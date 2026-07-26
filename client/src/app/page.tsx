"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWallet } from "@/hooks/use-wallet";
import { Shield, Package, CheckCircle, ArrowRight, Zap, Lock, Globe } from "lucide-react";

const steps = [
  {
    icon: Lock,
    title: "Buyer Locks Funds",
    description:
      "The buyer creates an escrow and locks XLM tokens into the smart contract. Funds are held securely on-chain.",
  },
  {
    icon: Package,
    title: "Seller Ships & Confirms",
    description:
      "The seller ships the item and provides a tracking hash as proof. The smart contract records the shipment.",
  },
  {
    icon: CheckCircle,
    title: "Buyer Confirms Receipt",
    description:
      "Once delivered, the buyer confirms receipt. The smart contract automatically releases funds to the seller.",
  },
];

const features = [
  { icon: Shield, title: "Smart Contract Security", description: "Funds are held in a Soroban smart contract — no middleman" },
  { icon: Zap, title: "Instant Settlement", description: "Funds release instantly when conditions are met" },
  { icon: Globe, title: "Fully Decentralized", description: "No central authority — peer-to-peer escrow on Stellar" },
];

export default function HomePage() {
  const { isConnected } = useWallet();

  return (
    <div className="space-y-16 py-8">
      {/* Hero */}
      <section className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
          <Shield className="h-4 w-4 text-primary" />
          Built on Stellar Soroban
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Escrow on{" "}
          <span className="text-primary">Delivery</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          A trustless, decentralized escrow system. Buyer locks funds, seller
          confirms shipment, and smart contracts handle the rest — automatically.
        </p>
        <div className="flex items-center justify-center gap-3">
          {isConnected ? (
            <Link href="/escrow">
              <Button size="lg" className="gap-2">
                Open App <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                Connect Wallet <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
          <Link href="/activity">
            <Button size="lg" variant="outline" className="gap-2">
              View Activity
            </Button>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">How It Works</h2>
          <p className="text-muted-foreground mt-1">Three simple steps to a secure transaction</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <Card key={i} className="relative overflow-hidden">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground">
                      STEP {i + 1}
                    </span>
                  </div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Why EscrowChain?</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div key={i} className="flex items-start gap-3 rounded-lg border p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats placeholder */}
      <section className="rounded-xl border bg-muted/30 p-8 text-center">
        <h2 className="text-xl font-bold mb-4">Platform Stats</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Total Escrows", value: "—" },
            { label: "Total Volume", value: "—" },
            { label: "Success Rate", value: "100%" },
            { label: "Avg. Settlement", value: "—" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
