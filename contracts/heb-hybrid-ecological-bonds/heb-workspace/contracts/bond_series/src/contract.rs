use cosmwasm_std::{
    entry_point, to_json_binary, Addr, BankMsg, Binary, Coin, Deps, DepsMut, Env, MessageInfo,
    Response, StdResult, Timestamp,
};
use cw2::set_contract_version;
use cw_utils::must_pay;

use crate::error::ContractError;
use crate::math::{accrue_index, parse_u128, to_string_u128};
use crate::msg::{
    AccruedInterestResponse, BalanceResponse, CollateralRatioResponse, ExecuteMsg, ImpactStatusResponse,
    InstantiateMsg, PriceStatusResponse, QueryMsg, StateResponse, TermsResponse,
};
use crate::state::{AccountIndex, Config, ImpactPoint, PricePoint, SeriesState, ACCOUNTS, CONFIG, STATE};

const CONTRACT_NAME: &str = "heb-bond-series";
const CONTRACT_VERSION: &str = "0.1.0";

fn now_ts(env: &Env) -> u64 {
    env.block.time.seconds()
}

fn require_not_paused(state: &SeriesState) -> Result<(), ContractError> {
    if state.paused {
        return Err(ContractError::Paused);
    }
    Ok(())
}

fn is_matured(env: &Env, cfg: &Config) -> bool {
    now_ts(env) >= cfg.terms.maturity_ts
}

/// Accrue global and account-level interest indexes.
fn accrue(deps: DepsMut, env: &Env) -> Result<(), ContractError> {
    let cfg = CONFIG.load(deps.storage)?;
    let mut st = STATE.load(deps.storage)?;

    let t = now_ts(env);
    if t <= st.last_accrual_ts {
        return Ok(());
    }
    let dt = t - st.last_accrual_ts;

    // TODO: effective rate should include penalty logic based on impact checkpoints.
    let new_index = accrue_index(&st.global_interest_index, dt, cfg.terms.base_rate_apr_bps)?;

    st.global_interest_index = new_index;
    st.last_accrual_ts = t;
    STATE.save(deps.storage, &st)?;
    Ok(())
}

/// Sync a single account accrued interest based on global index.
fn sync_account(deps: DepsMut, addr: &Addr) -> Result<(), ContractError> {
    let st = STATE.load(deps.storage)?;
    let mut acc = ACCOUNTS
        .may_load(deps.storage, addr.as_str())?
        .unwrap_or(AccountIndex {
            balance: "0".to_string(),
            index: st.global_interest_index.clone(),
            accrued: "0".to_string(),
        });

    // TODO: compute delta = balance * (global_index - acc.index), add to accrued
    acc.index = st.global_interest_index.clone();
    ACCOUNTS.save(deps.storage, addr.as_str(), &acc)?;
    Ok(())
}

#[entry_point]
pub fn instantiate(deps: DepsMut, env: Env, _info: MessageInfo, msg: InstantiateMsg) -> Result<Response, ContractError> {
    set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;

    // Basic validations (expand in real implementation)
    if msg.terms.collateral_denom.is_empty() || msg.terms.principal_denom.is_empty() {
        return Err(ContractError::InvalidConfig("missing denom".into()));
    }
    if msg.terms.maturity_ts <= now_ts(&env) {
        return Err(ContractError::InvalidConfig("maturity must be in future".into()));
    }

    let cfg = Config {
        admin: msg.admin,
        protocol_fee_bps: msg.protocol_fee_bps,
        fee_recipient: msg.fee_recipient,
        terms: msg.terms,
    };

    let st = SeriesState {
        sale_open: false,
        paused: false,
        total_principal_sold: "0".to_string(),
        total_principal_outstanding: "0".to_string(),
        collateral_locked: "0".to_string(),
        global_interest_index: "1".to_string(),
        last_accrual_ts: now_ts(&env),
        last_price: None,
        last_impact: None,
    };

    CONFIG.save(deps.storage, &cfg)?;
    STATE.save(deps.storage, &st)?;

    Ok(Response::new().add_attribute("action", "instantiate"))
}

