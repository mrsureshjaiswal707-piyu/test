"use client";

import { useState, useCallback } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { useContract } from "@/hooks/use-contract";
import { useTxStore } from "@/store/transactions";
import { EscrowForm } from "@/components/EscrowForm";
import { EscrowCard } from "@/components/EscrowCard";
import { ShipmentHashDialog } from "@/components/ShipmentHashDialog";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Wallet, Search, Shield, Loader2 } from "lucide-react";
import type { Escrow } from "@/types";

export default function EscrowPage() {
  const { address, isConnected, connect } = useWallet();
  const { loading, createEscrow, confirmShipment, confirmReceipt, raiseDispute, getEscrow } =
    useContract();
  const { events } = useTxStore();
  const [lookupId, setLookupId] = useState("");
  const [lookedUpEscrow, setLookedUpEscrow] = useState<Escrow | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [shipmentDialogOpen, setShipmentDialogOpen] = useState(false);
  const [selectedEscrowId, setSelectedEscrowId] = useState<number>(0);
  const [localEscrows, setLocalEscrows] = useState<Escrow[]>([]);

  const handleCreateEscrow = useCallback(
    async (seller: string, amount: number, token: string, description: string) => {
      await createEscrow(seller, amount, token, description, (status, hash) => {
        if (status === "success") {
          toast.success(`Escrow created! TX: ${hash?.slice(0, 10)}...`);
        }
      });
    },
    [createEscrow]
  );

  const handleConfirmShipment = useCallback(
    async (escrowId: number, hash: string) => {
      try {
        await confirmShipment(escrowId, hash, (status, txHash) => {
          if (status === "success") {
            toast.success("Shipment confirmed!");
          }
        });
        // Refresh the looked-up escrow
        const updated = await getEscrow(escrowId);
        if (updated) setLookedUpEscrow(updated);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed";
        if (msg.includes("reject")) toast.error("Transaction rejected");
        else toast.error(msg);
      }
    },
    [confirmShipment, getEscrow]
  );

  const handleConfirmReceipt = useCallback(
    async (escrowId: number) => {
      try {
        await confirmReceipt(escrowId, (status) => {
          if (status === "success") {
            toast.success("Receipt confirmed — funds released to seller!");
          }
        });
        const updated = await getEscrow(escrowId);
        if (updated) setLookedUpEscrow(updated);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed";
        if (msg.includes("reject")) toast.error("Transaction rejected");
        else toast.error(msg);
      }
    },
    [confirmReceipt, getEscrow]
  );

  const handleRaiseDispute = useCallback(
    async (escrowId: number) => {
      try {
        await raiseDispute(escrowId, (status) => {
          if (status === "success") {
            toast.success("Dispute raised");
          }
        });
        const updated = await getEscrow(escrowId);
        if (updated) setLookedUpEscrow(updated);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed";
        if (msg.includes("reject")) toast.error("Transaction rejected");
        else toast.error(msg);
      }
    },
    [raiseDispute, getEscrow]
  );

  const handleLookup = async () => {
    const id = parseInt(lookupId, 10);
    if (isNaN(id)) {
      toast.error("Enter a valid escrow ID");
      return;
    }
    setLookupLoading(true);
    try {
      const escrow = await getEscrow(id);
      if (escrow) {
        setLookedUpEscrow(escrow);
        toast.success(`Loaded escrow #${id}`);
      } else {
        toast.error(`Escrow #${id} not found`);
        setLookedUpEscrow(null);
      }
    } catch {
      toast.error("Failed to fetch escrow");
    } finally {
      setLookupLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Escrow</h1>
          <p className="text-muted-foreground text-sm">
            Create and manage delivery escrows
          </p>
        </div>
        <EmptyState
          icon="Wallet"
          title="Connect your wallet"
          description="You need to connect your Stellar wallet to create and manage escrows."
          action={
            <Button onClick={connect} className="gap-2">
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Escrow</h1>
          <p className="text-muted-foreground text-sm">
            Create and manage delivery escrows on Stellar
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {shortAddr(address)}
        </Badge>
      </div>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList>
          <TabsTrigger value="create" className="gap-1.5">
            <Shield className="h-4 w-4" />
            Create
          </TabsTrigger>
          <TabsTrigger value="lookup" className="gap-1.5">
            <Search className="h-4 w-4" />
            Lookup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <EscrowForm onSubmit={handleCreateEscrow} isLoading={loading} />
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Recent Activity
              </h3>
              {events.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center rounded-lg border border-dashed">
                  No events yet. Create your first escrow!
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {events.slice(0, 10).map((evt) => (
                    <div
                      key={evt.id}
                      className="rounded-lg border p-3 text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{formatType(evt.type)}</span>
                        <span className="text-xs text-muted-foreground">
                          #{evt.escrow_id}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatTime(evt.timestamp)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="lookup" className="space-y-6">
          <div className="flex items-center gap-2 max-w-md">
            <Input
              type="number"
              placeholder="Enter Escrow ID"
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            />
            <Button
              onClick={handleLookup}
              disabled={lookupLoading}
              className="gap-1.5 shrink-0"
            >
              {lookupLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Look Up
            </Button>
          </div>

          {lookedUpEscrow && (
            <EscrowCard
              escrow={lookedUpEscrow}
              currentAddress={address}
              onConfirmShipment={(id) => {
                setSelectedEscrowId(id);
                setShipmentDialogOpen(true);
              }}
              onConfirmReceipt={handleConfirmReceipt}
              onRaiseDispute={handleRaiseDispute}
              isLoading={loading}
            />
          )}
        </TabsContent>
      </Tabs>

      <ShipmentHashDialog
        open={shipmentDialogOpen}
        onOpenChange={setShipmentDialogOpen}
        escrowId={selectedEscrowId}
        onConfirm={handleConfirmShipment}
        isLoading={loading}
      />
    </div>
  );
}

function shortAddr(addr: string | null) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatType(type: string) {
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTime(ts: number) {
  return new Date(ts * 1000).toLocaleString();
}
