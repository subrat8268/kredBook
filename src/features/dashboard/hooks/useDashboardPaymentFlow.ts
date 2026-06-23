import { useToast } from "@/src/components/feedback/Toast";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useRef, useState } from "react";
import type { DashboardPaymentContext } from "../types";

type Params = {
  actionParam?: string;
  clearActionParam: () => void;
  openRecordPaymentForCustomer: (customerId: string, customerName: string) => Promise<DashboardPaymentContext | null>;
};

export function useDashboardPaymentFlow({
  actionParam,
  clearActionParam,
  openRecordPaymentForCustomer,
}: Params) {
  const { show: showToast } = useToast();
  const paymentSheetRef = useRef<BottomSheetModal>(null);

  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isCustomerPickerOpen, setIsCustomerPickerOpen] = useState(false);
  const [isCollecting, setIsCollecting] = useState(false);
  const [paymentContext, setPaymentContext] = useState<DashboardPaymentContext | null>(null);

  useEffect(() => {
    if (actionParam === "record-payment") {
      console.log("[useDashboardPaymentFlow] actionParam 'record-payment' received, opening customer picker.");
      setIsCustomerPickerOpen(true);
      clearActionParam();
    }
  }, [actionParam, clearActionParam]);

  const handleOpenRecordPaymentForCustomer = useCallback(
    async (customerId: string, customerName: string) => {
      console.log("[useDashboardPaymentFlow] handleOpenRecordPaymentForCustomer called:", { customerId, customerName });
      setIsCollecting(true);
      try {
        const context = await openRecordPaymentForCustomer(customerId, customerName);
        if (!context) {
          console.warn("[useDashboardPaymentFlow] No outstanding balance found for customer:", customerId);
          showToast({ message: "No outstanding balance for this customer.", type: "error" });
          return;
        }

        console.log("[useDashboardPaymentFlow] Successfully set payment context:", context);
        setPaymentContext(context);
      } catch (error) {
        console.error("[useDashboardPaymentFlow] Error resolved during record payment setup:", error);
        showToast({ message: "Could not open collection flow.", type: "error" });
      } finally {
        setIsCollecting(false);
      }
    },
    [openRecordPaymentForCustomer, showToast],
  );

  const handleOpenPicker = useCallback(() => {
    console.log("[useDashboardPaymentFlow] handleOpenPicker called, opening customer list selector.");
    setIsCustomerPickerOpen(true);
  }, []);

  return {
    paymentSheetRef,
    isAddCustomerOpen,
    setIsAddCustomerOpen,
    isCustomerPickerOpen,
    setIsCustomerPickerOpen,
    isCollecting,
    paymentContext,
    setPaymentContext,
    handleOpenRecordPaymentForCustomer,
    handleOpenPicker,
  };
}