#[entry_point]
pub fn execute(deps: DepsMut, env: Env, info: MessageInfo, msg: ExecuteMsg) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::DepositCollateral {} => execute_deposit_collateral(deps, env, info),
        ExecuteMsg::OpenSale {} => execute_open_sale(deps, env, info),
        ExecuteMsg::Buy { min_tokens } => execute_buy(deps, env, info, min_tokens),
        ExecuteMsg::Repay {} => execute_repay(deps, env, info),
        ExecuteMsg::ClaimInterest {} => execute_claim_interest(deps, env, info),
        ExecuteMsg::RedeemAtMaturity { amount } => execute_redeem_at_maturity(deps, env, info, amount),
        ExecuteMsg::Liquidate { max_repay } => execute_liquidate(deps, env, info, max_repay),
        ExecuteMsg::UpdateOraclePrice {} => execute_update_oracle_price(deps, env, info),
        ExecuteMsg::CheckpointImpact {} => execute_checkpoint_impact(deps, env, info),
        ExecuteMsg::Pause {} => execute_pause(deps, env, info),
        ExecuteMsg::Unpause {} => execute_unpause(deps, env, info),
        ExecuteMsg::Transfer { recipient, amount } => execute_transfer(deps, env, info, recipient, amount),
    }
}

fn only_admin(deps: Deps, info: &MessageInfo) -> Result<(), ContractError> {
    let cfg = CONFIG.load(deps.storage)?;
    if info.sender != Addr::unchecked(cfg.admin) {
        return Err(ContractError::Unauthorized);
    }
    Ok(())
}

fn execute_pause(deps: DepsMut, _env: Env, info: MessageInfo) -> Result<Response, ContractError> {
    only_admin(deps.as_ref(), &info)?;
    let mut st = STATE.load(deps.storage)?;
    st.paused = true;
    STATE.save(deps.storage, &st)?;
    Ok(Response::new().add_attribute("action", "pause"))
}

fn execute_unpause(deps: DepsMut, _env: Env, info: MessageInfo) -> Result<Response, ContractError> {
    only_admin(deps.as_ref(), &info)?;
    let mut st = STATE.load(deps.storage)?;
    st.paused = false;
    STATE.save(deps.storage, &st)?;
    Ok(Response::new().add_attribute("action", "unpause"))
}

fn execute_deposit_collateral(deps: DepsMut, env: Env, info: MessageInfo) -> Result<Response, ContractError> {
    let cfg = CONFIG.load(deps.storage)?;
    if info.sender != Addr::unchecked(cfg.terms.borrower.clone()) {
        return Err(ContractError::Unauthorized);
    }

    let mut st = STATE.load(deps.storage)?;
    require_not_paused(&st)?;
    if is_matured(&env, &cfg) {
        return Err(ContractError::Matured);
    }

    let paid = must_pay(&info, &cfg.terms.collateral_denom)?;
    let current = parse_u128(&st.collateral_locked)?;
    st.collateral_locked = to_string_u128(current + paid.u128());

    STATE.save(deps.storage, &st)?;
    Ok(Response::new()
        .add_attribute("action", "deposit_collateral")
        .add_attribute("amount", paid.to_string()))
}

fn execute_open_sale(deps: DepsMut, env: Env, info: MessageInfo) -> Result<Response, ContractError> {
    let cfg = CONFIG.load(deps.storage)?;
    if info.sender != Addr::unchecked(cfg.terms.borrower.clone()) {
        return Err(ContractError::Unauthorized);
    }
    let mut st = STATE.load(deps.storage)?;
    require_not_paused(&st)?;
    if is_matured(&env, &cfg) {
        return Err(ContractError::Matured);
    }
    st.sale_open = true;
    STATE.save(deps.storage, &st)?;
    Ok(Response::new().add_attribute("action", "open_sale"))
}

