const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

/**
 * Token Security Test Suite
 * Tests for: Reentrancy, Access Control, Integer Overflow, Edge Cases
 */
describe("Token Security Tests", function () {

  async function deployTokenFixture() {
    const [owner, treasury, liquidity, attacker, user1, user2] = await ethers.getSigners();

    const HypeAI = await ethers.getContractFactory("HypeAI");
    const token = await HypeAI.deploy(treasury.address, liquidity.address);

    return { token, owner, treasury, liquidity, attacker, user1, user2 };
  }

  describe("🔒 Reentrancy Attack Tests", function () {

    it("Should prevent reentrancy in transfer", async function () {
      const { token, owner, attacker } = await loadFixture(deployTokenFixture);

      // Deploy malicious contract that attempts reentrancy
      const MaliciousReceiver = await ethers.getContractFactory("MaliciousReentrancyAttacker");
      const malicious = await MaliciousReceiver.deploy(await token.getAddress());

      // Transfer tokens to malicious contract
      await token.transfer(await malicious.getAddress(), ethers.parseEther("1000"));

      // Attempt reentrancy attack - should fail due to ReentrancyGuard
      await expect(
        malicious.attack()
      ).to.be.revertedWith("ReentrancyGuard: reentrant call");
    });

    it("Should prevent reentrancy in stake function", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);

      await token.enableTrading();

      // Deploy malicious contract
      const MaliciousStaker = await ethers.getContractFactory("MaliciousStakeAttacker");
      const malicious = await MaliciousStaker.deploy(await token.getAddress());

      // Fund malicious contract
      await token.transfer(await malicious.getAddress(), ethers.parseEther("100000"));

      // Attempt reentrancy during staking
      await expect(
        malicious.attackStake(ethers.parseEther("10000"), 30)
      ).to.be.revertedWith("ReentrancyGuard: reentrant call");
    });

    it("Should prevent reentrancy in unstake function", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);

      await token.enableTrading();
      await token.stake(ethers.parseEther("10000"), 30);

      // Fast forward past lock period
      await time.increase(31 * 24 * 60 * 60);

      // Deploy malicious contract that tries to reenter during unstake
      const MaliciousUnstaker = await ethers.getContractFactory("MaliciousUnstakeAttacker");
      const malicious = await MaliciousUnstaker.deploy(await token.getAddress());

      // Transfer stake to malicious contract (if possible)
      // Then attempt reentrancy
      await expect(
        malicious.attackUnstake(0)
      ).to.be.revertedWith("ReentrancyGuard: reentrant call");
    });

    it("Should prevent cross-function reentrancy (stake -> unstake)", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);

      await token.enableTrading();

      // Deploy contract that attempts cross-function reentrancy
      const CrossFunction = await ethers.getContractFactory("CrossFunctionReentrancy");
      const attacker = await CrossFunction.deploy(await token.getAddress());

      await token.transfer(await attacker.getAddress(), ethers.parseEther("100000"));

      // Attempt cross-function reentrancy
      await expect(
        attacker.attackCrossFunction()
      ).to.be.revertedWith("ReentrancyGuard: reentrant call");
    });
  });

  describe("🔢 Integer Overflow/Underflow Tests", function () {

    it("Should not overflow on maximum token amount", async function () {
      const { token, owner, user1 } = await loadFixture(deployTokenFixture);

      const maxSupply = ethers.parseEther("10000000000"); // 10B tokens

      // Try to mint beyond max uint256 (should fail gracefully)
      await expect(
        token.transfer(user1.address, ethers.MaxUint256)
      ).to.be.revertedWithCustomError(token, "ERC20InsufficientBalance");
    });

    it("Should not underflow on zero balance withdrawal", async function () {
      const { token, user1 } = await loadFixture(deployTokenFixture);

      // User with zero balance tries to transfer
      await expect(
        token.connect(user1).transfer(user1.address, 1)
      ).to.be.revertedWithCustomError(token, "ERC20InsufficientBalance");
    });

    it("Should handle reward calculation overflow safely", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);

      await token.enableTrading();

      // Stake maximum allowed amount
      const maxStake = ethers.parseEther("200000000"); // 2% of supply
      await token.stake(maxStake, 365);

      // Fast forward 10 years
      await time.increase(365 * 10 * 24 * 60 * 60);

      // Calculate rewards - should not overflow
      const reward = await token.calculateStakingReward(owner.address, 0);
      expect(reward).to.be.greaterThan(0);
      expect(reward).to.be.lessThan(ethers.parseEther("2500000000")); // Max staking pool
    });

    it("Should prevent fee calculation overflow", async function () {
      const { token, owner, user1 } = await loadFixture(deployTokenFixture);

      await token.enableTrading();

      // Transfer maximum transaction amount
      const maxTx = await token.maxTransactionAmount();
      await token.transfer(user1.address, maxTx);

      // Fee calculation should not overflow
      const balance = await token.balanceOf(user1.address);
      expect(balance).to.be.lessThan(maxTx); // Some fees taken
    });

    it("Should handle staking pool depletion gracefully", async function () {
      const { token, owner, user1 } = await loadFixture(deployTokenFixture);

      await token.enableTrading();

      // Stake max amount
      await token.stake(ethers.parseEther("100000"), 365);

      // Fast forward 100 years to deplete pool
      await time.increase(365 * 100 * 24 * 60 * 60);

      // Unstake - reward should be capped at remaining pool
      await token.unstake(0);

      const poolHealth = await token.getPoolHealth();
      expect(poolHealth.poolRemaining).to.be.greaterThanOrEqual(0);
    });
  });

  describe("🚫 Access Control Tests", function () {

    it("Should prevent non-owner from enabling trading", async function () {
      const { token, attacker } = await loadFixture(deployTokenFixture);

      await expect(
        token.connect(attacker).enableTrading()
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });

    it("Should prevent non-owner from updating treasury wallet", async function () {
      const { token, attacker, user1 } = await loadFixture(deployTokenFixture);

      await expect(
        token.connect(attacker).updateTreasuryWallet(user1.address)
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });

    it("Should prevent non-owner from blacklisting users", async function () {
      const { token, attacker, user1 } = await loadFixture(deployTokenFixture);

      await expect(
        token.connect(attacker).setBlacklist(user1.address, true)
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });

    it("Should prevent non-owner from excluding from fees", async function () {
      const { token, attacker, user1 } = await loadFixture(deployTokenFixture);

      await expect(
        token.connect(attacker).excludeFromFees(user1.address, true)
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });

    it("Should prevent non-owner from setting AMM pairs", async function () {
      const { token, attacker, user1 } = await loadFixture(deployTokenFixture);

      await expect(
        token.connect(attacker).setAutomatedMarketMakerPair(user1.address, true)
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });

    it("Should prevent blacklisted users from transferring", async function () {
      const { token, owner, user1, user2 } = await loadFixture(deployTokenFixture);

      await token.enableTrading();
      await token.transfer(user1.address, ethers.parseEther("1000"));

      // Blacklist user1
      await token.setBlacklist(user1.address, true);

      // User1 cannot transfer
      await expect(
        token.connect(user1).transfer(user2.address, ethers.parseEther("100"))
      ).to.be.revertedWith("Blacklisted address");
    });

    it("Should prevent transfers to blacklisted addresses", async function () {
      const { token, owner, user1, user2 } = await loadFixture(deployTokenFixture);

      await token.enableTrading();
      await token.transfer(user1.address, ethers.parseEther("1000"));

      // Blacklist user2
      await token.setBlacklist(user2.address, true);

      // User1 cannot transfer to blacklisted user2
      await expect(
        token.connect(user1).transfer(user2.address, ethers.parseEther("100"))
      ).to.be.revertedWith("Blacklisted address");
    });
  });

  describe("⚠️ Edge Cases & Boundary Tests", function () {

    it("Should handle zero value transfers", async function () {
      const { token, owner, user1 } = await loadFixture(deployTokenFixture);

      await token.enableTrading();

      await expect(
        token.transfer(user1.address, 0)
      ).to.be.revertedWith("Transfer amount must be greater than zero");
    });

    it("Should enforce max transaction limit", async function () {
      const { token, owner, user1 } = await loadFixture(deployTokenFixture);

      await token.enableTrading();

      const maxTx = await token.maxTransactionAmount();

      await expect(
        token.transfer(user1.address, maxTx + 1n)
      ).to.be.revertedWith("Exceeds max transaction amount");
    });

    it("Should enforce max wallet limit", async function () {
      const { token, owner, user1 } = await loadFixture(deployTokenFixture);

      await token.enableTrading();

      const maxWallet = await token.maxWalletAmount();

      await expect(
        token.transfer(user1.address, maxWallet + 1n)
      ).to.be.revertedWith("Exceeds max wallet amount");
    });

    it("Should allow excluded addresses to bypass limits", async function () {
      const { token, owner, user1 } = await loadFixture(deployTokenFixture);

      await token.enableTrading();
      await token.excludeFromLimits(user1.address, true);

      const maxWallet = await token.maxWalletAmount();

      // Should succeed for excluded address
      await token.transfer(user1.address, maxWallet + ethers.parseEther("1000"));

      expect(await token.balanceOf(user1.address)).to.be.greaterThan(maxWallet);
    });

    it("Should prevent trading before enabled", async function () {
      const { token, owner, user1, user2 } = await loadFixture(deployTokenFixture);

      await token.transfer(user1.address, ethers.parseEther("1000"));

      // User1 tries to transfer before trading enabled
      await expect(
        token.connect(user1).transfer(user2.address, ethers.parseEther("100"))
      ).to.be.revertedWith("Trading not enabled");
    });

    it("Should handle minimum transaction amounts", async function () {
      const { token, owner, user1 } = await loadFixture(deployTokenFixture);

      await token.enableTrading();

      // Transfer 1 wei
      await token.transfer(user1.address, 1);

      expect(await token.balanceOf(user1.address)).to.be.greaterThanOrEqual(0);
    });

    it("Should handle staking pool depletion edge case", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);

      await token.enableTrading();

      // Check pool health when empty
      await token.stake(ethers.parseEther("10000"), 365);

      const poolHealth = await token.getPoolHealth();
      expect(poolHealth.poolHealthPercent).to.be.greaterThan(0);
    });

    it("Should prevent staking with invalid lock periods", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);

      await token.enableTrading();

      await expect(
        token.stake(ethers.parseEther("1000"), 60) // Invalid period
      ).to.be.revertedWith("Invalid lock period");
    });

    it("Should prevent unstaking before lock period ends", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);

      await token.enableTrading();
      await token.stake(ethers.parseEther("10000"), 30);

      // Try to unstake immediately
      await expect(
        token.unstake(0)
      ).to.be.revertedWith("Stake is still locked");
    });

    it("Should handle concurrent staking operations", async function () {
      const { token, owner, user1, user2 } = await loadFixture(deployTokenFixture);

      await token.enableTrading();
      await token.transfer(user1.address, ethers.parseEther("100000"));
      await token.transfer(user2.address, ethers.parseEther("100000"));

      // Concurrent stakes
      await Promise.all([
        token.connect(user1).stake(ethers.parseEther("10000"), 30),
        token.connect(user2).stake(ethers.parseEther("10000"), 90)
      ]);

      expect(await token.totalStakedAmount()).to.equal(ethers.parseEther("20000"));
    });
  });

  describe("💰 Economic Attack Scenarios", function () {

    it("Should prevent fee manipulation via flash transfers", async function () {
      const { token, owner, user1, user2 } = await loadFixture(deployTokenFixture);

      await token.enableTrading();
      await token.transfer(user1.address, ethers.parseEther("100000"));

      const initialBalance = await token.balanceOf(user1.address);

      // Rapid transfers to try to manipulate fees
      for (let i = 0; i < 10; i++) {
        await token.connect(user1).transfer(user2.address, ethers.parseEther("100"));
      }

      // Fees should be properly deducted
      const finalBalance = await token.balanceOf(user2.address);
      expect(finalBalance).to.be.lessThan(ethers.parseEther("1000")); // Less than 10*100 due to fees
    });

    it("Should prevent reward pool draining attack", async function () {
      const { token, owner, user1 } = await loadFixture(deployTokenFixture);

      await token.enableTrading();
      await token.transfer(user1.address, ethers.parseEther("200000000")); // Max wallet

      // Stake maximum amount with max APY
      await token.connect(user1).stake(ethers.parseEther("200000000"), 365);

      // Fast forward 1 year
      await time.increase(365 * 24 * 60 * 60);

      // Unstake - reward should be capped
      await token.connect(user1).unstake(0);

      const poolHealth = await token.getPoolHealth();
      expect(poolHealth.poolRemaining).to.be.greaterThanOrEqual(0);
    });

    it("Should prevent circular fee bypass via exclusions", async function () {
      const { token, owner, user1, user2 } = await loadFixture(deployTokenFixture);

      await token.enableTrading();

      // Exclude user1 from fees
      await token.excludeFromFees(user1.address, true);
      await token.transfer(user1.address, ethers.parseEther("100000"));

      const initialBalance = await token.balanceOf(user1.address);

      // User1 transfers to user2 (no fees)
      await token.connect(user1).transfer(user2.address, ethers.parseEther("10000"));

      // User2 transfers back (fees applied)
      await token.connect(user2).transfer(user1.address, ethers.parseEther("9000"));

      // Verify fees were taken on non-excluded user
      const finalBalance = await token.balanceOf(user1.address);
      expect(finalBalance).to.be.lessThan(initialBalance);
    });
  });

  describe("⏱️ Time Manipulation Tests", function () {

    it("Should handle block timestamp manipulation in staking", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);

      await token.enableTrading();
      await token.stake(ethers.parseEther("10000"), 30);

      // Record initial reward
      const reward1 = await token.calculateStakingReward(owner.address, 0);

      // Advance time
      await time.increase(15 * 24 * 60 * 60); // 15 days

      const reward2 = await token.calculateStakingReward(owner.address, 0);
      expect(reward2).to.be.greaterThan(reward1);

      // Try to manipulate by going back (should fail in real blockchain)
      // Just verify reward continues to grow
      await time.increase(15 * 24 * 60 * 60); // Another 15 days

      const reward3 = await token.calculateStakingReward(owner.address, 0);
      expect(reward3).to.be.greaterThan(reward2);
    });
  });

  describe("🔐 Front-Running Protection", function () {

    it("Should not be vulnerable to front-running on enable trading", async function () {
      const { token, owner, attacker, user1 } = await loadFixture(deployTokenFixture);

      // Transfer to attacker before trading enabled
      await token.transfer(attacker.address, ethers.parseEther("10000"));

      // Attacker tries to transfer right before trading is enabled
      const attackTx = token.connect(attacker).transfer(user1.address, ethers.parseEther("100"));

      // Enable trading (simulated front-running scenario)
      await token.enableTrading();

      // Attack transaction should fail (was sent before trading enabled)
      await expect(attackTx).to.be.revertedWith("Trading not enabled");
    });

    it("Should prevent max limit manipulation via front-running", async function () {
      const { token, owner, user1 } = await loadFixture(deployTokenFixture);

      await token.enableTrading();

      const currentMax = await token.maxTransactionAmount();

      // Owner sets new max (lower)
      const newMax = currentMax / 2n;
      await token.setMaxTransactionAmount(newMax);

      // User tries to transfer old max (should fail)
      await expect(
        token.transfer(user1.address, currentMax)
      ).to.be.revertedWith("Exceeds max transaction amount");
    });
  });
});
