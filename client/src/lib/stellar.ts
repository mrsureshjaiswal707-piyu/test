"use client";

import * as StellarSdk from "@stellar/stellar-sdk";
import { RPC_URL, NETWORK_PASSPHRASE } from "./constants";

const server = new StellarSdk.rpc.Server(RPC_URL);

export { server, StellarSdk };

export function getContract(contractAddress: string) {
  return new StellarSdk.Contract(contractAddress);
}

export async function simulateContract(
  contractAddress: string,
  method: string,
  ...args: StellarSdk.xdr.ScVal[]
) {
  const contract = getContract(contractAddress);
  const sourceAccount = await server.getAccount(
    "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"
  );
  const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: "100",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const result = await server.simulateTransaction(transaction);
  return result;
}

export function buildContractTransaction(
  contractAddress: string,
  method: string,
  sourceAccount: StellarSdk.Account,
  ...args: StellarSdk.xdr.ScVal[]
) {
  const contract = getContract(contractAddress);
  return new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: "100",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(300)
    .build();
}

export async function submitTransaction(signedXdr: string) {
  const tx = StellarSdk.TransactionBuilder.fromXDR(
    signedXdr,
    NETWORK_PASSPHRASE
  );
  const response = await server.sendTransaction(tx);
  return response;
}

export async function getTransactionStatus(hash: string) {
  try {
    const response = await server.getTransaction(hash);
    return response;
  } catch {
    return null;
  }
}

export function scValToAddress(scVal: StellarSdk.xdr.ScVal): string {
  return StellarSdk.Address.fromScVal(scVal).toString();
}

export function scValToI128(scVal: StellarSdk.xdr.ScVal): bigint {
  const big = StellarSdk.scValToNative(scVal);
  return typeof big === "bigint" ? big : BigInt(0);
}

export { StellarSdk as Sdk };
