import NewCustomerModal from "@/src/components/people/NewCustomerModal";
import RecordCustomerPaymentModal from "@/src/components/people/RecordCustomerPaymentModal";
import CustomerPickerSheet from "@/src/components/customer/CustomerPickerSheet";
import type { RefObject } from "react";
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

      <CustomerPickerSheet
        visible={isCustomerPickerOpen}
        onClose={() => setIsCustomerPickerOpen(false)}
        title="Select customer"
        showAddCustomer={false}
        customerList={pickerPeople.map((item) => ({
          id: item.id,
          name: item.name,
          phone: item.phone,
          balance: item.balance ?? 0,
        }))}
        selectedCustomerId={null}
        recentIds={[]}
        isLoading={isPickerLoading}
        searchQuery={search}
        onSearchQueryChange={setSearch}
        onEndReached={() => {
          if (pickerHasNextPage) fetchMorePickerPeople();
        }}
        isFetchingNextPage={pickerIsFetchingNextPage}
        onSelectCustomer={async (customer) => {
          setIsCustomerPickerOpen(false);
          await onSelectCustomer(customer.id, customer.name);
        }}
      />

      {paymentContext ? (
        <RecordCustomerPaymentModal
          ref={paymentSheetRef}
          autoPresent
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
