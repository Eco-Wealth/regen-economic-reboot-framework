import 'dotenv/config';
import { createPublicClient, createWalletClient, http, parseAbiItem } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { portalAbi } from './abi.js';
import { loadPolicy, shouldFinalize } from './policy.js';
import { executeMock } from './executors/mock.js';

const RPC_URL = process.env.RPC_URL ?? 'http://127.0.0.1:8545';
const CHAIN_ID = Number(process.env.CHAIN_ID ?? 31337);
const PORTAL_ADDRESS = (process.env.PORTAL_ADDRESS ?? '') as `0x${string}`;
const PRIVATE_KEY = (process.env.PRIVATE_KEY ?? '') as `0x${string}`;
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS ?? 2000);

if (!PORTAL_ADDRESS || PORTAL_ADDRESS === '0x0000000000000000000000000000000000000000') {
  console.error('Set PORTAL_ADDRESS in .env');
  process.exit(1);
}
if (!PRIVATE_KEY || PRIVATE_KEY === '0xYOUR_RELAYER_PRIVATE_KEY') {
  console.error('Set PRIVATE_KEY in .env');
  process.exit(1);
}

const account = privateKeyToAccount(PRIVATE_KEY);

const chain = {
  id: CHAIN_ID,
  name: 'custom',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
} as const;

const publicClient = createPublicClient({ chain, transport: http(RPC_URL) });
const walletClient = createWalletClient({ chain, transport: http(RPC_URL), account });

const policy = loadPolicy();

const intentEvent = parseAbiItem(
  'event IntentSubmitted(bytes32 indexed intentId, address indexed sender, uint32 action, uint64 expiry, uint256 nonce, bytes payload, bytes32 payloadHash)'
);

async function main() {
  console.log('Relayer:', account.address);
  console.log('Portal:', PORTAL_ADDRESS);
  console.log('Policy:', policy);

  let lastBlock = await publicClient.getBlockNumber();

  for (;;) {
    const head = await publicClient.getBlockNumber();
    if (head > lastBlock) {
      const logs = await publicClient.getLogs({
        address: PORTAL_ADDRESS,
        event: intentEvent,
        fromBlock: lastBlock + 1n,
        toBlock: head,
      });

      for (const log of logs) {
        const intentId = log.args.intentId as `0x${string}`;
        if (!shouldFinalize(policy)) continue;

        const exec = executeMock(intentId);

        try {
          const hash = await walletClient.writeContract({
            address: PORTAL_ADDRESS,
            abi: portalAbi,
            functionName: 'finalizeReceipt',
            args: [intentId, exec.success, exec.errorCode, exec.stateHash, exec.execRefHash, exec.resultPayload],
          });
          console.log('finalized', intentId, hash);
        } catch (e) {
          console.warn('finalize failed', intentId, e);
        }
      }

      lastBlock = head;
    }

    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
