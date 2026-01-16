# Deploy (Base devnet/testnet)

## Portal
- Deploy `ClickRegenPortal` with an initial `finalizer` address (relayer).
- Set caps: `maxClicksPerAddressPerDay`, `maxClicksPerDayGlobal`.
- Optional: pause/unpause during incidents.

## Relayer
- Configure `.env` with RPC, private key, portal address, chain id.
- Run `npm start` (watches events and finalizes receipts).

## Web
- Configure `NEXT_PUBLIC_RPC_URL` and `NEXT_PUBLIC_PORTAL_ADDRESS`.
- Deploy to Vercel or any Node host.

## Production note
If you later want “user pays nothing”:
- Add account abstraction / paymaster sponsorship OR
- use a custodial session key model (not implemented here).
