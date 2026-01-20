# THREAT_MODEL — Attack surfaces and mitigations

## Primary attack surfaces

1) Mint pathway
- risk: mint past cap or mint via hidden route
- mitigation: cap invariant enforced; audit all mint routes; tests

2) Protocolpool spends/claims
- risk: unauthorized value movement
- mitigation: governance gating; allowlists; circuit breaker

3) IBC value movement
- risk: drain via compromised channel/app/client
- mitigation: explicit policy; circuit breaker interchain isolation; channel allowlists

4) 08-wasm light clients (if enabled)
- risk: malicious/buggy client code
- mitigation: audit + allowlist; governance gating; fast IBC isolation

## Response posture

- contain first with circuit breaker presets
- remediate via governance + upgrade
- re-enable in stages after invariant checks
