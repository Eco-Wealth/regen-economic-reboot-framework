use thiserror::Error;

#[derive(Error, Debug, PartialEq)]
pub enum ContractError {
    #[error("{0}")]
    Std(#[from] cosmwasm_std::StdError),

    #[error("Unauthorized")]
    Unauthorized,

    #[error("Invalid config: {0}")]
    InvalidConfig(String),

    #[error("Principal denom not allowed")]
    DenomNotAllowed,
}
