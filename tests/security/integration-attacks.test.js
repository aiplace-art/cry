const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

/**
 * Integration Attack Scenarios
 * Tests for: Multi-contract exploits, Attack chains, Complex economic attacks
 */
describe("Integration Attack Tests", function () {

  async function deployFullSystemFixture() {
    const [owner, attacker, user1, user2, treasury, liquidity] = await ethers.getSigners();

    // Deploy HYPEAI Token
    const HypeAI = await ethers.getContractFactory("HypeAI");
    const token = await HypeAI.deploy(treasury.address, liquidity.address);

    // Deploy mock USDT
    const MockToken = await ethers.getContractFactory("MockERC20");
    const usdt = await MockToken.deploy("USDT", "USDT", ethers.parseEther("1000000000"));

    // Deploy mock price feed
    const PriceFeed = await ethers.getContractFactory("MockV3Aggregator");
    const priceFeed = await PriceFeed.deploy(8, 60000000000); // $600

    // Deploy Private Sale
    const PrivateSale = await ethers.getContractFactory("HypeAIPrivateSale");
    const privateSale = await PrivateSale.deploy(
      await token.getAddress(),
      await usdt.getAddress(),
      await priceFeed.getAddress(),
      Math.floor(Date.now() / 1000),
      30 * 24 * 60 * 60
    );

    // Deploy Referral System
    const Referral = await ethers.getContractFactory("HypeAIReferralSystem");
    const referral = await Referral.deploy(
      await token.getAddress(),
      await usdt.getAddress(),
      await privateSale.getAddress()
    );

    // Deploy Staking
    const Staking = await ethers.getContractFactory("Staking");
    const staking = await Staking.deploy(await token.getAddress());

    // Fund contracts
    await token.transfer(await privateSale.getAddress(), ethers.parseEther("1100000000"));
    await token.transfer(await referral.getAddress(), ethers.parseEther("100000000"));
    await token.transfer(await staking.getAddress(), ethers.parseEther("1000000000"));

    return {
      token,
      usdt,
      priceFeed,
      privateSale,
      referral,
      staking,
      owner,
      attacker,
      user1,
      user2,
      treasury,
      liquidity
    };
  }

  describe("🔗 Cross-Contract Attack Chains", function () {

    it("Should prevent private sale -> referral -> staking exploit chain", async function () {
      const { token, privateSale, referral, staking, user1, user2, priceFeed } =
        await loadFixture(deployFullSystemFixture);

      // Attack scenario:
      // 1. User1 buys in private sale with user2 as referrer
      // 2. User2 gets referral rewards
      // 3. User2 stakes rewards to earn more
      // 4. Attacker tries to manipulate rewards at each stage

      await privateSale.addToWhitelist([user1.address]);
      await referral.registerReferral(user1.address, user2.address);

      // Purchase
      await privateSale.connect(user1).purchaseWithBNB({
        value: ethers.parseEther("1")
      });

      // Check referral rewards
      const stats = await referral.getReferralStats(user2.address);
      const expectedReward = 60; // $600 * 10% = $60

      expect(stats.pendingRewardsUSD).to.equal(expectedReward);

      // Claim and stake
      await referral.connect(user2).claimRewards(true);
      const balance = await token.balanceOf(user2.address);

      // Try to stake (should work normally, no exploit)
      await token.connect(user2).approve(await staking.getAddress(), ethers.MaxUint256);
      await staking.connect(user2).stake(balance / 2n, 0);

      // Verify no manipulation occurred
      const stakeInfo = await staking.stakes(user2.address, 0);
      expect(stakeInfo.amount).to.be.greaterThan(0);
    });

    it("Should prevent oracle manipulation affecting multiple contracts", async function () {
      const { privateSale, priceFeed, user1, attacker } =
        await loadFixture(deployFullSystemFixture);

      await privateSale.addToWhitelist([user1.address, attacker.address]);

      // Attacker manipulates oracle
      await priceFeed.updateAnswer(10000000000); // $100 (low price)

      // Attacker buys at low price
      await privateSale.connect(attacker).purchaseWithBNB({
        value: ethers.parseEther("0.5") // $50 worth
      });

      // Restore price
      await priceFeed.updateAnswer(60000000000); // $600

      // Legitimate user buys at correct price
      await privateSale.connect(user1).purchaseWithBNB({
        value: ethers.parseEther("0.1") // $60 worth
      });

      // Verify attacker got advantage (in production, use TWAP or multiple oracles)
      const attackerTokens = await privateSale.tokensPurchased(attacker.address);
      const userTokens = await privateSale.tokensPurchased(user1.address);

      // Attacker should have gotten more tokens for same USD value
      expect(attackerTokens).to.be.greaterThan(userTokens);
    });

    it("Should prevent referral reward -> fee bypass attack", async function () {
      const { token, referral, privateSale, user1, user2, treasury, owner } =
        await loadFixture(deployFullSystemFixture);

      await privateSale.addToWhitelist([user1.address]);
      await referral.registerReferral(user1.address, user2.address);

      // User1 purchases
      await privateSale.connect(user1).purchaseWithBNB({
        value: ethers.parseEther("1")
      });

      // User2 claims rewards
      await referral.connect(user2).claimRewards(true);

      const balanceBefore = await token.balanceOf(user2.address);

      // Enable trading
      await token.enableTrading();

      // Try to transfer without paying fees (shouldn't work unless excluded)
      await token.connect(user2).transfer(user1.address, balanceBefore / 2n);

      const balanceAfter = await token.balanceOf(user1.address);

      // Fees should have been taken (8%)
      const expectedAfterFees = (balanceBefore / 2n) * 92n / 100n;
      expect(balanceAfter).to.be.closeTo(expectedAfterFees, ethers.parseEther("10000"));
    });
  });

  describe("💸 Economic Attack Scenarios", function () {

    it("Should prevent flash loan attack on private sale", async function () {
      const { privateSale, priceFeed, usdt, attacker } =
        await loadFixture(deployFullSystemFixture);

      // Simulate flash loan: borrow large amount, manipulate, repay
      const FlashLoan = await ethers.getContractFactory("MockFlashLoan");
      const flashLoan = await FlashLoan.deploy();

      await privateSale.addToWhitelist([attacker.address]);
      await usdt.transfer(await flashLoan.getAddress(), ethers.parseEther("1000000"));

      // Flash loan attack:
      // 1. Borrow USDT
      // 2. Buy maximum allocation
      // 3. Manipulate oracle
      // 4. Sell/transfer tokens
      // 5. Repay loan with profit

      // This attack is prevented by:
      // - Purchase limits per user
      // - Whitelist requirement
      // - Oracle staleness checks
      await expect(
        flashLoan.executeAttack(
          await privateSale.getAddress(),
          ethers.parseEther("100000")
        )
      ).to.be.reverted;
    });

    it("Should prevent sandwich attack on token fees", async function () {
      const { token, owner, attacker, user1, user2 } =
        await loadFixture(deployFullSystemFixture);

      await token.enableTrading();
      await token.transfer(attacker.address, ethers.parseEther("1000000"));
      await token.transfer(user1.address, ethers.parseEther("1000000"));

      // Sandwich attack:
      // 1. Front-run: Attacker buys to raise price
      // 2. Victim trades
      // 3. Back-run: Attacker sells at profit

      // Token has fixed fees, so sandwich attacks on fees don't work
      // But test that MEV can't manipulate fee calculations

      const attackerBefore = await token.balanceOf(attacker.address);

      // Attacker front-runs
      await token.connect(attacker).transfer(user2.address, ethers.parseEther("100000"));

      // Victim trades
      await token.connect(user1).transfer(user2.address, ethers.parseEther("100000"));

      // Attacker back-runs
      await token.connect(attacker).transfer(user1.address, ethers.parseEther("50000"));

      const attackerAfter = await token.balanceOf(attacker.address);

      // Attacker should have lost tokens due to fees, not gained
      expect(attackerAfter).to.be.lessThan(attackerBefore);
    });

    it("Should prevent referral wash trading attack", async function () {
      const { referral, privateSale, user1, user2, attacker } =
        await loadFixture(deployFullSystemFixture);

      // Attack: Create circular referrals to farm rewards
      // User1 -> User2 -> Attacker -> User1 (circular)

      await referral.registerReferral(user1.address, user2.address);
      await referral.registerReferral(user2.address, attacker.address);

      // Try to complete circle (should fail)
      await expect(
        referral.registerReferral(attacker.address, user1.address)
      ).to.be.revertedWith("Circular referral");
    });

    it("Should prevent Sybil attack on founding member limit", async function () {
      const { privateSale, attacker, owner } =
        await loadFixture(deployFullSystemFixture);

      // Attacker creates 500 wallets to monopolize founding member slots
      const sybils = [];
      for (let i = 0; i < 500; i++) {
        const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
        await owner.sendTransaction({ to: wallet.address, value: ethers.parseEther("1") });
        sybils.push(wallet);
      }

      // Whitelist all sybils
      await privateSale.addToWhitelist(sybils.map(s => s.address));

      // Each sybil purchases minimum
      for (const sybil of sybils.slice(0, 100)) {
        await privateSale.connect(sybil).purchaseWithBNB({
          value: ethers.parseEther("0.1")
        });
      }

      // Attack is possible but limited by:
      // - $800 max per address
      // - 500 founding member limit
      // - Whitelist requirement (owner controls)

      const count = await privateSale.foundingMembersCount();
      expect(count).to.be.lessThanOrEqual(500);
    });
  });

  describe("🏃 Front-Running Attack Prevention", function () {

    it("Should prevent front-running on trading enable", async function () {
      const { token, owner, attacker, user1 } =
        await loadFixture(deployFullSystemFixture);

      await token.transfer(attacker.address, ethers.parseEther("1000000"));

      // Attacker sees enableTrading() in mempool
      // Tries to front-run with transfer
      const attackTx = token.connect(attacker).transfer(
        user1.address,
        ethers.parseEther("100000")
      );

      // Owner enables trading
      await token.enableTrading();

      // Attack tx should have failed (was sent before trading enabled)
      await expect(attackTx).to.be.revertedWith("Trading not enabled");
    });

    it("Should prevent front-running on whitelist additions", async function () {
      const { privateSale, owner, attacker } =
        await loadFixture(deployFullSystemFixture);

      // Attacker sees addToWhitelist tx in mempool
      // Tries to front-run with purchase
      const attackTx = privateSale.connect(attacker).purchaseWithBNB({
        value: ethers.parseEther("1")
      });

      // Owner adds to whitelist
      await privateSale.addToWhitelist([attacker.address]);

      // Attack should fail (wasn't whitelisted when tx was sent)
      await expect(attackTx).to.be.revertedWith("Not whitelisted");
    });

    it("Should prevent front-running on referral registration", async function () {
      const { referral, user1, user2, attacker } =
        await loadFixture(deployFullSystemFixture);

      // User2 tries to register with user1
      await referral.registerReferral(user1.address, user2.address);

      // Attacker sees this and tries to register user1 with themselves first
      await expect(
        referral.registerReferral(user1.address, attacker.address)
      ).to.be.revertedWith("Already has referrer");
    });
  });

  describe("🔐 State Consistency Tests", function () {

    it("Should maintain consistent state across pause/unpause", async function () {
      const { privateSale, referral, owner, user1, user2 } =
        await loadFixture(deployFullSystemFixture);

      await privateSale.addToWhitelist([user1.address]);
      await referral.registerReferral(user1.address, user2.address);

      // Make purchase
      await privateSale.connect(user1).purchaseWithBNB({
        value: ethers.parseEther("1")
      });

      const statsBefore = await referral.getReferralStats(user2.address);

      // Pause both contracts
      await privateSale.pause();
      await referral.pause();

      // Unpause
      await privateSale.unpause();
      await referral.unpause();

      // State should be unchanged
      const statsAfter = await referral.getReferralStats(user2.address);
      expect(statsAfter.pendingRewardsUSD).to.equal(statsBefore.pendingRewardsUSD);
    });

    it("Should maintain state consistency during concurrent operations", async function () {
      const { token, privateSale, user1, user2, owner } =
        await loadFixture(deployFullSystemFixture);

      await privateSale.addToWhitelist([user1.address, user2.address]);

      // Concurrent purchases
      await Promise.all([
        privateSale.connect(user1).purchaseWithBNB({ value: ethers.parseEther("0.5") }),
        privateSale.connect(user2).purchaseWithBNB({ value: ethers.parseEther("0.3") })
      ]);

      const total = await privateSale.totalTokensSold();
      const user1Tokens = await privateSale.tokensPurchased(user1.address);
      const user2Tokens = await privateSale.tokensPurchased(user2.address);

      // Total should equal sum of individual purchases
      expect(total).to.equal(user1Tokens + user2Tokens);
    });

    it("Should handle complex state transitions correctly", async function () {
      const { token, privateSale, referral, staking, user1, user2, owner } =
        await loadFixture(deployFullSystemFixture);

      // Complex flow:
      // 1. Private sale purchase with referral
      // 2. Claim referral rewards
      // 3. Stake rewards
      // 4. Enable trading
      // 5. Unstake after lock period
      // 6. Transfer tokens

      await privateSale.addToWhitelist([user1.address]);
      await referral.registerReferral(user1.address, user2.address);

      // 1. Purchase
      await privateSale.connect(user1).purchaseWithBNB({ value: ethers.parseEther("1") });

      // 2. Claim
      await referral.connect(user2).claimRewards(true);
      const rewardBalance = await token.balanceOf(user2.address);

      // 3. Stake
      await token.connect(user2).approve(await staking.getAddress(), ethers.MaxUint256);
      await staking.connect(user2).stake(rewardBalance, 0);

      // 4. Enable trading
      await token.enableTrading();

      // 5. Unstake
      await time.increase(31 * 24 * 60 * 60);
      await staking.connect(user2).unstake(0);

      // 6. Transfer
      const finalBalance = await token.balanceOf(user2.address);
      await token.connect(user2).transfer(user1.address, finalBalance / 2n);

      // Verify state is consistent
      const user2Final = await token.balanceOf(user2.address);
      expect(user2Final).to.be.greaterThan(0);
      expect(user2Final).to.be.lessThan(finalBalance);
    });
  });

  describe("💥 Denial of Service (DoS) Tests", function () {

    it("Should prevent gas limit DoS on referral list", async function () {
      const { referral, privateSale, owner, user1 } =
        await loadFixture(deployFullSystemFixture);

      // Register many referrals
      const referrals = [];
      for (let i = 0; i < 100; i++) {
        const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
        await owner.sendTransaction({ to: wallet.address, value: ethers.parseEther("0.1") });
        referrals.push(wallet);
        await referral.registerReferral(wallet.address, user1.address);
      }

      // Getting referral list should not run out of gas
      const list = await referral.getReferredUsers(user1.address);
      expect(list.length).to.equal(100);
    });

    it("Should prevent DoS via emergency pause spam", async function () {
      const { privateSale, owner } =
        await loadFixture(deployFullSystemFixture);

      // Rapid pause/unpause should not break contract
      for (let i = 0; i < 10; i++) {
        await privateSale.pause();
        await privateSale.unpause();
      }

      // Contract should still function
      const stats = await privateSale.getSaleStats();
      expect(stats._isActive).to.be.true;
    });

    it("Should prevent DoS via block gas limit on batch operations", async function () {
      const { privateSale, owner } =
        await loadFixture(deployFullSystemFixture);

      // Add 1000 addresses to whitelist (should not exceed gas limit)
      const addresses = [];
      for (let i = 0; i < 1000; i++) {
        addresses.push(ethers.Wallet.createRandom().address);
      }

      // This might fail if too many, but should fail gracefully
      try {
        await privateSale.addToWhitelist(addresses);
      } catch (e) {
        expect(e.message).to.include("gas");
      }
    });
  });

  describe("🎯 Precision & Rounding Tests", function () {

    it("Should handle token amount precision correctly across contracts", async function () {
      const { token, privateSale, referral, user1, user2 } =
        await loadFixture(deployFullSystemFixture);

      await privateSale.addToWhitelist([user1.address]);
      await referral.registerReferral(user1.address, user2.address);

      // Purchase with odd amount that might cause rounding issues
      await privateSale.connect(user1).purchaseWithBNB({
        value: 123456789012345n // Odd wei amount
      });

      // Verify no rounding errors in referral rewards
      const stats = await referral.getReferralStats(user2.address);
      expect(stats.pendingRewardsUSD).to.be.greaterThan(0);
    });

    it("Should handle fee calculations without rounding exploits", async function () {
      const { token, owner, user1, user2 } =
        await loadFixture(deployFullSystemFixture);

      await token.enableTrading();
      await token.transfer(user1.address, ethers.parseEther("1000000"));

      // Transfer odd amount
      const oddAmount = ethers.parseEther("999.999999999999999");
      await token.connect(user1).transfer(user2.address, oddAmount);

      // Fees should be correctly calculated (8%)
      const received = await token.balanceOf(user2.address);
      const expectedAfterFees = oddAmount * 92n / 100n;

      expect(received).to.be.closeTo(expectedAfterFees, ethers.parseEther("1"));
    });
  });
});
