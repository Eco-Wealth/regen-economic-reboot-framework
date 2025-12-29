use cosmwasm_schema::{cw_serde, QueryResponses};
use heb_types::SeriesTerms;

#[cw_serde]
pub struct InstantiateMsg {
    /// Immutable bond terms
    pub terms: SeriesTerms,
    /// Factory (or admin) address authorized to pause/unpause
    pub admin: String,
    /// Protocol fee settings passed through from factory
    pub protocol_fee_bps: u32,
    pub fee_recipient: String,
}

#[cw_serde]
pub enum ExecuteMsg {
    DepositCollateral {},
    OpenSale {},
    Buy { min_tokens: Option<String> },
    Repay {},
    ClaimInterest {},
    RedeemAtMaturity { amount: String },
    Liquidate { max_repay: String },

    /// v0.1: placeholder. wire Band IBC oracle update flow here.
    UpdateOraclePrice {},

    /// v0.1: on-chain ecocredit checkpoint evaluation
    CheckpointImpact {},

    Pause {},
    Unpause {},

    /// CW20-like transfers (minimal subset)
    Transfer { recipient: String, amount: String },
}

#[cw_serde]
#[derive(QueryResponses)]
pub enum QueryMsg {
    #[returns(TermsResponse)]
    Terms {},
    #[returns(StateResponse)]
    State {},
    #[returns(BalanceResponse)]
    Balance { address: String },
    #[returns(AccruedInterestResponse)]
    AccruedInterest { address: String },
    #[returns(CollateralRatioResponse)]
    CollateralRatio {},
    #[returns(PriceStatusResponse)]
    PriceStatus {},
    #[returns(ImpactStatusResponse)]
    ImpactStatus {},
}

#[cw_serde]
pub struct TermsResponse {
    pub terms: SeriesTerms,
    pub admin: String,
    pub protocol_fee_bps: u32,
    pub fee_recipient: String,
}

#[cw_serde]
pub struct StateResponse {
    pub sale_open: bool,
    pub paused: bool,

    pub total_principal_sold: String,
    pub total_principal_outstanding: String,

    pub collateral_locked: String,

    pub global_interest_index: String,
    pub last_accrual_ts: u64,

    pub last_price: Option<PriceStatusResponse>,
    pub last_impact: Option<ImpactStatusResponse>,
}

#[cw_serde]
pub struct BalanceResponse {
    pub balance: String,
}

#[cw_serde]
pub struct AccruedInterestResponse {
    pub accrued: String,
}

#[cw_serde]
pub struct CollateralRatioResponse {
    pub ratio_bps: Option<u32>,
}

#[cw_serde]
pub struct PriceStatusResponse {
    pub price: String,
    pub ts: u64,
}

#[cw_serde]
pub struct ImpactStatusResponse {
    pub checkpoint_ts: u64,
    pub retired_total: String,
    pub target_retired: String,
    pub met: bool,
}
