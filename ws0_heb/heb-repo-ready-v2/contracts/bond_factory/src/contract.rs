use cosmwasm_std::{
    entry_point, to_json_binary, Addr, Binary, Deps, DepsMut, Env, MessageInfo, Reply, Response,
    StdResult, SubMsg, WasmMsg,
};
use cw2::set_contract_version;
use cw_storage_plus::Bound;
use heb_types::SeriesTerms;

use crate::error::ContractError;
use crate::msg::{ConfigResponse, ExecuteMsg, InstantiateMsg, QueryMsg, SeriesListResponse};
use crate::state::{Config, CONFIG, SERIES, SERIES_COUNT};

const CONTRACT_NAME: &str = "heb-bond-factory";
const CONTRACT_VERSION: &str = "0.1.0";

const REPLY_ID_CREATE_SERIES: u64 = 1;

#[entry_point]
pub fn instantiate(deps: DepsMut, _env: Env, info: MessageInfo, msg: InstantiateMsg) -> Result<Response, ContractError> {
    set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;

    if msg.admin.is_empty() {
        return Err(ContractError::InvalidConfig("admin required".into()));
    }

    let cfg = Config {
        admin: msg.admin,
        allowed_principal_denoms: msg.allowed_principal_denoms,
        min_initial_collateral_ratio_bps: msg.min_initial_collateral_ratio_bps,
        protocol_fee_bps: msg.protocol_fee_bps,
        fee_recipient: msg.fee_recipient,
        bond_series_code_id: msg.bond_series_code_id,
    };
    CONFIG.save(deps.storage, &cfg)?;
    SERIES_COUNT.save(deps.storage, &0)?;

    Ok(Response::new()
        .add_attribute("action", "instantiate")
        .add_attribute("sender", info.sender))
}

fn only_admin(deps: Deps, info: &MessageInfo) -> Result<(), ContractError> {
    let cfg = CONFIG.load(deps.storage)?;
    if info.sender != Addr::unchecked(cfg.admin) {
        return Err(ContractError::Unauthorized);
    }
    Ok(())
}

fn validate_terms(cfg: &Config, terms: &SeriesTerms) -> Result<(), ContractError> {
    if !cfg.allowed_principal_denoms.iter().any(|d| d == &terms.principal_denom) {
        return Err(ContractError::DenomNotAllowed);
    }
    if terms.initial_collateral_ratio_bps < cfg.min_initial_collateral_ratio_bps {
        return Err(ContractError::InvalidConfig("initial collateral ratio below minimum".into()));
    }
    Ok(())
}

#[entry_point]
pub fn execute(deps: DepsMut, env: Env, info: MessageInfo, msg: ExecuteMsg) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::CreateSeries { terms } => execute_create_series(deps, env, info, terms),
        ExecuteMsg::UpdateConfig {
            admin,
            allowed_principal_denoms,
            min_initial_collateral_ratio_bps,
            protocol_fee_bps,
            fee_recipient,
            bond_series_code_id,
        } => execute_update_config(
            deps,
            info,
            admin,
            allowed_principal_denoms,
            min_initial_collateral_ratio_bps,
            protocol_fee_bps,
            fee_recipient,
            bond_series_code_id,
        ),
    }
}

fn execute_update_config(
    deps: DepsMut,
    info: MessageInfo,
    admin: Option<String>,
    allowed_principal_denoms: Option<Vec<String>>,
    min_initial_collateral_ratio_bps: Option<u32>,
    protocol_fee_bps: Option<u32>,
    fee_recipient: Option<String>,
    bond_series_code_id: Option<u64>,
) -> Result<Response, ContractError> {
    only_admin(deps.as_ref(), &info)?;
    let mut cfg = CONFIG.load(deps.storage)?;

    if let Some(a) = admin { cfg.admin = a; }
    if let Some(d) = allowed_principal_denoms { cfg.allowed_principal_denoms = d; }
    if let Some(m) = min_initial_collateral_ratio_bps { cfg.min_initial_collateral_ratio_bps = m; }
    if let Some(p) = protocol_fee_bps { cfg.protocol_fee_bps = p; }
    if let Some(f) = fee_recipient { cfg.fee_recipient = f; }
    if let Some(c) = bond_series_code_id { cfg.bond_series_code_id = c; }

    CONFIG.save(deps.storage, &cfg)?;
    Ok(Response::new().add_attribute("action", "update_config"))
}

