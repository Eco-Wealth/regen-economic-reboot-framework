use cosmwasm_schema::cw_serde;
use cw_storage_plus::{Item, Map};
use heb_types::SeriesTerms;

#[cw_serde]
pub struct Config {
    pub admin: String,
    pub protocol_fee_bps: u32,
    pub fee_recipient: String,
    pub terms: SeriesTerms,
}

#[cw_serde]
pub struct PricePoint {
    /// price in fixed-point string (implementation decides scale)
    pub price: String,
    pub ts: u64,
}

#[cw_serde]
pub struct ImpactPoint {
    pub checkpoint_ts: u64,
    pub retired_total: String,
    pub target_retired: String,
    pub met: bool,
}

#[cw_serde]
pub struct SeriesState {
    pub sale_open: bool,
    pub paused: bool,

    pub total_principal_sold: String,
    pub total_principal_outstanding: String,

    pub collateral_locked: String,

    /// interest index is fixed-point string (implementation decides scale)
    pub global_interest_index: String,
    pub last_accrual_ts: u64,

    pub last_price: Option<PricePoint>,
    pub last_impact: Option<ImpactPoint>,
}

/// CW20-like balances
#[cw_serde]
pub struct AccountIndex {
    pub balance: String,
    pub index: String,
    pub accrued: String,
}

pub const CONFIG: Item<Config> = Item::new("config");
pub const STATE: Item<SeriesState> = Item::new("state");
pub const ACCOUNTS: Map<&str, AccountIndex> = Map::new("accounts");
