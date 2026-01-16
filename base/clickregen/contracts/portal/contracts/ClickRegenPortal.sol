// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ClickRegenPortal {
  address public owner;
  address public finalizer;
  bool public paused;

  uint32 public maxClicksPerAddressPerDay;
  uint32 public maxClicksPerDayGlobal;

  uint256 public currentDayIndex;
  uint32 public globalClicksToday;

  mapping(address => uint256) public lastDayByAddress;
  mapping(address => uint32) public clicksTodayByAddress;

  error NotOwner();
  error NotFinalizer();
  error Paused();
  error IntentAlreadyExists();
  error IntentNotFound();
  error IntentExpired();
  error IntentAlreadyFinalized();
  error InvalidIntentId();
  error AddressDayCapExceeded();
  error GlobalDayCapExceeded();

  event OwnerChanged(address indexed prev, address indexed next);
  event FinalizerChanged(address indexed prev, address indexed next);
  event PausedSet(bool paused);
  event CapsSet(uint32 maxPerAddressPerDay, uint32 maxPerDayGlobal);

  event IntentSubmitted(
    bytes32 indexed intentId,
    address indexed sender,
    uint32 action,
    uint64 expiry,
    uint256 nonce,
    bytes payload,
    bytes32 payloadHash
  );

  event ReceiptFinalized(
    bytes32 indexed intentId,
    bool success,
    uint32 errorCode,
    bytes32 stateHash,
    bytes32 execRefHash,
    bytes resultPayload,
    bytes32 receiptHash
  );

  struct IntentRecord {
    address sender;
    uint64 createdAt;
    uint64 expiry;
    uint32 action;
    uint256 nonce;
    bytes32 payloadHash;
    bool finalized;
    bytes32 receiptHash;
  }

  mapping(bytes32 => IntentRecord) public intents;

  modifier onlyOwner() {
    if (msg.sender != owner) revert NotOwner();
    _;
  }

  modifier onlyFinalizer() {
    if (msg.sender != finalizer) revert NotFinalizer();
    _;
  }

  constructor(address initialFinalizer, uint32 perAddressCap, uint32 globalCap) {
    owner = msg.sender;
    finalizer = initialFinalizer;
    maxClicksPerAddressPerDay = perAddressCap;
    maxClicksPerDayGlobal = globalCap;
    currentDayIndex = _dayIndex(block.timestamp);
    emit OwnerChanged(address(0), msg.sender);
    emit FinalizerChanged(address(0), initialFinalizer);
    emit CapsSet(perAddressCap, globalCap);
  }

  function setOwner(address next) external onlyOwner {
    emit OwnerChanged(owner, next);
    owner = next;
  }

  function setFinalizer(address next) external onlyOwner {
    emit FinalizerChanged(finalizer, next);
    finalizer = next;
  }

  function setPaused(bool p) external onlyOwner {
    paused = p;
    emit PausedSet(p);
  }

  function setCaps(uint32 perAddressCap, uint32 globalCap) external onlyOwner {
    maxClicksPerAddressPerDay = perAddressCap;
    maxClicksPerDayGlobal = globalCap;
    emit CapsSet(perAddressCap, globalCap);
  }

  function _dayIndex(uint256 ts) internal pure returns (uint256) {
    return ts / 1 days;
  }

  function _rollDayIfNeeded() internal {
    uint256 d = _dayIndex(block.timestamp);
    if (d != currentDayIndex) {
      currentDayIndex = d;
      globalClicksToday = 0;
    }
  }

  function _rollAddressIfNeeded(address a) internal {
    uint256 d = _dayIndex(block.timestamp);
    if (lastDayByAddress[a] != d) {
      lastDayByAddress[a] = d;
      clicksTodayByAddress[a] = 0;
    }
  }

  function computeIntentId(
    address sender,
    uint256 nonce,
    uint32 action,
    bytes calldata payload,
    uint64 expiry
  ) public view returns (bytes32) {
    bytes32 payloadHash = keccak256(payload);
    return keccak256(abi.encode(block.chainid, sender, nonce, action, payloadHash, expiry));
  }

  function submitIntent(
    bytes32 intentId,
    uint32 action,
    bytes calldata payload,
    uint64 expiry,
    uint256 nonce
  ) external returns (bytes32) {
    if (paused) revert Paused();

    _rollDayIfNeeded();
    _rollAddressIfNeeded(msg.sender);

    if (maxClicksPerDayGlobal != 0 && globalClicksToday >= maxClicksPerDayGlobal) {
      revert GlobalDayCapExceeded();
    }
    if (maxClicksPerAddressPerDay != 0 && clicksTodayByAddress[msg.sender] >= maxClicksPerAddressPerDay) {
      revert AddressDayCapExceeded();
    }

    if (intents[intentId].createdAt != 0) revert IntentAlreadyExists();

    bytes32 expected = computeIntentId(msg.sender, nonce, action, payload, expiry);
    if (expected != intentId) revert InvalidIntentId();
    if (expiry != 0 && block.timestamp > expiry) revert IntentExpired();

    globalClicksToday += 1;
    clicksTodayByAddress[msg.sender] += 1;

    bytes32 payloadHash = keccak256(payload);
    intents[intentId] = IntentRecord({
      sender: msg.sender,
      createdAt: uint64(block.timestamp),
      expiry: expiry,
      action: action,
      nonce: nonce,
      payloadHash: payloadHash,
      finalized: false,
      receiptHash: bytes32(0)
    });

    emit IntentSubmitted(intentId, msg.sender, action, expiry, nonce, payload, payloadHash);
    return intentId;
  }

  function finalizeReceipt(
    bytes32 intentId,
    bool success,
    uint32 errorCode,
    bytes32 stateHash,
    bytes32 execRefHash,
    bytes calldata resultPayload
  ) external onlyFinalizer {
    IntentRecord storage rec = intents[intentId];
    if (rec.createdAt == 0) revert IntentNotFound();
    if (rec.finalized) revert IntentAlreadyFinalized();
    if (rec.expiry != 0 && block.timestamp > rec.expiry) revert IntentExpired();

    bytes32 receiptHash = keccak256(
      abi.encode(intentId, success, errorCode, stateHash, execRefHash, keccak256(resultPayload))
    );

    rec.finalized = true;
    rec.receiptHash = receiptHash;

    emit ReceiptFinalized(intentId, success, errorCode, stateHash, execRefHash, resultPayload, receiptHash);
  }

  function getCounts(address a) external view returns (
    uint256 dayIndex,
    uint32 globalToday,
    uint32 addressToday,
    uint32 perAddressCap,
    uint32 globalCap
  ) {
    uint256 d = _dayIndex(block.timestamp);
    uint32 addrToday = clicksTodayByAddress[a];
    if (lastDayByAddress[a] != d) addrToday = 0;
    uint32 globalTodayView = globalClicksToday;
    if (currentDayIndex != d) globalTodayView = 0;
    return (d, globalTodayView, addrToday, maxClicksPerAddressPerDay, maxClicksPerDayGlobal);
  }
}
