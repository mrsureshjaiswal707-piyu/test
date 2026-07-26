import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CDYAOPQPXAWXZBRQTQ3OFAOOYSIBHCY5SYMUMJR4PPFKMHW5YRNU55OO",
  }
} as const


export interface Escrow {
  amount: i128;
  buyer: string;
  description: string;
  id: u32;
  seller: string;
  shipment_hash: string;
  status: EscrowStatus;
  token: string;
}

export type DataKey = {tag: "Escrow", values: readonly [u32]} | {tag: "NextId", values: void};

export type EscrowStatus = {tag: "Pending", values: void} | {tag: "Shipped", values: void} | {tag: "Completed", values: void} | {tag: "Disputed", values: void};

export interface Client {
  /**
   * Construct and simulate a get_escrow transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_escrow: ({escrow_id}: {escrow_id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Escrow>>

  /**
   * Construct and simulate a create_escrow transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_escrow: ({buyer, seller, amount, token, description}: {buyer: string, seller: string, amount: i128, token: string, description: string}, options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a raise_dispute transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  raise_dispute: ({escrow_id, caller}: {escrow_id: u32, caller: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a confirm_receipt transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  confirm_receipt: ({escrow_id}: {escrow_id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a confirm_shipment transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  confirm_shipment: ({escrow_id, shipment_hash}: {escrow_id: u32, shipment_hash: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAQAAAAAAAAAAAAAABkVzY3JvdwAAAAAACAAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAVidXllcgAAAAAAABMAAAAAAAAAC2Rlc2NyaXB0aW9uAAAAABAAAAAAAAAAAmlkAAAAAAAEAAAAAAAAAAZzZWxsZXIAAAAAABMAAAAAAAAADXNoaXBtZW50X2hhc2gAAAAAAAAQAAAAAAAAAAZzdGF0dXMAAAAAB9AAAAAMRXNjcm93U3RhdHVzAAAAAAAAAAV0b2tlbgAAAAAAABM=",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAgAAAAEAAAAAAAAABkVzY3JvdwAAAAAAAQAAAAQAAAAAAAAAAAAAAAZOZXh0SWQAAA==",
        "AAAAAgAAAAAAAAAAAAAADEVzY3Jvd1N0YXR1cwAAAAQAAAAAAAAAAAAAAAdQZW5kaW5nAAAAAAAAAAAAAAAAB1NoaXBwZWQAAAAAAAAAAAAAAAAJQ29tcGxldGVkAAAAAAAAAAAAAAAAAAAIRGlzcHV0ZWQ=",
        "AAAAAAAAAAAAAAAKZ2V0X2VzY3JvdwAAAAAAAQAAAAAAAAAJZXNjcm93X2lkAAAAAAAABAAAAAEAAAfQAAAABkVzY3JvdwAA",
        "AAAAAAAAAAAAAAANY3JlYXRlX2VzY3JvdwAAAAAAAAUAAAAAAAAABWJ1eWVyAAAAAAAAEwAAAAAAAAAGc2VsbGVyAAAAAAATAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAAAAAABXRva2VuAAAAAAAAEwAAAAAAAAALZGVzY3JpcHRpb24AAAAAEAAAAAEAAAAE",
        "AAAAAAAAAAAAAAANcmFpc2VfZGlzcHV0ZQAAAAAAAAIAAAAAAAAACWVzY3Jvd19pZAAAAAAAAAQAAAAAAAAABmNhbGxlcgAAAAAAEwAAAAA=",
        "AAAAAAAAAAAAAAAPY29uZmlybV9yZWNlaXB0AAAAAAEAAAAAAAAACWVzY3Jvd19pZAAAAAAAAAQAAAAA",
        "AAAAAAAAAAAAAAAQY29uZmlybV9zaGlwbWVudAAAAAIAAAAAAAAACWVzY3Jvd19pZAAAAAAAAAQAAAAAAAAADXNoaXBtZW50X2hhc2gAAAAAAAAQAAAAAA==" ]),
      options
    )
  }
  public readonly fromJSON = {
    get_escrow: this.txFromJSON<Escrow>,
        create_escrow: this.txFromJSON<u32>,
        raise_dispute: this.txFromJSON<null>,
        confirm_receipt: this.txFromJSON<null>,
        confirm_shipment: this.txFromJSON<null>
  }
}