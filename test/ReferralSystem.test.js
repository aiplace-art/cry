/**
 * HypeAI Referral System - Comprehensive Test Suite
 *
 * Tests:
 * - Referral registration (valid, invalid, edge cases)
 * - Purchase recording and reward calculation
 * - Reward claiming (HYPE and USDT)
 * - Security features (blacklist, max caps, pause)
 * - Integration with PrivateSale
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HypeAI Referral System", function () {
  let hypeToken;
  let usdtToken;
  let referralSystem;
  let privateSale;
  let owner;
  let user1;
  let user2;
  let user3;
  let user4;

  const INITIAL_SUPPLY = ethers.utils.parseEther("1000000000"); // 1B tokens
  const SALE_TOKENS = ethers.utils.parseEther("100000000"); // 100M for sale
  const REWARD_POOL = ethers.utils.parseEther("10000000"); // 10M for rewards
  const USDT_POOL = ethers.utils.parseEther("50000"); // 50K USDT

  beforeEach(async function () {
    [owner, user1, user2, user3, user4] = await ethers.getSigners();

    // Deploy mock HYPE token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    hypeToken = await MockERC20.deploy("HypeAI", "HYPE", INITIAL_SUPPLY);
    await hypeToken.deployed();

    // Deploy mock USDT token
    usdtToken = await MockERC20.deploy("Tether USD", "USDT", ethers.utils.parseEther("1000000"));
    await usdtToken.deployed();

    // Deploy ReferralSystem
    const ReferralSystem = await ethers.getContractFactory("HypeAIReferralSystem");
    referralSystem = await ReferralSystem.deploy(
      hypeToken.address,
      usdtToken.address,
      owner.address // Temporary, will update
    );
    await referralSystem.deployed();

    // Deploy PrivateSale
    const PrivateSale = await ethers.getContractFactory("HypeAIPrivateSaleWithReferral");
    const startTime = Math.floor(Date.now() / 1000);
    const duration = 30 * 24 * 60 * 60; // 30 days

    privateSale = await PrivateSale.deploy(
      hypeToken.address,
      usdtToken.address,
      referralSystem.address,
      startTime,
      duration
    );
    await privateSale.deployed();

    // Update ReferralSystem with PrivateSale address
    await referralSystem.setPrivateSaleContract(privateSale.address);

    // Fund contracts
    await hypeToken.transfer(privateSale.address, SALE_TOKENS);
    await hypeToken.approve(referralSystem.address, REWARD_POOL);
    await referralSystem.fundHypeRewards(REWARD_POOL);
    await usdtToken.approve(referralSystem.address, USDT_POOL);
    await referralSystem.fundUsdtRewards(USDT_POOL);

    // Distribute tokens to users for testing
    await hypeToken.transfer(user1.address, ethers.utils.parseEther("10000"));
    await hypeToken.transfer(user2.address, ethers.utils.parseEther("10000"));
    await usdtToken.transfer(user1.address, ethers.utils.parseEther("1000"));
    await usdtToken.transfer(user2.address, ethers.utils.parseEther("1000"));

    // Whitelist users
    await privateSale.addToWhitelist([
      user1.address,
      user2.address,
      user3.address,
      user4.address
    ]);
  });

  describe("Referral Registration", function () {
    it("Should register a valid referral", async function () {
      await referralSystem.registerReferral(user2.address, user1.address);

      const stats = await referralSystem.getReferralStats(user2.address);
      expect(stats.referrer).to.equal(user1.address);
      expect(stats.isActive).to.be.true;
    });

    it("Should prevent self-referral", async function () {
      await expect(
        referralSystem.registerReferral(user1.address, user1.address)
      ).to.be.revertedWith("Cannot refer yourself");
    });

    it("Should prevent double registration", async function () {
      await referralSystem.registerReferral(user2.address, user1.address);

      await expect(
        referralSystem.registerReferral(user2.address, user3.address)
      ).to.be.revertedWith("Already has referrer");
    });

    it("Should prevent circular referrals", async function () {
      await referralSystem.registerReferral(user2.address, user1.address);

      await expect(
        referralSystem.registerReferral(user1.address, user2.address)
      ).to.be.revertedWith("Circular referral");
    });

    it("Should support two-tier referral chain", async function () {
      // user1 refers user2
      await referralSystem.registerReferral(user2.address, user1.address);

      // user2 refers user3
      await referralSystem.registerReferral(user3.address, user2.address);

      const stats = await referralSystem.getReferralStats(user3.address);
      expect(stats.referrer).to.equal(user2.address);
      expect(stats.secondTierReferrer).to.equal(user1.address);
    });
  });

  describe("Purchase Recording and Rewards", function () {
    beforeEach(async function () {
      // Setup referral chain: user1 -> user2 -> user3
      await referralSystem.registerReferral(user2.address, user1.address);
      await referralSystem.registerReferral(user3.address, user2.address);
    });

    it("Should calculate 5% direct referral reward correctly", async function () {
      // user3 buys $100 worth
      await referralSystem.connect(privateSale.address).recordPurchase(
        user3.address,
        100, // $100 USD
        ethers.utils.parseEther("125000") // 125,000 HYPE tokens
      );

      const stats = await referralSystem.getReferralStats(user2.address);
      expect(stats.pendingRewardsUSD).to.equal(5); // $100 * 5% = $5
      expect(stats.totalEarnedUSD).to.equal(5);
      expect(stats.totalReferred).to.equal(1);
      expect(stats.totalVolume).to.equal(100);
    });

    it("Should calculate 2% second-tier reward correctly", async function () {
      // user3 buys $100 worth
      await referralSystem.connect(privateSale.address).recordPurchase(
        user3.address,
        100,
        ethers.utils.parseEther("125000")
      );

      const stats = await referralSystem.getReferralStats(user1.address);
      expect(stats.pendingRewardsUSD).to.equal(2); // $100 * 2% = $2
      expect(stats.totalEarnedUSD).to.equal(2);
    });

    it("Should accumulate rewards from multiple purchases", async function () {
      // First purchase: $100
      await referralSystem.connect(privateSale.address).recordPurchase(
        user3.address,
        100,
        ethers.utils.parseEther("125000")
      );

      // Second purchase: $200
      await referralSystem.connect(privateSale.address).recordPurchase(
        user3.address,
        200,
        ethers.utils.parseEther("250000")
      );

      const stats = await referralSystem.getReferralStats(user2.address);
      expect(stats.pendingRewardsUSD).to.equal(15); // ($100 + $200) * 5% = $15
      expect(stats.totalVolume).to.equal(300);
    });

    it("Should respect max reward cap ($10,000)", async function () {
      // Simulate large volume to hit cap
      // Need $200,000 in purchases to generate $10,000 in 5% rewards
      for (let i = 0; i < 250; i++) {
        await referralSystem.connect(privateSale.address).recordPurchase(
          user3.address,
          800, // $800 per purchase (max allowed)
          ethers.utils.parseEther("1000000")
        );
      }

      const stats = await referralSystem.getReferralStats(user2.address);
      expect(stats.totalEarnedUSD).to.equal(10000); // Capped at $10,000
    });

    it("Should not award rewards to blacklisted users", async function () {
      // Blacklist user2
      await referralSystem.setBlacklisted(user2.address, true);

      // user3 makes purchase
      await referralSystem.connect(privateSale.address).recordPurchase(
        user3.address,
        100,
        ethers.utils.parseEther("125000")
      );

      const stats = await referralSystem.getReferralStats(user2.address);
      expect(stats.pendingRewardsUSD).to.equal(0); // No reward
    });
  });

  describe("Reward Claiming", function () {
    beforeEach(async function () {
      // Setup: user1 refers user2
      await referralSystem.registerReferral(user2.address, user1.address);

      // user2 makes $100 purchase, user1 gets $5 reward
      await referralSystem.connect(privateSale.address).recordPurchase(
        user2.address,
        100,
        ethers.utils.parseEther("125000")
      );
    });

    it("Should claim rewards in HYPE tokens", async function () {
      const balanceBefore = await hypeToken.balanceOf(user1.address);

      await referralSystem.connect(user1).claimRewards(true); // Claim in HYPE

      const balanceAfter = await hypeToken.balanceOf(user1.address);
      const expectedTokens = ethers.utils.parseEther("6250"); // $5 * 1250 = 6,250 HYPE

      expect(balanceAfter.sub(balanceBefore)).to.equal(expectedTokens);
    });

    it("Should claim rewards in USDT", async function () {
      const balanceBefore = await usdtToken.balanceOf(user1.address);

      await referralSystem.connect(user1).claimRewards(false); // Claim in USDT

      const balanceAfter = await usdtToken.balanceOf(user1.address);
      const expectedUsdt = ethers.utils.parseEther("5"); // $5 USDT

      expect(balanceAfter.sub(balanceBefore)).to.equal(expectedUsdt);
    });

    it("Should reset pending rewards after claiming", async function () {
      await referralSystem.connect(user1).claimRewards(true);

      const stats = await referralSystem.getReferralStats(user1.address);
      expect(stats.pendingRewardsUSD).to.equal(0);
      expect(stats.totalClaimedUSD).to.equal(5);
    });

    it("Should revert when no pending rewards", async function () {
      await referralSystem.connect(user1).claimRewards(true);

      await expect(
        referralSystem.connect(user1).claimRewards(true)
      ).to.be.revertedWith("No pending rewards");
    });

    it("Should revert when blacklisted user tries to claim", async function () {
      await referralSystem.setBlacklisted(user1.address, true);

      await expect(
        referralSystem.connect(user1).claimRewards(true)
      ).to.be.revertedWith("User is blacklisted");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await referralSystem.registerReferral(user2.address, user1.address);
      await referralSystem.registerReferral(user3.address, user2.address);

      await referralSystem.connect(privateSale.address).recordPurchase(
        user3.address,
        100,
        ethers.utils.parseEther("125000")
      );
    });

    it("Should return correct pending rewards in multiple currencies", async function () {
      const [usdValue, hypeTokens, usdtTokens] = await referralSystem.getPendingRewards(user2.address);

      expect(usdValue).to.equal(5); // $5
      expect(hypeTokens).to.equal(ethers.utils.parseEther("6250")); // 6,250 HYPE
      expect(usdtTokens).to.equal(ethers.utils.parseEther("5")); // 5 USDT
    });

    it("Should return referred users list", async function () {
      await referralSystem.registerReferral(user4.address, user1.address);

      const referred = await referralSystem.getReferredUsers(user1.address);
      expect(referred).to.have.lengthOf(2);
      expect(referred).to.include(user2.address);
      expect(referred).to.include(user4.address);
    });

    it("Should return leaderboard data", async function () {
      const [volumes, counts] = await referralSystem.getLeaderboard([
        user1.address,
        user2.address,
        user3.address
      ]);

      expect(volumes[0]).to.equal(0); // user1 (no direct referrals purchased)
      expect(volumes[1]).to.equal(100); // user2 (referred user3 who bought $100)
      expect(counts[1]).to.equal(1); // user2 has 1 referral
    });
  });

  describe("Integration with PrivateSale", function () {
    it("Should automatically register referral on purchase", async function () {
      // user2 purchases with user1 as referrer
      await privateSale.connect(user2)["purchaseWithBNB(address)"](
        user1.address,
        { value: ethers.utils.parseEther("0.1") } // ~$60
      );

      const stats = await referralSystem.getReferralStats(user2.address);
      expect(stats.referrer).to.equal(user1.address);
    });

    it("Should record purchase in referral system", async function () {
      await privateSale.connect(user2)["purchaseWithBNB(address)"](
        user1.address,
        { value: ethers.utils.parseEther("0.1") }
      );

      const stats = await referralSystem.getReferralStats(user1.address);
      expect(stats.pendingRewardsUSD).to.be.gt(0); // Has pending rewards
    });

    it("Should work with USDT purchases", async function () {
      const usdtAmount = ethers.utils.parseEther("100");

      await usdtToken.connect(user2).approve(privateSale.address, usdtAmount);
      await privateSale.connect(user2)["purchaseWithUSDT(uint256,address)"](
        usdtAmount,
        user1.address
      );

      const stats = await referralSystem.getReferralStats(user1.address);
      expect(stats.pendingRewardsUSD).to.equal(5); // $100 * 5%
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update private sale contract", async function () {
      const newAddress = user4.address;
      await referralSystem.setPrivateSaleContract(newAddress);

      expect(await referralSystem.privateSaleContract()).to.equal(newAddress);
    });

    it("Should allow owner to blacklist users", async function () {
      await referralSystem.setBlacklisted(user1.address, true);

      expect(await referralSystem.blacklisted(user1.address)).to.be.true;
    });

    it("Should allow owner to deactivate accounts", async function () {
      await referralSystem.registerReferral(user2.address, user1.address);
      await referralSystem.deactivateAccount(user1.address);

      const stats = await referralSystem.getReferralStats(user1.address);
      expect(stats.isActive).to.be.false;
    });

    it("Should allow owner to pause/unpause", async function () {
      await referralSystem.pause();

      await expect(
        referralSystem.registerReferral(user2.address, user1.address)
      ).to.be.revertedWith("Pausable: paused");

      await referralSystem.unpause();

      await expect(
        referralSystem.registerReferral(user2.address, user1.address)
      ).to.not.be.reverted;
    });

    it("Should allow emergency withdrawal", async function () {
      const amount = ethers.utils.parseEther("1000");
      const balanceBefore = await hypeToken.balanceOf(owner.address);

      await referralSystem.emergencyWithdraw(hypeToken.address, amount);

      const balanceAfter = await hypeToken.balanceOf(owner.address);
      expect(balanceAfter.sub(balanceBefore)).to.equal(amount);
    });
  });
});

// Mock ERC20 contract for testing
// (This should be in a separate file in a real project)
const MockERC20Source = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
    }
}
`;