fn execute_buy(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    _min_tokens: Option<String>,
) -> Result<Response, ContractError> {
    accrue(deps.branch(), &env)?;
    let cfg = CONFIG.load(deps.storage)?;
    let mut st = STATE.load(deps.storage)?;
    require_not_paused(&st)?;
    if !st.sale_open {
        return Err(ContractError::SaleNotOpen);
    }
    if is_matured(&env, &cfg) {
        return Err(ContractError::Matured);
    }

    let paid = must_pay(&info, &cfg.terms.principal_denom)?;
    let paid_u = paid.u128();

    // TODO: enforce principal_cap
    // Mint bond tokens 1:1 with principal paid
    let buyer = info.sender.clone();
    sync_account(deps.branch(), &buyer)?;
    let mut acc = ACCOUNTS.load(deps.storage, buyer.as_str())?;
    let bal = parse_u128(&acc.balance)?;
    acc.balance = to_string_u128(bal + paid_u);
    ACCOUNTS.save(deps.storage, buyer.as_str(), &acc)?;

    // Update totals
    let sold = parse_u128(&st.total_principal_sold)?;
    let out = parse_u128(&st.total_principal_outstanding)?;
    st.total_principal_sold = to_string_u128(sold + paid_u);
    st.total_principal_outstanding = to_string_u128(out + paid_u);
    STATE.save(deps.storage, &st)?;

    // Fee + proceeds transfer to borrower
    let fee_bps = cfg.protocol_fee_bps as u128;
    let fee = (paid_u * fee_bps) / 10_000u128;
    let net = paid_u - fee;

    let mut msgs = vec![];
    if fee > 0 {
        msgs.push(BankMsg::Send {
            to_address: cfg.fee_recipient.clone(),
            amount: vec![Coin::new(fee, cfg.terms.principal_denom.clone())],
        });
    }
    msgs.push(BankMsg::Send {
        to_address: cfg.terms.borrower.clone(),
        amount: vec![Coin::new(net, cfg.terms.principal_denom.clone())],
    });

    Ok(Response::new()
        .add_messages(msgs)
        .add_attribute("action", "buy")
        .add_attribute("paid", paid.to_string()))
}

fn execute_repay(deps: DepsMut, env: Env, info: MessageInfo) -> Result<Response, ContractError> {
    accrue(deps.branch(), &env)?;
    let cfg = CONFIG.load(deps.storage)?;
    if info.sender != Addr::unchecked(cfg.terms.borrower.clone()) {
        return Err(ContractError::Unauthorized);
    }

    let mut st = STATE.load(deps.storage)?;
    require_not_paused(&st)?;
    let paid = must_pay(&info, &cfg.terms.principal_denom)?;
    // TODO: apply to interest first, then principal.
    // v0.1: reduce principal outstanding directly for now.
    let out = parse_u128(&st.total_principal_outstanding)?;
    let repay = paid.u128().min(out);
    st.total_principal_outstanding = to_string_u128(out - repay);
    STATE.save(deps.storage, &st)?;

    Ok(Response::new()
        .add_attribute("action", "repay")
        .add_attribute("amount", repay.to_string()))
}

fn execute_claim_interest(deps: DepsMut, env: Env, info: MessageInfo) -> Result<Response, ContractError> {
    accrue(deps.branch(), &env)?;
    let sender = info.sender.clone();
    sync_account(deps.branch(), &sender)?;
    let mut acc = ACCOUNTS.load(deps.storage, sender.as_str())?;

    let accrued = parse_u128(&acc.accrued)?;
    if accrued == 0 {
        return Err(ContractError::NothingToClaim);
    }

    let cfg = CONFIG.load(deps.storage)?;
    acc.accrued = "0".to_string();
    ACCOUNTS.save(deps.storage, sender.as_str(), &acc)?;

    // Pay interest in principal denom (stablecoin)
    let msg = BankMsg::Send {
        to_address: sender.to_string(),
        amount: vec![Coin::new(accrued, cfg.terms.principal_denom)],
    };

    Ok(Response::new()
        .add_message(msg)
        .add_attribute("action", "claim_interest")
        .add_attribute("amount", accrued.to_string()))
}

fn execute_redeem_at_maturity(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    amount: String,
) -> Result<Response, ContractError> {
    accrue(deps.branch(), &env)?;
    let cfg = CONFIG.load(deps.storage)?;
    if !is_matured(&env, &cfg) {
        return Err(ContractError::NotMatured);
    }

    let sender = info.sender.clone();
    sync_account(deps.branch(), &sender)?;
    let mut acc = ACCOUNTS.load(deps.storage, sender.as_str())?;
    let amt = parse_u128(&amount)?;
    let bal = parse_u128(&acc.balance)?;
    if amt == 0 || amt > bal {
        return Err(ContractError::InsufficientFunds);
    }

    // Burn tokens (reduce balance)
    acc.balance = to_string_u128(bal - amt);
    ACCOUNTS.save(deps.storage, sender.as_str(), &acc)?;

    // Pay principal in stablecoin
    let mut st = STATE.load(deps.storage)?;
    let out = parse_u128(&st.total_principal_outstanding)?;
    let pay = amt.min(out);
    st.total_principal_outstanding = to_string_u128(out - pay);
    STATE.save(deps.storage, &st)?;

    let msg = BankMsg::Send {
        to_address: sender.to_string(),
        amount: vec![Coin::new(pay, cfg.terms.principal_denom)],
    };

    Ok(Response::new()
        .add_message(msg)
        .add_attribute("action", "redeem_at_maturity")
        .add_attribute("amount", pay.to_string()))
}

