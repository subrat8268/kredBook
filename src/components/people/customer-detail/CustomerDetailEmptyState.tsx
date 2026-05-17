import Button from "@/src/components/ui/Button";
import EmptyState from "@/src/components/ui/EmptyState";
import type { PersonDetail } from "@/src/types/customer";
import { View } from "react-native";

type Props = {
  customer: PersonDetail;
  onAddEntry: () => void;
  onRecordPayment?: () => void;
};

export default function CustomerDetailEmptyState({ customer, onAddEntry, onRecordPayment }: Props) {
  const showRecordPayment = Boolean(onRecordPayment && (customer.pendingOrderBalance ?? 0) > 0);

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 24 }}>
      <EmptyState
        illustration="clipboard"
        headingEn="No entries yet"
        headingHi="कोई एंट्री नहीं"
        bodyEn="Record the first entry for this customer"
        bodyHi="इस ग्राहक की पहली एंट्री दर्ज करें"
        ctaLabel="Add Entry"
        onCta={onAddEntry}
      />

      {showRecordPayment ? (
        <View style={{ marginTop: 12 }}>
          <Button variant="secondary" title="Record Payment" onPress={onRecordPayment!} />
        </View>
      ) : null}
    </View>
  );
}
