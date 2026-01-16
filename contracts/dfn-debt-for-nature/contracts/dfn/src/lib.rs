pub mod msg;
pub mod state;
pub mod execute;
pub mod query;

use cosmwasm_std::{entry_point, DepsMut, Deps, Env, MessageInfo, Response, StdResult, Binary};
use cw2::set_contract_version;
use crate::msg::{InstantiateMsg, ExecuteMsg, QueryMsg};
use crate::state::{CONFIG, Config};

const CONTRACT_NAME: &str = "crates.io:dfn";
const CONTRACT_VERSION: &str = env!("CARGO_PKG_VERSION");

#[entry_point]
pub fn instantiate(deps: DepsMut, _env: Env, _info: MessageInfo, msg: InstantiateMsg) -> StdResult<Response> {
    let cfg = Config {
        governor: deps.api.addr_validate(&msg.governor)?,
        paused: false,
        threshold: msg.threshold,
        deny_reuse_retirements: msg.deny_reuse_retirements,
    };
    CONFIG.save(deps.storage, &cfg)?;
    set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;
    Ok(Response::new().add_attribute("method", "instantiate"))
}

#[entry_point]
pub fn execute(deps: DepsMut, env: Env, info: MessageInfo, msg: ExecuteMsg) -> StdResult<Response> {
    crate::execute::execute(deps, env, info, msg)
}

#[entry_point]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::Config {} => crate::query::query_config(deps),
        QueryMsg::Obligation { obligation_id } => crate::query::query_obligation(deps, obligation_id),
        _ => Ok(Binary::default()),
    }
}
