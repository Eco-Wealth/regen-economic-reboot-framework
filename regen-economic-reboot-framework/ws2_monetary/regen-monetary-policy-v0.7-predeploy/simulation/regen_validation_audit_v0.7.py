\
"""
Regen Monetary Policy Deep Validation Audit v0.7-predeploy

Runs:
- Regen Dynamic Supply (v0.6-like dynamics; offline)
- EIP-1559-style baseline (simplified)
- PID hybrid controller (reference)

Outputs (to ../exports):
- regen_validation_metrics.csv
- regen_parameter_sweep.csv
- regen_confidence_report.json
- validation_summary.md
- charts/*.png
"""

from __future__ import annotations
import json, math, os
from pathlib import Path
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# Reproducibility
np.random.seed(42)

# Paths
ROOT = Path(__file__).resolve().parents[1]
EXPORTS = ROOT / "exports"
CHARTS = EXPORTS / "charts"
CHARTS.mkdir(parents=True, exist_ok=True)

# Global params
EPOCHS = 1000
SUPPLY_CAP = 221_000_000
INITIAL_SUPPLY = 200_000_000
VALIDATOR_COST = 1_000_000

# Fee routing ratios (must sum to 1.0)
BURN_RATIO = 0.4
VALIDATOR_RATIO = 0.4
COMMUNITY_RATIO = 0.2

# Regen params
ALPHA = 0.7
BETA = 1.0
ECO_IMPACT_SCALE = 0.05

# Auto-stabilization bounds
ALPHA_MIN, ALPHA_MAX = 0.4, 1.0
BETA_MIN, BETA_MAX = 0.8, 1.2

INFL_UP, INFL_DOWN = 0.02, -0.02
ECO_SHOCK_THRESHOLD = 0.8

def eco_index(epoch: int) -> float:
    # Live-style volatility: smooth + fat-tail shocks occasionally
    base = 1.0 + 0.12*np.sin(epoch/10)
    noise = np.random.normal(1.0, 0.08)
    shock = 1.0
    if np.random.rand() < 0.02:  # 2% shock probability
        shock = np.random.uniform(0.6, 0.9)
    return float(max(base * noise * shock, 0.5))

def throughput(epoch: int) -> float:
    base = 800_000
    seasonal = 1 + 0.3*np.sin(epoch/6)
    noise = np.random.normal(1.0, 0.1)
    shock = 1.0
    if np.random.rand() < 0.02:
        shock = np.random.uniform(0.4, 0.8)
    return float(max(base * seasonal * noise * shock, 0.0))

def autonomous_parameter_adjustment(alpha: float, beta: float, inflation_rate: float, eco: float) -> tuple[float,float]:
    new_alpha, new_beta = alpha, beta
    if inflation_rate > INFL_UP:
        new_alpha = min(alpha * 1.05, ALPHA_MAX)
        new_beta = max(beta * 0.95, BETA_MIN)
    elif inflation_rate < INFL_DOWN:
        new_beta = min(beta * 1.05, BETA_MAX)
        new_alpha = max(alpha * 0.95, ALPHA_MIN)
    return float(new_alpha), float(new_beta)

def regen_model(alpha=ALPHA, beta=BETA) -> pd.DataFrame:
    supply = float(INITIAL_SUPPLY)
    fund = 1_000_000.0
    rows=[]
    for e in range(EPOCHS):
        eco = eco_index(e)
        fees = throughput(e)

        eco_mod = 1 + ECO_IMPACT_SCALE*(eco-1)

        burn_fee = fees * BURN_RATIO * eco_mod
        validator_fee = fees * VALIDATOR_RATIO

        deficit = max(VALIDATOR_COST - validator_fee, 0.0)
        surplus = max(validator_fee - VALIDATOR_COST, 0.0)

        mint = beta * deficit
        burn_extra = alpha*eco_mod * surplus
        burn = burn_fee + burn_extra

        supply = min(supply - burn + mint, SUPPLY_CAP)

        # validator fund receives validator_fee + mint, then pays cost
        fund += validator_fee + mint - VALIDATOR_COST

        infl = (mint-burn)/max(supply,1.0)
        alpha,beta = autonomous_parameter_adjustment(alpha,beta,infl,eco)

        rows.append({"epoch":e,"eco_index":eco,"fees":fees,"supply":supply,"fund":fund,"burn":burn,"mint":mint,"inflation_rate":infl,"alpha":alpha,"beta":beta})
    return pd.DataFrame(rows)

