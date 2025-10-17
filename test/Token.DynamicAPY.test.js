const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("HypeToken - Dynamic Staking APY", function () {
  let hypeToken;
  let owner, user1, user2, user3;

  const INITIAL_SUPPLY = ethers.parseEther("21000000000"); // 21B tokens
  const STAKING_POOL = ethers.parseEther("13020000000"); // 62% of supply
  const MAX_APY = 62; // 62% base APY
  const YEAR_SECONDS = 365 * 24 * 60 * 60;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();

    const HypeToken = await ethers.getContractFactory("HypeToken");
    hypeToken = await HypeToken.deploy();

    // Transfer tokens to users for testing
    await hypeToken.transfer(user1.address, ethers.parseEther("1000000"));
    await hypeToken.transfer(user2.address, ethers.parseEther("1000000"));
    await hypeToken.transfer(user3.address, ethers.parseEther("1000000"));
  });

  describe("Pool Health Calculation", function () {
    it("should return 100% health with full staking pool", async function () {
      const health = await hypeToken.getPoolHealth();
      expect(health).to.equal(100);
    });

    it("should return correct health at 75% pool capacity", async function () {
      // Stake 25% of pool (3,255,000,000 tokens)
      const stakeAmount = ethers.parseEther("3255000000");
      await hypeToken.connect(owner).approve(hypeToken.target, stakeAmount);
      await hypeToken.connect(owner).stake(stakeAmount);

      const health = await hypeToken.getPoolHealth();
      expect(health).to.be.closeTo(75, 1); // Allow 1% tolerance
    });

    it("should return correct health at 50% pool capacity", async function () {
      // Stake 50% of pool (6,510,000,000 tokens)
      const stakeAmount = ethers.parseEther("6510000000");
      await hypeToken.connect(owner).approve(hypeToken.target, stakeAmount);
      await hypeToken.connect(owner).stake(stakeAmount);

      const health = await hypeToken.getPoolHealth();
      expect(health).to.be.closeTo(50, 1);
    });

    it("should return correct health at 25% pool capacity", async function () {
      // Stake 75% of pool (9,765,000,000 tokens)
      const stakeAmount = ethers.parseEther("9765000000");
      await hypeToken.connect(owner).approve(hypeToken.target, stakeAmount);
      await hypeToken.connect(owner).stake(stakeAmount);

      const health = await hypeToken.getPoolHealth();
      expect(health).to.be.closeTo(25, 1);
    });

    it("should enforce minimum 10% pool health", async function () {
      // Stake 90% of pool (11,718,000,000 tokens)
      const stakeAmount = ethers.parseEther("11718000000");
      await hypeToken.connect(owner).approve(hypeToken.target, stakeAmount);
      await hypeToken.connect(owner).stake(stakeAmount);

      const health = await hypeToken.getPoolHealth();
      expect(health).to.be.gte(10); // Should never go below 10%
    });

    it("should prevent staking when pool health would drop below 10%", async function () {
      // Try to stake 95% of pool
      const stakeAmount = ethers.parseEther("12369000000");
      await hypeToken.connect(owner).approve(hypeToken.target, stakeAmount);

      await expect(
        hypeToken.connect(owner).stake(stakeAmount)
      ).to.be.revertedWith("Staking pool depleted");
    });
  });

  describe("APY Adjustment Based on Pool Health", function () {
    it("should give maximum APY (62%) when pool is at 100% health", async function () {
      const stakeAmount = ethers.parseEther("100000");
      await hypeToken.connect(user1).approve(hypeToken.target, stakeAmount);
      await hypeToken.connect(user1).stake(stakeAmount);

      // Fast forward 1 year
      await time.increase(YEAR_SECONDS);

      // Calculate expected rewards with max APY
      const expectedRewards = (stakeAmount * BigInt(MAX_APY)) / BigInt(100);

      const stakeInfo = await hypeToken.stakes(user1.address);
      const claimableRewards = await hypeToken.calculateRewards(user1.address);

      // Should be close to max APY (within 5% tolerance for time precision)
      const tolerance = expectedRewards * BigInt(5) / BigInt(100);
      expect(claimableRewards).to.be.closeTo(expectedRewards, tolerance);
    });

    it("should give reduced APY (~31%) when pool is at 50% health", async function () {
      // First, deplete pool to 50%
      const depletionAmount = ethers.parseEther("6510000000");
      await hypeToken.connect(owner).approve(hypeToken.target, depletionAmount);
      await hypeToken.connect(owner).stake(depletionAmount);

      // Now stake as user1
      const stakeAmount = ethers.parseEther("100000");
      await hypeToken.connect(user1).approve(hypeToken.target, stakeAmount);
      await hypeToken.connect(user1).stake(stakeAmount);

      // Fast forward 1 year
      await time.increase(YEAR_SECONDS);

      // At 50% pool health, APY should be ~31% (62% * 50%)
      const expectedAPY = (MAX_APY * 50) / 100;
      const expectedRewards = (stakeAmount * BigInt(expectedAPY)) / BigInt(100);

      const claimableRewards = await hypeToken.calculateRewards(user1.address);

      const tolerance = expectedRewards * BigInt(10) / BigInt(100);
      expect(claimableRewards).to.be.closeTo(expectedRewards, tolerance);
    });

    it("should give minimum APY (~6.2%) when pool is at 10% health", async function () {
      // Deplete pool to 10%
      const depletionAmount = ethers.parseEther("11718000000");
      await hypeToken.connect(owner).approve(hypeToken.target, depletionAmount);
      await hypeToken.connect(owner).stake(depletionAmount);

      // Stake as user1
      const stakeAmount = ethers.parseEther("50000");
      await hypeToken.connect(user1).approve(hypeToken.target, stakeAmount);
      await hypeToken.connect(user1).stake(stakeAmount);

      // Fast forward 1 year
      await time.increase(YEAR_SECONDS);

      // At 10% pool health, APY should be ~6.2% (62% * 10%)
      const expectedAPY = (MAX_APY * 10) / 100;
      const expectedRewards = (stakeAmount * BigInt(expectedAPY)) / BigInt(100);

      const claimableRewards = await hypeToken.calculateRewards(user1.address);

      const tolerance = expectedRewards * BigInt(15) / BigInt(100);
      expect(claimableRewards).to.be.closeTo(expectedRewards, tolerance);
    });
  });

  describe("Staking and Pool Dynamics", function () {
    it("should reduce pool correctly when staking", async function () {
      const initialPool = await hypeToken.stakingPool();
      const stakeAmount = ethers.parseEther("1000000");

      await hypeToken.connect(user1).approve(hypeToken.target, stakeAmount);
      await hypeToken.connect(user1).stake(stakeAmount);

      const newPool = await hypeToken.stakingPool();
      expect(initialPool - newPool).to.equal(stakeAmount);
    });

    it("should increase pool when unstaking (returning principal)", async function () {
      const stakeAmount = ethers.parseEther("1000000");

      // Stake
      await hypeToken.connect(user1).approve(hypeToken.target, stakeAmount);
      await hypeToken.connect(user1).stake(stakeAmount);

      const poolAfterStake = await hypeToken.stakingPool();

      // Fast forward and unstake
      await time.increase(30 * 24 * 60 * 60); // 30 days
      await hypeToken.connect(user1).unstake();

      const poolAfterUnstake = await hypeToken.stakingPool();

      // Pool should increase by principal amount
      expect(poolAfterUnstake - poolAfterStake).to.equal(stakeAmount);
    });

    it("should never allow pool to go negative", async function () {
      const stakeAmount = ethers.parseEther("500000");

      // Multiple users stake
      await hypeToken.connect(user1).approve(hypeToken.target, stakeAmount);
      await hypeToken.connect(user1).stake(stakeAmount);

      await hypeToken.connect(user2).approve(hypeToken.target, stakeAmount);
      await hypeToken.connect(user2).stake(stakeAmount);

      await hypeToken.connect(user3).approve(hypeToken.target, stakeAmount);
      await hypeToken.connect(user3).stake(stakeAmount);

      const pool = await hypeToken.stakingPool();
      expect(pool).to.be.gt(0);
    });

    it("should handle multiple stakes with different pool health levels", async function () {
      // User1 stakes at 100% health
      const stake1 = ethers.parseEther("100000");
      await hypeToken.connect(user1).approve(hypeToken.target, stake1);
      await hypeToken.connect(user1).stake(stake1);

      // Deplete pool to 50%
      const depletionAmount = ethers.parseEther("6400000000");
      await hypeToken.connect(owner).approve(hypeToken.target, depletionAmount);
      await hypeToken.connect(owner).stake(depletionAmount);

      // User2 stakes at 50% health
      const stake2 = ethers.parseEther("100000");
      await hypeToken.connect(user2).approve(hypeToken.target, stake2);
      await hypeToken.connect(user2).stake(stake2);

      // Fast forward 1 year
      await time.increase(YEAR_SECONDS);

      // User1 should have higher rewards (staked at higher APY)
      const rewards1 = await hypeToken.calculateRewards(user1.address);
      const rewards2 = await hypeToken.calculateRewards(user2.address);

      expect(rewards1).to.be.gt(rewards2);
    });
  });

  describe("Edge Cases and Security", function () {
    it("should handle very small stakes correctly", async function () {
      const tinyStake = ethers.parseEther("0.001");
      await hypeToken.connect(user1).approve(hypeToken.target, tinyStake);
      await hypeToken.connect(user1).stake(tinyStake);

      const health = await hypeToken.getPoolHealth();
      expect(health).to.equal(100); // Should still be essentially 100%
    });

    it("should handle rapid stake/unstake cycles", async function () {
      const stakeAmount = ethers.parseEther("10000");

      for (let i = 0; i < 5; i++) {
        await hypeToken.connect(user1).approve(hypeToken.target, stakeAmount);
        await hypeToken.connect(user1).stake(stakeAmount);

        await time.increase(7 * 24 * 60 * 60); // 7 days

        await hypeToken.connect(user1).unstake();
      }

      const pool = await hypeToken.stakingPool();
      expect(pool).to.be.gt(0);
    });

    it("should maintain consistency across multiple concurrent stakers", async function () {
      const stakeAmount = ethers.parseEther("100000");

      // All users stake simultaneously
      await hypeToken.connect(user1).approve(hypeToken.target, stakeAmount);
      await hypeToken.connect(user2).approve(hypeToken.target, stakeAmount);
      await hypeToken.connect(user3).approve(hypeToken.target, stakeAmount);

      await hypeToken.connect(user1).stake(stakeAmount);
      await hypeToken.connect(user2).stake(stakeAmount);
      await hypeToken.connect(user3).stake(stakeAmount);

      // Fast forward
      await time.increase(YEAR_SECONDS / 2); // 6 months

      // All should have similar rewards (staked at same time/health)
      const rewards1 = await hypeToken.calculateRewards(user1.address);
      const rewards2 = await hypeToken.calculateRewards(user2.address);
      const rewards3 = await hypeToken.calculateRewards(user3.address);

      // Within 1% of each other
      const tolerance = rewards1 / BigInt(100);
      expect(rewards2).to.be.closeTo(rewards1, tolerance);
      expect(rewards3).to.be.closeTo(rewards1, tolerance);
    });

    it("should revert when trying to stake more than pool can support", async function () {
      // Try to stake 95% of pool
      const excessiveStake = ethers.parseEther("12369000000");
      await hypeToken.connect(owner).approve(hypeToken.target, excessiveStake);

      await expect(
        hypeToken.connect(owner).stake(excessiveStake)
      ).to.be.revertedWith("Staking pool depleted");
    });
  });

  describe("getPoolHealth() View Function", function () {
    it("should return correct value after multiple operations", async function () {
      const initialHealth = await hypeToken.getPoolHealth();
      expect(initialHealth).to.equal(100);

      // Stake some tokens
      const stakeAmount = ethers.parseEther("3255000000");
      await hypeToken.connect(owner).approve(hypeToken.target, stakeAmount);
      await hypeToken.connect(owner).stake(stakeAmount);

      const healthAfterStake = await hypeToken.getPoolHealth();
      expect(healthAfterStake).to.be.closeTo(75, 1);

      // Unstake
      await time.increase(30 * 24 * 60 * 60);
      await hypeToken.connect(owner).unstake();

      const healthAfterUnstake = await hypeToken.getPoolHealth();
      expect(healthAfterUnstake).to.be.closeTo(100, 1);
    });

    it("should be callable by anyone (view function)", async function () {
      const health1 = await hypeToken.connect(owner).getPoolHealth();
      const health2 = await hypeToken.connect(user1).getPoolHealth();
      const health3 = await hypeToken.connect(user2).getPoolHealth();

      expect(health1).to.equal(health2);
      expect(health2).to.equal(health3);
    });

    it("should update in real-time as stakes change", async function () {
      const stakeAmount = ethers.parseEther("1000000");

      const health1 = await hypeToken.getPoolHealth();

      await hypeToken.connect(user1).approve(hypeToken.target, stakeAmount);
      await hypeToken.connect(user1).stake(stakeAmount);

      const health2 = await hypeToken.getPoolHealth();

      await hypeToken.connect(user2).approve(hypeToken.target, stakeAmount);
      await hypeToken.connect(user2).stake(stakeAmount);

      const health3 = await hypeToken.getPoolHealth();

      // Each stake should reduce health
      expect(health2).to.be.lt(health1);
      expect(health3).to.be.lt(health2);
    });
  });
});
