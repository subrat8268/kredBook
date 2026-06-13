import { Payment, fetchPayments, recordPayment, recordCustomerPayment } from "@/src/api/entries";
import { ApiError } from "@/src/lib/supabaseQuery";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useOrderStore } from "../store/orderStore";
import { orderKeys } from "./useEntries";
import { deriveOrderStatus } from "../utils/helper";

// markFull is resolved by the caller before invoking the mutation;
// the backend always receives the pre-computed amount so markFull is omitted.
interface RecordPaymentInput {
  amount: number;
  mode: "Cash" | "UPI" | "NEFT" | "Draft" | "Cheque";
  notes?: string;
}

type RecordPaymentResult = { status: "confirmed" | "queued" };

/**
 * Standalone mutation-only hook for recording a payment.
 * Used directly by RecordCustomerPaymentModal so the modal
 * does not need its own queryClient or cache invalidation code.
 *
 * Includes optimistic updates for offline-first architecture.
 */
export function useRecordPayment(orderId: string, vendorId?: string, customerId?: string) {
  const orderIdRef = useRef(orderId);

  useEffect(() => {
    orderIdRef.current = orderId;
  }, [orderId]);

  const queryClient = useQueryClient();
  const { addUpdatingOrderId, removeUpdatingOrderId } = useOrderStore();

  const mutation = useMutation<RecordPaymentResult, ApiError, RecordPaymentInput>({
    mutationFn: async ({ amount, mode, notes }) => {
      if (!vendorId) throw new Error("Vendor ID is required");
      return await recordPayment(orderIdRef.current, vendorId, amount, mode, false, notes);
    },

    onMutate: async ({ amount, mode, notes }) => {
      addUpdatingOrderId(orderId);

      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: orderKeys.detail(orderId) });
      await queryClient.cancelQueries({ queryKey: ["payments", orderId] });
      if (customerId) {
        await queryClient.cancelQueries({
          queryKey: ["customerDetail", customerId],
        });
      }

      // Snapshot the previous values for rollback
      const previousOrder = queryClient.getQueryData(orderKeys.detail(orderId));
      const previousPayments = queryClient.getQueryData(["payments", orderId]);
      const previousCustomer = customerId
        ? queryClient.getQueryData(["customerDetail", customerId])
        : undefined;

      // Optimistically update order details
      queryClient.setQueryData(orderKeys.detail(orderId), (old: any) => {
        if (!old) return old;
        const newAmountPaid = (old.amount_paid || 0) + amount;
        const newBalanceDue = (old.total_amount || 0) - newAmountPaid;
        const newStatus = deriveOrderStatus(old.total_amount || 0, newAmountPaid);

        return {
          ...old,
          amount_paid: newAmountPaid,
          balance_due: newBalanceDue,
          status: newStatus,
        };
      });

      // Optimistically add payment to payment history
      queryClient.setQueryData(["payments", orderId], (old: any) => {
        const newPayment = {
          id: `temp-${Date.now()}`, // Temporary ID
          order_id: orderId,
          vendor_id: vendorId || "",
          amount,
          payment_mode: mode,
          payment_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          notes,
        };
        return [newPayment, ...(old || [])];
      });

      // Optimistically update person balance if available
      if (customerId) {
        queryClient.setQueryData(["customerDetail", customerId], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            outstandingBalance: Math.max(
              0,
              (old.outstandingBalance || 0) - amount,
            ),
          };
        });
      }

      // Return context for rollback
      return { previousOrder, previousPayments, previousCustomer };
    },

    onSuccess: () => {
      if (!vendorId) return;
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: ["payments", orderId] });
      if (customerId) {
        queryClient.invalidateQueries({
          queryKey: ["customerDetail", customerId],
        });
      }
    },

    onError: (err: ApiError, _variables, context: any) => {
      // Rollback optimistic updates on error
      if (context?.previousOrder) {
        queryClient.setQueryData(
          orderKeys.detail(orderId),
          context.previousOrder,
        );
      }
      if (context?.previousPayments) {
        queryClient.setQueryData(
          ["payments", orderId],
          context.previousPayments,
        );
      }
      if (context?.previousCustomer && customerId) {
        queryClient.setQueryData(
          ["customerDetail", customerId],
          context.previousCustomer,
        );
      }

      console.error("Failed to record payment:", err.code, err.message);
    },

    onSettled: () => {
      removeUpdatingOrderId(orderId);
    },
  });

  return {
    recordPayment: mutation.mutateAsync,
    isRecording: mutation.isPending,
  };
}
/** Compound hook: payment history query + record-payment mutation. */
export function usePayments(
  orderId: string,
  vendorId?: string,
  customerId?: string,
) {
  const {
    data: payments,
    isLoading,
    isError,
    refetch,
  } = useQuery<Payment[]>({
    queryKey: ["payments", orderId],
    queryFn: () => fetchPayments(orderId),
    enabled: !!orderId,
    staleTime: 30_000,
  });

  const { recordPayment, isRecording } = useRecordPayment(
    orderId,
    vendorId,
    customerId,
  );

  return { payments, isLoading, isError, refetch, recordPayment, isRecording };
}

/**
 * Customer-level payment hook.
 * Distributes payment across all unpaid orders (oldest first)
 * instead of targeting a single order.
 */
export function useRecordCustomerPayment(vendorId?: string, customerId?: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    { status: "confirmed" | "queued" },
    ApiError,
    { amount: number; mode: "Cash" | "UPI" | "NEFT" | "Draft" | "Cheque"; notes?: string }
  >({
    mutationFn: async ({ amount, mode, notes }) => {
      if (!vendorId || !customerId) throw new Error("Missing customer or vendor ID");
      return await recordCustomerPayment(customerId, vendorId, amount, mode, notes);
    },

    onMutate: async ({ amount }) => {
      if (!customerId) return;

      await queryClient.cancelQueries({ queryKey: ["customerDetail", customerId] });

      const previousCustomer = queryClient.getQueryData(["customerDetail", customerId]);

      queryClient.setQueryData(["customerDetail", customerId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          outstandingBalance: Math.max(0, (old.outstandingBalance || 0) - amount),
        };
      });

      return { previousCustomer };
    },

    onSuccess: () => {
      if (!vendorId || !customerId) return;
      queryClient.invalidateQueries({ queryKey: ["customerDetail", customerId] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },

    onError: (_err, _variables, context: any) => {
      if (context?.previousCustomer && customerId) {
        queryClient.setQueryData(
          ["customerDetail", customerId],
          context.previousCustomer,
        );
      }
    },
  });

  return {
    recordPayment: mutation.mutateAsync,
    isRecording: mutation.isPending,
  };
}
