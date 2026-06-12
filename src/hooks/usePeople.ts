/**
 * Customer/People hooks backed by `parties`.
 *
 * NOTE: `parties` is an internal table name; user-facing docs use Customer.
 */

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
import { Alert, Linking } from "react-native";
import { useRouter } from "expo-router";
import { useToast } from "@/src/components/feedback/Toast";
import { useAuthStore } from "@/src/store/authStore";
import { fetchPeople, fetchPersonDetail, PAGE_SIZE, deletePerson, updatePerson } from "../api/people";
import { ApiError } from "../lib/supabaseQuery";
import { supabase } from "../services/supabase";
import { Person, PersonDetail } from "../types/customer";
import type { Party } from "../types/party";
import { useDebounce } from "./useDebounce";

function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  // Infinite pagination + changing datasets can yield overlapping ranges; dedupe prevents duplicate keys in lists.
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

// Helper: Convert Party to Person type
function partyToPerson(party: Party): Person {
  return {
    id: party.id,
    name: party.name,
    phone: party.phone || "",
    vendor_id: party.vendor_id,
    address: party.address || undefined,
    created_at: party.created_at,
    outstandingBalance: party.customer_balance,
    isOverdue: false, // Will be calculated if needed
    lastActiveAt: party.updated_at,
  };
}

export const customerKeys = {
  all: (vendorId: string) => ["customers", vendorId] as const,
  list: (vendorId: string, search: string) =>
    [...customerKeys.all(vendorId), { search }] as const,
};

// Preferred alias (new naming)
export const peopleKeys = customerKeys;

export const useCustomers = (vendorId?: string, search?: string) => {
  const debouncedSearch = useDebounce(search ?? "", 300);

  const query = useInfiniteQuery<Person[], ApiError>({
    queryKey: vendorId
      ? customerKeys.list(vendorId, debouncedSearch)
      : ["customers-disabled"],
    queryFn: ({ pageParam }) =>
      fetchPeople(pageParam as number, vendorId!, debouncedSearch),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length : undefined,
    initialPageParam: 0,
    enabled: !!vendorId,
    staleTime: 30_000,
  });

  return {
    ...query,
    people: dedupeById(query.data?.pages.flat() ?? []),
  };
};

// Preferred alias (new naming)
export const usePeople = useCustomers;

// Backward-compatible alias (deprecated)
export const useCustomer = useCustomers;

export const useAddCustomer = (vendorId: string) => {
  const queryClient = useQueryClient();

  return useMutation<
    Person,
    ApiError,
    Omit<
      Person,
      | "id"
      | "vendor_id"
      | "created_at"
      | "isOverdue"
      | "outstandingBalance"
      | "lastActiveAt"
    >,
    { previousQueries: [import("@tanstack/react-query").QueryKey, unknown][] }
  >({
    mutationFn: async (values) => {
      // Insert into parties table instead of legacy customers table
      const { data, error } = await supabase
        .from("parties")
        .insert({
          vendor_id: vendorId,
          name: values.name,
          phone: values.phone || null,
          address: values.address || null,
          is_customer: true,
          customer_balance: (values as any).openingBalance || 0,
        })
        .select()
        .single();

      if (error) throw error;
      return partyToPerson(data as Party);
    },
    onMutate: async (newCustomer) => {
      const queryKey = customerKeys.all(vendorId);
      await queryClient.cancelQueries({ queryKey });

      const previousQueries = queryClient.getQueriesData({ queryKey });

      const optimisticPerson: Person = {
        id: `temp-${Date.now()}`,
        vendor_id: vendorId,
        name: newCustomer.name,
        phone: newCustomer.phone,
        address: newCustomer.address,
        created_at: new Date().toISOString(),
        isOverdue: false,
        outstandingBalance: (newCustomer as any).openingBalance ?? 0,
        lastActiveAt: new Date().toISOString(),
      };

      queryClient.setQueriesData<any>({ queryKey }, (oldData: any) => {
        if (!oldData || !oldData.pages) return oldData;
        const newPages = [...oldData.pages];
        newPages[0] = [optimisticPerson, ...newPages[0]];
        return {
          ...oldData,
          pages: newPages,
        };
      });

      return { previousQueries };
    },
    onError: (err: ApiError, _, context) => {
      console.error("Failed to add customer:", err.message);
      if (context?.previousQueries) {
        context.previousQueries.forEach(([cacheKey, oldData]) => {
          queryClient.setQueryData(cacheKey, oldData);
        });
      }
      Alert.alert("Error", err.message || "Failed to add customer.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: customerKeys.all(vendorId),
        exact: false,
      });
    },
    onSuccess: () => {
      Alert.alert("Success", "Person added successfully");
    },
  });
};

