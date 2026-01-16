// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title RCLRegistry - Registry for Regenerative Credit Line participants and trust scores
contract RCLRegistry {
    struct User {
        uint8 trustScore;
        uint256 creditLimit;
        bool registered;
    }

    mapping(address => User) public users;
    address public oracle;
    address public governor;

    event Registered(address indexed user, uint8 trustScore);
    event TrustScoreUpdated(address indexed user, uint8 newScore, uint256 newLimit);

    modifier onlyGovernor() {
        require(msg.sender == governor, "Not governor");
        _;
    }

    modifier onlyOracle() {
        require(msg.sender == oracle, "Not oracle");
        _;
    }

    constructor(address _oracle, address _governor) {
        oracle = _oracle;
        governor = _governor;
    }

    function registerUser(address user, uint8 score, uint256 baseLimit) external onlyGovernor {
        require(!users[user].registered, "Already registered");
        users[user] = User(score, baseLimit * score / 100, true);
        emit Registered(user, score);
    }

    function updateTrustScore(address user, uint8 newScore, uint256 baseLimit) external onlyOracle {
        require(users[user].registered, "Not registered");
        users[user].trustScore = newScore;
        users[user].creditLimit = baseLimit * newScore / 100;
        emit TrustScoreUpdated(user, newScore, users[user].creditLimit);
    }
}
