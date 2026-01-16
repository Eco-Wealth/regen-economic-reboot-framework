import 'dotenv/config';
import fs from 'node:fs';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { loadState, saveState } from './state.js';
import { increment, loadLeaderboard, saveLeaderboard } from './leaderboard.js';

const RPC_URL = process.env.RPC_URL ?? 'http://127.0.0.1:8545';
const CHAIN_ID = Number(process.env.CHAIN_ID ?? 31337);
const PORTAL_ADDRESS = (process.env.PORTAL_ADDRESS ?? '') as `0x${string}`;
const FROM_BLOCK = BigInt(process.env.FROM_BLOCK ?? '0');
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS ?? 3000);
const OUT_DIR = process.env.OUT_DIR ?? './data';

if (!PORTAL_ADDRESS || PORTAL_ADDRESS === '0x0000000000000000000000000000000000000000') {
  console.error('Set PORTAL_ADDRESS in .env');
  process.exit(1);
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const chain = {
  id: CHAIN_ID,
  name: 'custom',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
} as const;

const publicClient = createPublicClient({ chain, transport: http(RPC_URL) });

const intentEvent = parseAbiItem(
  'event IntentSubmitted(bytes32 indexed intentId, address indexed sender, uint32 action, uint64 expiry, uint256 nonce, bytes payload, bytes32 payloadHash)'
);

function bigintToString(b: bigint) {
  return b.toString(10);
}

function stringToBigint(s: string) {
  return BigInt(s);
}

async function main() {
  console.log('Indexer portal:', PORTAL_ADDRESS);
  console.log('Out dir:', OUT_DIR);

  const lb = loadLeaderboard(OUT_DIR);
  const st = loadState(OUT_DIR);

  let lastProcessed =
    st ? stringToBigint(st.lastProcessedBlock) : (FROM_BLOCK > 0n ? FROM_BLOCK - 1n : 0n);

  for (;;) {
    try {
      const head = await publicClient.getBlockNumber();
      const from = lastProcessed + 1n;
      if (from <= head) {
        const logs = await publicClient.getLogs({
          address: PORTAL_ADDRESS,
          event: intentEvent,
          fromBlock: from,
          toBlock: head,
        });

        for (const log of logs) {
          const sender = (log.args.sender as string) ?? '';
          if (sender) increment(lb, sender, 1);
        }

        lastProcessed = head;

        saveLeaderboard(OUT_DIR, lb);
        saveState(OUT_DIR, { lastProcessedBlock: bigintToString(lastProcessed) });

        console.log(`scanned ${from}..${head} (+${logs.length} intents)`);
      }
    } catch (e) {
      console.warn('scan error', e);
    }

    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
