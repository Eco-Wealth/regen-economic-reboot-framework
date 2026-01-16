export const portalAbi = [
  {
    "type": "function",
    "name": "computeIntentId",
    "stateMutability": "view",
    "inputs": [
      {
        "name": "sender",
        "type": "address"
      },
      {
        "name": "nonce",
        "type": "uint256"
      },
      {
        "name": "action",
        "type": "uint32"
      },
      {
        "name": "payload",
        "type": "bytes"
      },
      {
        "name": "expiry",
        "type": "uint64"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bytes32"
      }
    ]
  },
  {
    "type": "function",
    "name": "submitIntent",
    "stateMutability": "nonpayable",
    "inputs": [
      {
        "name": "intentId",
        "type": "bytes32"
      },
      {
        "name": "action",
        "type": "uint32"
      },
      {
        "name": "payload",
        "type": "bytes"
      },
      {
        "name": "expiry",
        "type": "uint64"
      },
      {
        "name": "nonce",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bytes32"
      }
    ]
  },
  {
    "type": "function",
    "name": "getCounts",
    "stateMutability": "view",
    "inputs": [
      {
        "name": "a",
        "type": "address"
      }
    ],
    "outputs": [
      {
        "name": "dayIndex",
        "type": "uint256"
      },
      {
        "name": "globalToday",
        "type": "uint32"
      },
      {
        "name": "addressToday",
        "type": "uint32"
      },
      {
        "name": "perAddressCap",
        "type": "uint32"
      },
      {
        "name": "globalCap",
        "type": "uint32"
      }
    ]
  }
] as const;
