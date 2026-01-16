export const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL ?? 'http://127.0.0.1:8545';
export const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 31337);
export const portalAddress = (process.env.NEXT_PUBLIC_PORTAL_ADDRESS ?? '') as `0x${string}`;
