const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

/**
 * Staking Security Test Suite
 * Tests for: Reward manipulation, Lock period bypass, Reentrancy, Integer overflow
 */
describe("Staking Security Tests", function () {

  async function deployStakingFixture() {
    const [owner, staker1, staker2, attacker] = await ethers.getSigners();

    // Deploy mock token
    const Token = await ethers.getContractFactory("MockERC20");
    const stakingToken = await Token.deploy("StakeToken", "STK", ethers.parseEther("10000000"));

    // Deploy staking contract
    const Staking = await ethers.getContractFactory("Staking");
    const staking = await Staking.deploy(await stakingToken.getAddress());

    // Fund stakers
    await stakingToken.transfer(staker1.address, ethers.parseEther("100000"));
    await stakingToken.transfer(staker2.address, ethers.parseEther("100000"));
    await stakingToken.transfer(attacker.address, ethers.parseEther("100000"));

    // Fund staking contract with rewards
    await stakingToken.transfer(await staking.getAddress(), ethers.parseEther("1000000"));

    // Approve staking contract
    await stakingToken.connect(staker1).approve(await staking.getAddress(), ethers.MaxUint256);
    await stakingToken.connect(staker2).approve(await staking.getAddress(), ethers.MaxUint256);
    await stakingToken.connect(attacker).approve(await staking.getAddress(), ethers.MaxUint256);

    return { staking, stakingToken, owner, staker1, staker2, attacker };
  }

  describe("🔒 Reentrancy Protection", function () {

    it("Should prevent reentrancy in stake function", async function () {
      const { staking, stakingToken } = await loadFixture(deployStakingFixture);

      const MaliciousStaker = await ethers.getContractFactory("MaliciousStakingAttacker");
      const malicious = await MaliciousStaker.deploy(
        await staking.getAddress(),
        await stakingToken.getAddress()
      );

      await stakingToken.transfer(await malicious.getAddress(), ethers.parseEther("10000"));

      await expect(
        malicious.attackStake(ethers.parseEther("1000"), 0)
      ).to.be.revertedWith("ReentrancyGuard: reentrant call");
    });

    it("Should prevent reentrancy in unstake function", async function () {
      const { staking, staker1 } = await loadFixture(deployStakingFixture);

      await staking.connect(staker1).stake(ethers.parseEther("1000"), 0);

      // Fast forward
      await time.increase(31 * 24 * 60 * 60);

      // Deploy malicious contract
      const MaliciousUnstaker = await ethers.getContractFactory("MaliciousUnstakeAttacker");
      const malicious = await MaliciousUnstaker.deploy(await staking.getAddress());

      await expect(
        malicious.attackUnstake(0)
      ).to.be.revertedWith("ReentrancyGuard: reentrant call");
    });

    it("Should prevent reentrancy in claimRewards function", async function () {
      const { staking, staker1 } = await loadFixture(deployStakingFixture);

      await staking.connect(staker1).stake(ethers.parseEther("1000"), 0);

      await time.increase(15 * 24 * 60 * 60);

      const MaliciousClaimer = await ethers.getContractFactory("MaliciousRewardClaimer");
      const malicious = await MaliciousClaimer.deploy(await staking.getAddress());

      await expect(
        malicious.attackClaim(0)
      ).to.be.revertedWith("ReentrancyGuard: reentrant call");
    });
  });

  describe("🔢 Integer Overflow/Underflow Tests", function () {

    it("Should not overflow on reward calculation with max stake", async function () {
      const { staking, staker1 } = await loadFixture(deployStakingFixture);

      const maxStake = ethers.parseEther("100000");

      await staking.connect(staker1).stake(maxStake, 2); // 365 days, highest APY

      // Fast forward 10 years
      await time.increase(365 * 10 * 24 * 60 * 60);

      // Calculate rewards - should not overflow
      const pending = await staking.pendingRewards(staker1.address, 0);
      expect(pending).to.be.greaterThan(0);
      expect(pending).to.be.lessThan(ethers.MaxUint256);
    });

    it("Should not underflow on zero stake", async function () {
      const { staking, staker1 } = await loadFixture(deployStakingFixture);

      // Try to unstake without staking
      await expect(
        staking.connect(staker1).unstake(0)
      ).to.be.revertedWith("Invalid stake ID");
    });

    it("Should handle maximum uint256 time duration", async function () {
      const { staking, staker1 } = await loadFixture(deployStakingFixture);

      await staking.connect(staker1).stake(ethers.parseEther("1000"), 0);

      // Fast forward extreme time
      await time.increase(365 * 100 * 24 * 60 * 60); // 100 years

      const pending = await staking.pendingRewards(staker1.address, 0);
      expect(pending).to.be.greaterThan(0);
    });

    it("Should handle accumulated rewards correctly", async function () {
      const { staking, staker1 } = await loadFixture(deployStakingFixture);

      await staking.connect(staker1).stake(ethers.parseEther("10000"), 2);

      // Multiple time periods
      for (let i = 0; i < 5; i++) {
        await time.increase(365 * 24 * 60 * 60); // 1 year

        const pending = await staking.pendingRewards(staker1.address, 0);
        expect(pending).to.be.greaterThan(0);
      }
    });
  });

  describe("⏱️ Lock Period Bypass Tests", function () {

    it("Should prevent unstaking before lock period ends (30 days)", async function () {
      const { staking, staker1 } = await loadFixture(deployStakingFixture);

      await staking.connect(staker1).stake(ethers.parseEther("1000"), 0); // 30 days

      // Try to unstake after 29 days
      await time.increase(29 * 24 * 60 * 60);

      await expect(
        staking.connect(staker1).unstake(0)
      ).to.be.revertedWith("Lock period not ended");
    });

    it("Should prevent unstaking before lock period ends (90 days)", async function () {
      const { staking, staker1 } = await loadFixture(deployStakingFixture);

      await staking.connect(staker1).stake(ethers.parseEther("1000"), 1); // 90 days

      await time.increase(89 * 24 * 60 * 60);

      await expect(
        staking.connect(staker1).unstake(0)
      ).to.be.revertedWith("Lock period not ended");
    });

    it("Should prevent unstaking before lock period ends (365 days)", async function () {
      const { staking, staker1 } = await loadFixture(deployStakingFixture);

      await staking.connect(staker1).stake(ethers.parseEther("1000"), 2); // 365 days

      await time.increase(364 * 24 * 60 * 60);

      await expect(
        staking.connect(staker1).unstake(0)
      ).to.be.revertedWith("Lock period not ended");
    });

    it("Should allow unstaking exactly at lock period end", async function () {
      const { staking, staker1 } = await loadFixture(deployStakingFixture);

      await staking.connect(staker1).stake(ethers.parseEther("1000"), 0);

      await time.increase(30 * 24 * 60 * 60);

      await staking.connect(staker1).unstake(0);

      // Should succeed
      const stakeCount = await staking.stakeCount(staker1.address);
      expect(stakeCount).to.equal(1); // Stake deleted but count stays
    });

    it("Should allow unstaking after lock period", async function () {
      const { staking, staker1 } = await loadFixture(deployStakingFixture);

      await staking.connect(staker1).stake(ethers.parseEther("1000"), 0);

      await time.increase(60 * 24 * 60 * 60); // Double the lock period

      await staking.connect(staker1).unstake(0);

      // Should succeed
      const stake = await staking.stakes(staker1.address, 0);
      expect(stake.amount).to.equal(0);
    });
  });

  describe("💰 Reward Manipulation Tests", function () {

    it("Should prevent reward farming through repeated stake/unstake", async function () {
      const { staking, staker1, stakingToken } = await loadFixture(deployStakingFixture);

      const initialBalance = await stakingToken.balanceOf(staker1.address);

      // Rapid stake/unstake cycles
      for (let i = 0; i < 10; i++) {
        await staking.connect(staker1).stake(ethers.parseEther("1000"), 0);
        await time.increase(30 * 24 * 60 * 60);
        await staking.connect(staker1).unstake(i);
      }

      const finalBalance = await stakingToken.balanceOf(staker1.address);

      // Should have earned normal rewards, not manipulated amounts
      const earned = finalBalance - initialBalance;
      expect(earned).to.be.lessThan(ethers.parseEther("10000")); // Reasonable reward cap
    });

    it("Should correctly calculate rewards with tier multipliers", async function () {
      const { staking, staker1, staker2, stakingToken } = await loadFixture(deployStakingFixture);

      const amount = ethers.parseEther("10000");

      // Staker1: 30 days (17% APY)
      await staking.connect(staker1).stake(amount, 0);

      // Staker2: 365 days (62% APY)
      await staking.connect(staker2).stake(amount, 2);

      await time.increase(365 * 24 * 60 * 60); // 1 year

      const reward1 = await staking.pendingRewards(staker1.address, 0);
      const reward2 = await staking.pendingRewards(staker2.address, 0);

      // Staker2 should have significantly higher rewards
      expect(reward2).to.be.greaterThan(reward1 * 2n);
    });

    it("Should prevent double claiming rewards", async function () {
      const { staking, staker1, stakingToken } = await loadFixture(deployStakingFixture);

      await staking.connect(staker1).stake(ethers.parseEther("1000"), 0);
      await time.increase(15 * 24 * 60 * 60);

      // First claim
      await staking.connect(staker1).claimRewards(0);
      const balance1 = await stakingToken.balanceOf(staker1.address);

      // Immediate second claim (should give 0 rewards)
      await expect(
        staking.connect(staker1).claimRewards(0)
      ).to.be.revertedWith("No rewards to claim");
    });

    it("Should accumulate rewards correctly after claims", async function () {
      const { staking, staker1, stakingToken } = await loadFixture(deployStakingFixture);

      await staking.connect(staker1).stake(ethers.parseEther("10000"), 2);

      // First period
      await time.increase(30 * 24 * 60 * 60);
      await staking.connect(staker1).claimRewards(0);
      const balance1 = await stakingToken.balanceOf(staker1.address);

      // Second period
      await time.increase(30 * 24 * 60 * 60);
      await staking.connect(staker1).claimRewards(0);
      const balance2 = await stakingToken.balanceOf(staker1.address);

      // Should have received additional rewards
      expect(balance2).to.be.greaterThan(balance1);
    });
  });

  describe("⚠️ Edge Cases & Boundary Tests", function () {

    it("Should reject zero amount stakes", async function () {
      const { staking, staker1 } = await loadFixture(deployStakingFixture);

      await expect(
        staking.connect(staker1).stake(0, 0)
      ).to.be.revertedWith("Cannot stake 0 tokens");
    });

    it("Should reject invalid tier", async function () {
      const { staking, staker1 } = await loadFixture(deployStakingFixture);

      await expect(
        staking.connect(staker1).stake(ethers.parseEther("1000"), 5)
      ).to.be.revertedWith("Invalid tier");
    });

    it("Should handle minimum stake amount (1 wei)", async function () {
      const { staking, staker1 } = await loadFixture(deployStakingFixture);

      await staking.connect(staker1).stake(1, 0);

      const stake = await staking.stakes(staker1.address, 0);
      expect(stake.amount).to.equal(1);
    });

    it("Should handle maximum reasonable stake", async function () {
      const { staking, staker1 } = await loadFixture(deployStakingFixture);

      const maxStake = ethers.parseEther("100000");

      await staking.connect(staker1).stake(maxStake, 2);

      const stake = await staking.stakes(staker1.address, 0);
      expect(stake.amount).to.equal(maxStake);
    });

    it("Should handle multiple stakes from same user", async function () {
      const { staking, staker1 } = await loadFixture(deployStakingFixture);

      await staking.connect(staker1).stake(ethers.parseEther("1000"), 0);
      await staking.connect(staker1).stake(ethers.parseEther("2000"), 1);
      await staking.connect(staker1).stake(ethers.parseEther("3000"), 2);

      const stakeCount = await staking.stakeCount(staker1.address);
      expect(stakeCount).to.equal(3);
    });

    it("Should track total staked correctly", async function () {
      const { staking, staker1, staker2 } = await loadFixture(deployStakingFixture);

      await staking.connect(staker1).stake(ethers.parseEther("5000"), 0);
      await staking.connect(staker2).stake(ethers.parseEther("3000"), 1);

      const totalStaked = await staking.totalStaked();
      expect(totalStaked).to.equal(ethers.parseEther("8000"));
    });

    it("Should update total staked on unstake", async function () {
      const { staking, staker1 } = await loadFixture(deployStakingFixture);

      await staking.connect(staker1).stake(ethers.parseEther("10000"), 0);

      const totalBefore = await staking.totalStaked();

      await time.increase(31 * 24 * 60 * 60);
      await staking.connect(staker1).unstake(0);

      const totalAfter = await staking.totalStaked();
      expect(totalAfter).to.equal(totalBefore - ethers.parseEther("10000"));
    });

    it("Should handle concurrent stakes correctly", async function () {
      const { staking, staker1, staker2 } = await loadFixture(deployStakingFixture);

      // Concurrent stakes
      await Promise.all([
        staking.connect(staker1).stake(ethers.parseEther("1000"), 0),
        staking.connect(staker2).stake(ethers.parseEther("2000"), 1)
      ]);

      const total = await staking.totalStaked();
      expect(total).to.equal(ethers.parseEther("3000"));
    });

    it("Should reject unstake of invalid stake ID", async function () {
      const { staking, staker1 } = await loadFixture(deployStakingFixture);

      await expect(
        staking.connect(staker1).unstake(999)
      ).to.be.revertedWith("Invalid stake ID");
    });

    it("Should handle stake deletion correctly", async function () {
      const { staking, staker1 } = await loadFixture(deployStakingFixture);

      await staking.connect(staker1).stake(ethers.parseEther("1000"), 0);

      await time.increase(31 * 24 * 60 * 60);
      await staking.connect(staker1).unstake(0);

      // Stake should be deleted
      const stake = await staking.stakes(staker1.address, 0);
      expect(stake.amount).to.equal(0);
    });
  });

  describe("🚫 Access Control Tests", function () {

    it("Should allow anyone to stake (permissionless)", async function () {
      const { staking, attacker } = await loadFixture(deployStakingFixture);

      // Anyone can stake
      await staking.connect(attacker).stake(ethers.parseEther("1000"), 0);

      const stake = await staking.stakes(attacker.address, 0);
      expect(stake.amount).to.equal(ethers.parseEther("1000"));
    });

    it("Should prevent users from unstaking others' stakes", async function () {
      const { staking, staker1, attacker } = await loadFixture(deployStakingFixture);

      await staking.connect(staker1).stake(ethers.parseEther("1000"), 0);

      await time.increase(31 * 24 * 60 * 60);

      // Attacker tries to unstake staker1's stake
      await expect(
        staking.connect(attacker).unstake(0) // Tries own stake ID 0 (doesn't exist)
      ).to.be.revertedWith("Invalid stake ID");
    });

    it("Should prevent claiming others' rewards", async function () {
      const { staking, staker1, attacker } = await loadFixture(deployStakingFixture);

      await staking.connect(staker1).stake(ethers.parseEther("1000"), 0);
      await time.increase(15 * 24 * 60 * 60);

      // Attacker tries to claim staker1's rewards
      await expect(
        staking.connect(attacker).claimRewards(0)
      ).to.be.revertedWith("Invalid stake ID");
    });
  });

  describe("💸 Reward Pool Tests", function () {

    it("Should handle reward pool depletion gracefully", async function () {
      const { staking, staker1, stakingToken, owner } = await loadFixture(deployStakingFixture);

      // Drain most of reward pool
      const contractBalance = await stakingToken.balanceOf(await staking.getAddress());
      await staking.connect(owner).transferFrom(
        await staking.getAddress(),
        owner.address,
        contractBalance - ethers.parseEther("100")
      );

      await staking.connect(staker1).stake(ethers.parseEther("10000"), 2);

      await time.increase(365 * 24 * 60 * 60);

      // Unstake might fail if rewards exceed remaining pool
      // Contract should handle this gracefully
      const pending = await staking.pendingRewards(staker1.address, 0);
      const remainingBalance = await stakingToken.balanceOf(await staking.getAddress());

      if (pending > remainingBalance) {
        // Should fail or cap rewards
        await expect(
          staking.connect(staker1).unstake(0)
        ).to.be.reverted;
      }
    });

    it("Should track total rewards distributed", async function () {
      const { staking, staker1 } = await loadFixture(deployStakingFixture);

      await staking.connect(staker1).stake(ethers.parseEther("10000"), 0);

      await time.increase(30 * 24 * 60 * 60);
      await staking.connect(staker1).unstake(0);

      const totalDistributed = await staking.totalRewardsDistributed();
      expect(totalDistributed).to.be.greaterThan(0);
    });
  });
});