fn execute_liquidate(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    max_repay: String,
) -> Result<Response, ContractError> {
    accrue(deps.branch(), &env)?;
    let cfg = CONFIG.load(deps.storage)?;
    let mut st = STATE.load(deps.storage)?;
    require_not_paused(&st)?;

    // TODO: enforce oracle freshness + compute collateral ratio using price.
    // For now, require a price to be present; otherwise block.
    let price = st.last_price.clone().ok_or(ContractError::OracleStale)?;
    let _ = price;

    let paid = must_pay(&info, &cfg.terms.principal_denom)?;
    let max_repay_u = parse_u128(&max_repay)?;
    let repay_u = paid.u128().min(max_repay_u);

    // Reduce outstanding
    let out = parse_u128(&st.total_principal_outstanding)?;
    let applied = repay_u.min(out);
    st.total_principal_outstanding = to_string_u128(out - applied);

    // Transfer collateral to liquidator (placeholder: 1:1, ignores price + bonus)
    let coll = parse_u128(&st.collateral_locked)?;
    let give = applied.min(coll);
    st.collateral_locked = to_string_u128(coll - give);

    STATE.save(deps.storage, &st)?;

    let msg = BankMsg::Send {
        to_address: info.sender.to_string(),
        amount: vec![Coin::new(give, cfg.terms.collateral_denom)],
    };

    Ok(Response::new()
        .add_message(msg)
        .add_attribute("action", "liquidate")
        .add_attribute("repaid", applied.to_string())
        .add_attribute("collateral_out", give.to_string()))
}

fn execute_update_oracle_price(deps: DepsMut, _env: Env, _info: MessageInfo) -> Result<Response, ContractError> {
    // TODO: Implement Band IBC oracle request + reply processing.
    // For skeleton purposes, we allow admin to set mock price via a future admin-only message.
    Ok(Response::new().add_attribute("action", "update_oracle_price_todo"))
}

fn execute_checkpoint_impact(deps: DepsMut, env: Env, _info: MessageInfo) -> Result<Response, ContractError> {
    let cfg = CONFIG.load(deps.storage)?;
    let mut st = STATE.load(deps.storage)?;
    require_not_paused(&st)?;

    // TODO: query on-chain ecocredit module for batch retired supply.
    // Skeleton: mark last checkpoint as unmet.
    let checkpoint = cfg.terms.impact.checkpoints.first().cloned();
    if let Some(cp) = checkpoint {
        st.last_impact = Some(ImpactPoint {
            checkpoint_ts: cp.ts,
            retired_total: "0".to_string(),
            target_retired: cp.target_retired,
            met: false,
        });
        STATE.save(deps.storage, &st)?;
    }

    Ok(Response::new().add_attribute("action", "checkpoint_impact"))
}

fn execute_transfer(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    recipient: String,
    amount: String,
) -> Result<Response, ContractError> {
    accrue(deps.branch(), &env)?;
    let sender = info.sender.clone();
    let rcpt = deps.api.addr_validate(&recipient)?;

    sync_account(deps.branch(), &sender)?;
    sync_account(deps.branch(), &rcpt)?;

    let mut sacc = ACCOUNTS.load(deps.storage, sender.as_str())?;
    let mut racc = ACCOUNTS.load(deps.storage, rcpt.as_str())?;

    let amt = parse_u128(&amount)?;
    let sbal = parse_u128(&sacc.balance)?;
    if amt == 0 || amt > sbal {
        return Err(ContractError::InsufficientFunds);
    }

    sacc.balance = to_string_u128(sbal - amt);
    let rbal = parse_u128(&racc.balance)?;
    racc.balance = to_string_u128(rbal + amt);

    ACCOUNTS.save(deps.storage, sender.as_str(), &sacc)?;
    ACCOUNTS.save(deps.storage, rcpt.as_str(), &racc)?;

    Ok(Response::new()
        .add_attribute("action", "transfer")
        .add_attribute("from", sender)
        .add_attribute("to", recipient)
        .add_attribute("amount", amount))
}

