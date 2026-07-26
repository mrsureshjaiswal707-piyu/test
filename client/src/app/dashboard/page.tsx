"use client";

import { useEffect } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/EmptyState";
import { shortAddress } from "@/lib/constants";
import {
  Wallet,
  Copy,
  ExternalLink,
  RefreshCw,
  Globe,
  Coins,
} from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const {
    address,
    isConnected,
    isConnecting,
    balances,
    connect,
    fetchBalances,
  } = useWallet();

  useEffect(() => {
    if (isConnected) fetchBalances();
  }, [isConnected, fetchBalances]);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success("Address copied to clipboard");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Wallet Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Manage your Stellar wallet and view balances
        </p>
      </div>

      {!isConnected ? (
        <EmptyState
          icon="Wallet"
          title="No wallet connected"
          description="Connect your Stellar wallet to view your address, balances, and network information."
          action={
            <Button onClick={connect} disabled={isConnecting} className="gap-2">
              <Wallet className="h-4 w-4" />
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wallet className="h-5 w-5 text-primary" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <span className="text-xs text-muted-foreground">Address</span>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded bg-muted px-3 py-2 text-xs font-mono break-all">
                    {address}
                  </code>
                  <Button variant="outline" size="icon" onClick={copyAddress}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <a
                    href={`https://stellar.expert/testnet/account/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="icon">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Network</span>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                  <Globe className="mr-1 h-3 w-3" />
                  Stellar Testnet
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Network Passphrase</span>
                <span className="text-xs font-mono text-muted-foreground">
                  Test SDF Network
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Balances */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Coins className="h-5 w-5 text-primary" />
                Balances
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={fetchBalances}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {balances.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No balances found. Click refresh to load.
                </p>
              ) : (
                <div className="space-y-3">
                  {balances.map((bal) => (
                    <div
                      key={bal.asset}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {bal.asset.slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{bal.asset}</p>
                          <p className="text-xs text-muted-foreground">
                            {bal.asset === "XLM" ? "Native Asset" : "Custom Token"}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-sm font-semibold">
                        {Number(bal.balance).toLocaleString(undefined, {
                          minimumFractionDigits: bal.asset === "XLM" ? 4 : 2,
                          maximumFractionDigits: bal.asset === "XLM" ? 7 : 2,
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
