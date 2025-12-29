# x/authority (spec scaffold)

## Responsibilities
- Store the on-chain authority registry
- Provide deterministic active authority set selection
- Provide validator updates to consensus (implementation detail decided by R&D)

## Key design constraints
- Deterministic ordering of authority set updates
- Governance-controlled activation/deactivation
- Rotation at epoch boundary (BeginBlock preferred)

## Interfaces (conceptual)
- MsgRegisterAuthority
- MsgDeactivateAuthority
- MsgRotateAuthorities
- QueryAuthorities