#[entry_point]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::Terms {} => to_json_binary(&query_terms(deps)?),
        QueryMsg::State {} => to_json_binary(&query_state(deps)?),
        QueryMsg::Balance { address } => to_json_binary(&query_balance(deps, address)?),
        QueryMsg::AccruedInterest { address } => to_json_binary(&query_accrued(deps, address)?),
        QueryMsg::CollateralRatio {} => to_json_binary(&query_collateral_ratio(deps)?),
        QueryMsg::PriceStatus {} => to_json_binary(&query_price_status(deps)?),
        QueryMsg::ImpactStatus {} => to_json_binary(&query_impact_status(deps)?),
    }
}

fn query_terms(deps: Deps) -> StdResult<TermsResponse> {
    let cfg = CONFIG.load(deps.storage)?;
    Ok(TermsResponse {
        terms: cfg.terms,
        admin: cfg.admin,
        protocol_fee_bps: cfg.protocol_fee_bps,
        fee_recipient: cfg.fee_recipient,
    })
}

fn query_state(deps: Deps) -> StdResult<StateResponse> {
    let st = STATE.load(deps.storage)?;
    Ok(StateResponse {
        sale_open: st.sale_open,
        paused: st.paused,
        total_principal_sold: st.total_principal_sold,
        total_principal_outstanding: st.total_principal_outstanding,
        collateral_locked: st.collateral_locked,
        global_interest_index: st.global_interest_index,
        last_accrual_ts: st.last_accrual_ts,
        last_price: st.last_price.map(|p| PriceStatusResponse { price: p.price, ts: p.ts }),
        last_impact: st.last_impact.map(|i| ImpactStatusResponse {
            checkpoint_ts: i.checkpoint_ts,
            retired_total: i.retired_total,
            target_retired: i.target_retired,
            met: i.met,
        }),
    })
}

fn query_balance(deps: Deps, address: String) -> StdResult<BalanceResponse> {
    let st = STATE.load(deps.storage)?;
    let acc = ACCOUNTS
        .may_load(deps.storage, address.as_str())?
        .unwrap_or(AccountIndex {
            balance: "0".to_string(),
            index: st.global_interest_index,
            accrued: "0".to_string(),
        });
    Ok(BalanceResponse { balance: acc.balance })
}

fn query_accrued(deps: Deps, address: String) -> StdResult<AccruedInterestResponse> {
    let st = STATE.load(deps.storage)?;
    let acc = ACCOUNTS
        .may_load(deps.storage, address.as_str())?
        .unwrap_or(AccountIndex {
            balance: "0".to_string(),
            index: st.global_interest_index,
            accrued: "0".to_string(),
        });
    Ok(AccruedInterestResponse { accrued: acc.accrued })
}

fn query_collateral_ratio(_deps: Deps) -> StdResult<CollateralRatioResponse> {
    // TODO: compute using oracle price + debt
    Ok(CollateralRatioResponse { ratio_bps: None })
}

fn query_price_status(deps: Deps) -> StdResult<PriceStatusResponse> {
    let st = STATE.load(deps.storage)?;
    let p = st.last_price.unwrap_or(PricePoint {
        price: "0".to_string(),
        ts: 0,
    });
    Ok(PriceStatusResponse { price: p.price, ts: p.ts })
}

fn query_impact_status(deps: Deps) -> StdResult<ImpactStatusResponse> {
    let st = STATE.load(deps.storage)?;
    let i = st.last_impact.unwrap_or(ImpactPoint {
        checkpoint_ts: 0,
        retired_total: "0".to_string(),
        target_retired: "0".to_string(),
        met: false,
    });
    Ok(ImpactStatusResponse {
        checkpoint_ts: i.checkpoint_ts,
        retired_total: i.retired_total,
        target_retired: i.target_retired,
        met: i.met,
    })
}
