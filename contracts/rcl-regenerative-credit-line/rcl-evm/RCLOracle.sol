// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title RCLOracle - Mock Oracle providing ecological trust scores
contract RCLOracle {
    address public registry;

    event ScorePushed(address indexed project, uint8 score);

    modifier onlyRegistry() {
        require(msg.sender == registry, "Not registry");
        _;
    }

    constructor(address _registry) {
        registry = _registry;
    }

    function pushScore(address project, uint8 score, uint256 baseLimit) external onlyRegistry {
        emit ScorePushed(project, score);
    }
}
