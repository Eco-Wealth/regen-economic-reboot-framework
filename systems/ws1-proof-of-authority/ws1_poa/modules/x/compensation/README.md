# x/compensation (spec scaffold)

## Responsibilities
- Collect fees into epoch pools
- Split pool into validator pay, burn, and community pools
- Distribute validator pay with budget conservation

## Key design constraints
- Deterministic payouts
- Sum(payouts) == validator_pool (after rounding)
- Transparent accounting events (for dashboards)

## Interfaces (conceptual)
- MsgDistributeRewards
- QueryRewards
