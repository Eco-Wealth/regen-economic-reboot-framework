use cosmwasm_schema::cw_serde;

#[cw_serde]
pub struct BandPriceConfig {
    /// IBC channel to Band-enabled oracle relayer
    pub band_ibc_channel: String,
    /// Band oracle script id for REGEN/USD or REGEN/USDC
    pub regen_price_script_id: u64,
    /// Max acceptable age of price data in seconds
    pub max_price_age_seconds: u64,
}

#[cw_serde]
pub enum ImpactMode {
    /// v0.1: compute impact using on-chain ecocredit batch retired supply
    OnChainEcocreditBatches,
    /// v0.2: fetch impact using Band custom oracle scripts
    BandOracleScript,
}

#[cw_serde]
pub struct ImpactCheckpoint {
    pub ts: u64,
    /// Target retired credits by this checkpoint (micro units / chain units)
    pub target_retired: String,
}

#[cw_serde]
pub struct ImpactConfig {
    pub mode: ImpactMode,
    /// When OnChainEcocreditBatches: ecocredit batch IDs to track
    pub batch_ids: Vec<String>,
    /// When BandOracleScript: script id to request
    pub band_impact_script_id: Option<u64>,
    pub checkpoints: Vec<ImpactCheckpoint>,
}

#[cw_serde]
pub struct SeriesTerms {
    pub borrower: String,
    pub collateral_denom: String,
    pub principal_denom: String,
    pub principal_cap: String,
    pub maturity_ts: u64,
    pub base_rate_apr_bps: u32,
    pub penalty_rate_apr_bps: u32,
    pub coupon_period_seconds: Option<u64>,
    pub initial_collateral_ratio_bps: u32,
    pub liquidation_ratio_bps: u32,
    pub liquidation_bonus_bps: u32,
    pub oracle: BandPriceConfig,
    pub impact: ImpactConfig,
}
