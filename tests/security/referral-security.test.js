const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

/**
 * Referral System Security Test Suite
 * Tests for: Reward manipulation, Circular referrals, Blacklist bypass, Cap enforcement
 */
describe("Referral System Security Tests", function () {

  async function deployReferralFixture() {
    const [owner, privateSale, user1, user2, user3, attacker, treasury] = await ethers.getSigners();

    // Deploy mock HYPE token
    const Token = await ethers.getContractFactory("MockERC20");
    const hypeToken = await Token.deploy("HYPEAI", "HYPE", ethers.parseEther("10000000000"));

    // Deploy mock USDT token
    const usdtToken = await Token.deploy("USDT", "USDT", ethers.parseEther("1000000000"));

    // Deploy referral system
    const ReferralSystem = await ethers.getContractFactory("HypeAIReferralSystem");
    const referral = await ReferralSystem.deploy(
      await hypeToken.getAddress(),
      await usdtToken.getAddress(),
      privateSale.address
    );

    // Fund referral contract
    await hypeToken.transfer(await referral.getAddress(), ethers.parseEther("1000000"));
    await usdtToken.transfer(await referral.getAddress(), ethers.parseEther("100000"));

    return { referral, hypeToken, usdtToken, owner, privateSale, user1, user2, user3, attacker, treasury };
  }

  describe("🔒 Circular Referral Prevention", function () {

    it("Should prevent direct self-referral", async function () {
      const { referral, user1 } = await loadFixture(deployReferralFixture);

      await expect(
        referral.connect(user1).registerReferral(user1.address, user1.address)
      ).to.be.revertedWith("Cannot refer yourself");
    });

    it("Should prevent circular referrals (A->B->A)", async function () {
      const { referral, user1, user2 } = await loadFixture(deployReferralFixture);

      // User2 refers User1
      await referral.registerReferral(user1.address, user2.address);

      // User1 tries to refer User2 (circular)
      await expect(
        referral.registerReferral(user2.address, user1.address)
      ).to.be.revertedWith("Circular referral");
    });

    it("Should prevent multi-level circular referrals (A->B->C->A)", async function () {
      const { referral, user1, user2, user3 } = await loadFixture(deployReferralFixture);

      // Chain: user3 -> user2 -> user1
      await referral.registerReferral(user1.address, user2.address);
      await referral.registerReferral(user2.address, user3.address);

      // User1 tries to refer user3 (would create cycle)
      await expect(
        referral.registerReferral(user3.address, user1.address)
      ).to.be.revertedWith("Circular referral");
    });

    it("Should prevent owner from being referred", async function () {
      const { referral, owner, user1 } = await loadFixture(deployReferralFixture);

      await expect(
        referral.registerReferral(owner.address, user1.address)
      ).to.be.revertedWith("Owner cannot be referred");
    });

    it("Should prevent duplicate referral registration", async function () {
      const { referral, user1, user2, user3 } = await loadFixture(deployReferralFixture);

      // First registration
      await referral.registerReferral(user1.address, user2.address);

      // Try to register again with different referrer
      await expect(
        referral.registerReferral(user1.address, user3.address)
      ).to.be.revertedWith("Already has referrer");
    });
  });

  describe("💰 Reward Manipulation Tests", function () {

    it("Should prevent reward manipulation via repeated small purchases", async function () {
      const { referral, privateSale, user1, user2 } = await loadFixture(deployReferralFixture);

      await referral.registerReferral(user1.address, user2.address);

      let totalRewards = 0n;

      // Make 10 minimum purchases
      for (let i = 0; i < 10; i++) {
        await referral.connect(privateSale).recordPurchase(
          user1.address,
          400, // MIN_REFERRAL_PURCHASE
          ethers.parseEther("5000000")
        );
      }

      const stats = await referral.getReferralStats(user2.address);

      // Rewards should be properly calculated (10% of $4000 = $400)
      expect(stats.pendingRewardsUSD).to.equal(400);
    });

    it("Should enforce max reward cap", async function () {
      const { referral, privateSale, user1, user2 } = await loadFixture(deployReferralFixture);

      await referral.registerReferral(user1.address, user2.address);

      // Purchase that would exceed cap ($10,000)
      // Purchase $100,000 -> 10% reward = $10,000
      await referral.connect(privateSale).recordPurchase(
        user1.address,
        100000,
        ethers.parseEther("1250000000")
      );

      const stats = await referral.getReferralStats(user2.address);

      // Should be capped at $10,000
      expect(stats.totalEarnedUSD).to.equal(10000);
      expect(stats.pendingRewardsUSD).to.equal(10000);
    });

    it("Should stop rewards after cap reached", async function () {
      const { referral, privateSale, user1, user2 } = await loadFixture(deployReferralFixture);

      await referral.registerReferral(user1.address, user2.address);

      // First purchase to reach cap
      await referral.connect(privateSale).recordPurchase(
        user1.address,
        100000,
        ethers.parseEther("1250000000")
      );

      const stats1 = await referral.getReferralStats(user2.address);
      const rewardsBefore = stats1.pendingRewardsUSD;

      // Second purchase (should not add rewards)
      await referral.connect(privateSale).recordPurchase(
        user1.address,
        50000,
        ethers.parseEther("625000000")
      );

      const stats2 = await referral.getReferralStats(user2.address);

      // Rewards should not increase
      expect(stats2.pendingRewardsUSD).to.equal(rewardsBefore);
    });

    it("Should prevent reward gaming through level manipulation", async function () {
      const { referral, privateSale, user1, user2, user3, owner } = await loadFixture(deployReferralFixture);

      // Create referral chain to get user1 to high level
      const users = [];
      for (let i = 0; i < 100; i++) {
        const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
        await owner.sendTransaction({
          to: wallet.address,
          value: ethers.parseEther("1")
        });
        users.push(wallet);
      }

      // Register all users with user1 as referrer
      for (const user of users) {
        await referral.registerReferral(user.address, user1.address);
      }

      // User1 should be at Platinum level (100+ referrals)
      // Now make a purchase - reward should be based on level at time of purchase
      await referral.registerReferral(user2.address, user1.address);
      await referral.connect(privateSale).recordPurchase(
        user2.address,
        1000, // $1,000
        ethers.parseEther("12500000")
      );

      const stats = await referral.getReferralStats(user1.address);

      // Platinum multiplier is 2x (20000 basis points)
      // Base reward: $1000 * 10% = $100
      // With 2x multiplier: $200
      expect(stats.pendingRewardsUSD).to.equal(200);
    });

    it("Should correctly calculate multi-tier rewards", async function () {
      const { referral, privateSale, user1, user2, user3 } = await loadFixture(deployReferralFixture);

      // Chain: user3 -> user2 -> user1
      await referral.registerReferral(user1.address, user2.address);
      await referral.registerReferral(user2.address, user3.address);

      // User2 makes purchase
      await referral.connect(privateSale).recordPurchase(
        user2.address,
        1000, // $1,000
        ethers.parseEther("12500000")
      );

      const stats1 = await referral.getReferralStats(user3.address); // Direct referrer
      const stats2 = await referral.getReferralStats(user1.address); // Second-tier

      // Direct: $1000 * 10% = $100
      expect(stats1.pendingRewardsUSD).to.equal(100);

      // Second-tier: $1000 * 5% = $50
      expect(stats2.pendingRewardsUSD).to.equal(50);
    });
  });

  describe("🚫 Access Control & Blacklist Tests", function () {

    it("Should prevent non-private-sale from recording purchases", async function () {
      const { referral, attacker, user1 } = await loadFixture(deployReferralFixture);

      await expect(
        referral.connect(attacker).recordPurchase(
          user1.address,
          1000,
          ethers.parseEther("12500000")
        )
      ).to.be.revertedWith("Only private sale contract");
    });

    it("Should prevent blacklisted users from registering referrals", async function () {
      const { referral, owner, user1, user2 } = await loadFixture(deployReferralFixture);

      // Blacklist user1
      await referral.setBlacklisted(user1.address, true);

      await expect(
        referral.registerReferral(user1.address, user2.address)
      ).to.be.revertedWith("User is blacklisted");
    });

    it("Should prevent blacklisted users from being referrers", async function () {
      const { referral, owner, user1, user2 } = await loadFixture(deployReferralFixture);

      // Blacklist user2
      await referral.setBlacklisted(user2.address, true);

      await expect(
        referral.registerReferral(user1.address, user2.address)
      ).to.be.revertedWith("User is blacklisted");
    });

    it("Should stop rewards for blacklisted users", async function () {
      const { referral, privateSale, owner, user1, user2 } = await loadFixture(deployReferralFixture);

      await referral.registerReferral(user1.address, user2.address);

      // Make purchase before blacklist
      await referral.connect(privateSale).recordPurchase(
        user1.address,
        1000,
        ethers.parseEther("12500000")
      );

      const stats1 = await referral.getReferralStats(user2.address);
      expect(stats1.pendingRewardsUSD).to.equal(100);

      // Blacklist user2
      await referral.setBlacklisted(user2.address, true);

      // Make another purchase (should not add rewards)
      await referral.connect(privateSale).recordPurchase(
        user1.address,
        1000,
        ethers.parseEther("12500000")
      );

      const stats2 = await referral.getReferralStats(user2.address);
      expect(stats2.pendingRewardsUSD).to.equal(100); // Same as before
    });

    it("Should prevent blacklisted users from claiming rewards", async function () {
      const { referral, privateSale, owner, user1, user2 } = await loadFixture(deployReferralFixture);

      await referral.registerReferral(user1.address, user2.address);

      await referral.connect(privateSale).recordPurchase(
        user1.address,
        1000,
        ethers.parseEther("12500000")
      );

      // Blacklist user2
      await referral.setBlacklisted(user2.address, true);

      // Try to claim rewards
      await expect(
        referral.connect(user2).claimRewards(true)
      ).to.be.revertedWith("User is blacklisted");
    });
  });

  describe("⚠️ Edge Cases & Boundary Tests", function () {

    it("Should handle minimum purchase threshold", async function () {
      const { referral, privateSale, user1, user2 } = await loadFixture(deployReferralFixture);

      await referral.registerReferral(user1.address, user2.address);

      // Purchase below minimum ($400)
      await expect(
        referral.connect(privateSale).recordPurchase(
          user1.address,
          399,
          ethers.parseEther("4987500")
        )
      ).to.be.revertedWith("Purchase too small");
    });

    it("Should handle exact minimum purchase", async function () {
      const { referral, privateSale, user1, user2 } = await loadFixture(deployReferralFixture);

      await referral.registerReferral(user1.address, user2.address);

      // Exact minimum purchase
      await referral.connect(privateSale).recordPurchase(
        user1.address,
        400,
        ethers.parseEther("5000000")
      );

      const stats = await referral.getReferralStats(user2.address);
      expect(stats.pendingRewardsUSD).to.equal(40); // 10% of $400
    });

    it("Should handle zero address checks", async function () {
      const { referral, user1 } = await loadFixture(deployReferralFixture);

      await expect(
        referral.registerReferral(ethers.ZeroAddress, user1.address)
      ).to.be.revertedWith("Invalid referee");

      await expect(
        referral.registerReferral(user1.address, ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid referrer");
    });

    it("Should handle deactivated accounts", async function () {
      const { referral, privateSale, owner, user1, user2 } = await loadFixture(deployReferralFixture);

      await referral.registerReferral(user1.address, user2.address);

      // Deactivate user2
      await referral.deactivateAccount(user2.address);

      // Make purchase (should not add rewards to deactivated account)
      await referral.connect(privateSale).recordPurchase(
        user1.address,
        1000,
        ethers.parseEther("12500000")
      );

      const stats = await referral.getReferralStats(user2.address);
      expect(stats.pendingRewardsUSD).to.equal(0);
    });

    it("Should handle milestone rewards correctly", async function () {
      const { referral, privateSale, owner, user1 } = await loadFixture(deployReferralFixture);

      // Register 10 users with user1 as referrer
      for (let i = 0; i < 10; i++) {
        const wallet = ethers.Wallet.createRandom();
        await referral.registerReferral(wallet.address, user1.address);

        // Make purchase for each
        await referral.connect(privateSale).recordPurchase(
          wallet.address,
          400,
          ethers.parseEther("5000000")
        );
      }

      const stats = await referral.getReferralStats(user1.address);

      // Should have hit first milestone (10 referrals -> $50 bonus)
      expect(stats.milestoneRewards).to.equal(50);
    });
  });

  describe("🔐 Reentrancy Protection", function () {

    it("Should prevent reentrancy in claimRewards", async function () {
      const { referral, privateSale, user1, user2, hypeToken } = await loadFixture(deployReferralFixture);

      // Deploy malicious contract
      const MaliciousReceiver = await ethers.getContractFactory("MaliciousReferralAttacker");
      const malicious = await MaliciousReceiver.deploy(await referral.getAddress());

      // Register and earn rewards
      await referral.registerReferral(user1.address, await malicious.getAddress());
      await referral.connect(privateSale).recordPurchase(
        user1.address,
        1000,
        ethers.parseEther("12500000")
      );

      // Attempt reentrancy during claim
      await expect(
        malicious.attackClaim()
      ).to.be.revertedWith("ReentrancyGuard: reentrant call");
    });
  });

  describe("💸 Reward Claim Tests", function () {

    it("Should correctly claim rewards in HYPE tokens", async function () {
      const { referral, privateSale, hypeToken, user1, user2 } = await loadFixture(deployReferralFixture);

      await referral.registerReferral(user1.address, user2.address);

      await referral.connect(privateSale).recordPurchase(
        user1.address,
        1000,
        ethers.parseEther("12500000")
      );

      const stats = await referral.getReferralStats(user2.address);
      expect(stats.pendingRewardsUSD).to.equal(100);

      // Claim in HYPE tokens
      await referral.connect(user2).claimRewards(true);

      // $100 / $0.00008 = 1,250,000 HYPE tokens
      const balance = await hypeToken.balanceOf(user2.address);
      expect(balance).to.equal(ethers.parseEther("1250000"));
    });

    it("Should correctly claim rewards in USDT", async function () {
      const { referral, privateSale, usdtToken, user1, user2 } = await loadFixture(deployReferralFixture);

      await referral.registerReferral(user1.address, user2.address);

      await referral.connect(privateSale).recordPurchase(
        user1.address,
        1000,
        ethers.parseEther("12500000")
      );

      // Claim in USDT
      await referral.connect(user2).claimRewards(false);

      // $100 = 100 USDT
      const balance = await usdtToken.balanceOf(user2.address);
      expect(balance).to.equal(ethers.parseEther("100"));
    });

    it("Should prevent claiming with no rewards", async function () {
      const { referral, user1 } = await loadFixture(deployReferralFixture);

      await expect(
        referral.connect(user1).claimRewards(true)
      ).to.be.revertedWith("No pending rewards");
    });

    it("Should prevent double claiming", async function () {
      const { referral, privateSale, user1, user2 } = await loadFixture(deployReferralFixture);

      await referral.registerReferral(user1.address, user2.address);

      await referral.connect(privateSale).recordPurchase(
        user1.address,
        1000,
        ethers.parseEther("12500000")
      );

      // First claim
      await referral.connect(user2).claimRewards(true);

      // Second claim should fail
      await expect(
        referral.connect(user2).claimRewards(true)
      ).to.be.revertedWith("No pending rewards");
    });

    it("Should handle insufficient contract balance gracefully", async function () {
      const { referral, privateSale, hypeToken, owner, user1, user2 } = await loadFixture(deployReferralFixture);

      await referral.registerReferral(user1.address, user2.address);

      // Large purchase
      await referral.connect(privateSale).recordPurchase(
        user1.address,
        100000,
        ethers.parseEther("1250000000")
      );

      // Drain contract HYPE balance
      const contractBalance = await hypeToken.balanceOf(await referral.getAddress());
      await referral.emergencyWithdraw(await hypeToken.getAddress(), contractBalance);

      // Try to claim
      await expect(
        referral.connect(user2).claimRewards(true)
      ).to.be.revertedWith("Insufficient HYPE tokens in contract");
    });
  });

  describe("🔧 Admin Function Security", function () {

    it("Should prevent non-owner from updating private sale contract", async function () {
      const { referral, attacker, user1 } = await loadFixture(deployReferralFixture);

      await expect(
        referral.connect(attacker).setPrivateSaleContract(user1.address)
      ).to.be.revertedWithCustomError(referral, "OwnableUnauthorizedAccount");
    });

    it("Should prevent non-owner from emergency withdrawal", async function () {
      const { referral, attacker, hypeToken } = await loadFixture(deployReferralFixture);

      await expect(
        referral.connect(attacker).emergencyWithdraw(await hypeToken.getAddress(), 1000)
      ).to.be.revertedWithCustomError(referral, "OwnableUnauthorizedAccount");
    });

    it("Should prevent non-owner from pausing", async function () {
      const { referral, attacker } = await loadFixture(deployReferralFixture);

      await expect(
        referral.connect(attacker).pause()
      ).to.be.revertedWithCustomError(referral, "OwnableUnauthorizedAccount");
    });
  });
});
