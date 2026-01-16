use cosmwasm_schema::cw_serde;
use cosmwasm_std::Addr;
use cw_storage_plus::Map;

#[cw_serde]
pub struct RclUser {
    pub trust_score: u8,
    pub debt: u128,
}

pub const USERS: Map<&Addr, RclUser> = Map::new("users");
