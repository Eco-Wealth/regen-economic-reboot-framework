import {
  CosmWasmClient,
  SigningCosmWasmClient,
  ExecuteResult,
} from "@cosmjs/cosmwasm-stargate";
import { toUtf8 } from "@cosmjs/encoding";

export interface Eligibility {
  credit_type?: string;
  class_ids?: string[];
  project_ids?: string[];
  batch_denoms?: string[];
  start_time?: number;
  end_time?: number;
}

export interface CreateObligationMsg {
  metadata_uri: string;
  target_unit: string;
  target_amount: string;
  eligibility: Eligibility;
  executors: string[];
}

export interface ClearMsg {
  obligation_id: number;
  proof_uri: string;
}

export interface Config {
  governor: string;
  paused: boolean;
  threshold: number;
  deny_reuse_retirements: boolean;
}

export interface Obligation {
  id: number;
  issuer: string;
  executors: string[];
  metadata_uri: string;
  target_unit: string;
  target_amount: string;
  eligibility: Eligibility;
  status: string;
  verified_digest?: string;
  verified_impact?: [string, string];
  cleared_at?: number;
  proof_uri?: string;
}

export class DfNQueryClient {
  constructor(private readonly client: CosmWasmClient, private readonly contractAddress: string) {}
  async getConfig(): Promise<Config> {
    return await this.client.queryContractSmart(this.contractAddress, { Config: {} });
  }
  async getObligation(obligation_id: number): Promise<Obligation> {
    return await this.client.queryContractSmart(this.contractAddress, { Obligation: { obligation_id } });
  }
  async getObligations(start_after?: number, limit = 20): Promise<Obligation[]> {
    return await this.client.queryContractSmart(this.contractAddress, { Obligations: { start_after, limit } });
  }
}

export class DfNClient extends DfNQueryClient {
  constructor(private readonly signingClient: SigningCosmWasmClient, contractAddress: string, private readonly senderAddress: string) {
    super(signingClient, contractAddress);
  }

  async createObligation(msg: CreateObligationMsg): Promise<ExecuteResult> {
    return await this.signingClient.execute(this.senderAddress, this.contractAddress, {
      CreateObligation: msg,
    }, "auto", "Create obligation");
  }

  async clear(obligation_id: number, proof_uri: string): Promise<ExecuteResult> {
    return await this.signingClient.execute(this.senderAddress, this.contractAddress, {
      Clear: { obligation_id, proof_uri },
    }, "auto", "Clear obligation");
  }
}
