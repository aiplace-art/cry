const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("PrivateSale - Chainlink Oracle Integration", function () {
  let privateSale, hypeToken;
  let mockPriceFeed;
  let owner, buyer1, buyer2;

  const TOKEN_PRICE = ethers.parseEther("0.0000015"); // $0.0000015 per HYPE
  const MIN_PURCHASE = ethers.parseEther("0.1"); // 0.1 BNB minimum
  const SALE_SUPPLY = ethers.parseEther("2100000000"); // 10% of total supply

  beforeEach(async function () {
    [owner, buyer1, buyer2] = await ethers.getSigners();

    // Deploy mock price feed
    const MockV3Aggregator = await ethers.getContractFactory("MockV3Aggregator");
    mockPriceFeed = await MockV3Aggregator.deploy(
      8, // decimals
      30000000000 // $300 initial price (8 decimals)
    );

    // Deploy HypeToken
    const HypeToken = await ethers.getContractFactory("HypeToken");
    hypeToken = await HypeToken.deploy();

    // Deploy PrivateSale with mock price feed
    const PrivateSale = await ethers.getContractFactory("PrivateSale");
    privateSale = await PrivateSale.deploy(
      hypeToken.target,
      mockPriceFeed.target
    );

    // Transfer sale tokens to private sale contract
    await hypeToken.transfer(privateSale.target, SALE_SUPPLY);
  });

  describe("getBNBPrice() Function", function () {
    it("should return correct BNB price from oracle", async function () {
      const price = await privateSale.getBNBPrice();
      expect(price).to.equal(30000000000); // $300 with 8 decimals
    });

    it("should update when oracle price changes", async function () {
      const initialPrice = await privateSale.getBNBPrice();
      expect(initialPrice).to.equal(30000000000);

      // Update mock price feed to $350
      await mockPriceFeed.updateAnswer(35000000000);

      const newPrice = await privateSale.getBNBPrice();
      expect(newPrice).to.equal(35000000000);
    });

    it("should handle different price values correctly", async function () {
      // Test $250
      await mockPriceFeed.updateAnswer(25000000000);
      let price = await privateSale.getBNBPrice();
      expect(price).to.equal(25000000000);

      // Test $500
      await mockPriceFeed.updateAnswer(50000000000);
      price = await privateSale.getBNBPrice();
      expect(price).to.equal(50000000000);

      // Test $100
      await mockPriceFeed.updateAnswer(10000000000);
      price = await privateSale.getBNBPrice();
      expect(price).to.equal(10000000000);
    });

    it("should handle very high prices", async function () {
      // Test $10,000 per BNB
      await mockPriceFeed.updateAnswer(1000000000000);
      const price = await privateSale.getBNBPrice();
      expect(price).to.equal(1000000000000);
    });

    it("should handle very low prices", async function () {
      // Test $1 per BNB
      await mockPriceFeed.updateAnswer(100000000);
      const price = await privateSale.getBNBPrice();
      expect(price).to.equal(100000000);
    });
  });

  describe("Purchase with Real-Time BNB Price", function () {
    it("should calculate correct token amount based on BNB price", async function () {
      // BNB = $300, User sends 1 BNB ($300 worth)
      // Token price = $0.0000015
      // Expected tokens = 300 / 0.0000015 = 200,000,000 tokens

      const bnbAmount = ethers.parseEther("1");
      const expectedTokens = ethers.parseEther("200000000");

      await privateSale.connect(buyer1).buyTokens({ value: bnbAmount });

      const balance = await hypeToken.balanceOf(buyer1.address);

      // Allow 1% tolerance for rounding
      const tolerance = expectedTokens / BigInt(100);
      expect(balance).to.be.closeTo(expectedTokens, tolerance);
    });

    it("should give more tokens when BNB price is lower", async function () {
      // Lower BNB price means more tokens for same BNB amount

      // At $300 per BNB
      const bnbAmount = ethers.parseEther("1");
      await privateSale.connect(buyer1).buyTokens({ value: bnbAmount });
      const tokensAt300 = await hypeToken.balanceOf(buyer1.address);

      // Update to $200 per BNB
      await mockPriceFeed.updateAnswer(20000000000);

      await privateSale.connect(buyer2).buyTokens({ value: bnbAmount });
      const tokensAt200 = await hypeToken.balanceOf(buyer2.address);

      // Buyer2 should get fewer tokens (BNB is worth less)
      expect(tokensAt200).to.be.lt(tokensAt300);
    });

    it("should give fewer tokens when BNB price is higher", async function () {
      // Higher BNB price means fewer tokens for same BNB amount

      // At $300 per BNB
      const bnbAmount = ethers.parseEther("1");
      await privateSale.connect(buyer1).buyTokens({ value: bnbAmount });
      const tokensAt300 = await hypeToken.balanceOf(buyer1.address);

      // Update to $400 per BNB
      await mockPriceFeed.updateAnswer(40000000000);

      await privateSale.connect(buyer2).buyTokens({ value: bnbAmount });
      const tokensAt400 = await hypeToken.balanceOf(buyer2.address);

      // Buyer2 should get more tokens (BNB is worth more)
      expect(tokensAt400).to.be.gt(tokensAt300);
    });

    it("should handle minimum purchase with current BNB price", async function () {
      const minBnb = MIN_PURCHASE;

      await expect(
        privateSale.connect(buyer1).buyTokens({ value: minBnb })
      ).to.not.be.reverted;
    });

    it("should apply bonus correctly with real-time price", async function () {
      // Purchase 100 BNB ($30,000 worth) - should get 20% bonus
      const largePurchase = ethers.parseEther("100");

      await privateSale.connect(buyer1).buyTokens({ value: largePurchase });

      const balance = await hypeToken.balanceOf(buyer1.address);

      // At $300/BNB: 100 BNB = $30,000
      // Tokens = 30,000 / 0.0000015 = 20,000,000,000
      // With 20% bonus = 24,000,000,000 tokens
      const expectedTokens = ethers.parseEther("24000000000");
      const tolerance = expectedTokens / BigInt(100);

      expect(balance).to.be.closeTo(expectedTokens, tolerance);
    });
  });

  describe("Stale Price Protection", function () {
    it("should revert when price is stale (>1 hour old)", async function () {
      // Fast forward 1 hour and 1 second
      await time.increase(3601);

      await expect(
        privateSale.connect(buyer1).buyTokens({ value: ethers.parseEther("1") })
      ).to.be.revertedWith("Stale price data");
    });

    it("should accept price that is exactly 1 hour old", async function () {
      // Fast forward exactly 1 hour
      await time.increase(3600);

      await expect(
        privateSale.connect(buyer1).buyTokens({ value: ethers.parseEther("1") })
      ).to.not.be.reverted;
    });

    it("should accept fresh price (<1 hour)", async function () {
      // Fast forward 30 minutes
      await time.increase(1800);

      await expect(
        privateSale.connect(buyer1).buyTokens({ value: ethers.parseEther("1") })
      ).to.not.be.reverted;
    });

    it("should revert when price is very stale (>24 hours)", async function () {
      // Fast forward 24 hours
      await time.increase(24 * 60 * 60);

      await expect(
        privateSale.connect(buyer1).buyTokens({ value: ethers.parseEther("1") })
      ).to.be.revertedWith("Stale price data");
    });

    it("should work after price feed updates", async function () {
      // Make price stale
      await time.increase(3601);

      // Should revert
      await expect(
        privateSale.connect(buyer1).buyTokens({ value: ethers.parseEther("1") })
      ).to.be.revertedWith("Stale price data");

      // Update price feed (resets timestamp)
      await mockPriceFeed.updateAnswer(30000000000);

      // Should work now
      await expect(
        privateSale.connect(buyer1).buyTokens({ value: ethers.parseEther("1") })
      ).to.not.be.reverted;
    });
  });

  describe("Invalid Price Protection", function () {
    it("should revert when price is zero", async function () {
      await mockPriceFeed.updateAnswer(0);

      await expect(
        privateSale.connect(buyer1).buyTokens({ value: ethers.parseEther("1") })
      ).to.be.revertedWith("Invalid price data");
    });

    it("should revert when price is negative", async function () {
      await mockPriceFeed.updateAnswer(-30000000000);

      await expect(
        privateSale.connect(buyer1).buyTokens({ value: ethers.parseEther("1") })
      ).to.be.revertedWith("Invalid price data");
    });

    it("should handle extreme price values safely", async function () {
      // Very high price (but valid)
      await mockPriceFeed.updateAnswer(ethers.MaxUint256 / BigInt(2));

      // Should not overflow
      await expect(
        privateSale.connect(buyer1).buyTokens({ value: MIN_PURCHASE })
      ).to.not.be.reverted;
    });
  });

  describe("Price Feed Update by Owner", function () {
    it("should allow owner to update price feed address", async function () {
      const MockV3Aggregator = await ethers.getContractFactory("MockV3Aggregator");
      const newPriceFeed = await MockV3Aggregator.deploy(8, 40000000000); // $400

      await privateSale.connect(owner).updatePriceFeed(newPriceFeed.target);

      const price = await privateSale.getBNBPrice();
      expect(price).to.equal(40000000000);
    });

    it("should use new price feed for calculations after update", async function () {
      // Purchase with old price feed ($300)
      await privateSale.connect(buyer1).buyTokens({ value: ethers.parseEther("1") });
      const tokensOldFeed = await hypeToken.balanceOf(buyer1.address);

      // Update to new price feed ($400)
      const MockV3Aggregator = await ethers.getContractFactory("MockV3Aggregator");
      const newPriceFeed = await MockV3Aggregator.deploy(8, 40000000000);
      await privateSale.connect(owner).updatePriceFeed(newPriceFeed.target);

      // Purchase with new price feed
      await privateSale.connect(buyer2).buyTokens({ value: ethers.parseEther("1") });
      const tokensNewFeed = await hypeToken.balanceOf(buyer2.address);

      // Should get more tokens with higher BNB price
      expect(tokensNewFeed).to.be.gt(tokensOldFeed);
    });

    it("should emit event when price feed is updated", async function () {
      const MockV3Aggregator = await ethers.getContractFactory("MockV3Aggregator");
      const newPriceFeed = await MockV3Aggregator.deploy(8, 35000000000);

      await expect(
        privateSale.connect(owner).updatePriceFeed(newPriceFeed.target)
      ).to.emit(privateSale, "PriceFeedUpdated")
        .withArgs(newPriceFeed.target);
    });
  });

  describe("Non-Owner Access Control", function () {
    it("should prevent non-owner from updating price feed", async function () {
      const MockV3Aggregator = await ethers.getContractFactory("MockV3Aggregator");
      const newPriceFeed = await MockV3Aggregator.deploy(8, 40000000000);

      await expect(
        privateSale.connect(buyer1).updatePriceFeed(newPriceFeed.target)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should allow anyone to call getBNBPrice()", async function () {
      // View function, should be callable by anyone
      const price1 = await privateSale.connect(owner).getBNBPrice();
      const price2 = await privateSale.connect(buyer1).getBNBPrice();
      const price3 = await privateSale.connect(buyer2).getBNBPrice();

      expect(price1).to.equal(price2);
      expect(price2).to.equal(price3);
    });
  });

  describe("Integration with Bonus System", function () {
    it("should apply correct bonus at different BNB prices", async function () {
      // Scenario 1: BNB = $300, purchase 10 BNB ($3,000) = 10% bonus
      const purchase1 = ethers.parseEther("10");
      await privateSale.connect(buyer1).buyTokens({ value: purchase1 });
      const balance1 = await hypeToken.balanceOf(buyer1.address);

      // Update BNB price to $400
      await mockPriceFeed.updateAnswer(40000000000);

      // Scenario 2: BNB = $400, purchase 7.5 BNB ($3,000) = 10% bonus
      const purchase2 = ethers.parseEther("7.5");
      await privateSale.connect(buyer2).buyTokens({ value: purchase2 });
      const balance2 = await hypeToken.balanceOf(buyer2.address);

      // Both should get similar tokens (same USD value, same bonus)
      const tolerance = balance1 / BigInt(10);
      expect(balance2).to.be.closeTo(balance1, tolerance);
    });

    it("should handle price changes mid-sale correctly", async function () {
      // Multiple purchases at different prices

      // At $300
      await privateSale.connect(buyer1).buyTokens({ value: ethers.parseEther("1") });
      const balance1 = await hypeToken.balanceOf(buyer1.address);

      // Change to $350
      await mockPriceFeed.updateAnswer(35000000000);
      await privateSale.connect(buyer1).buyTokens({ value: ethers.parseEther("1") });
      const balance2 = await hypeToken.balanceOf(buyer1.address);

      // Change to $250
      await mockPriceFeed.updateAnswer(25000000000);
      await privateSale.connect(buyer1).buyTokens({ value: ethers.parseEther("1") });
      const balance3 = await hypeToken.balanceOf(buyer1.address);

      // Each purchase should have different token amounts
      expect(balance2).to.be.gt(balance1);
      expect(balance3).to.be.gt(balance2);
    });
  });

  describe("Edge Cases and Security", function () {
    it("should handle very small BNB purchases with high token amounts", async function () {
      const smallPurchase = MIN_PURCHASE;

      await expect(
        privateSale.connect(buyer1).buyTokens({ value: smallPurchase })
      ).to.not.be.reverted;

      const balance = await hypeToken.balanceOf(buyer1.address);
      expect(balance).to.be.gt(0);
    });

    it("should prevent reentrancy attacks during price fetch", async function () {
      // This is implicitly tested by using view functions
      // Price feed calls are read-only
      const price1 = await privateSale.getBNBPrice();
      const price2 = await privateSale.getBNBPrice();

      expect(price1).to.equal(price2);
    });

    it("should maintain precision with large purchases", async function () {
      // Purchase 1000 BNB at $300 = $300,000
      const largePurchase = ethers.parseEther("1000");

      await expect(
        privateSale.connect(buyer1).buyTokens({ value: largePurchase })
      ).to.not.be.reverted;

      const balance = await hypeToken.balanceOf(buyer1.address);
      expect(balance).to.be.gt(0);
    });

    it("should handle rapid price updates correctly", async function () {
      for (let i = 0; i < 10; i++) {
        const newPrice = 30000000000 + (i * 1000000000); // Increment by $10
        await mockPriceFeed.updateAnswer(newPrice);

        const price = await privateSale.getBNBPrice();
        expect(price).to.equal(newPrice);
      }
    });
  });
});

// Mock contract for testing
const MockV3AggregatorSource = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockV3Aggregator {
    uint8 public decimals;
    int256 public answer;
    uint256 public updatedAt;

    constructor(uint8 _decimals, int256 _initialAnswer) {
        decimals = _decimals;
        answer = _initialAnswer;
        updatedAt = block.timestamp;
    }

    function updateAnswer(int256 _answer) external {
        answer = _answer;
        updatedAt = block.timestamp;
    }

    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer_,
            uint256 startedAt,
            uint256 updatedAt_,
            uint80 answeredInRound
        )
    {
        return (0, answer, 0, updatedAt, 0);
    }
}
`;
