use cosmwasm_std::{StdError, StdResult};

/// NOTE: v0.1 uses decimal math as strings to avoid committing to a fixed-point scale too early.
/// Teams should replace this with a robust fixed-point library (e.g., Decimal256) once design is locked.

pub fn parse_u128(s: &str) -> StdResult<u128> {
    s.parse::<u128>().map_err(|e| StdError::generic_err(format!("bad u128: {e}")))
}

pub fn to_string_u128(x: u128) -> String {
    x.to_string()
}

/// Placeholder: compute new interest index after `dt` seconds at `rate_apr_bps`.
pub fn accrue_index(current_index: &str, _dt: u64, _rate_apr_bps: u32) -> StdResult<String> {
    // TODO: implement fixed point math (e.g., index *= (1 + rate_per_second * dt))
    Ok(current_index.to_string())
}
