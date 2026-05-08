import { useToast } from "@/src/components/feedback/Toast";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useRef, useState } from "react";
import type { DashboardPaymentContext, DashboardPerson } from "../types";

type Params = {
  actionParam?: string;
  clearActionParam: () => void;
  openRecordPaymentForCustomer: (customerId: string, customerName: string) => Promise<DashboardPaymentContext | null>;
  followUpPeople: DashboardPerson[];
};

export function useDashboardPaymentFlow({
  actionParam,
  clearActionParam,
  openRecordPaymentForCustomer,
  followUpPeople,
}: Params) {
  const { show: showToast } = useToast();
  const paymentSheetRef = useRef<BottomSheetModal>(null);

  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isCustomerPickerOpen, setIsCustomerPickerOpen] = useState(false);
  const [isCollecting, setIsCollecting] = useState(false);
  const [paymentContext, setPaymentContext] = useState<DashboardPaymentContext | null>(null);

  useEffect(() => {
    if (actionParam === "record-payment") {
      setIsCustomerPickerOpen(true);
      clearActionParam();
    }
  }, [actionParam, clearActionParam]);

  const handleOpenRecordPaymentForCustomer = useCallback(
    async (customerId: string, customerName: string) => {
      setIsCollecting(true);
      try {
        const context = await openRecordPaymentForCustomer(customerId, customerName);
        if (!context) {
          showToast({ message: "No outstanding balance to collect for this customer.", type: "error" });
          return;
        }

        setPaymentContext(context);
        paymentSheetRef.current?.present();
      } catch {
        showToast({ message: "Could not open collection flow.", type: "error" });
      } finally {
        setIsCollecting(false);
      }
    },
    [openRecordPaymentForCustomer, showToast],
  );

  const handleCollectNow = useCallback(async () => {
    const first = followUpPeople[0];
    if (first) {
      await handleOpenRecordPaymentForCustomer(first.id, first.name);
      return;
    }
    setIsCustomerPickerOpen(true);
  }, [followUpPeople, handleOpenRecordPaymentForCustomer]);

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
    handleCollectNow,
  };
}
