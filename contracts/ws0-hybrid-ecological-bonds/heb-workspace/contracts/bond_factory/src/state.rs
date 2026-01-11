use cosmwasm_schema::cw_serde;
use cw_storage_plus::{Item, Map};

#[cw_serde]
pub struct Config {
    pub admin: String,
    pub allowed_principal_denoms: Vec<String>,
    pub min_initial_collateral_ratio_bps: u32,
    pub protocol_fee_bps: u32,
    pub fee_recipient: String,
    pub bond_series_code_id: u64,
}

pub const CONFIG: Item<Config> = Item::new("config");

/// series id -> address (string). For v0.1, we just store sequential ids.
pub const SERIES: Map<u64, String> = Map::new("series");
pub const SERIES_COUNT: Item<u64> = Item::new("series_count");
