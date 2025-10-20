const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * COMPREHENSIVE VESTING TESTS FOR HYPEAI PRIVATE SALE
 *
 * Vesting Formula (MUST BE VERIFIED):
 * - Immediate unlock: 20% of total tokens (available at purchase)
 * - Cliff period: 90 days (3 months) - no tokens unlock during this time
 * - Linear vesting: 80% of total tokens over 540 days (18 months) AFTER cliff
 * - Total duration: 630 days (21 months) from purchase to full unlock
 */

describe("HypeAIPrivateSaleWithVesting - Comprehensive Tests", function() {
  let privateSale;
  let hypeToken;
  let usdtToken;
  let owner, buyer1, buyer2, buyer3;

  // Vesting parameters (MUST MATCH CONTRACT)
  const IMMEDIATE_UNLOCK_PERCENTAGE = 2000; // 20%
  const VESTING_PERCENTAGE = 8000; // 80%
  const CLIFF_DURATION = 90 * 24 * 60 * 60; // 90 days in seconds
  const VESTING_DURATION = 540 * 24 * 60 * 60; // 540 days in seconds
  const TOTAL_DURATION = CLIFF_DURATION + VESTING_DURATION; // 630 days
  const BASIS_POINTS = 10000;

  // Token price and purchase amounts
  const TOKEN_PRICE_USD = 8; // $0.00008 scaled
  const MIN_PURCHASE_USD = ethers.parseEther("400"); // $400
  const MAX_PURCHASE_USD = ethers.parseEther("8000"); // $8,000
  const BONUS_PERCENTAGE = 1000; // 10%

  // Time helpers
  const DAY = 24 * 60 * 60;
  const increaseTime = async (seconds) => {
    await ethers.provider.send("evm_increaseTime", [seconds]);
    await ethers.provider.send("evm_mine");
  };

  beforeEach(async function() {
    [owner, buyer1, buyer2, buyer3] = await ethers.getSigners();

    // Deploy mock HYPE token
    const MockToken = await ethers.getContractFactory("MockERC20");
    hypeToken = await MockToken.deploy("HypeAI", "HYPE", ethers.parseEther("10000000000")); // 10B supply
    await hypeToken.waitForDeployment();

    // Deploy mock USDT token
    usdtToken = await MockToken.deploy("Tether USD", "USDT", ethers.parseEther("1000000"));
    await usdtToken.waitForDeployment();

    // Deploy private sale contract
    const PrivateSale = await ethers.getContractFactory("HypeAIPrivateSaleWithVesting");
    privateSale = await PrivateSale.deploy(
      await hypeToken.getAddress(),
      await usdtToken.getAddress(),
      ethers.ZeroAddress // No referral system for tests
    );
    await privateSale.waitForDeployment();

    // Fund private sale contract with HYPE tokens
    const fundAmount = ethers.parseEther("1100000000"); // 1.1B tokens
    await hypeToken.transfer(await privateSale.getAddress(), fundAmount);

    // Give buyers USDT for purchases
    await usdtToken.transfer(buyer1.address, ethers.parseEther("10000"));
    await usdtToken.transfer(buyer2.address, ethers.parseEther("10000"));
    await usdtToken.transfer(buyer3.address, ethers.parseEther("10000"));

    // Approve private sale to spend USDT
    await usdtToken.connect(buyer1).approve(await privateSale.getAddress(), ethers.MaxUint256);
    await usdtToken.connect(buyer2).approve(await privateSale.getAddress(), ethers.MaxUint256);
    await usdtToken.connect(buyer3).approve(await privateSale.getAddress(), ethers.MaxUint256);
  });

  describe("1. VESTING PARAMETERS VERIFICATION", function() {
    it("should have correct immediate unlock percentage (20%)", async function() {
      const params = await privateSale.getVestingParameters();
      expect(params.immediateUnlockBps).to.equal(IMMEDIATE_UNLOCK_PERCENTAGE);
    });

    it("should have correct vesting percentage (80%)", async function() {
      const params = await privateSale.getVestingParameters();
      expect(params.vestingBps).to.equal(VESTING_PERCENTAGE);
    });

    it("should have correct cliff duration (90 days)", async function() {
      const params = await privateSale.getVestingParameters();
      expect(params.cliffDurationSeconds).to.equal(CLIFF_DURATION);
    });

    it("should have correct vesting duration (540 days)", async function() {
      const params = await privateSale.getVestingParameters();
      expect(params.vestingDurationSeconds).to.equal(VESTING_DURATION);
    });

    it("should have correct total duration (630 days)", async function() {
      const params = await privateSale.getVestingParameters();
      const totalDuration = params.cliffDurationSeconds + params.vestingDurationSeconds;
      expect(totalDuration).to.equal(TOTAL_DURATION);
    });

    it("should have correct token price ($0.00008)", async function() {
      const params = await privateSale.getVestingParameters();
      expect(params.tokenPriceUsd).to.equal(TOKEN_PRICE_USD);
    });

    it("should have correct bonus percentage (10%)", async function() {
      const params = await privateSale.getVestingParameters();
      expect(params.bonusBps).to.equal(BONUS_PERCENTAGE);
    });
  });

  describe("2. TOKEN PURCHASE AND VESTING SCHEDULE CREATION", function() {
    it("should create vesting schedule on purchase", async function() {
      const purchaseAmount = ethers.parseEther("1000"); // $1,000

      await privateSale.connect(buyer1).purchaseTokens(purchaseAmount, false);

      const info = await privateSale.getVestingInfo(buyer1.address);
      expect(info.totalTokens).to.be.gt(0);
      expect(info.immediateTokens).to.be.gt(0);
      expect(info.vestedTokens).to.be.gt(0);
    });

    it("should calculate correct token amounts for $1,000 purchase", async function() {
      const purchaseAmount = ethers.parseEther("1000"); // $1,000

      await privateSale.connect(buyer1).purchaseTokens(purchaseAmount, false);

      const info = await privateSale.getVestingInfo(buyer1.address);

      // $1,000 / $0.00008 = 12,500,000 tokens
      const expectedBaseTokens = ethers.parseEther("12500000");

      expect(info.totalTokens).to.equal(expectedBaseTokens);
    });

    it("should apply 10% bonus when requested", async function() {
      const purchaseAmount = ethers.parseEther("1000"); // $1,000

      await privateSale.connect(buyer1).purchaseTokens(purchaseAmount, true); // With bonus

      const info = await privateSale.getVestingInfo(buyer1.address);

      // $1,000 / $0.00008 = 12,500,000 base tokens
      // 10% bonus = 1,250,000 tokens
      // Total = 13,750,000 tokens
      const expectedTotalTokens = ethers.parseEther("13750000");

      expect(info.totalTokens).to.equal(expectedTotalTokens);
    });

    it("should correctly split immediate (20%) and vested (80%) tokens", async function() {
      const purchaseAmount = ethers.parseEther("1000"); // $1,000

      await privateSale.connect(buyer1).purchaseTokens(purchaseAmount, false);

      const info = await privateSale.getVestingInfo(buyer1.address);

      // Expected: 12,500,000 total
      // Immediate (20%): 2,500,000
      // Vested (80%): 10,000,000
      const expectedImmediate = ethers.parseEther("2500000");
      const expectedVested = ethers.parseEther("10000000");

      expect(info.immediateTokens).to.equal(expectedImmediate);
      expect(info.vestedTokens).to.equal(expectedVested);
      expect(info.immediateTokens + info.vestedTokens).to.equal(info.totalTokens);
    });

    it("should verify immediate + vested = total tokens", async function() {
      const purchaseAmount = ethers.parseEther("1000");

      await privateSale.connect(buyer1).purchaseTokens(purchaseAmount, true); // With bonus

      const info = await privateSale.getVestingInfo(buyer1.address);

      expect(info.immediateTokens + info.vestedTokens).to.equal(info.totalTokens);
    });
  });

  describe("3. CLIFF PERIOD LOGIC (0-90 DAYS)", function() {
    beforeEach(async function() {
      const purchaseAmount = ethers.parseEther("1000"); // $1,000
      await privateSale.connect(buyer1).purchaseTokens(purchaseAmount, false);
    });

    it("should unlock only immediate tokens (20%) at day 0", async function() {
      const unlocked = await privateSale.getUnlockedAmount(buyer1.address);
      const info = await privateSale.getVestingInfo(buyer1.address);

      // Should be exactly 20% (immediate tokens only)
      expect(unlocked).to.equal(info.immediateTokens);
      expect(unlocked).to.equal(ethers.parseEther("2500000"));
    });

    it("should still have only 20% unlocked at day 30 (mid-cliff)", async function() {
      await increaseTime(30 * DAY);

      const unlocked = await privateSale.getUnlockedAmount(buyer1.address);
      const info = await privateSale.getVestingInfo(buyer1.address);

      expect(unlocked).to.equal(info.immediateTokens);
      expect(unlocked).to.equal(ethers.parseEther("2500000"));
    });

    it("should still have only 20% unlocked at day 60", async function() {
      await increaseTime(60 * DAY);

      const unlocked = await privateSale.getUnlockedAmount(buyer1.address);

      expect(unlocked).to.equal(ethers.parseEther("2500000"));
    });

    it("should still have only 20% unlocked at day 89 (one day before cliff end)", async function() {
      await increaseTime(89 * DAY);

      const unlocked = await privateSale.getUnlockedAmount(buyer1.address);

      expect(unlocked).to.equal(ethers.parseEther("2500000"));
    });

    it("should NOT unlock any vested tokens during cliff", async function() {
      await increaseTime(89 * DAY);

      const unlocked = await privateSale.getUnlockedAmount(buyer1.address);
      const info = await privateSale.getVestingInfo(buyer1.address);

      // Unlocked should equal immediate only (no vesting yet)
      expect(unlocked).to.equal(info.immediateTokens);
    });
  });

  describe("4. POST-CLIFF LINEAR VESTING (90-630 DAYS)", function() {
    beforeEach(async function() {
      const purchaseAmount = ethers.parseEther("1000"); // $1,000
      await privateSale.connect(buyer1).purchaseTokens(purchaseAmount, false);
    });

    it("should start vesting after day 90 (cliff end)", async function() {
      await increaseTime(90 * DAY);

      const unlocked = await privateSale.getUnlockedAmount(buyer1.address);

      // Should be > 20% now (immediate + some vested)
      expect(unlocked).to.be.gt(ethers.parseEther("2500000"));
    });

    it("should have ~20% unlocked at day 91 (1 day after cliff)", async function() {
      await increaseTime(91 * DAY);

      const unlocked = await privateSale.getUnlockedAmount(buyer1.address);
      const info = await privateSale.getVestingInfo(buyer1.address);

      // Immediate (20%) + 1 day of vesting (80% / 540 days)
      // Expected: 2,500,000 + (10,000,000 / 540) ≈ 2,518,518
      const expectedMin = ethers.parseEther("2500000");
      const expectedMax = ethers.parseEther("2550000");

      expect(unlocked).to.be.gte(expectedMin);
      expect(unlocked).to.be.lte(expectedMax);
    });

    it("should have ~35% unlocked at day 180 (90 days into vesting)", async function() {
      await increaseTime(180 * DAY); // 90 cliff + 90 vesting

      const unlocked = await privateSale.getUnlockedAmount(buyer1.address);
      const total = (await privateSale.getVestingInfo(buyer1.address)).totalTokens;

      // Immediate (20%) + 90 days of vesting (80% * 90/540 = 13.33%)
      // Total: 33.33%
      const percentage = (unlocked * 10000n) / total;
      expect(percentage).to.be.closeTo(3333n, 100n); // ~33.33% ± 1%
    });

    it("should have ~60% unlocked at day 360 (halfway through vesting)", async function() {
      await increaseTime(360 * DAY); // 90 cliff + 270 vesting

      const unlocked = await privateSale.getUnlockedAmount(buyer1.address);
      const total = (await privateSale.getVestingInfo(buyer1.address)).totalTokens;

      // Immediate (20%) + half of vested (40%)
      // Total: 60%
      const percentage = (unlocked * 10000n) / total;
      expect(percentage).to.be.closeTo(6000n, 100n); // ~60% ± 1%
    });

    it("should have ~80% unlocked at day 540 (3/4 through vesting)", async function() {
      await increaseTime(540 * DAY); // 90 cliff + 450 vesting

      const unlocked = await privateSale.getUnlockedAmount(buyer1.address);
      const total = (await privateSale.getVestingInfo(buyer1.address)).totalTokens;

      // Immediate (20%) + 3/4 of vested (60%)
      // Total: 80%
      const percentage = (unlocked * 10000n) / total;
      expect(percentage).to.be.closeTo(8000n, 100n); // ~80% ± 1%
    });

    it("should have 100% unlocked at day 630 (full vesting complete)", async function() {
      await increaseTime(630 * DAY); // 90 cliff + 540 vesting

      const unlocked = await privateSale.getUnlockedAmount(buyer1.address);
      const total = (await privateSale.getVestingInfo(buyer1.address)).totalTokens;

      expect(unlocked).to.equal(total);
    });

    it("should stay at 100% after day 630", async function() {
      await increaseTime(700 * DAY); // Past full vesting

      const unlocked = await privateSale.getUnlockedAmount(buyer1.address);
      const total = (await privateSale.getVestingInfo(buyer1.address)).totalTokens;

      expect(unlocked).to.equal(total);
    });
  });

  describe("5. CLAIMING TOKENS", function() {
    beforeEach(async function() {
      const purchaseAmount = ethers.parseEther("1000"); // $1,000
      await privateSale.connect(buyer1).purchaseTokens(purchaseAmount, false);
    });

    it("should allow claiming immediate tokens (20%) at day 0", async function() {
      const balanceBefore = await hypeToken.balanceOf(buyer1.address);

      await privateSale.connect(buyer1).claimTokens();

      const balanceAfter = await hypeToken.balanceOf(buyer1.address);
      const claimed = balanceAfter - balanceBefore;

      expect(claimed).to.equal(ethers.parseEther("2500000"));
    });

    it("should NOT allow claiming during cliff period (no new tokens)", async function() {
      // Claim immediate tokens first
      await privateSale.connect(buyer1).claimTokens();

      // Advance into cliff period
      await increaseTime(30 * DAY);

      // Should fail - no new tokens to claim
      await expect(
        privateSale.connect(buyer1).claimTokens()
      ).to.be.revertedWith("No tokens to claim");
    });

    it("should allow claiming after cliff period", async function() {
      // Claim immediate tokens first
      await privateSale.connect(buyer1).claimTokens();

      // Advance past cliff
      await increaseTime(100 * DAY);

      const balanceBefore = await hypeToken.balanceOf(buyer1.address);
      await privateSale.connect(buyer1).claimTokens();
      const balanceAfter = await hypeToken.balanceOf(buyer1.address);

      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("should track claimed amount correctly", async function() {
      await privateSale.connect(buyer1).claimTokens();

      const info = await privateSale.getVestingInfo(buyer1.address);

      expect(info.claimedTokens).to.equal(ethers.parseEther("2500000"));
    });

    it("should allow multiple claims over time", async function() {
      // Claim 1: Immediate tokens
      await privateSale.connect(buyer1).claimTokens();
      const claim1 = (await privateSale.getVestingInfo(buyer1.address)).claimedTokens;

      // Advance time
      await increaseTime(200 * DAY);

      // Claim 2: Some vested tokens
      await privateSale.connect(buyer1).claimTokens();
      const claim2 = (await privateSale.getVestingInfo(buyer1.address)).claimedTokens;

      expect(claim2).to.be.gt(claim1);

      // Advance more time
      await increaseTime(200 * DAY);

      // Claim 3: More vested tokens
      await privateSale.connect(buyer1).claimTokens();
      const claim3 = (await privateSale.getVestingInfo(buyer1.address)).claimedTokens;

      expect(claim3).to.be.gt(claim2);
    });

    it("should allow claiming all tokens after full vesting", async function() {
      await increaseTime(630 * DAY);

      const info = await privateSale.getVestingInfo(buyer1.address);
      const balanceBefore = await hypeToken.balanceOf(buyer1.address);

      await privateSale.connect(buyer1).claimTokens();

      const balanceAfter = await hypeToken.balanceOf(buyer1.address);
      const claimed = balanceAfter - balanceBefore;

      expect(claimed).to.equal(info.totalTokens);
    });
  });

  describe("6. EDGE CASES", function() {
    it("should handle claim exactly at cliff boundary (day 90)", async function() {
      const purchaseAmount = ethers.parseEther("1000");
      await privateSale.connect(buyer1).purchaseTokens(purchaseAmount, false);

      await increaseTime(90 * DAY);

      const unlocked = await privateSale.getUnlockedAmount(buyer1.address);

      // At exactly day 90, should start having vested tokens
      expect(unlocked).to.be.gte(ethers.parseEther("2500000"));
    });

    it("should handle very small purchase amounts", async function() {
      const purchaseAmount = MIN_PURCHASE_USD; // $400

      await privateSale.connect(buyer1).purchaseTokens(purchaseAmount, false);

      const info = await privateSale.getVestingInfo(buyer1.address);

      expect(info.immediateTokens + info.vestedTokens).to.equal(info.totalTokens);
    });

    it("should handle maximum purchase amounts", async function() {
      const purchaseAmount = MAX_PURCHASE_USD; // $8,000

      await privateSale.connect(buyer1).purchaseTokens(purchaseAmount, false);

      const info = await privateSale.getVestingInfo(buyer1.address);

      expect(info.immediateTokens + info.vestedTokens).to.equal(info.totalTokens);
    });

    it("should prevent double purchases", async function() {
      const purchaseAmount = ethers.parseEther("1000");

      await privateSale.connect(buyer1).purchaseTokens(purchaseAmount, false);

      await expect(
        privateSale.connect(buyer1).purchaseTokens(purchaseAmount, false)
      ).to.be.revertedWith("Already purchased");
    });
  });

  describe("7. MULTIPLE USERS", function() {
    it("should handle multiple independent vesting schedules", async function() {
      // Buyer 1: $1,000
      await privateSale.connect(buyer1).purchaseTokens(ethers.parseEther("1000"), false);

      // Buyer 2: $2,000
      await privateSale.connect(buyer2).purchaseTokens(ethers.parseEther("2000"), false);

      // Buyer 3: $500 with bonus
      await privateSale.connect(buyer3).purchaseTokens(ethers.parseEther("500"), true);

      const info1 = await privateSale.getVestingInfo(buyer1.address);
      const info2 = await privateSale.getVestingInfo(buyer2.address);
      const info3 = await privateSale.getVestingInfo(buyer3.address);

      // Each should have different amounts
      expect(info1.totalTokens).to.not.equal(info2.totalTokens);
      expect(info2.totalTokens).to.not.equal(info3.totalTokens);

      // All should have correct 20/80 split
      expect(info1.immediateTokens + info1.vestedTokens).to.equal(info1.totalTokens);
      expect(info2.immediateTokens + info2.vestedTokens).to.equal(info2.totalTokens);
      expect(info3.immediateTokens + info3.vestedTokens).to.equal(info3.totalTokens);
    });

    it("should allow each user to claim independently", async function() {
      await privateSale.connect(buyer1).purchaseTokens(ethers.parseEther("1000"), false);
      await privateSale.connect(buyer2).purchaseTokens(ethers.parseEther("2000"), false);

      // Buyer 1 claims immediately
      await privateSale.connect(buyer1).claimTokens();
      const claimed1 = (await privateSale.getVestingInfo(buyer1.address)).claimedTokens;

      // Buyer 2 waits
      await increaseTime(100 * DAY);
      await privateSale.connect(buyer2).claimTokens();
      const claimed2 = (await privateSale.getVestingInfo(buyer2.address)).claimedTokens;

      // Buyer 2 should have more (waited longer)
      expect(claimed2).to.be.gt(claimed1);
    });
  });

  describe("8. VESTING PROGRESS CALCULATION", function() {
    beforeEach(async function() {
      const purchaseAmount = ethers.parseEther("1000");
      await privateSale.connect(buyer1).purchaseTokens(purchaseAmount, false);
    });

    it("should calculate 0% progress at purchase time", async function() {
      const info = await privateSale.getVestingInfo(buyer1.address);

      expect(info.vestingProgress).to.equal(0);
    });

    it("should calculate ~14% progress at day 90 (cliff end)", async function() {
      await increaseTime(90 * DAY);

      const info = await privateSale.getVestingInfo(buyer1.address);

      // 90 days / 630 days = 14.28%
      expect(info.vestingProgress).to.be.closeTo(1428n, 50n);
    });

    it("should calculate 50% progress at day 315 (halfway)", async function() {
      await increaseTime(315 * DAY);

      const info = await privateSale.getVestingInfo(buyer1.address);

      expect(info.vestingProgress).to.be.closeTo(5000n, 50n);
    });

    it("should calculate 100% progress at day 630", async function() {
      await increaseTime(630 * DAY);

      const info = await privateSale.getVestingInfo(buyer1.address);

      expect(info.vestingProgress).to.equal(10000);
    });
  });
});

// Mock ERC20 token for testing
const MockERC20 = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol, uint256 initialSupply) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
    }
}
`;
