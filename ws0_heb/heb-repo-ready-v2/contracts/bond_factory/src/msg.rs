use cosmwasm_schema::{cw_serde, QueryResponses};
use heb_types::SeriesTerms;

#[cw_serde]
pub struct InstantiateMsg {
    pub admin: String,
    pub allowed_principal_denoms: Vec<String>,
    pub min_initial_collateral_ratio_bps: u32,
    pub protocol_fee_bps: u32,
    pub fee_recipient: String,
    pub bond_series_code_id: u64,
}

#[cw_serde]
pub enum ExecuteMsg {
    CreateSeries { terms: SeriesTerms },
    UpdateConfig {
        admin: Option<String>,
        allowed_principal_denoms: Option<Vec<String>>,
        min_initial_collateral_ratio_bps: Option<u32>,
        protocol_fee_bps: Option<u32>,
        fee_recipient: Option<String>,
        bond_series_code_id: Option<u64>,
    },
}

#[cw_serde]
#[derive(QueryResponses)]
pub enum QueryMsg {
    #[returns(ConfigResponse)]
    Config {},
    #[returns(SeriesListResponse)]
    SeriesList { start_after: Option<String>, limit: Option<u32> },
}

#[cw_serde]
pub struct ConfigResponse {
    pub admin: String,
    pub allowed_principal_denoms: Vec<String>,
    pub min_initial_collateral_ratio_bps: u32,
    pub protocol_fee_bps: u32,
    pub fee_recipient: String,
    pub bond_series_code_id: u64,
}

#[cw_serde]
pub struct SeriesListResponse {
    pub series: Vec<String>,
}
