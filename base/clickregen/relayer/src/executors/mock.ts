import { keccak256, toHex } from 'viem';

export type ExecutionResult = {
  success: boolean;
  errorCode: number;
  stateHash: `0x${string}`;
  execRef: string;
  execRefHash: `0x${string}`;
  resultPayload: `0x${string}`;
};

export function executeMock(intentId: `0x${string}`): ExecutionResult {
  const execRef = `mock:${intentId.slice(0, 10)}`;
  const execRefHash = keccak256(toHex(execRef));
  return {
    success: true,
    errorCode: 0,
    stateHash: '0x' + '00'.repeat(32),
    execRef,
    execRefHash,
    resultPayload: '0x',
  };
}
