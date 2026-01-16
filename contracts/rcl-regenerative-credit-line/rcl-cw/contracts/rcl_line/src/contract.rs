use cosmwasm_std::{
    entry_point, to_binary, Binary, Deps, DepsMut, Env, MessageInfo, Response, StdError, StdResult,
    Coin,
};
use crate::msg::{ExecuteMsg, InstantiateMsg, QueryMsg, GetUserResponse};
use crate::state::{RclUser, USERS};

#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    _msg: InstantiateMsg,
) -> StdResult<Response> {
    Ok(Response::new().add_attribute("creator", info.sender))
}

#[entry_point]
pub fn execute(deps: DepsMut, env: Env, info: MessageInfo, msg: ExecuteMsg) -> StdResult<Response> {
    match msg {
        ExecuteMsg::Borrow { amount } => try_borrow(deps, env, info, amount),
        ExecuteMsg::Repay { amount } => try_repay(deps, env, info, amount),
        ExecuteMsg::UpdateTrust { score } => try_update_trust(deps, info, score),
    }
}

pub fn try_borrow(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    amount: Coin,
) -> StdResult<Response> {
    let mut user = USERS
        .may_load(deps.storage, &info.sender)?
        .unwrap_or(RclUser { trust_score: 80, debt: 0 });

    if user.trust_score < 60 {
        return Err(StdError::generic_err("Low trust score"));
    }

    user.debt += amount.amount.u128();
    USERS.save(deps.storage, &info.sender, &user)?;

    Ok(Response::new()
        .add_attribute("action", "borrow")
        .add_attribute("amount", amount.amount.to_string()))
}

pub fn try_repay(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    amount: Coin,
) -> StdResult<Response> {
    let mut user = USERS
        .load(deps.storage, &info.sender)
        .map_err(|_| StdError::generic_err("No debt record"))?;

    if amount.amount.u128() >= user.debt {
        user.debt = 0;
    } else {
        user.debt -= amount.amount.u128();
    }

    USERS.save(deps.storage, &info.sender, &user)?;

    Ok(Response::new()
        .add_attribute("action", "repay")
        .add_attribute("remaining_debt", user.debt.to_string()))
}

pub fn try_update_trust(deps: DepsMut, info: MessageInfo, score: u8) -> StdResult<Response> {
    let mut user = USERS
        .may_load(deps.storage, &info.sender)?
        .unwrap_or(RclUser { trust_score: 0, debt: 0 });

    user.trust_score = score;
    USERS.save(deps.storage, &info.sender, &user)?;

    Ok(Response::new()
        .add_attribute("action", "update_trust")
        .add_attribute("new_score", score.to_string()))
}

#[entry_point]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetUser { address } => {
            let addr = deps.api.addr_validate(&address)?;
            let user = USERS.may_load(deps.storage, &addr)?;
            match user {
                Some(u) => to_binary(&GetUserResponse {
                    trust_score: u.trust_score,
                    debt: u.debt,
                }),
                None => Err(StdError::not_found("RclUser")),
            }
        }
    }
}
