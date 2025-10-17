const { expect } = require("chai");
const { ethers } = require("hardhat");
const { increaseTime, parseEther, formatEther, TIME } = require("./helpers/test-helpers.cjs");

describe("HypeAI Private Sale - Chainlink Oracle Integration", function() {
  let privateSale, token, mockOracle;
  let owner, treasury, buyer1, buyer2, buyer3;

  const INITIAL_BNB_PRICE = 50000000000; // $500.00 (8 decimals)
  const TOKENS_PER_USD = parseEther("1000"); // 1000 HYPE per $1
  const MIN_PURCHASE = parseEther("0.1"); // 0.1 BNB minimum

  beforeEach(async function() {
    [owner, treasury, buyer1, buyer2, buyer3] = await ethers.getSigners();

    // Deploy mock Chainlink oracle
    const MockOracle = await ethers.getContractFactory("MockV3Aggregator");
    mockOracle = await MockOracle.deploy(8, INITIAL_BNB_PRICE);
    await mockOracle.waitForDeployment();

    // Deploy token
    const Token = await ethers.getContractFactory("HypeAI");
    token = await Token.deploy(treasury.address, owner.address);
    await token.waitForDeployment();

    // Deploy private sale
    const PrivateSale = await ethers.getContractFactory("HypeAIPrivateSale");
    privateSale = await PrivateSale.deploy(
      await token.getAddress(),
      await mockOracle.getAddress(),
      treasury.address
    );
    await privateSale.waitForDeployment();

    // Approve tokens for sale
    const saleAllocation = parseEther("50000000"); // 50M tokens
    await token.approve(await privateSale.getAddress(), saleAllocation);
  });

  describe("Oracle Price Fetching", function() {
    it("should fetch BNB price from Chainlink oracle", async function() {
      const price = await privateSale.getBNBPrice();
      expect(price).to.equal(INITIAL_BNB_PRICE);
    });

    it("should return price with correct decimals (8)", async function() {
      const price = await privateSale.getBNBPrice();
      const decimals = await mockOracle.decimals();

      expect(decimals).to.equal(8);
      // $500.00 = 50000000000 (8 decimals)
      expect(price).to.equal(50000000000n);
    });

    it("should fetch updated price after oracle update", async function() {
      const newPrice = 60000000000n; // $600.00
      await mockOracle.updateAnswer(newPrice);

      const price = await privateSale.getBNBPrice();
      expect(price).to.equal(newPrice);
    });

    it("should handle price increases correctly", async function() {
      const prices = [55000000000n, 60000000000n, 70000000000n];

      for (const newPrice of prices) {
        await mockOracle.updateAnswer(newPrice);
        const fetchedPrice = await privateSale.getBNBPrice();
        expect(fetchedPrice).to.equal(newPrice);
      }
    });

    it("should handle price decreases correctly", async function() {
      const prices = [45000000000n, 40000000000n, 35000000000n];

      for (const newPrice of prices) {
        await mockOracle.updateAnswer(newPrice);
        const fetchedPrice = await privateSale.getBNBPrice();
        expect(fetchedPrice).to.equal(newPrice);
      }
    });
  });

  describe("Purchase Calculation with Real-Time Price", function() {
    it("should calculate tokens correctly at $500 BNB", async function() {
      const bnbAmount = parseEther("1"); // 1 BNB

      const tx = await privateSale.connect(buyer1).purchaseTokens({ value: bnbAmount });
      const receipt = await tx.wait();

      // 1 BNB × $500 = $500 worth
      // $500 × 1000 tokens/USD = 500,000 tokens
      // Plus 20% bonus = 600,000 tokens
      const expectedTokens = parseEther("600000"); // With 20% bonus

      const purchase = await privateSale.getPurchaseInfo(buyer1.address);
      expect(purchase.totalTokens).to.be.closeTo(expectedTokens, parseEther("1000"));
    });

    it("should calculate tokens correctly at $700 BNB", async function() {
      await mockOracle.updateAnswer(70000000000n); // $700

      const bnbAmount = parseEther("1");
      await privateSale.connect(buyer1).purchaseTokens({ value: bnbAmount });

      // 1 BNB × $700 = $700 worth
      // $700 × 1000 tokens/USD = 700,000 tokens
      // Plus 20% bonus = 840,000 tokens
      const expectedTokens = parseEther("840000");

      const purchase = await privateSale.getPurchaseInfo(buyer1.address);
      expect(purchase.totalTokens).to.be.closeTo(expectedTokens, parseEther("1000"));
    });

    it("should adjust tokens when BNB price changes mid-sale", async function() {
      // First purchase at $500
      await privateSale.connect(buyer1).purchaseTokens({ value: parseEther("1") });
      const purchase1 = await privateSale.getPurchaseInfo(buyer1.address);

      // Update price to $600
      await mockOracle.updateAnswer(60000000000n);

      // Second purchase at $600
      await privateSale.connect(buyer2).purchaseTokens({ value: parseEther("1") });
      const purchase2 = await privateSale.getPurchaseInfo(buyer2.address);

      // buyer2 should get fewer tokens (higher BNB price = more USD = more tokens)
      // Actually buyer2 gets MORE tokens because BNB is worth more
      expect(purchase2.totalTokens).to.be.gt(purchase1.totalTokens);
    });

    it("should handle fractional BNB amounts", async function() {
      const bnbAmount = parseEther("0.5"); // 0.5 BNB
      await privateSale.connect(buyer1).purchaseTokens({ value: bnbAmount });

      // 0.5 BNB × $500 = $250 worth
      // $250 × 1000 tokens/USD = 250,000 tokens
      // Plus 20% bonus = 300,000 tokens
      const expectedTokens = parseEther("300000");

      const purchase = await privateSale.getPurchaseInfo(buyer1.address);
      expect(purchase.totalTokens).to.be.closeTo(expectedTokens, parseEther("1000"));
    });
  });

  describe("Bonus Token Calculation with Dynamic Price", function() {
    it("should apply 20% bonus at Tier 1", async function() {
      const bnbAmount = parseEther("1");
      await privateSale.connect(buyer1).purchaseTokens({ value: bnbAmount });

      const purchase = await privateSale.getPurchaseInfo(buyer1.address);
      const baseTokens = parseEther("500000"); // Without bonus
      const expectedTotal = parseEther("600000"); // With 20% bonus

      expect(purchase.totalTokens).to.be.closeTo(expectedTotal, parseEther("1000"));
    });

    it("should apply 25% bonus at Tier 2", async function() {
      // Advance to tier 2 (need to sell tier 1 allocation first)
      const tier1Amount = parseEther("20"); // Sell out tier 1
      await privateSale.connect(buyer1).purchaseTokens({ value: tier1Amount });

      // Now tier 2
      await privateSale.connect(buyer2).purchaseTokens({ value: parseEther("1") });

      const purchase = await privateSale.getPurchaseInfo(buyer2.address);
      const baseTokens = parseEther("500000");
      const expectedTotal = parseEther("625000"); // With 25% bonus

      expect(purchase.totalTokens).to.be.closeTo(expectedTotal, parseEther("5000"));
    });

    it("should calculate bonus correctly with different BNB prices", async function() {
      const prices = [
        { price: 40000000000n, bnb: parseEther("1"), expectedBase: 400000 },
        { price: 60000000000n, bnb: parseEther("1"), expectedBase: 600000 },
        { price: 80000000000n, bnb: parseEther("1"), expectedBase: 800000 }
      ];

      for (let i = 0; i < prices.length; i++) {
        await mockOracle.updateAnswer(prices[i].price);

        const buyer = [buyer1, buyer2, buyer3][i];
        await privateSale.connect(buyer).purchaseTokens({ value: prices[i].bnb });

        const purchase = await privateSale.getPurchaseInfo(buyer.address);
        const expectedWithBonus = parseEther((prices[i].expectedBase * 1.2).toString());

        expect(purchase.totalTokens).to.be.closeTo(expectedWithBonus, parseEther("10000"));
      }
    });
  });

  describe("Stale Price Protection", function() {
    it("should revert when price is stale (>1 hour old)", async function() {
      await mockOracle.setStalePrice(); // Set timestamp 2 hours ago

      await expect(
        privateSale.connect(buyer1).purchaseTokens({ value: parseEther("1") })
      ).to.be.revertedWith("Stale price data");
    });

    it("should accept price that is exactly 1 hour old", async function() {
      const currentTime = Math.floor(Date.now() / 1000);
      await mockOracle.setUpdatedAt(currentTime - 3600); // Exactly 1 hour

      // This should work (boundary case)
      await expect(
        privateSale.connect(buyer1).purchaseTokens({ value: parseEther("1") })
      ).to.not.be.reverted;
    });

    it("should accept fresh price (<1 hour old)", async function() {
      const currentTime = Math.floor(Date.now() / 1000);
      await mockOracle.setUpdatedAt(currentTime - 1800); // 30 minutes ago

      await expect(
        privateSale.connect(buyer1).purchaseTokens({ value: parseEther("1") })
      ).to.not.be.reverted;
    });

    it("should revert when price is 2 hours old", async function() {
      const currentTime = Math.floor(Date.now() / 1000);
      await mockOracle.setUpdatedAt(currentTime - 7200); // 2 hours

      await expect(
        privateSale.connect(buyer1).purchaseTokens({ value: parseEther("1") })
      ).to.be.revertedWith("Stale price data");
    });
  });

  describe("Invalid Price Protection", function() {
    it("should revert when price is 0", async function() {
      await mockOracle.updateAnswer(0);

      await expect(
        privateSale.connect(buyer1).purchaseTokens({ value: parseEther("1") })
      ).to.be.revertedWith("Invalid price");
    });

    it("should revert when price is negative", async function() {
      await mockOracle.updateAnswer(-100000000);

      await expect(
        privateSale.connect(buyer1).purchaseTokens({ value: parseEther("1") })
      ).to.be.revertedWith("Invalid price");
    });

    it("should accept minimum valid price ($1)", async function() {
      await mockOracle.updateAnswer(100000000n); // $1.00

      await expect(
        privateSale.connect(buyer1).purchaseTokens({ value: parseEther("1") })
      ).to.not.be.reverted;
    });

    it("should handle very small positive prices", async function() {
      await mockOracle.updateAnswer(1); // $0.00000001

      await expect(
        privateSale.connect(buyer1).purchaseTokens({ value: parseEther("1") })
      ).to.not.be.reverted;
    });
  });

  describe("Price Feed Address Management", function() {
    it("should allow owner to update price feed", async function() {
      const NewOracle = await ethers.getContractFactory("MockV3Aggregator");
      const newOracle = await NewOracle.deploy(8, 55000000000n);

      await privateSale.connect(owner).updatePriceFeed(await newOracle.getAddress());

      const price = await privateSale.getBNBPrice();
      expect(price).to.equal(55000000000n);
    });

    it("should prevent non-owner from updating price feed", async function() {
      const NewOracle = await ethers.getContractFactory("MockV3Aggregator");
      const newOracle = await NewOracle.deploy(8, 55000000000n);

      await expect(
        privateSale.connect(buyer1).updatePriceFeed(await newOracle.getAddress())
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should revert when updating to zero address", async function() {
      await expect(
        privateSale.connect(owner).updatePriceFeed(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid price feed address");
    });

    it("should emit event when price feed is updated", async function() {
      const NewOracle = await ethers.getContractFactory("MockV3Aggregator");
      const newOracle = await NewOracle.deploy(8, 55000000000n);

      await expect(
        privateSale.connect(owner).updatePriceFeed(await newOracle.getAddress())
      ).to.emit(privateSale, "PriceFeedUpdated")
        .withArgs(await mockOracle.getAddress(), await newOracle.getAddress());
    });

    it("should continue working after price feed update", async function() {
      const NewOracle = await ethers.getContractFactory("MockV3Aggregator");
      const newOracle = await NewOracle.deploy(8, 65000000000n); // $650

      await privateSale.connect(owner).updatePriceFeed(await newOracle.getAddress());

      await privateSale.connect(buyer1).purchaseTokens({ value: parseEther("1") });

      const purchase = await privateSale.getPurchaseInfo(buyer1.address);
      const expectedTokens = parseEther("780000"); // 1 BNB × $650 × 1000 × 1.2

      expect(purchase.totalTokens).to.be.closeTo(expectedTokens, parseEther("1000"));
    });
  });

  describe("Extreme Price Scenarios", function() {
    it("should handle BNB at $1", async function() {
      await mockOracle.updateAnswer(100000000n); // $1.00

      await privateSale.connect(buyer1).purchaseTokens({ value: parseEther("1") });

      const purchase = await privateSale.getPurchaseInfo(buyer1.address);
      const expectedTokens = parseEther("1200"); // 1 BNB × $1 × 1000 × 1.2

      expect(purchase.totalTokens).to.be.closeTo(expectedTokens, parseEther("10"));
    });

    it("should handle BNB at $10,000", async function() {
      await mockOracle.updateAnswer(1000000000000n); // $10,000

      await privateSale.connect(buyer1).purchaseTokens({ value: parseEther("0.1") });

      const purchase = await privateSale.getPurchaseInfo(buyer1.address);
      const expectedTokens = parseEther("1200000"); // 0.1 BNB × $10k × 1000 × 1.2

      expect(purchase.totalTokens).to.be.closeTo(expectedTokens, parseEther("10000"));
    });

    it("should handle rapid price volatility", async function() {
      const prices = [
        50000000000n,  // $500
        100000000000n, // $1000
        25000000000n,  // $250
        75000000000n,  // $750
        60000000000n   // $600
      ];

      for (const price of prices) {
        await mockOracle.updateAnswer(price);
        const fetchedPrice = await privateSale.getBNBPrice();
        expect(fetchedPrice).to.equal(price);
      }
    });

    it("should handle maximum uint256 price gracefully", async function() {
      const maxPrice = 2n ** 256n - 1n;

      // This should fail or be handled gracefully
      await expect(
        mockOracle.updateAnswer(maxPrice)
      ).to.be.reverted;
    });
  });

  describe("Multi-Purchase with Price Changes", function() {
    it("should track multiple purchases at different prices", async function() {
      // Purchase 1 at $500
      await privateSale.connect(buyer1).purchaseTokens({ value: parseEther("1") });

      // Update price to $600
      await mockOracle.updateAnswer(60000000000n);

      // Purchase 2 at $600
      await privateSale.connect(buyer1).purchaseTokens({ value: parseEther("1") });

      const purchase = await privateSale.getPurchaseInfo(buyer1.address);

      // Should have tokens from both purchases
      const tokens1 = parseEther("600000"); // 1 BNB × $500 × 1000 × 1.2
      const tokens2 = parseEther("720000"); // 1 BNB × $600 × 1000 × 1.2
      const expectedTotal = tokens1 + tokens2;

      expect(purchase.totalTokens).to.be.closeTo(expectedTotal, parseEther("10000"));
    });

    it("should handle 5 purchases with different prices", async function() {
      const purchases = [
        { price: 50000000000n, bnb: parseEther("0.5") },
        { price: 55000000000n, bnb: parseEther("0.6") },
        { price: 60000000000n, bnb: parseEther("0.7") },
        { price: 65000000000n, bnb: parseEther("0.8") },
        { price: 70000000000n, bnb: parseEther("0.9") }
      ];

      let expectedTotal = 0n;

      for (const p of purchases) {
        await mockOracle.updateAnswer(p.price);
        await privateSale.connect(buyer1).purchaseTokens({ value: p.bnb });

        const usdValue = (p.bnb * p.price) / parseEther("1");
        const tokens = (usdValue * TOKENS_PER_USD * 12n) / 10n; // With 20% bonus
        expectedTotal += tokens;
      }

      const purchase = await privateSale.getPurchaseInfo(buyer1.address);
      expect(purchase.totalTokens).to.be.closeTo(expectedTotal, parseEther("10000"));
    });
  });

  describe("Oracle Integration Edge Cases", function() {
    it("should handle oracle returning future timestamp", async function() {
      const futureTime = Math.floor(Date.now() / 1000) + 3600;
      await mockOracle.setUpdatedAt(futureTime);

      // Should still work (time validation should handle this)
      await expect(
        privateSale.connect(buyer1).purchaseTokens({ value: parseEther("1") })
      ).to.not.be.reverted;
    });

    it("should handle decimals mismatch gracefully", async function() {
      // Create oracle with different decimals
      const NewOracle = await ethers.getContractFactory("MockV3Aggregator");
      const newOracle = await NewOracle.deploy(18, parseEther("500")); // 18 decimals

      await privateSale.connect(owner).updatePriceFeed(await newOracle.getAddress());

      // Should handle conversion correctly
      const price = await privateSale.getBNBPrice();
      expect(price).to.equal(parseEther("500"));
    });
  });
});
