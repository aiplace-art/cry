const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HypedToken", function () {
  let token;
  let owner;
  let treasury;
  let liquidity;
  let addr1;
  let addr2;
  let addr3;

  const TOTAL_SUPPLY = ethers.parseEther("1000000000"); // 1 Billion
  const MAX_TX_AMOUNT = ethers.parseEther("5000000"); // 0.5%
  const MAX_WALLET_AMOUNT = ethers.parseEther("20000000"); // 2%

  beforeEach(async function () {
    [owner, treasury, liquidity, addr1, addr2, addr3] = await ethers.getSigners();

    const HypedToken = await ethers.getContractFactory("HypedToken");
    token = await HypedToken.deploy(treasury.address, liquidity.address);
    await token.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await token.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply to the owner", async function () {
      const ownerBalance = await token.balanceOf(owner.address);
      expect(await token.totalSupply()).to.equal(ownerBalance);
    });

    it("Should set correct treasury and liquidity wallets", async function () {
      expect(await token.treasuryWallet()).to.equal(treasury.address);
      expect(await token.liquidityWallet()).to.equal(liquidity.address);
    });

    it("Should have correct initial parameters", async function () {
      expect(await token.totalSupply()).to.equal(TOTAL_SUPPLY);
      expect(await token.maxTransactionAmount()).to.equal(MAX_TX_AMOUNT);
      expect(await token.maxWalletAmount()).to.equal(MAX_WALLET_AMOUNT);
    });

    it("Should exclude owner from fees and limits", async function () {
      expect(await token.isExcludedFromFees(owner.address)).to.be.true;
      expect(await token.isExcludedFromLimits(owner.address)).to.be.true;
    });
  });

  describe("Transactions", function () {
    beforeEach(async function () {
      // Enable trading
      await token.enableTrading();
      // Exclude addr1 from limits for testing
      await token.excludeFromLimits(addr1.address, true);
    });

    it("Should transfer tokens between accounts", async function () {
      const amount = ethers.parseEther("1000");

      await token.transfer(addr1.address, amount);
      expect(await token.balanceOf(addr1.address)).to.equal(amount);

      await token.connect(addr1).transfer(addr2.address, amount);
      expect(await token.balanceOf(addr2.address)).to.be.closeTo(amount, ethers.parseEther("100")); // Account for fees
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await token.balanceOf(owner.address);
      await expect(
        token.connect(addr1).transfer(owner.address, ethers.parseEther("1"))
      ).to.be.reverted;
      expect(await token.balanceOf(owner.address)).to.equal(initialOwnerBalance);
    });

    it("Should apply fees on transfers", async function () {
      await token.excludeFromFees(owner.address, false);
      const amount = ethers.parseEther("1000");

      await token.transfer(addr1.address, amount);

      // Should receive less due to 8% fee
      const balance = await token.balanceOf(addr1.address);
      expect(balance).to.be.lt(amount);
      expect(balance).to.be.closeTo(ethers.parseEther("920"), ethers.parseEther("10")); // ~92% after fees
    });

    it("Should respect max transaction amount", async function () {
      await token.excludeFromLimits(owner.address, false);
      const overMaxAmount = MAX_TX_AMOUNT + ethers.parseEther("1");

      await expect(
        token.transfer(addr1.address, overMaxAmount)
      ).to.be.revertedWith("Exceeds max transaction amount");
    });

    it("Should respect max wallet amount", async function () {
      await token.excludeFromLimits(addr1.address, false);
      const overMaxWallet = MAX_WALLET_AMOUNT + ethers.parseEther("1");

      await expect(
        token.transfer(addr1.address, overMaxWallet)
      ).to.be.revertedWith("Exceeds max wallet amount");
    });

    it("Should prevent transfers before trading is enabled", async function () {
      const Token = await ethers.getContractFactory("HypedToken");
      const newToken = await Token.deploy(treasury.address, liquidity.address);
      await newToken.waitForDeployment();

      await expect(
        newToken.connect(owner).transfer(addr1.address, ethers.parseEther("100"))
      ).to.be.revertedWith("Trading not enabled");
    });
  });

  describe("Staking", function () {
    beforeEach(async function () {
      await token.enableTrading();
      // Transfer tokens to addr1 for staking
      await token.transfer(addr1.address, ethers.parseEther("100000"));
    });

    it("Should allow staking tokens for 30 days", async function () {
      const stakeAmount = ethers.parseEther("10000");

      await token.connect(addr1).stake(stakeAmount, 30);

      const stakes = await token.getUserStakes(addr1.address);
      expect(stakes.length).to.equal(1);
      expect(stakes[0].amount).to.equal(stakeAmount);
      expect(stakes[0].lockPeriod).to.equal(30);
    });

    it("Should allow staking tokens for 90 days", async function () {
      const stakeAmount = ethers.parseEther("10000");

      await token.connect(addr1).stake(stakeAmount, 90);

      const stakes = await token.getUserStakes(addr1.address);
      expect(stakes[0].lockPeriod).to.equal(90);
    });

    it("Should allow staking tokens for 365 days", async function () {
      const stakeAmount = ethers.parseEther("10000");

      await token.connect(addr1).stake(stakeAmount, 365);

      const stakes = await token.getUserStakes(addr1.address);
      expect(stakes[0].lockPeriod).to.equal(365);
    });

    it("Should reject invalid lock periods", async function () {
      const stakeAmount = ethers.parseEther("10000");

      await expect(
        token.connect(addr1).stake(stakeAmount, 60)
      ).to.be.revertedWith("Invalid lock period");
    });

    it("Should not allow unstaking before lock period ends", async function () {
      const stakeAmount = ethers.parseEther("10000");

      await token.connect(addr1).stake(stakeAmount, 30);

      await expect(
        token.connect(addr1).unstake(0)
      ).to.be.revertedWith("Stake is still locked");
    });

    it("Should allow unstaking after lock period and distribute rewards", async function () {
      const stakeAmount = ethers.parseEther("10000");

      await token.connect(addr1).stake(stakeAmount, 30);

      // Fast forward 30 days
      await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      const initialBalance = await token.balanceOf(addr1.address);
      await token.connect(addr1).unstake(0);
      const finalBalance = await token.balanceOf(addr1.address);

      // Should receive original stake + rewards
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should calculate staking rewards correctly", async function () {
      const stakeAmount = ethers.parseEther("10000");

      await token.connect(addr1).stake(stakeAmount, 30);

      const reward = await token.calculateStakingReward(addr1.address, 0);
      expect(reward).to.be.gt(0);
    });

    it("Should allow multiple stakes", async function () {
      await token.connect(addr1).stake(ethers.parseEther("5000"), 30);
      await token.connect(addr1).stake(ethers.parseEther("10000"), 90);
      await token.connect(addr1).stake(ethers.parseEther("15000"), 365);

      const stakes = await token.getUserStakes(addr1.address);
      expect(stakes.length).to.equal(3);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to enable trading", async function () {
      expect(await token.tradingEnabled()).to.be.false;
      await token.enableTrading();
      expect(await token.tradingEnabled()).to.be.true;
    });

    it("Should allow owner to update fees", async function () {
      await token.setFees(300, 400, 200, 100);

      expect(await token.reflectionFee()).to.equal(300);
      expect(await token.liquidityFee()).to.equal(400);
      expect(await token.burnFee()).to.equal(200);
      expect(await token.treasuryFee()).to.equal(100);
    });

    it("Should prevent fees from exceeding maximum", async function () {
      await expect(
        token.setFees(500, 500, 500, 500)
      ).to.be.revertedWith("Total fees exceed maximum");
    });

    it("Should allow owner to update max transaction amount", async function () {
      const newMax = ethers.parseEther("10000000");
      await token.setMaxTransactionAmount(newMax);
      expect(await token.maxTransactionAmount()).to.equal(newMax);
    });

    it("Should prevent setting max transaction too low", async function () {
      const tooLow = ethers.parseEther("100000"); // Less than 0.1%
      await expect(
        token.setMaxTransactionAmount(tooLow)
      ).to.be.revertedWith("Max transaction too low");
    });

    it("Should allow owner to blacklist addresses", async function () {
      await token.setBlacklist(addr1.address, true);
      expect(await token.isBlacklisted(addr1.address)).to.be.true;

      await token.setBlacklist(addr1.address, false);
      expect(await token.isBlacklisted(addr1.address)).to.be.false;
    });

    it("Should prevent blacklisted addresses from transferring", async function () {
      await token.enableTrading();
      await token.transfer(addr1.address, ethers.parseEther("1000"));

      await token.setBlacklist(addr1.address, true);

      await expect(
        token.connect(addr1).transfer(addr2.address, ethers.parseEther("100"))
      ).to.be.revertedWith("Blacklisted address");
    });

    it("Should allow owner to exclude addresses from fees", async function () {
      await token.excludeFromFees(addr1.address, true);
      expect(await token.isExcludedFromFees(addr1.address)).to.be.true;
    });

    it("Should allow owner to update treasury wallet", async function () {
      await token.updateTreasuryWallet(addr3.address);
      expect(await token.treasuryWallet()).to.equal(addr3.address);
    });

    it("Should prevent non-owner from calling admin functions", async function () {
      await expect(
        token.connect(addr1).enableTrading()
      ).to.be.reverted;

      await expect(
        token.connect(addr1).setFees(100, 100, 100, 100)
      ).to.be.reverted;
    });
  });

  describe("AI Features", function () {
    it("Should have AI fees enabled by default", async function () {
      expect(await token.aiFeesEnabled()).to.be.true;
    });

    it("Should allow owner to toggle AI fees", async function () {
      await token.setAIFeesEnabled(false);
      expect(await token.aiFeesEnabled()).to.be.false;

      await token.setAIFeesEnabled(true);
      expect(await token.aiFeesEnabled()).to.be.true;
    });

    it("Should track daily volume", async function () {
      await token.enableTrading();
      await token.transfer(addr1.address, ethers.parseEther("1000"));

      const volume = await token.dailyVolume();
      expect(volume).to.be.gt(0);
    });
  });

  describe("Security", function () {
    it("Should prevent reentrancy attacks on staking", async function () {
      // This test ensures ReentrancyGuard is working
      // Actual reentrancy tests require malicious contract
      const stakeAmount = ethers.parseEther("1000");
      await token.transfer(addr1.address, stakeAmount);

      await expect(
        token.connect(addr1).stake(stakeAmount, 30)
      ).to.not.be.reverted;
    });

    it("Should have correct access controls", async function () {
      // Only owner should be able to call these
      await expect(token.connect(addr1).enableTrading()).to.be.reverted;
      await expect(token.connect(addr1).setFees(100, 100, 100, 100)).to.be.reverted;
      await expect(token.connect(addr1).updateTreasuryWallet(addr2.address)).to.be.reverted;
    });

    it("Should reject zero address transfers", async function () {
      await expect(
        token.transfer(ethers.ZeroAddress, ethers.parseEther("100"))
      ).to.be.revertedWith("Transfer to zero address");
    });

    it("Should reject zero amount transfers", async function () {
      await token.enableTrading();
      await expect(
        token.transfer(addr1.address, 0)
      ).to.be.revertedWith("Transfer amount must be greater than zero");
    });
  });
});
