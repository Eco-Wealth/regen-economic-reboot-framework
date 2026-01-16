use cosmwasm_schema::{cw_serde, QueryResponses};
use cosmwasm_std::Coin;

#[cw_serde]
pub struct InstantiateMsg {}

#[cw_serde]
pub enum ExecuteMsg {
    Borrow { amount: Coin },
    Repay { amount: Coin },
    UpdateTrust { score: u8 },
}

#[cw_serde]
#[derive(QueryResponses)]
pub enum QueryMsg {
    #[returns(GetUserResponse)]
    GetUser { address: String },
}

#[cw_serde]
pub struct GetUserResponse {
    pub trust_score: u8,
    pub debt: u128,
}