fn execute_create_series(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    terms: SeriesTerms,
) -> Result<Response, ContractError> {
    let cfg = CONFIG.load(deps.storage)?;
    // admin can create; optionally allow anyone (policy choice)
    if info.sender != Addr::unchecked(cfg.admin.clone()) && info.sender != Addr::unchecked(terms.borrower.clone()) {
        return Err(ContractError::Unauthorized);
    }
    validate_terms(&cfg, &terms)?;

    // Instantiate bond_series with factory as admin
    let instantiate_msg = bond_series::msg::InstantiateMsg {
        terms,
        admin: cfg.admin.clone(),
        protocol_fee_bps: cfg.protocol_fee_bps,
        fee_recipient: cfg.fee_recipient.clone(),
    };

    let sub = SubMsg::reply_on_success(
        WasmMsg::Instantiate {
            admin: Some(cfg.admin.clone()),
            code_id: cfg.bond_series_code_id,
            msg: cosmwasm_std::to_json_binary(&instantiate_msg)?,
            funds: vec![],
            label: "heb-bond-series".to_string(),
        },
        REPLY_ID_CREATE_SERIES,
    );

    Ok(Response::new()
        .add_submessage(sub)
        .add_attribute("action", "create_series"))
}

#[entry_point]
pub fn reply(deps: DepsMut, _env: Env, msg: Reply) -> Result<Response, ContractError> {
    if msg.id != REPLY_ID_CREATE_SERIES {
        return Err(ContractError::InvalidConfig("unknown reply id".into()));
    }

    // Parse instantiate reply to extract contract address
    let res = msg.result.into_result().map_err(|e| ContractError::Std(cosmwasm_std::StdError::generic_err(e)))?;
    let addr = res
        .events
        .iter()
        .flat_map(|ev| ev.attributes.iter())
        .find(|a| a.key == "_contract_address")
        .map(|a| a.value.clone())
        .ok_or_else(|| ContractError::InvalidConfig("missing contract address in reply".into()))?;

    let mut count = SERIES_COUNT.load(deps.storage)?;
    count += 1;
    SERIES_COUNT.save(deps.storage, &count)?;
    SERIES.save(deps.storage, count, &addr)?;

    Ok(Response::new()
        .add_attribute("action", "series_created")
        .add_attribute("series_id", count.to_string())
        .add_attribute("address", addr))
}

#[entry_point]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::Config {} => to_json_binary(&query_config(deps)?),
        QueryMsg::SeriesList { start_after, limit } => to_json_binary(&query_series_list(deps, start_after, limit)?),
    }
}

fn query_config(deps: Deps) -> StdResult<ConfigResponse> {
    let cfg = CONFIG.load(deps.storage)?;
    Ok(ConfigResponse {
        admin: cfg.admin,
        allowed_principal_denoms: cfg.allowed_principal_denoms,
        min_initial_collateral_ratio_bps: cfg.min_initial_collateral_ratio_bps,
        protocol_fee_bps: cfg.protocol_fee_bps,
        fee_recipient: cfg.fee_recipient,
        bond_series_code_id: cfg.bond_series_code_id,
    })
}

fn query_series_list(deps: Deps, start_after: Option<String>, limit: Option<u32>) -> StdResult<SeriesListResponse> {
    let lim = limit.unwrap_or(50).min(200) as usize;
    let start_id = start_after
        .and_then(|s| s.parse::<u64>().ok())
        .unwrap_or(0);

    let mut out = vec![];
    for item in SERIES
        .range(deps.storage, Some(Bound::exclusive(start_id + 1)), None, cosmwasm_std::Order::Ascending)
        .take(lim)
    {
        let (_k, v) = item?;
        out.push(v);
    }
    Ok(SeriesListResponse { series: out })
}
