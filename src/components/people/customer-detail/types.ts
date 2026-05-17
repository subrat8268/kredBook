import type { Transaction } from "@/src/types/customer";

export type TxFilter = "All" | "Entries" | "Payments";

export type TxListItem =
  | { kind: "header"; label: string; key: string }
  | { kind: "tx"; data: Transaction; key: string };
