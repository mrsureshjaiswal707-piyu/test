"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import {
  Address,
  Contract,
  TransactionBuilder,
  nativeToScVal,
  scValToNative,
} from "@stellar/stellar-sdk";
import { rpc } from "@stellar/stellar-sdk";
import { useWallet } from "./use-wallet";
import { useTxStore } from "@/store/transactions";
import { CONTRACT_ADDRESS, RPC_URL, NETWORK_PASSPHRASE, HORIZON_URL } from "@/lib/constants";
import type { Escrow, EscrowEvent } from "@/types";
import type { xdr } from "@stellar/stellar-sdk";

const server = new rpc.Server(RPC_URL);
const { assembleTransaction } = rpc;

function toScValString(value: string) {
  return nativeToScVal(value, { type: "string" });
}

function toScValAddress(value: string) {
  return new Address(value).toScVal();
}

function toScValI128(value: number) {
  return nativeToScVal(BigInt(Math.floor(value)), { type: "i128" });
}

function toScValU32(value: number) {
  return nativeToScVal(value, { type: "u32" });
}

function parseEscrowFromResult(result: xdr.ScVal): Escrow | null {
  try {
    const map = scValToNative(result) as Record<string, unknown>;
    if (!map) return null;
    return {
      id: Number(map.id ?? 0),
      buyer: String(map.buyer ?? ""),
      seller: String(map.seller ?? ""),
      amount: Number(map.amount ?? 0),
      token: String(map.token ?? ""),
      description: String(map.description ?? ""),
      status: String(map.status ?? "Pending") as Escrow["status"],
      shipment_hash: String(map.shipment_hash ?? ""),
    };
  } catch {
    return null;
  }
}

export function useContract() {
  const { address, signAndSend } = useWallet();
  const { addEvent } = useTxStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const buildAndSign = useCallback(
    async (
      method: string,
      args: xdr.ScVal[],
      sourceAddress?: string
    ) => {
      if (!sourceAddress) throw new Error("Wallet not connected");
      const sourceAccount = await server.getAccount(sourceAddress);
      const contract = new Contract(CONTRACT_ADDRESS);
      const tx = new TransactionBuilder(sourceAccount, {
        fee: "200",
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(contract.call(method, ...args))
        .setTimeout(300)
        .build();

      const simResult = await server.simulateTransaction(tx);
      if ("error" in simResult) {
        throw new Error(
          typeof simResult.error === "string"
            ? simResult.error
            : "Simulation failed"
        );
      }

      const assembledTx = assembleTransaction(tx, simResult).build();
      return assembledTx.toXDR();
    },
    []
  );

  const createEscrow = useCallback(
    async (
      seller: string,
      amount: number,
      token: string,
      description: string,
      onStatus?: (s: "pending" | "success" | "failed", h?: string) => void
    ) => {
      if (!address) throw new Error("Connect your wallet first");
      setLoading(true);
      setError(null);
      try {
        const args = [
          toScValAddress(address),
          toScValAddress(seller),
          toScValI128(amount),
          toScValAddress(token),
          toScValString(description),
        ];
        const xdr = await buildAndSign("create_escrow", args, address);
        const { hash } = await signAndSend(xdr, onStatus);
        addEvent({
          id: `evt-${Date.now()}`,
          type: "escrow_created",
          escrow_id: -1,
          address,
          amount,
          timestamp: Math.floor(Date.now() / 1000),
          txHash: hash,
        });
        return hash;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [address, buildAndSign, signAndSend, addEvent]
  );

  const confirmShipment = useCallback(
    async (
      escrowId: number,
      shipmentHash: string,
      onStatus?: (s: "pending" | "success" | "failed", h?: string) => void
    ) => {
      if (!address) throw new Error("Connect your wallet first");
      setLoading(true);
      setError(null);
      try {
        const args = [toScValU32(escrowId), toScValString(shipmentHash)];
        const xdr = await buildAndSign("confirm_shipment", args, address);
        const { hash } = await signAndSend(xdr, onStatus);
        addEvent({
          id: `evt-${Date.now()}`,
          type: "shipment_confirmed",
          escrow_id: escrowId,
          address,
          shipment_hash: shipmentHash,
          timestamp: Math.floor(Date.now() / 1000),
          txHash: hash,
        });
        return hash;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [address, buildAndSign, signAndSend, addEvent]
  );

  const confirmReceipt = useCallback(
    async (
      escrowId: number,
      onStatus?: (s: "pending" | "success" | "failed", h?: string) => void
    ) => {
      if (!address) throw new Error("Connect your wallet first");
      setLoading(true);
      setError(null);
      try {
        const args = [toScValU32(escrowId)];
        const xdr = await buildAndSign("confirm_receipt", args, address);
        const { hash } = await signAndSend(xdr, onStatus);
        addEvent({
          id: `evt-${Date.now()}`,
          type: "receipt_confirmed",
          escrow_id: escrowId,
          address,
          timestamp: Math.floor(Date.now() / 1000),
          txHash: hash,
        });
        return hash;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [address, buildAndSign, signAndSend, addEvent]
  );

  const raiseDispute = useCallback(
    async (
      escrowId: number,
      onStatus?: (s: "pending" | "success" | "failed", h?: string) => void
    ) => {
      if (!address) throw new Error("Connect your wallet first");
      setLoading(true);
      setError(null);
      try {
        const args = [toScValU32(escrowId), toScValAddress(address)];
        const xdr = await buildAndSign("raise_dispute", args, address);
        const { hash } = await signAndSend(xdr, onStatus);
        addEvent({
          id: `evt-${Date.now()}`,
          type: "dispute_raised",
          escrow_id: escrowId,
          address,
          timestamp: Math.floor(Date.now() / 1000),
          txHash: hash,
        });
        return hash;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [address, buildAndSign, signAndSend, addEvent]
  );

  const getEscrow = useCallback(
    async (escrowId: number): Promise<Escrow | null> => {
      try {
        const contract = new Contract(CONTRACT_ADDRESS);
        const sourceAccount = await server.getAccount(
          "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"
        );
        const tx = new TransactionBuilder(sourceAccount, {
          fee: "100",
          networkPassphrase: NETWORK_PASSPHRASE,
        })
          .addOperation(
            contract.call(
              "get_escrow",
              toScValU32(escrowId)
            )
          )
          .setTimeout(30)
          .build();

        const result = await server.simulateTransaction(tx);
        if ("result" in result && result.result) {
          const retval = result.result.retval;
          return parseEscrowFromResult(retval);
        }
        return null;
      } catch {
        return null;
      }
    },
    []
  );

  const getEscrows = useCallback(
    async (ids: number[]): Promise<(Escrow | null)[]> => {
      const results = await Promise.all(ids.map((id) => getEscrow(id)));
      return results;
    },
    [getEscrow]
  );

  const getEvents = useCallback(
    async (escrowId?: number): Promise<unknown[]> => {
      try {
        let url = `${HORIZON_URL}/events?limit=50&order=desc`;
        if (escrowId !== undefined) {
          url += `&topic=${escrowId}`;
        }
        const resp = await fetch(url);
        const data = await resp.json();
        return data._embedded?.records || [];
      } catch {
        return [];
      }
    },
    []
  );

  return {
    loading,
    error,
    createEscrow,
    confirmShipment,
    confirmReceipt,
    raiseDispute,
    getEscrow,
    getEscrows,
    getEvents,
  };
}
