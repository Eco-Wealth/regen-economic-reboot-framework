'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPublicClient, createWalletClient, custom, http } from 'viem';
import { portalAbi } from '@/lib/portalAbi';
import { chainId, portalAddress, rpcUrl } from '@/lib/config';

type Counts = {
  globalToday: number;
  addressToday: number;
  perAddressCap: number;
  globalCap: number;
};

function shortAddr(a: string) {
  return a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '';
}

export function ClickPanel() {
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const [status, setStatus] = useState<'disconnected' | 'ready' | 'submitting' | 'confirmed' | 'error'>('disconnected');
  const [txHash, setTxHash] = useState<string>('');
  const [counts, setCounts] = useState<Counts>({ globalToday: 0, addressToday: 0, perAddressCap: 0, globalCap: 0 });
  const [educationIndex, setEducationIndex] = useState(0);

  const education = useMemo(
    () => [
      'Your click is a verifiable on-chain demand signal. It proves attention exists.',
      'Budgets must be capped to survive spam and still grow.',
      'Receipts finalize state so the UI resolves without support.',
      'Later: some clicks can trigger real Regen retirements behind policy gates.',
    ],
    []
  );

  const publicClient = useMemo(() => {
    return createPublicClient({
      chain: {
        id: chainId,
        name: 'custom',
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        rpcUrls: { default: { http: [rpcUrl] } },
      },
      transport: http(rpcUrl),
    });
  }, []);

  async function refreshCounts(a?: `0x${string}`) {
    if (!portalAddress) return;
    const target = a ?? address;
    if (!target) return;
    try {
      const res = await publicClient.readContract({
        address: portalAddress,
        abi: portalAbi,
        functionName: 'getCounts',
        args: [target],
      });
      const [, globalToday, addressToday, perAddressCap, globalCap] = res as any;
      setCounts({
        globalToday: Number(globalToday),
        addressToday: Number(addressToday),
        perAddressCap: Number(perAddressCap),
        globalCap: Number(globalCap),
      });
    } catch {
      // ignore
    }
  }

  async function connect() {
    const eth = (window as any).ethereum;
    if (!eth) {
      setStatus('error');
      return;
    }
    const wallet = createWalletClient({
      transport: custom(eth),
      chain: publicClient.chain,
    });
    const [a] = (await wallet.requestAddresses()) as any;
    setAddress(a);
    setStatus('ready');
    refreshCounts(a);
  }

  async function click() {
    if (!address) return;
    if (!portalAddress) {
      setStatus('error');
      return;
    }
    const eth = (window as any).ethereum;
    if (!eth) {
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setTxHash('');

    const wallet = createWalletClient({
      transport: custom(eth),
      chain: publicClient.chain,
      account: address,
    });

    const action = 1; // CLICK
    const payload = '0x' as const;
    const expiry = 0;
    const nonce = BigInt(Date.now());

    try {
      const intentId = (await publicClient.readContract({
        address: portalAddress,
        abi: portalAbi,
        functionName: 'computeIntentId',
        args: [address, nonce, action, payload, expiry],
      })) as `0x${string}`;

      const hash = await wallet.writeContract({
        address: portalAddress,
        abi: portalAbi,
        functionName: 'submitIntent',
        args: [intentId, action, payload, expiry, nonce],
      });

      setTxHash(hash);
      await publicClient.waitForTransactionReceipt({ hash });
      setStatus('confirmed');
      setEducationIndex((x) => (x + 1) % education.length);
      refreshCounts(address);
    } catch {
      setStatus('error');
    }
  }

  useEffect(() => {
    if (address) refreshCounts(address);
  }, [address]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border p-4" style={{ borderColor: 'rgb(var(--border))', background: 'rgb(var(--card))' }}>
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Wallet</div>
          <div className="text-xs opacity-80">{address ? shortAddr(address) : 'not connected'}</div>
        </div>

        <div className="mt-3 flex gap-2">
          {!address ? (
            <button
              onClick={connect}
              className="rounded-xl px-3 py-2 text-sm font-medium"
              style={{ background: 'rgb(var(--fg))', color: 'rgb(var(--bg))' }}
            >
              Connect
            </button>
          ) : (
            <button
              onClick={click}
              disabled={status === 'submitting'}
              className="w-full rounded-2xl px-4 py-4 text-lg font-semibold tracking-wide shadow-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(20,184,166,0.95), rgba(56,189,248,0.95))',
                color: 'black',
                opacity: status === 'submitting' ? 0.7 : 1,
              }}
            >
              {status === 'submitting' ? 'Submitting…' : 'CLICK'}
            </button>
          )}
        </div>

        <div className="mt-3 text-xs opacity-80">
          Status: <span className="font-medium">{status}</span>
          {txHash ? <span className="ml-2 break-all">tx: {txHash}</span> : null}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border p-4" style={{ borderColor: 'rgb(var(--border))', background: 'rgb(var(--card))' }}>
          <div className="text-xs opacity-80">Global clicks today</div>
          <div className="mt-1 text-2xl font-semibold">{counts.globalToday}</div>
          <div className="mt-1 text-xs opacity-70">cap: {counts.globalCap || '∞'}</div>
        </div>
        <div className="rounded-2xl border p-4" style={{ borderColor: 'rgb(var(--border))', background: 'rgb(var(--card))' }}>
          <div className="text-xs opacity-80">Your clicks today</div>
          <div className="mt-1 text-2xl font-semibold">{counts.addressToday}</div>
          <div className="mt-1 text-xs opacity-70">cap: {counts.perAddressCap || '∞'}</div>
        </div>
        <div className="rounded-2xl border p-4 bg-metal" style={{ borderColor: 'rgb(var(--border))', backgroundColor: 'rgb(var(--card))' }}>
          <div className="text-xs opacity-80">What happened?</div>
          <div className="mt-2 text-sm leading-snug">{education[educationIndex]}</div>
        </div>
      </div>

      <div className="rounded-2xl border p-4" style={{ borderColor: 'rgb(var(--border))', background: 'rgb(var(--card))' }}>
        <div className="text-sm font-semibold">Leaderboard</div>
        <div className="mt-2 text-sm opacity-80">Placeholder. Add an indexer (logs → DB) or read events to rank addresses.</div>
      </div>
    </div>
  );
}
