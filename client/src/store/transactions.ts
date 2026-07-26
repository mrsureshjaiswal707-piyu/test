"use client";

import { create } from "zustand";
import type { TransactionRecord, EscrowEvent } from "@/types";

interface TxStore {
  transactions: TransactionRecord[];
  events: EscrowEvent[];
  addTransaction: (tx: TransactionRecord) => void;
  updateTransaction: (hash: string, update: Partial<TransactionRecord>) => void;
  addEvent: (event: EscrowEvent) => void;
  clearOld: () => void;
}

export const useTxStore = create<TxStore>((set) => ({
  transactions: [],
  events: [],
  addTransaction: (tx) =>
    set((s) => ({ transactions: [tx, ...s.transactions].slice(0, 100) })),
  updateTransaction: (hash, update) =>
    set((s) => ({
      transactions: s.transactions.map((t) =>
        t.hash === hash ? { ...t, ...update } : t
      ),
    })),
  addEvent: (event) =>
    set((s) => ({ events: [event, ...s.events].slice(0, 200) })),
  clearOld: () =>
    set((s) => ({
      transactions: s.transactions.slice(0, 50),
      events: s.events.slice(0, 100),
    })),
}));
