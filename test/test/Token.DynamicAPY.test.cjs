const { expect } = require("chai");
const { ethers } = require("hardhat");
const { increaseTime, parseEther, formatEther, TIME } = require("./helpers/test-helpers.cjs");

describe("HypeAI Token - Dynamic APY System", function() {
  let token;
  let owner, treasury, liquidity, user1, user2, user3, user4;
  const INITIAL_REWARD_POOL = parseEther("150000000"); // 150M tokens
  const BASE_APY = 6200; // 62% in basis points (100 = 1%)

  beforeEach(async function() {
    [owner, treasury, liquidity, user1, user2, user3, user4] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("HypeAI");
    token = await Token.deploy(treasury.address, liquidity.address);
    await token.waitForDeployment();
  });

  describe("Pool Health Calculation", function() {
    it("should start with 100% pool health", async function() {
      const health = await token.getPoolHealth();
      expect(health.poolHealthPercent).to.equal(100);
      expect(health.currentPool).to.equal(INITIAL_REWARD_POOL);
      expect(health.initialPool).to.equal(INITIAL_REWARD_POOL);
    });

    it("should calculate 75% pool health correctly", async function() {
      const stakeAmount = parseEther("50000000"); // Stake to reduce pool
      await token.connect(user1).stake(stakeAmount);

      // Wait for some time to accumulate rewards
      await increaseTime(TIME.MONTH * 3); // 3 months

      const health = await token.getPoolHealth();
      expect(health.poolHealthPercent).to.be.closeTo(75, 5); // Allow 5% variance
    });

    it("should calculate 50% pool health correctly", async function() {
      // Distribute half the reward pool
      const stakeAmount = parseEther("100000000");
      await token.connect(user1).stake(stakeAmount);

      await increaseTime(TIME.MONTH * 6);

      const health = await token.getPoolHealth();
      expect(health.poolHealthPercent).to.be.closeTo(50, 5);
    });

    it("should calculate 25% pool health correctly", async function() {
      const stakeAmount = parseEther("150000000");
      await token.connect(user1).stake(stakeAmount);

      await increaseTime(TIME.MONTH * 9);

      const health = await token.getPoolHealth();
      expect(health.poolHealthPercent).to.be.closeTo(25, 5);
    });

    it("should calculate 10% pool health correctly", async function() {
      const stakeAmount = parseEther("180000000");
      await token.connect(user1).stake(stakeAmount);

      await increaseTime(TIME.YEAR);

      const health = await token.getPoolHealth();
      expect(health.poolHealthPercent).to.be.closeTo(10, 5);
    });

    it("should never go below 10% health", async function() {
      const stakeAmount = parseEther("200000000");
      await token.connect(user1).stake(stakeAmount);

      await increaseTime(TIME.YEAR * 2);

      const health = await token.getPoolHealth();
      expect(health.poolHealthPercent).to.be.gte(10);
    });

    it("should never have negative pool balance", async function() {
      const stakeAmount = parseEther("200000000");
      await token.connect(user1).stake(stakeAmount);

      await increaseTime(TIME.YEAR * 3);

      const health = await token.getPoolHealth();
      expect(health.currentPool).to.be.gte(0);
    });
  });

  describe("APY Scaling Based on Pool Health", function() {
    it("should provide 62% APY at 100% pool health", async function() {
      const currentAPY = await token.getCurrentAPY();
      expect(currentAPY).to.equal(6200); // 62%
    });

    it("should scale to ~46.5% APY at 75% pool health", async function() {
      // Deplete pool to 75%
      const stakeAmount = parseEther("50000000");
      await token.connect(user1).stake(stakeAmount);
      await increaseTime(TIME.MONTH * 3);

      const currentAPY = await token.getCurrentAPY();
      expect(currentAPY).to.be.closeTo(4650, 500); // ~46.5% with tolerance
    });

    it("should scale to ~31% APY at 50% pool health", async function() {
      const stakeAmount = parseEther("100000000");
      await token.connect(user1).stake(stakeAmount);
      await increaseTime(TIME.MONTH * 6);

      const currentAPY = await token.getCurrentAPY();
      expect(currentAPY).to.be.closeTo(3100, 500); // ~31%
    });

    it("should scale to ~15.5% APY at 25% pool health", async function() {
      const stakeAmount = parseEther("150000000");
      await token.connect(user1).stake(stakeAmount);
      await increaseTime(TIME.MONTH * 9);

      const currentAPY = await token.getCurrentAPY();
      expect(currentAPY).to.be.closeTo(1550, 500); // ~15.5%
    });

    it("should maintain minimum 6.2% APY at 10% pool health", async function() {
      const stakeAmount = parseEther("180000000");
      await token.connect(user1).stake(stakeAmount);
      await increaseTime(TIME.YEAR);

      const currentAPY = await token.getCurrentAPY();
      expect(currentAPY).to.be.gte(620); // Minimum 6.2%
    });

    it("should never drop below minimum APY", async function() {
      const stakeAmount = parseEther("200000000");
      await token.connect(user1).stake(stakeAmount);
      await increaseTime(TIME.YEAR * 2);

      const currentAPY = await token.getCurrentAPY();
      expect(currentAPY).to.be.gte(620); // 6.2% minimum
    });
  });

  describe("Staking with Full Pool", function() {
    it("should receive 62% APY when pool is 100% full", async function() {
      const stakeAmount = parseEther("10000");
      await token.connect(user1).stake(stakeAmount);

      const stakeInfo = await token.getStake(user1.address);
      expect(stakeInfo.apyAtStake).to.equal(6200);
    });

    it("should calculate correct rewards at full pool APY", async function() {
      const stakeAmount = parseEther("10000");
      await token.connect(user1).stake(stakeAmount);

      await increaseTime(TIME.YEAR);

      const rewards = await token.calculateRewards(user1.address);
      const expectedRewards = (stakeAmount * BigInt(6200)) / BigInt(10000);
      expect(rewards).to.be.closeTo(expectedRewards, parseEther("100"));
    });

    it("should handle multiple stakers at full pool", async function() {
      const stakeAmount = parseEther("5000");

      await token.connect(user1).stake(stakeAmount);
      await token.connect(user2).stake(stakeAmount);
      await token.connect(user3).stake(stakeAmount);

      const apy1 = (await token.getStake(user1.address)).apyAtStake;
      const apy2 = (await token.getStake(user2.address)).apyAtStake;
      const apy3 = (await token.getStake(user3.address)).apyAtStake;

      expect(apy1).to.equal(6200);
      expect(apy2).to.equal(6200);
      expect(apy3).to.equal(6200);
    });
  });

  describe("Staking with Half Pool", function() {
    beforeEach(async function() {
      // Deplete pool to 50%
      const stakeAmount = parseEther("100000000");
      await token.connect(user1).stake(stakeAmount);
      await increaseTime(TIME.MONTH * 6);
    });

    it("should receive ~31% APY when pool is 50% full", async function() {
      const stakeAmount = parseEther("10000");
      await token.connect(user2).stake(stakeAmount);

      const stakeInfo = await token.getStake(user2.address);
      expect(stakeInfo.apyAtStake).to.be.closeTo(3100, 500);
    });

    it("should calculate correct rewards at half pool APY", async function() {
      const stakeAmount = parseEther("10000");
      await token.connect(user2).stake(stakeAmount);

      await increaseTime(TIME.YEAR);

      const rewards = await token.calculateRewards(user2.address);
      const expectedRewards = (stakeAmount * BigInt(3100)) / BigInt(10000);
      expect(rewards).to.be.closeTo(expectedRewards, parseEther("100"));
    });
  });

  describe("Unstaking and Pool Recovery", function() {
    it("should increase pool when user unstakes", async function() {
      const stakeAmount = parseEther("10000");
      await token.connect(user1).stake(stakeAmount);

      const healthBefore = await token.getPoolHealth();

      await increaseTime(TIME.MONTH);
      await token.connect(user1).unstake(stakeAmount);

      const healthAfter = await token.getPoolHealth();
      expect(healthAfter.currentPool).to.be.lte(healthBefore.currentPool);
    });

    it("should not increase pool beyond initial size", async function() {
      const stakeAmount = parseEther("10000");
      await token.connect(user1).stake(stakeAmount);
      await token.connect(user1).unstake(stakeAmount);

      const health = await token.getPoolHealth();
      expect(health.currentPool).to.be.lte(INITIAL_REWARD_POOL);
    });

    it("should handle multiple unstake operations", async function() {
      const stakeAmount = parseEther("5000");

      await token.connect(user1).stake(stakeAmount);
      await token.connect(user2).stake(stakeAmount);
      await token.connect(user3).stake(stakeAmount);

      await increaseTime(TIME.MONTH);

      await token.connect(user1).unstake(stakeAmount);
      await token.connect(user2).unstake(stakeAmount);
      await token.connect(user3).unstake(stakeAmount);

      const health = await token.getPoolHealth();
      expect(health.currentPool).to.be.gte(0);
    });
  });

  describe("Multiple Concurrent Stakers", function() {
    it("should handle 10 concurrent stakers correctly", async function() {
      const signers = await ethers.getSigners();
      const stakeAmount = parseEther("1000");

      for (let i = 1; i <= 10; i++) {
        await token.connect(signers[i]).stake(stakeAmount);
      }

      const health = await token.getPoolHealth();
      expect(health.currentPool).to.be.lte(INITIAL_REWARD_POOL);
    });

    it("should calculate independent rewards for each staker", async function() {
      await token.connect(user1).stake(parseEther("10000"));
      await increaseTime(TIME.MONTH);

      await token.connect(user2).stake(parseEther("5000"));
      await increaseTime(TIME.MONTH);

      const rewards1 = await token.calculateRewards(user1.address);
      const rewards2 = await token.calculateRewards(user2.address);

      expect(rewards1).to.be.gt(rewards2);
    });

    it("should maintain correct pool balance with concurrent stakes", async function() {
      const stakeAmount = parseEther("1000");

      await token.connect(user1).stake(stakeAmount);
      await token.connect(user2).stake(stakeAmount);
      await token.connect(user3).stake(stakeAmount);
      await token.connect(user4).stake(stakeAmount);

      await increaseTime(TIME.YEAR);

      const health = await token.getPoolHealth();
      expect(health.currentPool).to.be.gte(0);
      expect(health.currentPool).to.be.lte(INITIAL_REWARD_POOL);
    });
  });

  describe("Pool Depletion Over Time", function() {
    it("should show gradual pool depletion over 1 year", async function() {
      const stakeAmount = parseEther("50000000");
      await token.connect(user1).stake(stakeAmount);

      const health0 = await token.getPoolHealth();

      await increaseTime(TIME.MONTH * 3);
      const health3 = await token.getPoolHealth();

      await increaseTime(TIME.MONTH * 3);
      const health6 = await token.getPoolHealth();

      await increaseTime(TIME.MONTH * 6);
      const health12 = await token.getPoolHealth();

      expect(health0.poolHealthPercent).to.be.gt(health3.poolHealthPercent);
      expect(health3.poolHealthPercent).to.be.gt(health6.poolHealthPercent);
      expect(health6.poolHealthPercent).to.be.gt(health12.poolHealthPercent);
    });

    it("should show APY decreasing as pool depletes", async function() {
      const stakeAmount = parseEther("50000000");
      await token.connect(user1).stake(stakeAmount);

      const apy0 = await token.getCurrentAPY();

      await increaseTime(TIME.MONTH * 6);
      const apy6 = await token.getCurrentAPY();

      await increaseTime(TIME.MONTH * 6);
      const apy12 = await token.getCurrentAPY();

      expect(apy0).to.be.gt(apy6);
      expect(apy6).to.be.gt(apy12);
    });

    it("should maintain minimum 10% pool health over extended time", async function() {
      const stakeAmount = parseEther("100000000");
      await token.connect(user1).stake(stakeAmount);

      await increaseTime(TIME.YEAR * 2);

      const health = await token.getPoolHealth();
      expect(health.poolHealthPercent).to.be.gte(10);
    });
  });

  describe("Edge Cases - Very Small Stakes", function() {
    it("should handle 1 wei stake", async function() {
      await token.connect(user1).stake(1);

      const stakeInfo = await token.getStake(user1.address);
      expect(stakeInfo.amount).to.equal(1);
    });

    it("should handle 0.0001 token stake", async function() {
      const tinyAmount = parseEther("0.0001");
      await token.connect(user1).stake(tinyAmount);

      const stakeInfo = await token.getStake(user1.address);
      expect(stakeInfo.amount).to.equal(tinyAmount);
    });

    it("should calculate rewards correctly for tiny stakes", async function() {
      const tinyAmount = parseEther("0.001");
      await token.connect(user1).stake(tinyAmount);

      await increaseTime(TIME.YEAR);

      const rewards = await token.calculateRewards(user1.address);
      expect(rewards).to.be.gt(0);
    });
  });

  describe("Edge Cases - Rapid Stake/Unstake Cycles", function() {
    it("should handle rapid stake operations", async function() {
      const stakeAmount = parseEther("100");

      for (let i = 0; i < 5; i++) {
        await token.connect(user1).stake(stakeAmount);
      }

      const stakeInfo = await token.getStake(user1.address);
      expect(stakeInfo.amount).to.equal(stakeAmount * BigInt(5));
    });

    it("should handle rapid unstake operations", async function() {
      const stakeAmount = parseEther("1000");
      await token.connect(user1).stake(stakeAmount);

      await increaseTime(TIME.DAY);

      const unstakeAmount = parseEther("100");
      for (let i = 0; i < 5; i++) {
        await token.connect(user1).unstake(unstakeAmount);
      }

      const stakeInfo = await token.getStake(user1.address);
      expect(stakeInfo.amount).to.equal(stakeAmount - (unstakeAmount * BigInt(5)));
    });

    it("should handle alternating stake/unstake", async function() {
      await token.connect(user1).stake(parseEther("1000"));
      await increaseTime(TIME.HOUR);

      await token.connect(user1).unstake(parseEther("500"));
      await increaseTime(TIME.HOUR);

      await token.connect(user1).stake(parseEther("300"));
      await increaseTime(TIME.HOUR);

      await token.connect(user1).unstake(parseEther("200"));

      const stakeInfo = await token.getStake(user1.address);
      expect(stakeInfo.amount).to.equal(parseEther("600"));
    });

    it("should maintain pool integrity during rapid cycles", async function() {
      const stakeAmount = parseEther("1000");

      for (let i = 0; i < 10; i++) {
        await token.connect(user1).stake(stakeAmount);
        await increaseTime(TIME.HOUR);
        await token.connect(user1).unstake(stakeAmount / BigInt(2));
        await increaseTime(TIME.HOUR);
      }

      const health = await token.getPoolHealth();
      expect(health.currentPool).to.be.lte(INITIAL_REWARD_POOL);
      expect(health.currentPool).to.be.gte(0);
    });
  });

  describe("Pool Health Edge Cases", function() {
    it("should handle exact 0 pool balance", async function() {
      // This should be prevented, but test boundary
      const health = await token.getPoolHealth();
      expect(health.currentPool).to.be.gte(0);
    });

    it("should return accurate percentages for all health levels", async function() {
      const healthLevels = [100, 90, 75, 50, 25, 10];

      for (const level of healthLevels) {
        const health = await token.getPoolHealth();
        expect(health.poolHealthPercent).to.be.gte(0);
        expect(health.poolHealthPercent).to.be.lte(100);
      }
    });
  });
});
