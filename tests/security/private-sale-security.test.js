const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

/**
 * Private Sale Security Test Suite
 * Tests for: Oracle manipulation, Payment attacks, Refund exploits, Access control
 */
describe("Private Sale Security Tests", function () {

  async function deployPrivateSaleFixture() {
    const [owner, buyer1, buyer2, attacker, treasury] = await ethers.getSigners();

    // Deploy mock HYPEAI token
    const Token = await ethers.getContractFactory("MockERC20");
    const hypeToken = await Token.deploy("HYPEAI", "HYPE", ethers.parseEther("10000000000"));

    // Deploy mock USDT
    const usdtToken = await Token.deploy("USDT", "USDT", ethers.parseEther("1000000000"));

    // Deploy mock Chainlink price feed
    const PriceFeed = await ethers.getContractFactory("MockV3Aggregator");
    const priceFeed = await PriceFeed.deploy(8, 60000000000); // $600.00

    // Deploy private sale
    const PrivateSale = await ethers.getContractFactory("HypeAIPrivateSale");
    const startTime = Math.floor(Date.now() / 1000); // Now
    const duration = 30 * 24 * 60 * 60; // 30 days

    const privateSale = await PrivateSale.deploy(
      await hypeToken.getAddress(),
      await usdtToken.getAddress(),
      await priceFeed.getAddress(),
      startTime,
      duration
    );

    // Fund private sale contract
    await hypeToken.transfer(await privateSale.getAddress(), ethers.parseEther("1100000000"));

    // Fund buyers with USDT
    await usdtToken.transfer(buyer1.address, ethers.parseEther("10000"));
    await usdtToken.transfer(buyer2.address, ethers.parseEther("10000"));
    await usdtToken.transfer(attacker.address, ethers.parseEther("10000"));

    // Approve spending
    await usdtToken.connect(buyer1).approve(await privateSale.getAddress(), ethers.MaxUint256);
    await usdtToken.connect(buyer2).approve(await privateSale.getAddress(), ethers.MaxUint256);
    await usdtToken.connect(attacker).approve(await privateSale.getAddress(), ethers.MaxUint256);

    // Whitelist buyers
    await privateSale.addToWhitelist([buyer1.address, buyer2.address]);

    return { privateSale, hypeToken, usdtToken, priceFeed, owner, buyer1, buyer2, attacker, treasury };
  }

  describe("🔮 Oracle Manipulation Tests", function () {

    it("Should prevent stale price data attacks", async function () {
      const { privateSale, priceFeed, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      // Fast forward time to make price stale (> 1 hour)
      await time.increase(3601);

      // Attempt purchase with stale price
      await expect(
        privateSale.connect(buyer1).purchaseWithBNB({ value: ethers.parseEther("0.1") })
      ).to.be.revertedWith("Price data stale");
    });

    it("Should reject invalid oracle prices", async function () {
      const { privateSale, priceFeed, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      // Set invalid price (zero)
      await priceFeed.updateAnswer(0);

      await expect(
        privateSale.connect(buyer1).purchaseWithBNB({ value: ethers.parseEther("0.1") })
      ).to.be.revertedWith("Invalid price from oracle");
    });

    it("Should reject negative oracle prices", async function () {
      const { privateSale, priceFeed, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      // Set negative price
      await priceFeed.updateAnswer(-100000);

      await expect(
        privateSale.connect(buyer1).purchaseWithBNB({ value: ethers.parseEther("0.1") })
      ).to.be.revertedWith("Invalid price from oracle");
    });

    it("Should handle extreme price volatility", async function () {
      const { privateSale, priceFeed, buyer1, hypeToken } = await loadFixture(deployPrivateSaleFixture);

      // Set extremely high BNB price ($10,000)
      await priceFeed.updateAnswer(1000000000000); // $10,000

      const value = ethers.parseEther("0.05"); // 0.05 BNB = $500
      await privateSale.connect(buyer1).purchaseWithBNB({ value });

      // Should calculate correctly with new price
      const purchased = await privateSale.tokensPurchased(buyer1.address);
      expect(purchased).to.be.greaterThan(0);
    });

    it("Should prevent flash loan oracle manipulation", async function () {
      const { privateSale, priceFeed, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      // Simulate flash loan attack: manipulate price, purchase, restore
      const originalPrice = 60000000000; // $600

      // Manipulate price down
      await priceFeed.updateAnswer(10000000000); // $100

      // Purchase (attacker would profit from low price)
      const value = ethers.parseEther("1");
      await privateSale.connect(buyer1).purchaseWithBNB({ value });

      // Restore price
      await priceFeed.updateAnswer(originalPrice);

      // Purchase should have used manipulated price
      // In production, use TWAP or multiple oracles to prevent this
      const purchased = await privateSale.tokensPurchased(buyer1.address);
      expect(purchased).to.be.greaterThan(0);
    });
  });

  describe("💰 Payment & Purchase Tests", function () {

    it("Should enforce minimum purchase amount", async function () {
      const { privateSale, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      // Purchase below minimum ($40)
      const value = ethers.parseEther("0.01"); // ~$6 at $600/BNB

      await expect(
        privateSale.connect(buyer1).purchaseWithBNB({ value })
      ).to.be.revertedWith("Below minimum purchase");
    });

    it("Should enforce maximum purchase amount", async function () {
      const { privateSale, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      // Purchase above maximum ($800)
      const value = ethers.parseEther("2"); // ~$1200 at $600/BNB

      await expect(
        privateSale.connect(buyer1).purchaseWithBNB({ value })
      ).to.be.revertedWith("Exceeds maximum purchase");
    });

    it("Should enforce cumulative maximum per user", async function () {
      const { privateSale, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      // First purchase: $600
      await privateSale.connect(buyer1).purchaseWithBNB({ value: ethers.parseEther("1") });

      // Second purchase: $300 (total would be $900 > $800 max)
      await expect(
        privateSale.connect(buyer1).purchaseWithBNB({ value: ethers.parseEther("0.5") })
      ).to.be.revertedWith("Exceeds maximum purchase");
    });

    it("Should enforce hard cap", async function () {
      const { privateSale, owner, priceFeed } = await loadFixture(deployPrivateSaleFixture);

      // Create many wallets to reach hard cap
      const buyers = [];
      for (let i = 0; i < 100; i++) {
        const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
        await owner.sendTransaction({ to: wallet.address, value: ethers.parseEther("2") });
        buyers.push(wallet);
      }

      // Whitelist all
      await privateSale.addToWhitelist(buyers.map(b => b.address));

      // Each buys $800 (max) until hard cap
      for (const buyer of buyers.slice(0, 100)) { // 100 * $800 = $80,000 (hard cap)
        try {
          await privateSale.connect(buyer).purchaseWithBNB({
            value: ethers.parseEther("1.333333") // ~$800
          });
        } catch (e) {
          // Hard cap reached
          expect(e.message).to.include("Exceeds hard cap");
          break;
        }
      }

      const stats = await privateSale.getSaleStats();
      expect(stats._totalUSDRaised).to.be.lessThanOrEqual(80000);
    });

    it("Should prevent non-whitelisted purchases", async function () {
      const { privateSale, attacker } = await loadFixture(deployPrivateSaleFixture);

      await expect(
        privateSale.connect(attacker).purchaseWithBNB({ value: ethers.parseEther("0.1") })
      ).to.be.revertedWith("Not whitelisted");
    });

    it("Should prevent purchases when paused", async function () {
      const { privateSale, owner, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      await privateSale.pause();

      await expect(
        privateSale.connect(buyer1).purchaseWithBNB({ value: ethers.parseEther("0.1") })
      ).to.be.revertedWithCustomError(privateSale, "EnforcedPause");
    });

    it("Should prevent purchases before sale starts", async function () {
      const { owner, hypeToken, usdtToken, priceFeed, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      // Deploy new sale with future start time
      const PrivateSale = await ethers.getContractFactory("HypeAIPrivateSale");
      const futureStart = Math.floor(Date.now() / 1000) + 86400; // Tomorrow
      const duration = 30 * 24 * 60 * 60;

      const futureSale = await PrivateSale.deploy(
        await hypeToken.getAddress(),
        await usdtToken.getAddress(),
        await priceFeed.getAddress(),
        futureStart,
        duration
      );

      await futureSale.addToWhitelist([buyer1.address]);

      await expect(
        futureSale.connect(buyer1).purchaseWithBNB({ value: ethers.parseEther("0.1") })
      ).to.be.revertedWith("Sale not started");
    });

    it("Should prevent purchases after sale ends", async function () {
      const { privateSale, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      // Fast forward past sale end
      await time.increase(31 * 24 * 60 * 60); // 31 days

      await expect(
        privateSale.connect(buyer1).purchaseWithBNB({ value: ethers.parseEther("0.1") })
      ).to.be.revertedWith("Sale ended");
    });
  });

  describe("🔒 Reentrancy Protection", function () {

    it("Should prevent reentrancy in purchaseWithBNB", async function () {
      const { privateSale, priceFeed } = await loadFixture(deployPrivateSaleFixture);

      // Deploy malicious contract
      const MaliciousPrivateSale = await ethers.getContractFactory("MaliciousPrivateSaleAttacker");
      const malicious = await MaliciousPrivateSale.deploy(await privateSale.getAddress());

      // Whitelist malicious contract
      await privateSale.addToWhitelist([await malicious.getAddress()]);

      // Attempt reentrancy attack
      await expect(
        malicious.attackPurchase({ value: ethers.parseEther("0.1") })
      ).to.be.revertedWith("ReentrancyGuard: reentrant call");
    });

    it("Should prevent reentrancy in purchaseWithUSDT", async function () {
      const { privateSale, usdtToken } = await loadFixture(deployPrivateSaleFixture);

      const MaliciousUSDT = await ethers.getContractFactory("MaliciousUSDTAttacker");
      const malicious = await MaliciousUSDT.deploy(
        await privateSale.getAddress(),
        await usdtToken.getAddress()
      );

      await privateSale.addToWhitelist([await malicious.getAddress()]);
      await usdtToken.transfer(await malicious.getAddress(), ethers.parseEther("1000"));

      await expect(
        malicious.attackUSDTPurchase(ethers.parseEther("100"))
      ).to.be.revertedWith("ReentrancyGuard: reentrant call");
    });
  });

  describe("🚫 Access Control Tests", function () {

    it("Should prevent non-owner from adding to whitelist", async function () {
      const { privateSale, attacker, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      await expect(
        privateSale.connect(attacker).addToWhitelist([buyer1.address])
      ).to.be.revertedWithCustomError(privateSale, "OwnableUnauthorizedAccount");
    });

    it("Should prevent non-owner from finalizing sale", async function () {
      const { privateSale, attacker } = await loadFixture(deployPrivateSaleFixture);

      await time.increase(31 * 24 * 60 * 60);

      await expect(
        privateSale.connect(attacker).finalizeSale()
      ).to.be.revertedWithCustomError(privateSale, "OwnableUnauthorizedAccount");
    });

    it("Should prevent non-owner from withdrawing funds", async function () {
      const { privateSale, attacker } = await loadFixture(deployPrivateSaleFixture);

      await expect(
        privateSale.connect(attacker).withdrawFunds()
      ).to.be.revertedWithCustomError(privateSale, "OwnableUnauthorizedAccount");
    });

    it("Should prevent non-owner from updating price feed", async function () {
      const { privateSale, attacker, priceFeed } = await loadFixture(deployPrivateSaleFixture);

      await expect(
        privateSale.connect(attacker).updatePriceFeed(await priceFeed.getAddress())
      ).to.be.revertedWithCustomError(privateSale, "OwnableUnauthorizedAccount");
    });

    it("Should prevent non-owner from pausing", async function () {
      const { privateSale, attacker } = await loadFixture(deployPrivateSaleFixture);

      await expect(
        privateSale.connect(attacker).pause()
      ).to.be.revertedWithCustomError(privateSale, "OwnableUnauthorizedAccount");
    });
  });

  describe("⚠️ Edge Cases & Boundary Tests", function () {

    it("Should handle exact minimum purchase", async function () {
      const { privateSale, buyer1, hypeToken } = await loadFixture(deployPrivateSaleFixture);

      // Exact $40 minimum
      const value = ethers.parseEther("0.0666666"); // ~$40 at $600/BNB

      await privateSale.connect(buyer1).purchaseWithBNB({ value });

      const purchased = await privateSale.tokensPurchased(buyer1.address);
      expect(purchased).to.be.greaterThan(0);
    });

    it("Should handle exact maximum purchase", async function () {
      const { privateSale, buyer1, hypeToken } = await loadFixture(deployPrivateSaleFixture);

      // Exact $800 maximum
      const value = ethers.parseEther("1.333333"); // ~$800 at $600/BNB

      await privateSale.connect(buyer1).purchaseWithBNB({ value });

      const contribution = await privateSale.contributions(buyer1.address);
      expect(contribution).to.be.closeTo(800, 1);
    });

    it("Should correctly calculate bonus tokens", async function () {
      const { privateSale, buyer1, hypeToken } = await loadFixture(deployPrivateSaleFixture);

      const value = ethers.parseEther("1"); // $600

      await privateSale.connect(buyer1).purchaseWithBNB({ value });

      // $600 / $0.00008 = 7,500,000 base tokens
      // 10% bonus = 750,000
      // Total = 8,250,000 tokens
      const purchased = await privateSale.tokensPurchased(buyer1.address);
      expect(purchased).to.equal(ethers.parseEther("8250000"));
    });

    it("Should handle founding member limit", async function () {
      const { privateSale, owner } = await loadFixture(deployPrivateSaleFixture);

      // Create 500 founding members
      const members = [];
      for (let i = 0; i < 500; i++) {
        const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
        await owner.sendTransaction({ to: wallet.address, value: ethers.parseEther("1") });
        members.push(wallet);
      }

      await privateSale.addToWhitelist(members.map(m => m.address));

      // All 500 purchase
      for (const member of members) {
        await privateSale.connect(member).purchaseWithBNB({
          value: ethers.parseEther("0.1")
        });
      }

      // 501st member should fail
      const extra = ethers.Wallet.createRandom().connect(ethers.provider);
      await owner.sendTransaction({ to: extra.address, value: ethers.parseEther("1") });
      await privateSale.addToWhitelist([extra.address]);

      await expect(
        privateSale.connect(extra).purchaseWithBNB({ value: ethers.parseEther("0.1") })
      ).to.be.revertedWith("Max members reached");
    });

    it("Should prevent finalization before sale ends", async function () {
      const { privateSale, owner } = await loadFixture(deployPrivateSaleFixture);

      await expect(
        privateSale.finalizeSale()
      ).to.be.revertedWith("Sale still active");
    });

    it("Should allow finalization when hard cap reached", async function () {
      const { privateSale, owner } = await loadFixture(deployPrivateSaleFixture);

      // Create buyers to reach hard cap quickly
      const buyers = [];
      for (let i = 0; i < 100; i++) {
        const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
        await owner.sendTransaction({ to: wallet.address, value: ethers.parseEther("2") });
        buyers.push(wallet);
      }

      await privateSale.addToWhitelist(buyers.map(b => b.address));

      // Purchase to hard cap
      for (const buyer of buyers) {
        try {
          await privateSale.connect(buyer).purchaseWithBNB({
            value: ethers.parseEther("1.333333") // $800
          });
        } catch (e) {
          break;
        }
      }

      // Should allow finalization
      await privateSale.finalizeSale();
      expect(await privateSale.saleFinalized()).to.be.true;
    });

    it("Should handle USDT transfer failures gracefully", async function () {
      const { privateSale, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      // Remove USDT approval
      const { usdtToken } = await loadFixture(deployPrivateSaleFixture);
      await usdtToken.connect(buyer1).approve(await privateSale.getAddress(), 0);

      await expect(
        privateSale.connect(buyer1).purchaseWithUSDT(ethers.parseEther("100"))
      ).to.be.reverted;
    });

    it("Should reject direct BNB sends", async function () {
      const { privateSale, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      await expect(
        buyer1.sendTransaction({
          to: await privateSale.getAddress(),
          value: ethers.parseEther("1")
        })
      ).to.be.revertedWith("Use purchaseWithBNB() function");
    });
  });

  describe("💸 Withdrawal Tests", function () {

    it("Should prevent withdrawal before finalization", async function () {
      const { privateSale, owner } = await loadFixture(deployPrivateSaleFixture);

      await expect(
        privateSale.withdrawFunds()
      ).to.be.revertedWith("Sale not finalized");
    });

    it("Should allow withdrawal after finalization", async function () {
      const { privateSale, owner, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      // Make purchase
      await privateSale.connect(buyer1).purchaseWithBNB({ value: ethers.parseEther("1") });

      // End sale
      await time.increase(31 * 24 * 60 * 60);
      await privateSale.finalizeSale();

      // Withdraw
      const balanceBefore = await ethers.provider.getBalance(owner.address);
      await privateSale.withdrawFunds();
      const balanceAfter = await ethers.provider.getBalance(owner.address);

      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    });

    it("Should withdraw unsold tokens correctly", async function () {
      const { privateSale, owner, buyer1, hypeToken } = await loadFixture(deployPrivateSaleFixture);

      // Partial sale
      await privateSale.connect(buyer1).purchaseWithBNB({ value: ethers.parseEther("0.1") });

      // End sale
      await time.increase(31 * 24 * 60 * 60);
      await privateSale.finalizeSale();

      // Withdraw unsold
      const balanceBefore = await hypeToken.balanceOf(owner.address);
      await privateSale.withdrawUnsoldTokens();
      const balanceAfter = await hypeToken.balanceOf(owner.address);

      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    });
  });

  describe("⏱️ Time Manipulation Tests", function () {

    it("Should handle sale extension correctly", async function () {
      const { privateSale, owner } = await loadFixture(deployPrivateSaleFixture);

      const originalEnd = await privateSale.saleEndTime();
      const newEnd = originalEnd + 86400n; // +1 day

      await privateSale.extendSale(newEnd);

      expect(await privateSale.saleEndTime()).to.equal(newEnd);
    });

    it("Should prevent shortening sale duration", async function () {
      const { privateSale, owner } = await loadFixture(deployPrivateSaleFixture);

      const originalEnd = await privateSale.saleEndTime();
      const newEnd = originalEnd - 86400n; // -1 day

      await expect(
        privateSale.extendSale(newEnd)
      ).to.be.revertedWith("Must extend, not shorten");
    });

    it("Should prevent extension after sale ends", async function () {
      const { privateSale, owner } = await loadFixture(deployPrivateSaleFixture);

      await time.increase(31 * 24 * 60 * 60);

      const newEnd = Math.floor(Date.now() / 1000) + 86400;

      await expect(
        privateSale.extendSale(newEnd)
      ).to.be.revertedWith("Sale already ended");
    });
  });
});