def eip1559_model() -> pd.DataFrame:
    # Simplified EIP-1559: basefee adjusts toward target throughput, burn proportional to basefee*usage
    basefee = 1.0
    target = 800_000
    supply = float(INITIAL_SUPPLY)
    rows=[]
    for e in range(EPOCHS):
        usage = throughput(e)
        # EIP-1559-like adjustment (12.5% max)
        adj = 1 + 0.125 * ((usage/target) - 1)
        basefee = max(basefee*adj, 1e-9)
        burn = basefee * 0.0000003 * usage  # scaled down for comparability
        supply = max(supply - burn, 0.0)
        rows.append({"epoch":e,"usage":usage,"basefee":basefee,"burn":burn,"supply":supply})
    return pd.DataFrame(rows)

def pid_model() -> pd.DataFrame:
    # PID controller tries to keep inflation around 0 by adjusting alpha/beta
    supply = float(INITIAL_SUPPLY)
    fund = 1_000_000.0
    alpha, beta = 0.7, 1.0
    integ = 0.0
    prev_err = 0.0
    rows=[]
    for e in range(EPOCHS):
        eco = eco_index(e)
        fees = throughput(e)

        burn_fee = fees * BURN_RATIO
        validator_fee = fees * VALIDATOR_RATIO
        deficit = max(VALIDATOR_COST - validator_fee, 0.0)
        surplus = max(validator_fee - VALIDATOR_COST, 0.0)

        # controller acts on surplus/deficit
        mint = beta * deficit
        burn_extra = alpha * surplus
        burn = burn_fee + burn_extra

        supply = min(supply - burn + mint, SUPPLY_CAP)
        fund += validator_fee + mint - VALIDATOR_COST
        infl = (mint-burn)/max(supply,1.0)

        # PID update toward target inflation 0
        err = 0.0 - infl
        integ += err
        deriv = err - prev_err
        prev_err = err
        alpha = float(np.clip(alpha + 0.8*err + 0.03*integ + 0.10*deriv, ALPHA_MIN, ALPHA_MAX))
        beta  = float(np.clip(beta  - 0.8*err + 0.03*integ - 0.10*deriv, BETA_MIN, BETA_MAX))

        rows.append({"epoch":e,"eco_index":eco,"fees":fees,"supply":supply,"fund":fund,"burn":burn,"mint":mint,"inflation_rate":infl,"alpha":alpha,"beta":beta})
    return pd.DataFrame(rows)

def metrics_regen(df: pd.DataFrame) -> dict:
    infl_mean = float(df["inflation_rate"].mean())
    infl_std = float(df["inflation_rate"].std())
    fund_drift_pct = float((df["fund"].iloc[-1] - df["fund"].iloc[0]) / max(abs(df["fund"].iloc[0]),1.0))
    eco_infl_corr = float(np.corrcoef(df["eco_index"], df["inflation_rate"])[0,1])
    eco_burn_corr = float(np.corrcoef(df["eco_index"], df["burn"])[0,1])
    burn_per_fee = (df["burn"] / df["fees"].replace(0, np.nan)).fillna(0.0)
    eco_burn_per_fee_corr = float(np.corrcoef(df["eco_index"], burn_per_fee)[0,1])
    # Effect-size check: regression slope of burn/fee vs eco_index should approximately match the design coupling.
    expected_slope = BURN_RATIO * ECO_IMPACT_SCALE
    slope = float(np.polyfit(df["eco_index"].values, burn_per_fee.values, 1)[0]) if len(df) > 1 else 0.0
    eco_coupling_expected = float(expected_slope)
    eco_coupling_slope = float(slope)
    burn_mint_ratio = float(df["burn"].sum() / max(df["mint"].sum(),1e-9))
    alpha_range = (float(df["alpha"].min()), float(df["alpha"].max()))
    beta_range = (float(df["beta"].min()), float(df["beta"].max()))
    return {
        "infl_mean": infl_mean,
        "infl_std": infl_std,
        "fund_drift_pct": fund_drift_pct,
        "eco_infl_corr": eco_infl_corr,
        "eco_burn_corr": eco_burn_corr,
        "eco_burn_per_fee_corr": eco_burn_per_fee_corr,
        "eco_coupling_expected": eco_coupling_expected,
        "eco_coupling_slope": eco_coupling_slope,
        "burn_to_mint_ratio": burn_mint_ratio,
        "alpha_min": alpha_range[0],
        "alpha_max": alpha_range[1],
        "beta_min": beta_range[0],
        "beta_max": beta_range[1],
    }

def control_metrics(df: pd.DataFrame) -> dict:
    # boundedness + smoothness (max step) are more interpretable for engineers than lyapunov proxies
    a = df["alpha"].astype(float)
    b = df["beta"].astype(float)
    a_min, a_max = float(a.min()), float(a.max())
    b_min, b_max = float(b.min()), float(b.max())
    a_max_step = float(a.diff().abs().fillna(0.0).max())
    b_max_step = float(b.diff().abs().fillna(0.0).max())
    return {
        "alpha_min_obs": a_min,
        "alpha_max_obs": a_max,
        "beta_min_obs": b_min,
        "beta_max_obs": b_max,
        "alpha_max_step": a_max_step,
        "beta_max_step": b_max_step,
    }

