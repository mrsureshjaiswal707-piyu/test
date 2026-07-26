"use client";

import { TransactionTracker } from "@/components/TransactionTracker";
import { EmptyState } from "@/components/EmptyState";
import { useTxStore } from "@/store/transactions";
import { useWallet } from "@/hooks/use-wallet";
import { History, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function TransactionsPage() {
  const { transactions } = useTxStore();
  const { isConnected } = useWallet();

  const pendingCount = transactions.filter((t) => t.status === "pending").length;
  const successCount = transactions.filter((t) => t.status === "success").length;
  const failedCount = transactions.filter((t) => t.status === "failed").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            Transaction History
          </h1>
          <p className="text-muted-foreground text-sm">
            Track all contract interactions and their statuses
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-xs">
              {pendingCount} pending
            </Badge>
          )}
          {successCount > 0 && (
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">
              {successCount} confirmed
            </Badge>
          )}
          {failedCount > 0 && (
            <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 text-xs">
              {failedCount} failed
            </Badge>
          )}
        </div>
      </div>

      {!isConnected ? (
        <EmptyState
          icon="History"
          title="Connect your wallet"
          description="Connect your wallet to view your transaction history."
          action={
            <Button onClick={() => window.location.href = "/dashboard"} className="gap-2">
              <Wallet className="h-4 w-4" />
              Go to Dashboard
            </Button>
          }
        />
      ) : (
        <TransactionTracker transactions={transactions} />
      )}
    </div>
  );
}
