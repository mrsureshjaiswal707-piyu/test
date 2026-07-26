export type EscrowStatus = "Pending" | "Shipped" | "Completed" | "Disputed";

export interface Escrow {
  id: number;
  buyer: string;
  seller: string;
  amount: number;
  token: string;
  description: string;
  status: EscrowStatus;
  shipment_hash: string;
}

export interface EscrowEvent {
  id: string;
  type: "escrow_created" | "shipment_confirmed" | "receipt_confirmed" | "dispute_raised";
  escrow_id: number;
  address: string;
  amount?: number;
  shipment_hash?: string;
  timestamp: number;
  txHash: string;
}

export interface TransactionRecord {
  hash: string;
  status: "pending" | "success" | "failed";
  type: string;
  escrow_id?: number;
  from: string;
  to?: string;
  amount?: number;
  timestamp: number;
  error?: string;
}

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  network: string;
  balances: { asset: string; balance: string }[];
  connect: () => Promise<void>;
  disconnect: () => void;
  fetchBalances: () => Promise<void>;
}
