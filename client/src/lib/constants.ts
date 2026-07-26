export const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";
export const RPC_URL = "https://soroban-testnet.stellar.org";
export const HORIZON_URL = "https://horizon-testnet.stellar.org";
export const EXPLORER_URL = "https://stellar.expert/testnet/tx";

export const CONTRACT_ADDRESS = "CDYAOPQPXAWXZBRQTQ3OFAOOYSIBHCY5SYMUMJR4PPFKMHW5YRNU55OO";

export const XLM_ASSET = "XLM";
export const DECIMALS = 7;

export function formatAmount(amount: number, decimals = DECIMALS): string {
  return (amount / Math.pow(10, decimals)).toFixed(decimals === 7 ? 4 : 2);
}

export function shortAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function getExplorerTxUrl(hash: string): string {
  return `${EXPLORER_URL}/${hash}`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "Pending": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    case "Shipped": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "Completed": return "bg-green-500/10 text-green-500 border-green-500/20";
    case "Disputed": return "bg-red-500/10 text-red-500 border-red-500/20";
    default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
  }
}

export function getEventTypeLabel(type: string): string {
  switch (type) {
    case "escrow_created": return "Escrow Created";
    case "shipment_confirmed": return "Shipment Confirmed";
    case "receipt_confirmed": return "Receipt Confirmed";
    case "dispute_raised": return "Dispute Raised";
    default: return type;
  }
}

export function getEventIcon(type: string): string {
  switch (type) {
    case "escrow_created": return "🔒";
    case "shipment_confirmed": return "📦";
    case "receipt_confirmed": return "✅";
    case "dispute_raised": return "⚠️";
    default: return "📋";
  }
}
