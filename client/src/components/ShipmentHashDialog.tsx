"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Package, Loader2 } from "lucide-react";

interface ShipmentHashDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  escrowId: number;
  onConfirm: (escrowId: number, hash: string) => Promise<void>;
  isLoading: boolean;
}

export function ShipmentHashDialog({
  open,
  onOpenChange,
  escrowId,
  onConfirm,
  isLoading,
}: ShipmentHashDialogProps) {
  const [hash, setHash] = useState("");

  const handleConfirm = async () => {
    if (!hash.trim()) return;
    await onConfirm(escrowId, hash.trim());
    setHash("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Confirm Shipment — Escrow #{escrowId}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <p className="text-sm text-muted-foreground">
            Enter the shipment tracking hash or reference number.
          </p>
          <Input
            placeholder="e.g. TRACK-12345-HASH or SHA-256..."
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            className="font-mono text-sm"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!hash.trim() || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Package className="h-4 w-4" />
            )}
            Confirm Shipment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
