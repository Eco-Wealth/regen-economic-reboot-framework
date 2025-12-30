use thiserror::Error;

#[derive(Error, Debug, PartialEq)]
pub enum ContractError {
    #[error("{0}")]
    Std(#[from] cosmwasm_std::StdError),

    #[error("Unauthorized")]
    Unauthorized,

    #[error("Paused")]
    Paused,

    #[error("Sale not open")]
    SaleNotOpen,

    #[error("Bond has matured")]
    Matured,

    #[error("Bond not yet matured")]
    NotMatured,

    #[error("Invalid denom")]
    InvalidDenom,

    #[error("Insufficient funds")]
    InsufficientFunds,

    #[error("Oracle price stale or missing")]
    OracleStale,

    #[error("Collateral ratio too low")]
    CollateralTooLow,

    #[error("Nothing to claim")]
    NothingToClaim,

    #[error("Invalid config: {0}")]
    InvalidConfig(String),
}
