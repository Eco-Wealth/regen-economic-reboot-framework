\
"""
Regen Dynamic Supply Model v0.6
Autonomous Monetary Stabilization + optional live ecological feed + optional dashboard streaming.

NOTE: Defaults are SAFE for offline simulation (no network calls):
- USE_LIVE_FEED = False
- ENABLE_STREAMING = False
"""

from __future__ import annotations
import numpy as np
import pandas as pd
import datetime
import json
import requests

# --- Global Parameters ---
SUPPLY_CAP = 221_000_000
INITIAL_SUPPLY = 200_000_000
INITIAL_VALIDATOR_FUND = 1_000_000

ALPHA = 0.7  # Burn elasticity
BETA = 1.0   # Mint elasticity

EPOCHS = 1000  # Simulation epochs (weeks)
VALIDATOR_COST = 1_000_000

# Fee routing ratios
BURN_RATIO = 0.4
VALIDATOR_RATIO = 0.4
COMMUNITY_RATIO = 0.2

# Ecological coupling parameters
ECO_COUPLING = True
ECO_IMPACT_SCALE = 0.05

# Smart Trigger System thresholds
INFLATION_UPPER_THRESHOLD = 0.02
INFLATION_LOWER_THRESHOLD = -0.02
ECO_SHOCK_THRESHOLD = 0.8

# Endpoint configuration (placeholders)
GAIAAI_API_URL = "https://regen.gaiaai.xyz/api/v1/ecological-metrics"
DASHBOARD_API_URL = "https://dashboard.regen.network/api/v1/update"

# Defaults: OFF for offline runs
USE_LIVE_FEED = False
ENABLE_STREAMING = False
STREAM_INTERVAL = 10

# Reproducibility
np.random.seed(42)

def simulate_ecological_impact(epoch: int) -> float:
    """Synthetic eco index ~ live-style volatility."""
    base_impact = 1.0 + 0.1 * np.sin(epoch / 8)
    stochastic = np.random.normal(1, 0.05)
    return max(base_impact * stochastic, 0.0)

def fetch_live_ecological_impact() -> float:
    """Fetch live ecological data. Falls back to synthetic if unavailable."""
    try:
        resp = requests.get(GAIAAI_API_URL, timeout=5)
        if resp.status_code != 200:
            return simulate_ecological_impact(0)
        data = json.loads(resp.text)
        eco_index = (
            1 + 0.001 * data.get("co2_tonnes", 0)
            + 0.01 * data.get("biodiversity_index", 0)
            + 0.0001 * data.get("hectares_restored", 0)
        )
        return float(min(max(eco_index, 0.8), 1.5))
    except Exception:
        return simulate_ecological_impact(0)

def simulate_throughput(epoch: int) -> float:
    """Synthetic fee volume with seasonality + noise."""
    base_fee = 800_000
    seasonal = 1 + 0.3 * np.sin(epoch / 6)
    noise = np.random.normal(1, 0.1)
    return float(max(base_fee * seasonal * noise, 0))

def autonomous_parameter_adjustment(alpha: float, beta: float, inflation_rate: float, eco_index: float) -> tuple[float,float]:
    """Bounded auto-tuning of alpha/beta under shocks."""
    new_alpha, new_beta = alpha, beta

    if inflation_rate > INFLATION_UPPER_THRESHOLD:
        new_alpha = min(alpha * 1.05, 1.0)
        new_beta = max(beta * 0.95, 0.8)
    elif inflation_rate < INFLATION_LOWER_THRESHOLD:
        new_beta = min(beta * 1.05, 1.2)
        new_alpha = max(alpha * 0.95, 0.4)

    return new_alpha, new_beta

def supply_governor(fees: float, current_supply: float, alpha: float, beta: float, eco_index: float) -> tuple[float,float,float]:
    """Mint/Burn based on validator funding gap after fee routing, with ecological modifier.

    Assumptions:
    - Fees are denominated in REGEN.
    - Fees are split: burn pool (BURN_RATIO), validator pool (VALIDATOR_RATIO), community (COMMUNITY_RATIO).
    - Burn pool is burned immediately from supply.
    - Validator pool funds fixed validator cost; if short, mint covers the gap (bounded by beta & eco modifier).
    - If validator pool exceeds cost, optional extra burn (alpha fraction) burns surplus to increase scarcity while leaving buffer.
    """
    eco_mod = 1 + ECO_IMPACT_SCALE * (eco_index - 1) if ECO_COUPLING else 1.0

    burn_fee = fees * BURN_RATIO * eco_mod
    validator_fee = fees * VALIDATOR_RATIO

    deficit = max(VALIDATOR_COST - validator_fee, 0.0)
    surplus = max(validator_fee - VALIDATOR_COST, 0.0)

    mint = beta * deficit
    burn_extra = alpha * eco_mod * surplus

    burn = burn_fee + burn_extra

    new_supply = min(current_supply - burn + mint, SUPPLY_CAP)
    return float(new_supply), float(burn), float(mint)

def stream_to_dashboard(payload: dict) -> None:
    if not ENABLE_STREAMING:
        return
    try:
        requests.post(DASHBOARD_API_URL, json=payload, timeout=5)
    except Exception:
        pass

def run_simulation(
    epochs: int = EPOCHS,
    alpha: float = ALPHA,
    beta: float = BETA,
    use_live_feed: bool = USE_LIVE_FEED,
) -> pd.DataFrame:
    supply = float(INITIAL_SUPPLY)
    validator_fund = float(INITIAL_VALIDATOR_FUND)
    rows = []

    for epoch in range(int(epochs)):
        fees = simulate_throughput(epoch)
        eco = fetch_live_ecological_impact() if use_live_feed else simulate_ecological_impact(epoch)

        supply, burn, mint = supply_governor(fees, supply, alpha, beta, eco)

        # Fee routing (40% validator + mint to validator fund in this model)
        validator_fee = fees * VALIDATOR_RATIO
        validator_income = validator_fee + mint
        validator_fund += validator_income - VALIDATOR_COST

        inflation_rate = (mint - burn) / max(supply, 1.0)

        # Autonomous adjustment step
        alpha, beta = autonomous_parameter_adjustment(alpha, beta, inflation_rate, eco)

        row = {
            "epoch": epoch,
            "fees": fees,
            "eco_index": eco,
            "alpha": alpha,
            "beta": beta,
            "supply": supply,
            "burn": burn,
            "mint": mint,
            "validator_fund": validator_fund,
            "inflation_rate": inflation_rate,
            "supply_ratio": supply / SUPPLY_CAP,
            "timestamp": datetime.datetime.utcnow().isoformat()
        }
        rows.append(row)

        if ENABLE_STREAMING and (epoch % STREAM_INTERVAL == 0):
            stream_to_dashboard(row)

    return pd.DataFrame(rows)

if __name__ == "__main__":
    df = run_simulation()
    print(df.tail(5).to_string(index=False))
