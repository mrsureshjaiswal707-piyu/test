"use client";

import { useCallback, useEffect, useRef } from "react";
import { useWalletStore } from "@/store/wallet";
import { useTxStore } from "@/store/transactions";
import { NETWORK_PASSPHRASE, HORIZON_URL } from "@/lib/constants";
import { StellarSdk } from "@/lib/stellar";

let kitInitialized = false;

async function getKit() {
  const { StellarWalletsKit } = await import(
    "@creit.tech/stellar-wallets-kit"
  );
  const { defaultModules } = await import(
    "@creit.tech/stellar-wallets-kit/modules/utils"
  );
  if (!kitInitialized) {
    StellarWalletsKit.init({
      modules: defaultModules(),
    });
    kitInitialized = true;
  }
  return StellarWalletsKit;
}

export function useWallet() {
  const {
    address,
    isConnected,
    isConnecting,
    balances,
    setAddress,
    setConnecting,
    setWalletId,
    setBalances,
    disconnect: storeDisconnect,
  } = useWalletStore();
  const { addTransaction, updateTransaction } = useTxStore();
  const kitRef = useRef<Awaited<ReturnType<typeof getKit>> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const kit = await getKit();
        kitRef.current = kit;
        const { KitEventType } = await import(
          "@creit.tech/stellar-wallets-kit/types"
        );
        kit.on(KitEventType.STATE_UPDATED, (event: { payload?: { address?: string } }) => {
          const addr = event?.payload?.address;
          if (addr) {
            setAddress(addr);
          }
        });
        kit.on(KitEventType.DISCONNECT, () => {
          storeDisconnect();
        });
        try {
          const { address: saved } = await kit.getAddress();
          if (saved) {
            setAddress(saved);
          }
        } catch {
          /* no saved session */
        }
      } catch {
        /* kit not available in SSR */
      }
    })();
  }, [setAddress, storeDisconnect]);

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      const kit = await getKit();
      kitRef.current = kit;
      const { address: addr } = await kit.authModal();
      if (addr) {
        setAddress(addr);
        setWalletId("wallet");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("reject") || msg.includes("deny")) {
        throw new Error("User rejected the connection request");
      }
      throw new Error("Failed to connect wallet: " + msg);
    } finally {
      setConnecting(false);
    }
  }, [setAddress, setConnecting, setWalletId]);

  const disconnect = useCallback(() => {
    storeDisconnect();
  }, [storeDisconnect]);

  const fetchBalances = useCallback(async () => {
    if (!address) return;
    try {
      const response = await fetch(
        `${HORIZON_URL}/accounts/${address}/balances`
      );
      const data = await response.json();
      const bals = (data._embedded?.records || []).map(
        (r: { asset_type: string; balance: string; asset_code?: string }) => ({
          asset:
            r.asset_type === "native"
              ? "XLM"
              : r.asset_code || "Unknown",
          balance: r.balance,
        })
      );
      setBalances(bals);
    } catch {
      /* ignore */
    }
  }, [address, setBalances]);

  const signAndSend = useCallback(
    async (
      txXdr: string,
      onStatus?: (status: "pending" | "success" | "failed", hash?: string) => void
    ): Promise<{ hash: string; result: unknown }> => {
      if (!address) throw new Error("Wallet not connected");
      const kit = kitRef.current || (await getKit());

      let signedTxXdr: string;
      try {
        const result = await kit.signTransaction(txXdr, {
          networkPassphrase: NETWORK_PASSPHRASE,
          address,
        });
        signedTxXdr = result.signedTxXdr;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("reject") || msg.includes("deny")) {
          throw new Error("User rejected the transaction");
        }
        throw new Error("Transaction signing failed: " + msg);
      }

      onStatus?.("pending");

      try {
        const response = await fetch(`${HORIZON_URL}/transactions`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `tx=${encodeURIComponent(signedTxXdr)}`,
        });
        const data = await response.json();

        if (data.hash) {
          const txRecord = {
            hash: data.hash,
            status: "pending" as const,
            type: "contract_call",
            from: address,
            timestamp: Math.floor(Date.now() / 1000),
          };
          addTransaction(txRecord);
          onStatus?.("pending", data.hash);

          // Poll for confirmation
          const pollId = setInterval(async () => {
            try {
              const resp = await fetch(
                `${HORIZON_URL}/transactions/${data.hash}`
              );
              const txData = await resp.json();
              if (txData.status === "succeeded") {
                clearInterval(pollId);
                updateTransaction(data.hash, { status: "success" });
                onStatus?.("success", data.hash);
              } else if (
                txData.status === "failed" ||
                txData.status === "error"
              ) {
                clearInterval(pollId);
                updateTransaction(data.hash, {
                  status: "failed",
                  error: txData.result_xdr || "Transaction failed",
                });
                onStatus?.("failed", data.hash);
              }
            } catch {
              /* keep polling */
            }
          }, 3000);

          // Stop polling after 60s
          setTimeout(() => clearInterval(pollId), 60000);

          return { hash: data.hash, result: data };
        }

        onStatus?.("failed");
        throw new Error(data.result_xdr || "Transaction submission failed");
      } catch (err) {
        onStatus?.("failed");
        throw err;
      }
    },
    [address, addTransaction, updateTransaction]
  );

  return {
    address,
    isConnected,
    isConnecting,
    balances,
    connect,
    disconnect,
    fetchBalances,
    signAndSend,
  };
}
