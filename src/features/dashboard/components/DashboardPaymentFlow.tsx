import NewCustomerModal from "@/src/components/people/NewCustomerModal";
import RecordCustomerPaymentModal from "@/src/components/people/RecordCustomerPaymentModal";
import BottomSheetPicker from "@/src/components/picker/BottomSheetPicker";
import Avatar from "@/src/components/ui/Avatar";
import type { RefObject } from "react";
import { Pressable, Text, View } from "react-native";
import type { DashboardPaymentContext, DashboardPickerPerson } from "../types";

type Props = {
  isAddCustomerOpen: boolean;
  setIsAddCustomerOpen: (value: boolean) => void;
  addCustomer: (values: { name: string; phone?: string; address?: string; openingBalance?: number }) => Promise<void>;
  isAddingCustomer: boolean;
  addCustomerError?: string;
  onCustomerAdded: () => void;
  isCustomerPickerOpen: boolean;
  setIsCustomerPickerOpen: (value: boolean) => void;
  pickerPeople: DashboardPickerPerson[];
  isPickerLoading: boolean;
  pickerIsFetchingNextPage: boolean;
  pickerHasNextPage: boolean;
  fetchMorePickerPeople: () => void;
  search: string;
  setSearch: (value: string) => void;
  onSelectCustomer: (customerId: string, customerName: string) => Promise<void>;
  paymentContext: DashboardPaymentContext | null;
  setPaymentContext: (context: DashboardPaymentContext | null) => void;
  paymentSheetRef: RefObject<any>;
  onPaymentSuccess: () => void;
};

export default function DashboardPaymentFlow({
  isAddCustomerOpen,
  setIsAddCustomerOpen,
  addCustomer,
  isAddingCustomer,
  addCustomerError,
  onCustomerAdded,
  isCustomerPickerOpen,
  setIsCustomerPickerOpen,
  pickerPeople,
  isPickerLoading,
  pickerIsFetchingNextPage,
  pickerHasNextPage,
  fetchMorePickerPeople,
  search,
  setSearch,
  onSelectCustomer,
  paymentContext,
  setPaymentContext,
  paymentSheetRef,
  onPaymentSuccess,
}: Props) {
  return (
    <>
      <NewCustomerModal
        visible={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        onSubmit={async (values) => {
          await addCustomer({
            name: values.name,
            phone: values.phone || "",
            address: values.address,
            openingBalance: values.openingBalance,
          });
          setIsAddCustomerOpen(false);
          onCustomerAdded();
        }}
        loading={isAddingCustomer}
        errorMessage={addCustomerError}
      />

      <BottomSheetPicker
        visible={isCustomerPickerOpen}
        onClose={() => setIsCustomerPickerOpen(false)}
        title="Select customer"
        items={pickerPeople}
        isLoading={isPickerLoading}
        isFetchingNextPage={pickerIsFetchingNextPage}
        onEndReached={() => {
          if (pickerHasNextPage) fetchMorePickerPeople();
        }}
        search={search}
        setSearch={setSearch}
        keyExtractor={(item) => item.id}
        renderItem={(item) => (
          <Pressable
            className="flex-row items-center rounded-xl border border-soft bg-surface px-4 py-3 dark:border-border-soft-dark dark:bg-surface-dark"
            onPress={() => {
              setIsCustomerPickerOpen(false);
              onSelectCustomer(item.id, item.name);
            }}
          >
            <Avatar name={item.name} size="sm" />
            <View className="ml-3 flex-1">
              <Text className="text-body font-inter-semibold text-textPrimary dark:text-textPrimary-dark" numberOfLines={1}>
                {item.name}
              </Text>
              <Text className="mt-0.5 text-caption text-textSecondary dark:text-textSecondary-dark" numberOfLines={1}>
                Open to record a payment
              </Text>
            </View>
          </Pressable>
        )}
      />

      {paymentContext ? (
        <RecordCustomerPaymentModal
          ref={paymentSheetRef}
          onSuccess={onPaymentSuccess}
          orderId={paymentContext.orderId}
          balanceDue={paymentContext.balanceDue}
          customerId={paymentContext.customerId}
          customerName={paymentContext.customerName}
          initialAmount={paymentContext.initialAmount}
          onDismiss={() => setPaymentContext(null)}
        />
      ) : null}
    </>
  );
}
