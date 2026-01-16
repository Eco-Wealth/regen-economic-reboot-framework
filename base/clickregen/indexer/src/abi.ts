export const intentEventAbi = [
  {
    "type": "event",
    "name": "IntentSubmitted",
    "inputs": [
      {
        "indexed": true,
        "name": "intentId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "name": "sender",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "action",
        "type": "uint32"
      },
      {
        "indexed": false,
        "name": "expiry",
        "type": "uint64"
      },
      {
        "indexed": false,
        "name": "nonce",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "payload",
        "type": "bytes"
      },
      {
        "indexed": false,
        "name": "payloadHash",
        "type": "bytes32"
      }
    ]
  }
] as const;