export function usePersonDetail(customerId?: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { profile } = useAuthStore();
  const { show: showToast } = useToast();

  const { data: customer, isLoading, isError, refetch } = useQuery<PersonDetail | null>({
    queryKey: ["customerDetail", customerId],
    queryFn: () =>
      customerId ? fetchPersonDetail(customerId) : Promise.resolve(null),
    enabled: !!customerId,
    staleTime: 30_000,
  });

  // UI states
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [successBannerAmount, setSuccessBannerAmount] = useState<number>(0);

  // Deletion mutation
  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!customerId || !profile?.id) throw new Error("Missing customerId or vendorId");
      return deletePerson(customerId, profile.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      showToast({
        message: "Customer deleted successfully",
        type: "success",
      });
      router.replace("/(main)/people" as any);
    },
    onError: (err: any) => {
      showToast({
        message: `Error deleting customer: ${err.message}`,
        type: "error",
      });
    },
  });

  // Computed Values
  const netBalance = customer?.outstandingBalance ?? 0;

  const oldestOverdueDays = useMemo(() => {
    if (!customer?.orders) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let maxDays = 0;
    let found = false;

    for (const order of customer.orders) {
      if (order.balance_due > 0 && order.due_date) {
        const dueDate = new Date(order.due_date);
        if (dueDate < today) {
          found = true;
          const diff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diff > maxDays) {
            maxDays = diff;
          }
        }
      }
    }
    return found ? maxDays : null;
  }, [customer?.orders]);

  const nearestDueDate = useMemo(() => {
    if (!customer?.orders) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let minDate: Date | null = null;

    for (const order of customer.orders) {
      if (order.balance_due > 0 && order.due_date) {
        const dueDate = new Date(order.due_date);
        if (dueDate >= today) {
          if (!minDate || dueDate < minDate) {
            minDate = dueDate;
          }
        }
      }
    }
    return minDate;
  }, [customer?.orders]);

  // Fix #7: normalize status casing
  const openEntriesCount = useMemo(() => {
    if (!customer?.orders) return 0;
    return customer.orders.filter((o) => o.status?.toLowerCase() !== "paid" && o.balance_due > 0).length;
  }, [customer?.orders]);

  const balanceState = useMemo<'overdue' | 'pending' | 'partial' | 'settled' | 'advance' | null>(() => {
    if (!customer) return null;
    if (!customer.orders || customer.orders.length === 0) return null;

    const hasOverdue = oldestOverdueDays !== null;
    const hasPartial = customer.orders?.some(o => o.amount_paid > 0 && o.balance_due > 0);

    if (netBalance < 0) {
      return 'advance';
    }
    if (netBalance === 0) {
      return 'settled';
    }
    if (netBalance > 0) {
      if (hasOverdue) return 'overdue';
      if (hasPartial) return 'partial';
      return 'pending';
    }
    return null;
  }, [customer, netBalance, oldestOverdueDays]);

  // Communication Handlers
  const onCall = useCallback(() => {
    if (customer?.phone) {
      const cleaned = customer.phone.replace(/\D/g, "");
      if (cleaned) {
        Linking.openURL(`tel:${cleaned}`);
      }
    }
  }, [customer?.phone]);

  const onWhatsApp = useCallback(async () => {
    if (customer?.phone && customer?.name) {
      const cleaned = customer.phone.replace(/\D/g, "");
      if (cleaned) {
        try {
          const biz = profile?.business_name || "our store";
          const msg = `Dear ${customer.name}, your outstanding balance with ${biz} is Rs. ${netBalance}. Please arrange payment. Thank you.`;
          const prefix = cleaned.length === 10 ? "91" : "";
          const waUrl = `https://wa.me/${prefix}${cleaned}?text=${encodeURIComponent(msg)}`;
          await Linking.openURL(waUrl);
        } catch {
          Alert.alert(
            "Cannot open WhatsApp",
            "Please install WhatsApp and try again.",
          );
        }
      }
    }
  }, [customer?.phone, customer?.name, profile, netBalance]);

  // Fix #5: removed duplicate refetch() — invalidateQueries handles cache update
  const handlePaymentSuccess = useCallback((amount?: number) => {
    setSuccessBannerAmount(amount ?? 0);
    setShowSuccessBanner(true);
    // Cache invalidation (do not skip)
    queryClient.invalidateQueries({ queryKey: ['customerDetail', customerId] });
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  }, [customerId, queryClient]);

  return {
    customer,
    isLoading,
    isError,
    refetch,

    // Computed values
    netBalance,
    oldestOverdueDays,
    nearestDueDate,
    openEntriesCount,
    balanceState,

    // Visibilities
    selectedPayment,
    setSelectedPayment,
    showSuccessBanner,
    setShowSuccessBanner,
    successBannerAmount,

    // Actions
    onCall,
    onWhatsApp,
    onDeleteCustomer: () => deleteMutation.mutate(),
    isDeleting: deleteMutation.isPending,
    handlePaymentSuccess,
  };
}

// Preferred alias (new naming)
export const useAddPerson = useAddCustomer;

export function useUpdatePerson(customerId: string) {
  const queryClient = useQueryClient();
  const { profile } = useAuthStore();
  const { show: showToast } = useToast();

  return useMutation({
    mutationFn: (values: { name: string; phone?: string | null; address?: string | null }) => {
      if (!profile?.id) throw new Error("Missing vendorId");
      return updatePerson(customerId, profile.id, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customerDetail", customerId] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      showToast({
        message: "Profile updated successfully",
        type: "success",
      });
    },
    onError: (err: any) => {
      showToast({
        message: `Error updating profile: ${err.message}`,
        type: "error",
      });
    },
  });
}
