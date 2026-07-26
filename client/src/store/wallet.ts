"use client";

import { create } from "zustand";

interface WalletStore {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  walletId: string | null;
  balances: { asset: string; balance: string }[];
  setAddress: (address: string | null) => void;
  setConnecting: (v: boolean) => void;
  setWalletId: (id: string | null) => void;
  setBalances: (b: { asset: string; balance: string }[]) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletStore>((set) => ({
  address: null,
  isConnected: false,
  isConnecting: false,
  walletId: null,
  balances: [],
  setAddress: (address) =>
    set({ address, isConnected: !!address }),
  setConnecting: (isConnecting) => set({ isConnecting }),
  setWalletId: (walletId) => set({ walletId }),
  setBalances: (balances) => set({ balances }),
  disconnect: () =>
    set({
      address: null,
      isConnected: false,
      isConnecting: false,
      walletId: null,
      balances: [],
    }),
}));
