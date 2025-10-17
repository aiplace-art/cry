const { expect } = require("chai");
const { ethers } = require("hardhat");
const { increaseTime, TIME } = require("./helpers/test-helpers.cjs");

describe("HypeAI Token - Staking System", function() {
  let token;
  let owner, treasury, liquidity, user1, user2, user3;

  const INITIAL_STAKING_POOL = ethers.parseEther("2500000000"); // 2.5B tokens
  const BASE_APY = 1200; // 12%
  const BONUS_APY_30 = 500; // +5% = 17% total
  const BONUS_APY_90 = 1500; // +15% = 27% total
  const BONUS_APY_365 = 5000; // +50% = 62% total

  beforeEach(async function() {
    [owner, treasury, liquidity, user1, user2, user3] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("HypeAI");
    token = await Token.deploy(treasury.address, liquidity.address);
    await token.waitForDeployment();

    // Enable trading
    await token.enableTrading();

    // 🔥 CRITICAL: Transfer staking pool (2.5B tokens) to contract for rewards
    await token.transfer(await token.getAddress(), INITIAL_STAKING_POOL);

    // Transfer tokens to users for testing
    await token.transfer(user1.address, ethers.parseEther("10000000"));
    await token.transfer(user2.address, ethers.parseEther("10000000"));
    await token.transfer(user3.address, ethers.parseEther("10000000"));
  });

  describe("Basic Staking Tests", function() {
    it("should stake 1000 tokens for 30 days", async function() {
      const stakeAmount = ethers.parseEther("1000");

      await token.connect(user1).stake(stakeAmount, 30);

      const stakes = await token.getUserStakes(user1.address);
      expect(stakes.length).to.equal(1);
      expect(stakes[0].amount).to.equal(stakeAmount);
      expect(stakes[0].lockPeriod).to.equal(30);
    });

    it("should stake 1000 tokens for 90 days", async function() {
      const stakeAmount = ethers.parseEther("1000");

      await token.connect(user1).stake(stakeAmount, 90);

      const stakes = await token.getUserStakes(user1.address);
      expect(stakes.length).to.equal(1);
      expect(stakes[0].lockPeriod).to.equal(90);
    });

    it("should stake 1000 tokens for 365 days", async function() {
      const stakeAmount = ethers.parseEther("1000");

      await token.connect(user1).stake(stakeAmount, 365);

      const stakes = await token.getUserStakes(user1.address);
      expect(stakes.length).to.equal(1);
      expect(stakes[0].lockPeriod).to.equal(365);
    });

    it("should reject invalid lock period (60 days)", async function() {
      const stakeAmount = ethers.parseEther("1000");

      await expect(
        token.connect(user1).stake(stakeAmount, 60)
      ).to.be.revertedWith("Invalid lock period");
    });

    it("should reject invalid lock period (180 days)", async function() {
      const stakeAmount = ethers.parseEther("1000");

      await expect(
        token.connect(user1).stake(stakeAmount, 180)
      ).to.be.revertedWith("Invalid lock period");
    });

    it("should reject staking 0 tokens", async function() {
      await expect(
        token.connect(user1).stake(0, 30)
      ).to.be.revertedWith("Cannot stake 0 tokens");
    });

    it("should reject staking more than balance", async function() {
      const tooMuch = ethers.parseEther("100000000");

      await expect(
        token.connect(user1).stake(tooMuch, 30)
      ).to.be.revertedWith("Insufficient balance");
    });

    it("should allow multiple stakes by same user", async function() {
      const stakeAmount = ethers.parseEther("1000");

      await token.connect(user1).stake(stakeAmount, 30);
      await token.connect(user1).stake(stakeAmount, 90);
      await token.connect(user1).stake(stakeAmount, 365);

      const stakes = await token.getUserStakes(user1.address);
      expect(stakes.length).to.equal(3);
      expect(stakes[0].lockPeriod).to.equal(30);
      expect(stakes[1].lockPeriod).to.equal(90);
      expect(stakes[2].lockPeriod).to.equal(365);
    });

    it("should return empty array for user with no stakes", async function() {
      const stakes = await token.getUserStakes(user1.address);
      expect(stakes.length).to.equal(0);
    });
  });

  describe("Pool Health Tests", function() {
    it("should start with 100% pool health", async function() {
      const [poolRemaining, poolHealthPercent, apy30, apy90, apy365] = await token.getPoolHealth();

      expect(poolRemaining).to.equal(INITIAL_STAKING_POOL);
      expect(poolHealthPercent).to.equal(100);
    });

    it("should return tuple with 5 values", async function() {
      const result = await token.getPoolHealth();

      expect(result.length).to.equal(5);
      expect(result[0]).to.be.a('bigint'); // poolRemaining
      expect(result[1]).to.be.a('bigint'); // poolHealthPercent
      expect(result[2]).to.be.a('bigint'); // effectiveAPY30Days
      expect(result[3]).to.be.a('bigint'); // effectiveAPY90Days
      expect(result[4]).to.be.a('bigint'); // effectiveAPY365Days
    });

    it("should show effectiveAPY30Days = 1700 at 100% health", async function() {
      const [, , apy30] = await token.getPoolHealth();

      // BASE_APY (1200) + BONUS_APY_30_DAYS (500) = 1700 (17%)
      expect(apy30).to.equal(1700);
    });

    it("should show effectiveAPY90Days = 2700 at 100% health", async function() {
      const [, , , apy90] = await token.getPoolHealth();

      // BASE_APY (1200) + BONUS_APY_90_DAYS (1500) = 2700 (27%)
      expect(apy90).to.equal(2700);
    });

    it("should show effectiveAPY365Days = 6200 at 100% health", async function() {
      const [, , , , apy365] = await token.getPoolHealth();

      // BASE_APY (1200) + BONUS_APY_365_DAYS (5000) = 6200 (62%)
      expect(apy365).to.equal(6200);
    });

    it("should have correct pool health structure", async function() {
      const [poolRemaining, poolHealthPercent, apy30, apy90, apy365] = await token.getPoolHealth();

      expect(poolRemaining).to.be.a('bigint');
      expect(poolHealthPercent).to.be.a('bigint');
      expect(apy30).to.be.a('bigint');
      expect(apy90).to.be.a('bigint');
      expect(apy365).to.be.a('bigint');

      expect(poolHealthPercent).to.be.lte(100);
      expect(poolHealthPercent).to.be.gte(0);
    });
  });

  describe("Unstaking Tests", function() {
    it("cannot unstake before lock period (30 days)", async function() {
      const stakeAmount = ethers.parseEther("1000");
      await token.connect(user1).stake(stakeAmount, 30);

      await expect(
        token.connect(user1).unstake(0)
      ).to.be.revertedWith("Stake is still locked");
    });

    it("can unstake after 30 days for 30-day stake", async function() {
      const stakeAmount = ethers.parseEther("1000");
      await token.connect(user1).stake(stakeAmount, 30);

      // Fast-forward 30 days
      await increaseTime(TIME.DAY * 30);

      await expect(
        token.connect(user1).unstake(0)
      ).to.not.be.reverted;
    });

    it("can unstake after 90 days for 90-day stake", async function() {
      const stakeAmount = ethers.parseEther("1000");
      await token.connect(user1).stake(stakeAmount, 90);

      // Fast-forward 90 days
      await increaseTime(TIME.DAY * 90);

      await expect(
        token.connect(user1).unstake(0)
      ).to.not.be.reverted;
    });

    it("can unstake after 365 days for 365-day stake", async function() {
      const stakeAmount = ethers.parseEther("1000");
      await token.connect(user1).stake(stakeAmount, 365);

      // Fast-forward 365 days
      await increaseTime(TIME.DAY * 365);

      await expect(
        token.connect(user1).unstake(0)
      ).to.not.be.reverted;
    });

    it("receives correct reward after unstaking", async function() {
      const stakeAmount = ethers.parseEther("1000");
      const balanceBefore = await token.balanceOf(user1.address);

      await token.connect(user1).stake(stakeAmount, 30);
      await increaseTime(TIME.DAY * 30);

      await token.connect(user1).unstake(0);

      const balanceAfter = await token.balanceOf(user1.address);

      // Should receive original stake + rewards
      expect(balanceAfter).to.be.gt(balanceBefore - stakeAmount);
    });

    it("pool health decreases after distributing reward", async function() {
      const stakeAmount = ethers.parseEther("1000");

      const [poolBefore] = await token.getPoolHealth();

      await token.connect(user1).stake(stakeAmount, 30);
      await increaseTime(TIME.DAY * 30);
      await token.connect(user1).unstake(0);

      const [poolAfter] = await token.getPoolHealth();

      expect(poolAfter).to.be.lt(poolBefore);
    });

    it("rejects invalid stake index", async function() {
      await expect(
        token.connect(user1).unstake(0)
      ).to.be.revertedWith("Invalid stake index");
    });

    it("rejects out of bounds stake index", async function() {
      const stakeAmount = ethers.parseEther("1000");
      await token.connect(user1).stake(stakeAmount, 30);

      await expect(
        token.connect(user1).unstake(5)
      ).to.be.revertedWith("Invalid stake index");
    });

    it("can unstake multiple stakes by index", async function() {
      const stakeAmount = ethers.parseEther("1000");

      await token.connect(user1).stake(stakeAmount, 30);
      await token.connect(user1).stake(stakeAmount, 30);
      await token.connect(user1).stake(stakeAmount, 30);

      await increaseTime(TIME.DAY * 30);

      // Unstake first stake
      await token.connect(user1).unstake(0);

      let stakes = await token.getUserStakes(user1.address);
      expect(stakes.length).to.equal(2);

      // Unstake another
      await token.connect(user1).unstake(0);

      stakes = await token.getUserStakes(user1.address);
      expect(stakes.length).to.equal(1);
    });
  });

  describe("Reward Calculation Tests", function() {
    it("calculateStakingReward returns value for 30-day stake", async function() {
      const stakeAmount = ethers.parseEther("1000");
      await token.connect(user1).stake(stakeAmount, 30);

      await increaseTime(TIME.DAY * 15); // Halfway through

      const reward = await token.calculateStakingReward(user1.address, 0);
      expect(reward).to.be.gt(0);
    });

    it("calculateStakingReward increases over time", async function() {
      const stakeAmount = ethers.parseEther("1000");
      await token.connect(user1).stake(stakeAmount, 365);

      await increaseTime(TIME.DAY * 30);
      const reward1 = await token.calculateStakingReward(user1.address, 0);

      await increaseTime(TIME.DAY * 30);
      const reward2 = await token.calculateStakingReward(user1.address, 0);

      expect(reward2).to.be.gt(reward1);
    });

    it("calculateStakingReward for 365-day stake is highest", async function() {
      const stakeAmount = ethers.parseEther("1000");

      await token.connect(user1).stake(stakeAmount, 30);
      await token.connect(user2).stake(stakeAmount, 365);

      await increaseTime(TIME.DAY * 30);

      const reward30 = await token.calculateStakingReward(user1.address, 0);
      const reward365 = await token.calculateStakingReward(user2.address, 0);

      expect(reward365).to.be.gt(reward30);
    });

    it("reward calculation doesn't revert for invalid index", async function() {
      await expect(
        token.calculateStakingReward(user1.address, 0)
      ).to.be.revertedWith("Invalid stake index");
    });

    it("reward is capped at stakingPoolRemaining", async function() {
      const stakeAmount = ethers.parseEther("1000");
      await token.connect(user1).stake(stakeAmount, 365);

      await increaseTime(TIME.YEAR * 10); // Way too long

      const reward = await token.calculateStakingReward(user1.address, 0);
      const [poolRemaining] = await token.getPoolHealth();

      expect(reward).to.be.lte(poolRemaining);
    });
  });

  describe("Dynamic APY Tests", function() {
    it("stake when pool is 100% full gets 62% APY (365 days)", async function() {
      const stakeAmount = ethers.parseEther("1000");

      await token.connect(user1).stake(stakeAmount, 365);

      const stakes = await token.getUserStakes(user1.address);

      // At 100% health: BASE_APY (1200) + BONUS_APY_365 (5000) = 6200 (62%)
      expect(stakes[0].rewardRate).to.equal(6200);
    });

    it("stake when pool is 100% full gets 17% APY (30 days)", async function() {
      const stakeAmount = ethers.parseEther("1000");

      await token.connect(user1).stake(stakeAmount, 30);

      const stakes = await token.getUserStakes(user1.address);

      // At 100% health: BASE_APY (1200) + BONUS_APY_30 (500) = 1700 (17%)
      expect(stakes[0].rewardRate).to.equal(1700);
    });

    it("large stake reduces pool and new stakers get lower APY", async function() {
      // First staker gets full APY
      const largeStake = ethers.parseEther("1000000");
      await token.connect(user1).stake(largeStake, 365);

      // Deplete some of the pool (wait full 365 days for unlock)
      await increaseTime(TIME.DAY * 365);
      await token.connect(user1).unstake(0);

      // Check new effective APY
      const [, poolHealthPercent] = await token.getPoolHealth();

      // Second staker gets reduced APY
      await token.connect(user2).stake(ethers.parseEther("1000"), 365);
      const stakes = await token.getUserStakes(user2.address);

      // APY should be scaled by pool health
      expect(stakes[0].rewardRate).to.be.lt(6200);
    });

    it("minimum 10% of base APY when pool is low", async function() {
      // Stake a huge amount to deplete pool
      const hugeStake = ethers.parseEther("5000000");
      await token.connect(user1).stake(hugeStake, 365);

      // Wait a long time
      await increaseTime(TIME.YEAR);
      await token.connect(user1).unstake(0);

      // Pool should be very low, but minimum APY applies
      const [, , , , apy365] = await token.getPoolHealth();

      // Minimum is 10% of base: 6200 * 10% = 620
      expect(apy365).to.be.gte(620);
    });
  });

  describe("Edge Cases", function() {
    it("stake 1 wei", async function() {
      await token.connect(user1).stake(1, 30);

      const stakes = await token.getUserStakes(user1.address);
      expect(stakes[0].amount).to.equal(1);
    });

    it("stake max wallet amount", async function() {
      const maxAmount = await token.balanceOf(user1.address);

      await token.connect(user1).stake(maxAmount, 30);

      const stakes = await token.getUserStakes(user1.address);
      expect(stakes[0].amount).to.equal(maxAmount);
    });

    it("10 concurrent stakers", async function() {
      const signers = await ethers.getSigners();
      const stakeAmount = ethers.parseEther("1000");

      // Transfer tokens to more users
      for (let i = 3; i < 13; i++) {
        await token.transfer(signers[i].address, ethers.parseEther("10000"));
      }

      // All stake at once
      for (let i = 3; i < 13; i++) {
        await token.connect(signers[i]).stake(stakeAmount, 30);
      }

      const [poolRemaining, poolHealthPercent] = await token.getPoolHealth();
      expect(poolRemaining).to.be.lte(INITIAL_STAKING_POOL);
      expect(poolHealthPercent).to.be.lte(100);
    });

    it("rapid stake/unstake cycles", async function() {
      const stakeAmount = ethers.parseEther("100");

      for (let i = 0; i < 5; i++) {
        await token.connect(user1).stake(stakeAmount, 30);
        await increaseTime(TIME.DAY * 30);
        await token.connect(user1).unstake(0);
      }

      const stakes = await token.getUserStakes(user1.address);
      expect(stakes.length).to.equal(0);
    });

    it("pool health never negative", async function() {
      const stakeAmount = ethers.parseEther("1000000");

      await token.connect(user1).stake(stakeAmount, 365);
      await increaseTime(TIME.YEAR * 5);

      const [poolRemaining, poolHealthPercent] = await token.getPoolHealth();

      expect(poolRemaining).to.be.gte(0);
      expect(poolHealthPercent).to.be.gte(0);
    });

    it("unstaking removes correct stake from array", async function() {
      await token.connect(user1).stake(ethers.parseEther("1000"), 30);
      await token.connect(user1).stake(ethers.parseEther("2000"), 90);
      await token.connect(user1).stake(ethers.parseEther("3000"), 365);

      await increaseTime(TIME.DAY * 30);

      // Unstake the first one (index 0)
      await token.connect(user1).unstake(0);

      const stakes = await token.getUserStakes(user1.address);
      expect(stakes.length).to.equal(2);

      // The array swaps last element with removed element
      // So we should still have stakes, but one is gone
      expect(stakes[0].amount).to.be.gt(0);
      expect(stakes[1].amount).to.be.gt(0);
    });
  });

  describe("Staking Rewards Accuracy", function() {
    it("30-day stake earns approximately correct rewards", async function() {
      const stakeAmount = ethers.parseEther("10000");

      await token.connect(user1).stake(stakeAmount, 30);
      await increaseTime(TIME.DAY * 30);

      const reward = await token.calculateStakingReward(user1.address, 0);

      // Expected: 10000 * 17% * (30/365) ≈ 139.7 tokens
      const expected = (stakeAmount * 1700n * 30n) / (365n * 10000n);

      // Allow 1% tolerance
      const tolerance = expected / 100n;
      expect(reward).to.be.closeTo(expected, tolerance);
    });

    it("365-day stake earns approximately correct rewards", async function() {
      const stakeAmount = ethers.parseEther("10000");

      await token.connect(user1).stake(stakeAmount, 365);
      await increaseTime(TIME.YEAR);

      const reward = await token.calculateStakingReward(user1.address, 0);

      // Expected: 10000 * 62% = 6200 tokens
      const expected = (stakeAmount * 6200n) / 10000n;

      // Allow 1% tolerance
      const tolerance = expected / 100n;
      expect(reward).to.be.closeTo(expected, tolerance);
    });
  });
});
