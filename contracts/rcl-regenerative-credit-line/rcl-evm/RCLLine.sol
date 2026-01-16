// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./RCLRegistry.sol";

/// @title RCLLine - Core credit line contract for regenerative liquidity
contract RCLLine {
    RCLRegistry public registry;
    address public token; // Regen-compatible stable asset (e.g., rUSD)
    uint256 public baseRate;

    struct Loan {
        uint256 principal;
        uint256 rate;
        bool active;
    }

    mapping(address => Loan) public loans;

    event Borrowed(address indexed user, uint256 amount, uint256 rate);
    event Repaid(address indexed user, uint256 amount);
    event Closed(address indexed user);

    constructor(address _registry, address _token, uint256 _baseRate) {
        registry = RCLRegistry(_registry);
        token = _token;
        baseRate = _baseRate;
    }

    function borrow(uint256 amount) external {
        (uint8 trustScore, uint256 creditLimit, bool registered) = getUserData(msg.sender);
        require(registered, "Not registered");
        require(amount <= creditLimit, "Limit exceeded");

        uint256 rate = baseRate * (100 - trustScore) / 100;
        loans[msg.sender] = Loan(amount, rate, true);

        emit Borrowed(msg.sender, amount, rate);
    }

    function repay(uint256 amount) external {
        Loan storage loan = loans[msg.sender];
        require(loan.active, "No active loan");
        if (amount >= loan.principal) {
            loan.principal = 0;
            loan.active = false;
            emit Closed(msg.sender);
        } else {
            loan.principal -= amount;
            emit Repaid(msg.sender, amount);
        }
    }

    function getUserData(address user) internal view returns (uint8, uint256, bool) {
        (bool success, bytes memory data) = address(registry).staticcall(
            abi.encodeWithSignature("users(address)", user)
        );
        require(success, "Registry query failed");
        (uint8 score, uint256 limit, bool registered) = abi.decode(data, (uint8, uint256, bool));
        return (score, limit, registered);
    }
}