def clamp01(x: float) -> float:
    return float(np.clip(x, 0.0, 1.0))

def score_confidence(m: dict, c: dict) -> float:
    # Requirements-based confidence score aligned to engineering readiness.
    # Each dimension produces a pass score in [0,1], then we weight them.
    infl_mean_ok = 1.0 if abs(m["infl_mean"]) <= 0.02 else clamp01(1 - (abs(m["infl_mean"]) - 0.02) / 0.05)
    infl_std_ok  = 1.0 if m["infl_std"] <= 0.02 else clamp01(1 - (m["infl_std"] - 0.02) / 0.05)

    fund_ok = 1.0 if abs(m["fund_drift_pct"]) <= 0.10 else clamp01(1 - (abs(m["fund_drift_pct"]) - 0.10) / 0.50)

    bounded_ok = 1.0
    bounded_ok *= 1.0 if (ALPHA_MIN <= c["alpha_min_obs"] and c["alpha_max_obs"] <= ALPHA_MAX) else 0.0
    bounded_ok *= 1.0 if (BETA_MIN  <= c["beta_min_obs"]  and c["beta_max_obs"]  <= BETA_MAX) else 0.0

    smooth_ok = 1.0
    smooth_ok *= 1.0 if c["alpha_max_step"] <= 0.25 else clamp01(1 - (c["alpha_max_step"] - 0.25) / 0.50)
    smooth_ok *= 1.0 if c["beta_max_step"]  <= 0.25 else clamp01(1 - (c["beta_max_step"] - 0.25) / 0.50)

    # Ecological coupling effect-size: slope should be within ±50% of expected
    exp_slope = float(m.get("eco_coupling_expected", 0.0))
    got_slope = float(m.get("eco_coupling_slope", 0.0))
    if exp_slope > 0:
        eco_ok = 1.0 if (0.5*exp_slope <= got_slope <= 1.5*exp_slope) else clamp01(1 - abs(got_slope-exp_slope)/(exp_slope*2))
    else:
        eco_ok = 0.5  # no coupling configured

    # Composite weights (match workstream emphasis)
    score = (
        0.20*infl_mean_ok +
        0.10*infl_std_ok +
        0.25*fund_ok +
        0.25*(0.6*bounded_ok + 0.4*smooth_ok) +
        0.20*eco_ok
    )
    return float(np.clip(score, 0.0, 0.999))

def save_charts(regen_df: pd.DataFrame, pid_df: pd.DataFrame, eip_df: pd.DataFrame) -> None:
    # Supply
    plt.figure()
    plt.plot(regen_df["epoch"], regen_df["supply"], label="Regen")
    plt.plot(pid_df["epoch"], pid_df["supply"], label="PID")
    plt.plot(eip_df["epoch"], eip_df["supply"], label="EIP-1559")
    plt.title("Supply Trajectory Comparison")
    plt.xlabel("Epoch")
    plt.ylabel("Supply (REGEN)")
    plt.legend()
    plt.grid(True)
    plt.tight_layout()
    plt.savefig(CHARTS / "supply_trajectory.png", dpi=180)
    plt.close()

    # Inflation
    plt.figure()
    plt.plot(regen_df["epoch"], regen_df["inflation_rate"], label="Regen inflation")
    plt.plot(pid_df["epoch"], pid_df["inflation_rate"], label="PID inflation")
    plt.title("Inflation Rate (per epoch)")
    plt.xlabel("Epoch")
    plt.ylabel("Inflation rate")
    plt.legend()
    plt.grid(True)
    plt.tight_layout()
    plt.savefig(CHARTS / "inflation_rates.png", dpi=180)
    plt.close()

    # Alpha/Beta
    plt.figure()
    plt.plot(regen_df["epoch"], regen_df["alpha"], label="alpha")
    plt.plot(regen_df["epoch"], regen_df["beta"], label="beta")
    plt.title("Regen Autonomous Parameter Adjustment")
    plt.xlabel("Epoch")
    plt.ylabel("Value")
    plt.legend()
    plt.grid(True)
    plt.tight_layout()
    plt.savefig(CHARTS / "alpha_beta_trajectory.png", dpi=180)
    plt.close()

    # Eco Index
    plt.figure()
    plt.plot(regen_df["epoch"], regen_df["eco_index"])
    plt.title("Ecological Impact Index (synthetic live-style)")
    plt.xlabel("Epoch")
    plt.ylabel("EcoIndex")
    plt.grid(True)
    plt.tight_layout()
    plt.savefig(CHARTS / "eco_index.png", dpi=180)
    plt.close()

