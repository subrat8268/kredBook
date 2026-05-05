import { createMMKV } from "react-native-mmkv";

const RECENT_CUSTOMER_IDS_KEY = "recent_customer_ids";
const storage = createMMKV({ id: "recent-customers" });

export function getRecentCustomerIds(): string[] {
  const raw = storage.getString(RECENT_CUSTOMER_IDS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function prependRecentCustomer(customerId: string): string[] {
  const next = [customerId, ...getRecentCustomerIds().filter((id) => id !== customerId)].slice(0, 8);
  storage.set(RECENT_CUSTOMER_IDS_KEY, JSON.stringify(next));
  return next;
}
