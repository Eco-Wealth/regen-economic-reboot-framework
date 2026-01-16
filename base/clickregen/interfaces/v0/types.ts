export type Hex32 = `0x${string}`;
export type HexBytes = `0x${string}`;
export type Address = `0x${string}`;

export type IntentActionV0 = 'CLICK' | 'INFER' | 'RETIRE' | 'TASK';

export type IntentEnvelopeV0 = {
  v: 'v0';
  intentId: Hex32;
  sourceChainId: number;
  evmSender: Address;
  action: IntentActionV0;
  payload: HexBytes;
  expiry: number;
  nonce: number;
  note?: string;
};

export type ReceiptEnvelopeV0 = {
  v: 'v0';
  intentId: Hex32;
  execRef: string;
  execRefHash: Hex32;
  success: boolean;
  errorCode: number;
  stateHash: Hex32;
  resultPayload: HexBytes;
};
