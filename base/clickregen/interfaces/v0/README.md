# Interfaces v0 (frozen envelope)

Only the envelope is frozen early. Action-specific payload ABI can evolve.

## IntentEnvelopeV0
- `v`: "v0"
- `intentId`: 0x + 64 hex
- `sourceChainId`: number
- `evmSender`: 0x address
- `action`: string enum (v0)
- `payload`: 0x bytes
- `expiry`: unix seconds (0 allowed)
- `nonce`: number

## ReceiptEnvelopeV0
- `v`: "v0"
- `intentId`
- `execRef`: string (human-friendly ref; relayer may store tx hash here)
- `execRefHash`: 0x32 (bytes32) (e.g. keccak256(regenTxHash))
- `success`: boolean
- `errorCode`: uint32
- `stateHash`: 0x32 (optional; 0 if unused)
- `resultPayload`: 0x bytes

## v0 actions (ClickRegen)
- CLICK
- INFER
- RETIRE
- TASK
