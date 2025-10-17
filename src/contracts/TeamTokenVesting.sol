// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TeamTokenVesting
 * @dev Vesting contract for HypeAI team tokens with 6-month cliff and 24-month linear vesting
 *
 * Features:
 * - 1 Billion HYPE tokens for team
 * - 6-month cliff (no tokens released before 6 months)
 * - 24-month linear vesting after cliff (equal monthly releases)
 * - Multiple beneficiaries with individual allocations
 * - Emergency withdraw by owner (only unvested tokens)
 */
contract TeamTokenVesting is Ownable, ReentrancyGuard {

    IERC20 public immutable token;

    // Vesting parameters
    uint256 public constant CLIFF_DURATION = 180 days; // 6 months
    uint256 public constant VESTING_DURATION = 730 days; // 24 months
    uint256 public constant TOTAL_TEAM_ALLOCATION = 1_000_000_000 * 10**18; // 1B tokens

    uint256 public vestingStartTime;
    uint256 public totalAllocated;

    struct VestingSchedule {
        uint256 totalAmount;      // Total tokens allocated to beneficiary
        uint256 released;         // Tokens already released
        bool revoked;             // Whether vesting was revoked
    }

    mapping(address => VestingSchedule) public vestingSchedules;
    address[] public beneficiaries;

    // Events
    event VestingScheduleCreated(address indexed beneficiary, uint256 amount);
    event TokensReleased(address indexed beneficiary, uint256 amount);
    event VestingRevoked(address indexed beneficiary, uint256 unvestedAmount);
    event VestingStarted(uint256 startTime);

    constructor(address _token) Ownable(msg.sender) {
        require(_token != address(0), "Invalid token address");
        token = IERC20(_token);
    }

    /**
     * @dev Start the vesting period (can only be called once)
     */
    function startVesting() external onlyOwner {
        require(vestingStartTime == 0, "Vesting already started");
        require(totalAllocated > 0, "No beneficiaries added");

        vestingStartTime = block.timestamp;
        emit VestingStarted(vestingStartTime);
    }

    /**
     * @dev Add beneficiary with vesting allocation (before vesting starts)
     */
    function addBeneficiary(address beneficiary, uint256 amount) external onlyOwner {
        require(vestingStartTime == 0, "Vesting already started");
        require(beneficiary != address(0), "Invalid beneficiary");
        require(amount > 0, "Amount must be greater than 0");
        require(vestingSchedules[beneficiary].totalAmount == 0, "Beneficiary already exists");
        require(totalAllocated + amount <= TOTAL_TEAM_ALLOCATION, "Exceeds total allocation");

        vestingSchedules[beneficiary] = VestingSchedule({
            totalAmount: amount,
            released: 0,
            revoked: false
        });

        beneficiaries.push(beneficiary);
        totalAllocated += amount;

        emit VestingScheduleCreated(beneficiary, amount);
    }

    /**
     * @dev Add multiple beneficiaries at once
     */
    function addBeneficiaries(
        address[] calldata _beneficiaries,
        uint256[] calldata _amounts
    ) external onlyOwner {
        require(_beneficiaries.length == _amounts.length, "Arrays length mismatch");
        require(vestingStartTime == 0, "Vesting already started");

        for (uint256 i = 0; i < _beneficiaries.length; i++) {
            address beneficiary = _beneficiaries[i];
            uint256 amount = _amounts[i];

            require(beneficiary != address(0), "Invalid beneficiary");
            require(amount > 0, "Amount must be greater than 0");
            require(vestingSchedules[beneficiary].totalAmount == 0, "Beneficiary already exists");
            require(totalAllocated + amount <= TOTAL_TEAM_ALLOCATION, "Exceeds total allocation");

            vestingSchedules[beneficiary] = VestingSchedule({
                totalAmount: amount,
                released: 0,
                revoked: false
            });

            beneficiaries.push(beneficiary);
            totalAllocated += amount;

            emit VestingScheduleCreated(beneficiary, amount);
        }
    }

    /**
     * @dev Calculate vested amount for a beneficiary
     */
    function vestedAmount(address beneficiary) public view returns (uint256) {
        VestingSchedule memory schedule = vestingSchedules[beneficiary];

        if (schedule.totalAmount == 0 || vestingStartTime == 0) {
            return 0;
        }

        if (schedule.revoked) {
            return schedule.released;
        }

        // Before cliff: 0 tokens vested
        if (block.timestamp < vestingStartTime + CLIFF_DURATION) {
            return 0;
        }

        // After full vesting period: all tokens vested
        if (block.timestamp >= vestingStartTime + CLIFF_DURATION + VESTING_DURATION) {
            return schedule.totalAmount;
        }

        // During vesting period: linear vesting
        uint256 timeFromCliff = block.timestamp - (vestingStartTime + CLIFF_DURATION);
        uint256 vested = (schedule.totalAmount * timeFromCliff) / VESTING_DURATION;

        return vested;
    }

    /**
     * @dev Calculate releasable amount for a beneficiary
     */
    function releasableAmount(address beneficiary) public view returns (uint256) {
        uint256 vested = vestedAmount(beneficiary);
        uint256 released = vestingSchedules[beneficiary].released;

        return vested - released;
    }

    /**
     * @dev Release vested tokens to beneficiary
     */
    function release() external nonReentrant {
        address beneficiary = msg.sender;
        uint256 unreleased = releasableAmount(beneficiary);

        require(unreleased > 0, "No tokens to release");

        vestingSchedules[beneficiary].released += unreleased;

        require(token.transfer(beneficiary, unreleased), "Token transfer failed");

        emit TokensReleased(beneficiary, unreleased);
    }

    /**
     * @dev Release tokens on behalf of beneficiary (callable by anyone)
     */
    function releaseFor(address beneficiary) external nonReentrant {
        uint256 unreleased = releasableAmount(beneficiary);

        require(unreleased > 0, "No tokens to release");

        vestingSchedules[beneficiary].released += unreleased;

        require(token.transfer(beneficiary, unreleased), "Token transfer failed");

        emit TokensReleased(beneficiary, unreleased);
    }

    /**
     * @dev Revoke vesting for a beneficiary (emergency only)
     * Releases vested tokens to beneficiary and returns unvested tokens to owner
     */
    function revokeVesting(address beneficiary) external onlyOwner nonReentrant {
        VestingSchedule storage schedule = vestingSchedules[beneficiary];

        require(schedule.totalAmount > 0, "Beneficiary does not exist");
        require(!schedule.revoked, "Vesting already revoked");

        uint256 vested = vestedAmount(beneficiary);
        uint256 unreleased = vested - schedule.released;
        uint256 unvested = schedule.totalAmount - vested;

        schedule.revoked = true;

        // Release vested tokens to beneficiary
        if (unreleased > 0) {
            schedule.released += unreleased;
            require(token.transfer(beneficiary, unreleased), "Token transfer to beneficiary failed");
            emit TokensReleased(beneficiary, unreleased);
        }

        // Return unvested tokens to owner
        if (unvested > 0) {
            require(token.transfer(owner(), unvested), "Token transfer to owner failed");
        }

        emit VestingRevoked(beneficiary, unvested);
    }

    /**
     * @dev Get vesting info for a beneficiary
     */
    function getVestingInfo(address beneficiary) external view returns (
        uint256 totalAmount,
        uint256 released,
        uint256 vested,
        uint256 releasable,
        uint256 cliffEnd,
        uint256 vestingEnd,
        bool revoked,
        bool cliffPassed,
        bool fullyVested
    ) {
        VestingSchedule memory schedule = vestingSchedules[beneficiary];

        totalAmount = schedule.totalAmount;
        released = schedule.released;
        vested = vestedAmount(beneficiary);
        releasable = releasableAmount(beneficiary);
        revoked = schedule.revoked;

        if (vestingStartTime > 0) {
            cliffEnd = vestingStartTime + CLIFF_DURATION;
            vestingEnd = vestingStartTime + CLIFF_DURATION + VESTING_DURATION;
            cliffPassed = block.timestamp >= cliffEnd;
            fullyVested = block.timestamp >= vestingEnd;
        }
    }

    /**
     * @dev Get all beneficiaries
     */
    function getBeneficiaries() external view returns (address[] memory) {
        return beneficiaries;
    }

    /**
     * @dev Get total number of beneficiaries
     */
    function getBeneficiaryCount() external view returns (uint256) {
        return beneficiaries.length;
    }

    /**
     * @dev Emergency withdraw of unallocated tokens (only before vesting starts)
     */
    function emergencyWithdraw() external onlyOwner {
        require(vestingStartTime == 0, "Vesting already started");

        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");

        require(token.transfer(owner(), balance), "Token transfer failed");
    }

    /**
     * @dev Get contract status
     */
    function getStatus() external view returns (
        bool vestingStarted,
        uint256 startTime,
        uint256 cliffEnd,
        uint256 vestingEnd,
        uint256 totalAllocatedTokens,
        uint256 totalReleasedTokens,
        uint256 contractBalance,
        uint256 beneficiaryCount
    ) {
        vestingStarted = vestingStartTime > 0;
        startTime = vestingStartTime;
        totalAllocatedTokens = totalAllocated;
        contractBalance = token.balanceOf(address(this));
        beneficiaryCount = beneficiaries.length;

        if (vestingStartTime > 0) {
            cliffEnd = vestingStartTime + CLIFF_DURATION;
            vestingEnd = vestingStartTime + CLIFF_DURATION + VESTING_DURATION;
        }

        // Calculate total released
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            totalReleasedTokens += vestingSchedules[beneficiaries[i]].released;
        }
    }
}
