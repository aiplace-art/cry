/**
 * HypeAI Referral System - Bonus Tiers Tests
 * Tests for 10% direct, 5% second-tier, 2% third-tier rewards
 */

const { expect } = require('chai');
const { ethers } = require('hardhat');
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');

describe('ReferralSystem - Bonus Tiers', function () {
  // Fixture to deploy contract and setup initial state
  async function deployReferralSystemFixture() {
    const [owner, user1, user2, user3, user4, privateSale] = await ethers.getSigners();

    // Deploy mock HYPE token
    const MockERC20 = await ethers.getContractFactory('MockERC20');
    const hypeToken = await MockERC20.deploy('HypeAI Token', 'HYPE', ethers.parseEther('10000000000'));

    // Deploy mock USDT token
    const usdtToken = await MockERC20.deploy('Tether USD', 'USDT', ethers.parseEther('1000000'));

    // Deploy ReferralSystem
    const ReferralSystem = await ethers.getContractFactory('HypeAIReferralSystem');
    const referralSystem = await ReferralSystem.deploy(
      await hypeToken.getAddress(),
      await usdtToken.getAddress(),
      privateSale.address
    );

    // Fund referral contract with rewards
    await hypeToken.transfer(await referralSystem.getAddress(), ethers.parseEther('1000000'));
    await usdtToken.transfer(await referralSystem.getAddress(), ethers.parseEther('50000'));

    return { referralSystem, hypeToken, usdtToken, owner, user1, user2, user3, user4, privateSale };
  }

  describe('Direct Referral - 5% Reward (500 basis points)', function () {
    it('should calculate correct 5% reward for direct referral', async function () {
      const { referralSystem, user1, user2, privateSale } = await loadFixture(deployReferralSystemFixture);

      // Register referral: user2 refers user1
      await referralSystem.registerReferral(user1.address, user2.address);

      // Record $1000 purchase
      const purchaseAmount = 1000; // USD
      const tokensAmount = ethers.parseEther('12500000'); // 1000 / 0.00008

      await referralSystem.connect(privateSale).recordPurchase(
        user1.address,
        purchaseAmount,
        tokensAmount
      );

      // Check user2's pending rewards (should be 5% of $1000 = $50)
      const stats = await referralSystem.getReferralStats(user2.address);
      expect(stats.pendingRewardsUSD).to.equal(50); // 5% of 1000
      expect(stats.totalEarnedUSD).to.equal(50);
      expect(stats.totalReferred).to.equal(1);
    });

    it('should calculate 5% reward for multiple purchases', async function () {
      const { referralSystem, user1, user2, privateSale } = await loadFixture(deployReferralSystemFixture);

      await referralSystem.registerReferral(user1.address, user2.address);

      // First purchase: $500
      await referralSystem.connect(privateSale).recordPurchase(
        user1.address,
        500,
        ethers.parseEther('6250000')
      );

      // Second purchase: $1500
      await referralSystem.connect(privateSale).recordPurchase(
        user1.address,
        1500,
        ethers.parseEther('18750000')
      );

      const stats = await referralSystem.getReferralStats(user2.address);
      // 5% of (500 + 1500) = 5% of 2000 = $100
      expect(stats.pendingRewardsUSD).to.equal(100);
      expect(stats.totalVolume).to.equal(2000);
    });

    it('should handle edge case: minimum purchase amount ($400)', async function () {
      const { referralSystem, user1, user2, privateSale } = await loadFixture(deployReferralSystemFixture);

      await referralSystem.registerReferral(user1.address, user2.address);

      // Purchase exactly minimum amount
      await referralSystem.connect(privateSale).recordPurchase(
        user1.address,
        400,
        ethers.parseEther('5000000')
      );

      const stats = await referralSystem.getReferralStats(user2.address);
      expect(stats.pendingRewardsUSD).to.equal(20); // 5% of 400
    });

    it('should reject purchases below minimum ($400)', async function () {
      const { referralSystem, user1, user2, privateSale } = await loadFixture(deployReferralSystemFixture);

      await referralSystem.registerReferral(user1.address, user2.address);

      // Purchase below minimum
      await expect(
        referralSystem.connect(privateSale).recordPurchase(
          user1.address,
          399,
          ethers.parseEther('4987500')
        )
      ).to.be.revertedWith('Purchase too small');
    });
  });

  describe('Second-Tier Referral - 2% Reward (200 basis points)', function () {
    it('should calculate correct 2% reward for second-tier referral', async function () {
      const { referralSystem, user1, user2, user3, privateSale } = await loadFixture(deployReferralSystemFixture);

      // Setup chain: user3 -> user2 -> user1
      await referralSystem.registerReferral(user2.address, user3.address);
      await referralSystem.registerReferral(user1.address, user2.address);

      // user1 makes purchase
      await referralSystem.connect(privateSale).recordPurchase(
        user1.address,
        1000,
        ethers.parseEther('12500000')
      );

      // user2 gets 5% (direct)
      const user2Stats = await referralSystem.getReferralStats(user2.address);
      expect(user2Stats.pendingRewardsUSD).to.equal(50); // 5% of 1000

      // user3 gets 2% (second-tier)
      const user3Stats = await referralSystem.getReferralStats(user3.address);
      expect(user3Stats.pendingRewardsUSD).to.equal(20); // 2% of 1000
      expect(user3Stats.totalReferred).to.equal(0); // Didn't directly refer user1
    });

    it('should distribute rewards to both tiers correctly', async function () {
      const { referralSystem, user1, user2, user3, privateSale } = await loadFixture(deployReferralSystemFixture);

      await referralSystem.registerReferral(user2.address, user3.address);
      await referralSystem.registerReferral(user1.address, user2.address);

      // Multiple purchases
      await referralSystem.connect(privateSale).recordPurchase(
        user1.address,
        2000,
        ethers.parseEther('25000000')
      );

      await referralSystem.connect(privateSale).recordPurchase(
        user1.address,
        3000,
        ethers.parseEther('37500000')
      );

      const user2Stats = await referralSystem.getReferralStats(user2.address);
      expect(user2Stats.pendingRewardsUSD).to.equal(250); // 5% of 5000

      const user3Stats = await referralSystem.getReferralStats(user3.address);
      expect(user3Stats.pendingRewardsUSD).to.equal(100); // 2% of 5000
    });

    it('should handle single-tier referral (no second tier)', async function () {
      const { referralSystem, user1, user2, privateSale } = await loadFixture(deployReferralSystemFixture);

      // Only one tier: user2 -> user1 (user2 has no referrer)
      await referralSystem.registerReferral(user1.address, user2.address);

      await referralSystem.connect(privateSale).recordPurchase(
        user1.address,
        1000,
        ethers.parseEther('12500000')
      );

      const user2Stats = await referralSystem.getReferralStats(user2.address);
      expect(user2Stats.pendingRewardsUSD).to.equal(50);

      // Check that no second-tier referrer exists
      expect(user2Stats.secondTierReferrer).to.equal(ethers.ZeroAddress);
    });
  });

  describe('Multi-Tier Chain Tests', function () {
    it('should handle 3-tier referral chain', async function () {
      const { referralSystem, user1, user2, user3, user4, privateSale } = await loadFixture(deployReferralSystemFixture);

      // Chain: user4 -> user3 -> user2 -> user1
      await referralSystem.registerReferral(user3.address, user4.address);
      await referralSystem.registerReferral(user2.address, user3.address);
      await referralSystem.registerReferral(user1.address, user2.address);

      // user1 makes $10,000 purchase
      await referralSystem.connect(privateSale).recordPurchase(
        user1.address,
        10000,
        ethers.parseEther('125000000')
      );

      // Tier 1 (direct): user2 gets 5%
      const user2Stats = await referralSystem.getReferralStats(user2.address);
      expect(user2Stats.pendingRewardsUSD).to.equal(500); // 5% of 10000

      // Tier 2: user3 gets 2%
      const user3Stats = await referralSystem.getReferralStats(user3.address);
      expect(user3Stats.pendingRewardsUSD).to.equal(200); // 2% of 10000

      // Tier 3+: user4 gets nothing (only 2 tiers supported)
      const user4Stats = await referralSystem.getReferralStats(user4.address);
      expect(user4Stats.pendingRewardsUSD).to.equal(0);
    });

    it('should track volume correctly across tiers', async function () {
      const { referralSystem, user1, user2, user3, privateSale } = await loadFixture(deployReferralSystemFixture);

      await referralSystem.registerReferral(user2.address, user3.address);
      await referralSystem.registerReferral(user1.address, user2.address);

      await referralSystem.connect(privateSale).recordPurchase(
        user1.address,
        5000,
        ethers.parseEther('62500000')
      );

      const user2Stats = await referralSystem.getReferralStats(user2.address);
      expect(user2Stats.totalVolume).to.equal(5000);

      // Second-tier referrer doesn't track volume (didn't directly refer)
      const user3Stats = await referralSystem.getReferralStats(user3.address);
      expect(user3Stats.totalVolume).to.equal(0);
    });
  });

  describe('Reward Cap Tests ($10,000 max)', function () {
    it('should respect max reward cap for direct referrals', async function () {
      const { referralSystem, user1, user2, privateSale } = await loadFixture(deployReferralSystemFixture);

      await referralSystem.registerReferral(user1.address, user2.address);

      // Purchase $200,000 -> 5% = $10,000 (exactly at cap)
      await referralSystem.connect(privateSale).recordPurchase(
        user1.address,
        200000,
        ethers.parseEther('2500000000')
      );

      const stats = await referralSystem.getReferralStats(user2.address);
      expect(stats.totalEarnedUSD).to.equal(10000);
    });

    it('should stop rewards after reaching cap', async function () {
      const { referralSystem, user1, user2, privateSale } = await loadFixture(deployReferralSystemFixture);

      await referralSystem.registerReferral(user1.address, user2.address);

      // First purchase: earn $10,000
      await referralSystem.connect(privateSale).recordPurchase(
        user1.address,
        200000,
        ethers.parseEther('2500000000')
      );

      // Second purchase: should earn nothing (cap reached)
      await referralSystem.connect(privateSale).recordPurchase(
        user1.address,
        10000,
        ethers.parseEther('125000000')
      );

      const stats = await referralSystem.getReferralStats(user2.address);
      expect(stats.totalEarnedUSD).to.equal(10000); // Still capped at 10k
      expect(stats.pendingRewardsUSD).to.equal(10000);
    });

    it('should respect cap for second-tier referrals', async function () {
      const { referralSystem, user1, user2, user3, privateSale } = await loadFixture(deployReferralSystemFixture);

      await referralSystem.registerReferral(user2.address, user3.address);
      await referralSystem.registerReferral(user1.address, user2.address);

      // Purchase $500,000 -> 2% = $10,000 for second tier
      await referralSystem.connect(privateSale).recordPurchase(
        user1.address,
        500000,
        ethers.parseEther('6250000000')
      );

      const user3Stats = await referralSystem.getReferralStats(user3.address);
      expect(user3Stats.totalEarnedUSD).to.equal(10000);

      // Additional purchase should not increase second-tier rewards
      await referralSystem.connect(privateSale).recordPurchase(
        user1.address,
        100000,
        ethers.parseEther('1250000000')
      );

      const updatedStats = await referralSystem.getReferralStats(user3.address);
      expect(updatedStats.totalEarnedUSD).to.equal(10000); // Still capped
    });
  });

  describe('Pending Rewards Calculation', function () {
    it('should calculate pending rewards in both HYPE and USDT', async function () {
      const { referralSystem, user1, user2, privateSale } = await loadFixture(deployReferralSystemFixture);

      await referralSystem.registerReferral(user1.address, user2.address);

      await referralSystem.connect(privateSale).recordPurchase(
        user1.address,
        1000,
        ethers.parseEther('12500000')
      );

      const pending = await referralSystem.getPendingRewards(user2.address);

      // USD value: $50
      expect(pending.usdValue).to.equal(50);

      // HYPE tokens: $50 / $0.00008 = 625,000 HYPE
      expect(pending.hypeTokens).to.equal(ethers.parseEther('625000'));

      // USDT: $50 = 50 USDT
      expect(pending.usdtTokens).to.equal(ethers.parseEther('50'));
    });

    it('should update pending rewards after multiple purchases', async function () {
      const { referralSystem, user1, user2, privateSale } = await loadFixture(deployReferralSystemFixture);

      await referralSystem.registerReferral(user1.address, user2.address);

      // Purchase 1: $1000
      await referralSystem.connect(privateSale).recordPurchase(
        user1.address,
        1000,
        ethers.parseEther('12500000')
      );

      let pending = await referralSystem.getPendingRewards(user2.address);
      expect(pending.usdValue).to.equal(50);

      // Purchase 2: $2000
      await referralSystem.connect(privateSale).recordPurchase(
        user1.address,
        2000,
        ethers.parseEther('25000000')
      );

      pending = await referralSystem.getPendingRewards(user2.address);
      expect(pending.usdValue).to.equal(150); // 5% of 3000 total
    });
  });

  describe('Percentage Accuracy Tests', function () {
    it('should calculate exact percentages for various amounts', async function () {
      const { referralSystem, user1, user2, privateSale } = await loadFixture(deployReferralSystemFixture);

      await referralSystem.registerReferral(user1.address, user2.address);

      const testCases = [
        { purchase: 400, expected: 20 },    // 5% of 400
        { purchase: 1000, expected: 50 },   // 5% of 1000
        { purchase: 5000, expected: 250 },  // 5% of 5000
        { purchase: 12345, expected: 617 }, // 5% of 12345 (truncated)
      ];

      for (const testCase of testCases) {
        const { referralSystem, user1, user2, privateSale } = await loadFixture(deployReferralSystemFixture);
        await referralSystem.registerReferral(user1.address, user2.address);

        await referralSystem.connect(privateSale).recordPurchase(
          user1.address,
          testCase.purchase,
          ethers.parseEther((testCase.purchase / 0.00008).toString())
        );

        const stats = await referralSystem.getReferralStats(user2.address);
        expect(stats.pendingRewardsUSD).to.equal(testCase.expected);
      }
    });

    it('should calculate correct basis points (500 = 5%, 200 = 2%)', async function () {
      const { referralSystem } = await loadFixture(deployReferralSystemFixture);

      const directReward = await referralSystem.DIRECT_REFERRAL_REWARD();
      const secondTierReward = await referralSystem.SECOND_TIER_REWARD();

      expect(directReward).to.equal(500);  // 5%
      expect(secondTierReward).to.equal(200); // 2%
    });
  });
});
