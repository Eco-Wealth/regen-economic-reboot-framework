# Threat model (v0)

## Primary risks
- Budget drain via spam clicks
- Sybil addresses farming any future reward
- Relayer key compromise
- Event replay / duplicate intent submission
- UI misleading users about “earn” or “impact”

## Mitigations (v0)
- On-chain caps: per-address/day and global/day
- Deterministic intentId + dedupe mapping
- Relayer idempotency (never finalize twice)
- Emergency pause
- No guaranteed earnings claims in UI copy
