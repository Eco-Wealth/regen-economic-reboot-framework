export const portalAbi = [
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
  },
  {
    "type": "function",
    "name": "finalizeReceipt",
    "stateMutability": "nonpayable",
    "inputs": [
      {
        "name": "intentId",
        "type": "bytes32"
      },
      {
        "name": "success",
        "type": "bool"
      },
      {
        "name": "errorCode",
        "type": "uint32"
      },
      {
        "name": "stateHash",
        "type": "bytes32"
      },
      {
        "name": "execRefHash",
        "type": "bytes32"
      },
      {
        "name": "resultPayload",
        "type": "bytes"
      }
    ],
    "outputs": []
  }
] as const;
