#!/usr/bin/env python3
"""poa_simulator.py

Reference (non-chain) simulator for PoA validator compensation.

Design goal: **budget-conserving** reward distribution.

Usage:
  python sim/poa_simulator.py sim/scenarios/example_epoch.json
"""

from __future__ import annotations

import json
import sys
from dataclasses import dataclass
from typing import Dict, List, Tuple


@dataclass(frozen=True)
class Authority:
    authority_id: str
    bonus_beta: float  # 0..beta_max


@dataclass(frozen=True)
class Config:
    fee_total: int              # integer coin amount (e.g. uregen)
    validator_fraction: float   # 0..1
    burn_fraction: float        # 0..1
    beta_max: float             # max performance bonus


def clamp(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))


def distribute_budget_conserving(total: int, weights: List[float]) -> List[int]:
    """Distribute `total` across `weights` deterministically.

    Rounding rule:
      - floor each share
      - allocate remainder to highest weight(s), tie-break by stable order
    """
    if total < 0:
        raise ValueError("total must be non-negative")
    if not weights:
        return []
    if any(w < 0 for w in weights):
        raise ValueError("weights must be non-negative")

    s = sum(weights)
    if s == 0:
        # all weights zero -> equal split
        base = total // len(weights)
        rem = total - base * len(weights)
        out = [base] * len(weights)
        for i in range(rem):
            out[i] += 1
        return out

    raw = [total * (w / s) for w in weights]
    floored = [int(x) for x in raw]
    rem = total - sum(floored)

    # allocate remainder to highest weight, tie-break by index order
    order = sorted(range(len(weights)), key=lambda i: (-weights[i], i))
    for i in range(rem):
        floored[order[i % len(order)]] += 1

    assert sum(floored) == total
    return floored


def simulate_epoch(cfg: Config, authorities: List[Authority]) -> Dict:
    # sanity
    if cfg.validator_fraction + cfg.burn_fraction > 1.0 + 1e-9:
        raise ValueError("validator_fraction + burn_fraction must be <= 1")

    fee_total = cfg.fee_total
    val_pool = int(fee_total * cfg.validator_fraction)
    burn_pool = int(fee_total * cfg.burn_fraction)
    community_pool = fee_total - val_pool - burn_pool

    weights = [1.0 + clamp(a.bonus_beta, 0.0, cfg.beta_max) for a in authorities]
    payouts = distribute_budget_conserving(val_pool, weights)

    return {
        "fee_total": fee_total,
        "validator_pool": val_pool,
        "burn_pool": burn_pool,
        "community_pool": community_pool,
        "authorities": [
            {
                "authority_id": a.authority_id,
                "beta": clamp(a.bonus_beta, 0.0, cfg.beta_max),
                "weight": weights[i],
                "payout": payouts[i],
            }
            for i, a in enumerate(authorities)
        ],
        "payout_sum": sum(payouts),
    }


def main() -> None:
    if len(sys.argv) != 2:
        print("Usage: python sim/poa_simulator.py <scenario.json>", file=sys.stderr)
        sys.exit(2)

    path = sys.argv[1]
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    cfg = Config(
        fee_total=int(data["fee_total"]),
        validator_fraction=float(data["validator_fraction"]),
        burn_fraction=float(data["burn_fraction"]),
        beta_max=float(data.get("beta_max", 0.15)),
    )
    authorities = [Authority(a["authority_id"], float(a.get("beta", 0.0))) for a in data["authorities"]]

    out = simulate_epoch(cfg, authorities)
    print(json.dumps(out, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
