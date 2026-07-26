"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EscrowStatusBadge } from "./EscrowStatusBadge";
import { formatAmount, shortAddress } from "@/lib/constants";
import { Package, CheckCircle, AlertTriangle, ExternalLink } from "lucide-react";
import type { Escrow } from "@/types";

interface EscrowCardProps {
  escrow: Escrow;
  currentAddress?: string | null;
  onConfirmShipment?: (id: number) => void;
  onConfirmReceipt?: (id: number) => void;
  onRaiseDispute?: (id: number) => void;
  isLoading?: boolean;
}

export function EscrowCard({
  escrow,
  currentAddress,
  onConfirmShipment,
  onConfirmReceipt,
  onRaiseDispute,
  isLoading,
}: EscrowCardProps) {
  const isBuyer = currentAddress === escrow.buyer;
  const isSeller = currentAddress === escrow.seller;

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Escrow #{escrow.id}
          </CardTitle>
          <EscrowStatusBadge status={escrow.status} />
        </div>
        <p className="text-sm text-muted-foreground">{escrow.description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Amount</span>
            <p className="font-mono font-semibold text-lg">
              {formatAmount(escrow.amount)} XLM
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Token</span>
            <p className="font-mono text-xs break-all">{shortAddress(escrow.token, 8)}</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-1.5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Buyer</span>
            <span className={`font-mono text-xs ${isBuyer ? "text-primary font-semibold" : ""}`}>
              {shortAddress(escrow.buyer)}
              {isBuyer && " (you)"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Seller</span>
            <span className={`font-mono text-xs ${isSeller ? "text-primary font-semibold" : ""}`}>
              {shortAddress(escrow.seller)}
              {isSeller && " (you)"}
            </span>
          </div>
          {escrow.shipment_hash && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tracking Hash</span>
              <span className="font-mono text-xs">{shortAddress(escrow.shipment_hash, 6)}</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {escrow.status === "Pending" && isSeller && onConfirmShipment && (
            <Button
              size="sm"
              onClick={() => onConfirmShipment(escrow.id)}
              disabled={isLoading}
              className="gap-1.5"
            >
              <Package className="h-3.5 w-3.5" />
              Confirm Shipment
            </Button>
          )}
          {escrow.status === "Shipped" && isBuyer && onConfirmReceipt && (
            <Button
              size="sm"
              onClick={() => onConfirmReceipt(escrow.id)}
              disabled={isLoading}
              className="gap-1.5 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Confirm Receipt
            </Button>
          )}
          {(escrow.status === "Pending" || escrow.status === "Shipped") &&
            (isBuyer || isSeller) &&
            onRaiseDispute && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onRaiseDispute(escrow.id)}
                disabled={isLoading}
                className="gap-1.5"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                Raise Dispute
              </Button>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