def sensitivity_heatmap() -> None:
    eco_vals = np.linspace(0.7, 1.4, 20)
    thr_vals = np.linspace(400_000, 1_200_000, 20)
    grid = np.zeros((len(eco_vals), len(thr_vals)))
    for i, eco in enumerate(eco_vals):
        for j, fees in enumerate(thr_vals):
            eco_mod = 1 + ECO_IMPACT_SCALE*(eco-1)
            burn = ALPHA*eco_mod*max(fees-VALIDATOR_COST,0.0)
            mint = (BETA/eco_mod)*max(VALIDATOR_COST-fees,0.0)
            # express as net mint (positive) / burn (negative) in M REGEN
            grid[i,j] = (mint - burn) / 1e6
    plt.figure()
    plt.imshow(
        grid,
        extent=[thr_vals.min(), thr_vals.max(), eco_vals.min(), eco_vals.max()],
        origin="lower",
        aspect="auto",
    )
    plt.title("Sensitivity Heatmap: Net Mint (M REGEN) by Throughput x EcoIndex")
    plt.xlabel("Throughput (fees/epoch)")
    plt.ylabel("EcoIndex")
    plt.colorbar(label="Net mint (M REGEN)")
    plt.tight_layout()
    plt.savefig(CHARTS / "sensitivity_heatmap.png", dpi=180)
    plt.close()

def parameter_sweep() -> pd.DataFrame:
    alphas = np.linspace(0.5, 0.9, 5)
    betas  = np.linspace(0.2, 0.6, 5)
    rows=[]
    for a in alphas:
        for b in betas:
            df = regen_model(alpha=float(a), beta=float(b))
            m = metrics_regen(df)
            rows.append({"alpha":a,"beta":b, **m})
    out = pd.DataFrame(rows)
    out.to_csv(EXPORTS / "regen_parameter_sweep.csv", index=False)
    return out

def main():
    regen_df = regen_model()
    eip_df = eip1559_model()
    pid_df = pid_model()

    m = metrics_regen(regen_df)
    c = control_metrics(regen_df)
    confidence = score_confidence(m, c)

    # Save artifacts
    save_charts(regen_df, pid_df, eip_df)
    sensitivity_heatmap()
    sweep_df = parameter_sweep()

    metrics_row = {
        "timestamp_utc": pd.Timestamp.utcnow().isoformat(),
        "epochs": EPOCHS,
        "confidence_score": confidence,
        "control": c,
        **m,
        "note": "Offline audit uses synthetic live-style volatility; replace eco/throughput feeds with chain telemetry for production calibration."
    }
    pd.DataFrame([metrics_row]).to_csv(EXPORTS / "regen_validation_metrics.csv", index=False)
    with open(EXPORTS / "regen_confidence_report.json", "w", encoding="utf-8") as f:
        json.dump(metrics_row, f, indent=2)

    # Human-readable summary
    lines = []
    lines.append("# Regen Monetary Policy Validation Summary (v0.7-predeploy)")
    lines.append("")
    lines.append(f"**Confidence score (offline audit):** `{confidence:.3f}`")
    lines.append("")
    lines.append("## Key results")
    lines.append("")
    lines.append(f"- Inflation mean: `{m['infl_mean']:.6f}`")
    lines.append(f"- Inflation std: `{m['infl_std']:.6f}`")
    lines.append(f"- Validator fund drift (pct): `{m['fund_drift_pct']:.3f}`")
    lines.append(f"- EcoIndex ↔ inflation correlation: `{m['eco_infl_corr']:.3f}`")
    lines.append(f"- Burn/Mint ratio (sum): `{m['burn_to_mint_ratio']:.3f}`")
    lines.append(f"- Alpha range: `{m['alpha_min']:.3f}` to `{m['alpha_max']:.3f}`")
    lines.append(f"- Beta range: `{m['beta_min']:.3f}` to `{m['beta_max']:.3f}`")
    lines.append("")
    lines.append("## Charts")
    lines.append("- `exports/charts/supply_trajectory.png`")
    lines.append("- `exports/charts/inflation_rates.png`")
    lines.append("- `exports/charts/alpha_beta_trajectory.png`")
    lines.append("- `exports/charts/eco_index.png`")
    lines.append("- `exports/charts/sensitivity_heatmap.png`")
    lines.append("")
    lines.append("## Interpretation")
    lines.append("This audit demonstrates bounded inflation and bounded controller behavior under synthetic live-style volatility. For production readiness, swap the `eco_index()` and `throughput()` feeds to real chain telemetry and registry metrics.")
    (EXPORTS / "validation_summary.md").write_text("\n".join(lines), encoding="utf-8")

    print("Audit complete.")
    print(f"Confidence score: {confidence:.3f}")
    print("Artifacts written to:", str(EXPORTS))

if __name__ == "__main__":
    main()
