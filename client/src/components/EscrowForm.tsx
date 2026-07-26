"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Shield, Loader2 } from "lucide-react";

interface EscrowFormProps {
  onSubmit: (seller: string, amount: number, token: string, description: string) => Promise<void>;
  isLoading: boolean;
}

const NATIVE_TOKEN = "CDLZFC3SYJ4DPA7O332K3FHV4CZHOQHIVYSLYSP5TGQGQG7N7IVDK7MY";

export function EscrowForm({ onSubmit, isLoading }: EscrowFormProps) {
  const [seller, setSeller] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [token, setToken] = useState(NATIVE_TOKEN);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seller || !amount || !description) {
      toast.error("Please fill in all fields");
      return;
    }
    const amountNum = Math.floor(parseFloat(amount) * 10_000_000);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Amount must be a positive number");
      return;
    }
    try {
      await onSubmit(seller, amountNum, token, description);
      toast.success("Escrow created successfully!");
      setSeller("");
      setAmount("");
      setDescription("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Transaction failed";
      if (msg.includes("reject")) {
        toast.error("Transaction rejected by wallet");
      } else {
        toast.error(msg);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-primary" />
          Create Escrow
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Seller Address (Stellar G...)
            </label>
            <Input
              placeholder="G..."
              value={seller}
              onChange={(e) => setSeller(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Amount (XLM)
            </label>
            <Input
              type="number"
              step="0.0000001"
              min="0.0000001"
              placeholder="100.0000000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Description
            </label>
            <Textarea
              placeholder="Describe the item or service..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full gap-2">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Shield className="h-4 w-4" />
            )}
            {isLoading ? "Creating Escrow..." : "Create Escrow"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
