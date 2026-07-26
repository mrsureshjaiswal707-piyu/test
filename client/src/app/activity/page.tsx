"use client";

import { useEffect, useState, useCallback } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { EventFeed } from "@/components/EventFeed";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Activity, Wallet } from "lucide-react";
import { useTxStore } from "@/store/transactions";
import { HORIZON_URL } from "@/lib/constants";
import type { EscrowEvent } from "@/types";

export default function ActivityPage() {
  const { isConnected, address } = useWallet();
  const { events, addEvent } = useTxStore();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchContractEvents = useCallback(async () => {
    try {
      const resp = await fetch(
        `${HORIZON_URL}/events?limit=50&order=desc&type=contract`
      );
      const data = await resp.json();
      const records = data._embedded?.records || [];
      for (const rec of records) {
        const topics = rec.topics || [];
        const eventType = topics[0]?.value || "";
        if (
          eventType === "escrow_created" ||
          eventType === "shipment_confirmed" ||
          eventType === "receipt_confirmed" ||
          eventType === "dispute_raised"
        ) {
          const existingId = `chain-${rec.transaction_hash}-${eventType}`;
          const alreadyExists = events.some((e) => e.id === existingId);
          if (!alreadyExists) {
            addEvent({
              id: existingId,
              type: eventType as EscrowEvent["type"],
              escrow_id: parseInt(topics[1]?.value || "0", 10) || 0,
              address: topics[2]?.value || topics[1]?.value || "",
              amount: rec.value?.value
                ? parseInt(String(rec.value.value), 10)
                : undefined,
              shipment_hash: topics[2]?.value || undefined,
              timestamp: Math.floor(
                new Date(rec.ledger_closed_time || Date.now()).getTime() / 1000
              ),
              txHash: rec.transaction_hash || "",
            });
          }
        }
      }
      setLastRefresh(new Date());
    } catch {
      /* events endpoint may not be available */
    }
  }, [addEvent, events]);

  useEffect(() => {
    fetchContractEvents();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchContractEvents, 15_000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchContractEvents]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Activity Feed
          </h1>
          <p className="text-muted-foreground text-sm">
            Real-time events from escrow contract interactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={autoRefresh ? "default" : "outline"} className="text-xs cursor-pointer"
            onClick={() => setAutoRefresh(!autoRefresh)}>
            {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
          </Badge>
          <Button variant="outline" size="icon" onClick={fetchContractEvents}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {lastRefresh && (
        <p className="text-xs text-muted-foreground">
          Last refreshed: {lastRefresh.toLocaleTimeString()}
        </p>
      )}

      {!isConnected ? (
        <EmptyState
          icon="Activity"
          title="Connect your wallet to view activity"
          description="Connect your wallet to see real-time escrow events on the Stellar network."
          action={
            <Button onClick={() => window.location.href = "/dashboard"} className="gap-2">
              <Wallet className="h-4 w-4" />
              Go to Dashboard
            </Button>
          }
        />
      ) : (
        <EventFeed events={events} />
      )}
    </div>
  );
}
