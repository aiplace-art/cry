/**
 * @test HypeAI Private Sale Smart Contract
 * @description Comprehensive smart contract integration tests
 * @coverage Purchase flow, vesting, security, edge cases
 */

import { expect } from 'chai';
import { ethers } from 'hardhat';
import { time, loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';

describe('HypeAIPrivateSale Smart Contract', () => {
  // Test fixture for contract deployment
  async function deployPrivateSaleFixture() {
    const [owner, buyer1, buyer2, buyer3] = await ethers.getSigners();

    const HypeAIToken = await ethers.getContractFactory('HypeAIToken');
    const token = await HypeAIToken.deploy();

    const HypeAIPrivateSale = await ethers.getContractFactory('HypeAIPrivateSale');
    const privateSale = await HypeAIPrivateSale.deploy(
      await token.getAddress(),
      ethers.parseEther('0.0015'), // Token price: $0.0015
      50, // Min purchase: $50
      500, // Max purchase: $500
      ethers.parseEther('5000000') // Target: $5M
    );

    // Transfer tokens to private sale contract
    const saleAllocation = ethers.parseEther('10000000'); // 10M tokens
    await token.transfer(await privateSale.getAddress(), saleAllocation);

    return { token, privateSale, owner, buyer1, buyer2, buyer3 };
  }

  describe('Deployment', () => {
    it('should set correct token address', async () => {
      const { token, privateSale } = await loadFixture(deployPrivateSaleFixture);

      expect(await privateSale.token()).to.equal(await token.getAddress());
    });

    it('should set correct token price', async () => {
      const { privateSale } = await loadFixture(deployPrivateSaleFixture);

      expect(await privateSale.tokenPrice()).to.equal(ethers.parseEther('0.0015'));
    });

    it('should set correct purchase limits', async () => {
      const { privateSale } = await loadFixture(deployPrivateSaleFixture);

      expect(await privateSale.minPurchase()).to.equal(50);
      expect(await privateSale.maxPurchase()).to.equal(500);
    });

    it('should set correct target amount', async () => {
      const { privateSale } = await loadFixture(deployPrivateSaleFixture);

      expect(await privateSale.targetAmount()).to.equal(ethers.parseEther('5000000'));
    });

    it('should receive tokens for sale', async () => {
      const { token, privateSale } = await loadFixture(deployPrivateSaleFixture);

      const balance = await token.balanceOf(await privateSale.getAddress());
      expect(balance).to.equal(ethers.parseEther('10000000'));
    });
  });

  describe('Purchase Flow', () => {
    it('should allow purchase with minimum amount ($50)', async () => {
      const { privateSale, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      const purchaseAmount = 50;
      await expect(
        privateSale.connect(buyer1).purchase(purchaseAmount, { value: ethers.parseEther('0.05') })
      ).to.emit(privateSale, 'PurchaseCompleted');
    });

    it('should calculate correct token amount with 5% bonus', async () => {
      const { token, privateSale, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      const purchaseAmount = 50;
      await privateSale.connect(buyer1).purchase(purchaseAmount, {
        value: ethers.parseEther('0.05'),
      });

      const purchase = await privateSale.purchases(buyer1.address, 0);

      // $50 / $0.0015 = 33,333.33 tokens
      // + 5% bonus = 35,000 tokens
      expect(purchase.totalTokens).to.be.closeTo(
        ethers.parseEther('35000'),
        ethers.parseEther('10')
      );
    });

    it('should calculate correct token amount with 10% bonus', async () => {
      const { privateSale, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      const purchaseAmount = 100;
      await privateSale.connect(buyer1).purchase(purchaseAmount, {
        value: ethers.parseEther('0.1'),
      });

      const purchase = await privateSale.purchases(buyer1.address, 0);

      // $100 / $0.0015 = 66,666.67 tokens
      // + 10% bonus = 73,333.34 tokens
      expect(purchase.totalTokens).to.be.closeTo(
        ethers.parseEther('73333.34'),
        ethers.parseEther('10')
      );
    });

    it('should calculate correct token amount with 20% bonus', async () => {
      const { privateSale, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      const purchaseAmount = 250;
      await privateSale.connect(buyer1).purchase(purchaseAmount, {
        value: ethers.parseEther('0.25'),
      });

      const purchase = await privateSale.purchases(buyer1.address, 0);

      // $250 / $0.0015 = 166,666.67 tokens
      // + 20% bonus = 200,000 tokens
      expect(purchase.totalTokens).to.be.closeTo(
        ethers.parseEther('200000'),
        ethers.parseEther('10')
      );
    });

    it('should calculate correct token amount with maximum 30% bonus', async () => {
      const { privateSale, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      const purchaseAmount = 500;
      await privateSale.connect(buyer1).purchase(purchaseAmount, {
        value: ethers.parseEther('0.5'),
      });

      const purchase = await privateSale.purchases(buyer1.address, 0);

      // $500 / $0.0015 = 333,333.33 tokens
      // + 30% bonus = 433,333.33 tokens
      expect(purchase.totalTokens).to.be.closeTo(
        ethers.parseEther('433333.33'),
        ethers.parseEther('10')
      );
    });

    it('should reject purchases below minimum', async () => {
      const { privateSale, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      await expect(
        privateSale.connect(buyer1).purchase(25, { value: ethers.parseEther('0.025') })
      ).to.be.revertedWith('Amount below minimum');
    });

    it('should reject purchases above maximum', async () => {
      const { privateSale, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      await expect(
        privateSale.connect(buyer1).purchase(1000, { value: ethers.parseEther('1') })
      ).to.be.revertedWith('Amount exceeds maximum');
    });

    it('should track total raised amount', async () => {
      const { privateSale, buyer1, buyer2 } = await loadFixture(deployPrivateSaleFixture);

      await privateSale.connect(buyer1).purchase(100, { value: ethers.parseEther('0.1') });
      await privateSale.connect(buyer2).purchase(200, { value: ethers.parseEther('0.2') });

      expect(await privateSale.totalRaised()).to.equal(300);
    });

    it('should emit PurchaseCompleted event with correct data', async () => {
      const { privateSale, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      await expect(privateSale.connect(buyer1).purchase(100, { value: ethers.parseEther('0.1') }))
        .to.emit(privateSale, 'PurchaseCompleted')
        .withArgs(buyer1.address, 100, anyValue, anyValue);
    });
  });

  describe('Vesting Schedule', () => {
    it('should unlock 40% immediately after purchase', async () => {
      const { token, privateSale, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      await privateSale.connect(buyer1).purchase(100, { value: ethers.parseEther('0.1') });

      const purchase = await privateSale.purchases(buyer1.address, 0);
      const immediate = (purchase.totalTokens * 40n) / 100n;

      expect(await privateSale.getUnlockedTokens(buyer1.address, 0)).to.equal(immediate);
    });

    it('should vest 10% per month for 6 months', async () => {
      const { privateSale, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      await privateSale.connect(buyer1).purchase(100, { value: ethers.parseEther('0.1') });

      const purchase = await privateSale.purchases(buyer1.address, 0);
      const totalTokens = purchase.totalTokens;

      // Check unlocked amount after each month
      for (let month = 1; month <= 6; month++) {
        await time.increase(30 * 24 * 60 * 60); // 30 days

        const expectedUnlocked = (totalTokens * BigInt(40 + 10 * month)) / 100n;
        const actualUnlocked = await privateSale.getUnlockedTokens(buyer1.address, 0);

        expect(actualUnlocked).to.be.closeTo(expectedUnlocked, ethers.parseEther('100'));
      }
    });

    it('should unlock all tokens after 6 months', async () => {
      const { privateSale, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      await privateSale.connect(buyer1).purchase(100, { value: ethers.parseEther('0.1') });

      const purchase = await privateSale.purchases(buyer1.address, 0);

      // Fast forward 6 months
      await time.increase(6 * 30 * 24 * 60 * 60);

      const unlockedTokens = await privateSale.getUnlockedTokens(buyer1.address, 0);
      expect(unlockedTokens).to.equal(purchase.totalTokens);
    });

    it('should not allow claiming before tokens are unlocked', async () => {
      const { privateSale, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      await privateSale.connect(buyer1).purchase(100, { value: ethers.parseEther('0.1') });

      const purchase = await privateSale.purchases(buyer1.address, 0);
      const immediate = (purchase.totalTokens * 40n) / 100n;

      // Try to claim more than unlocked
      await expect(
        privateSale.connect(buyer1).claimTokens(0, immediate + ethers.parseEther('1'))
      ).to.be.revertedWith('Insufficient unlocked tokens');
    });
  });

  describe('Token Claiming', () => {
    it('should allow claiming unlocked tokens', async () => {
      const { token, privateSale, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      await privateSale.connect(buyer1).purchase(100, { value: ethers.parseEther('0.1') });

      const purchase = await privateSale.purchases(buyer1.address, 0);
      const immediate = (purchase.totalTokens * 40n) / 100n;

      await privateSale.connect(buyer1).claimTokens(0, immediate);

      expect(await token.balanceOf(buyer1.address)).to.equal(immediate);
    });

    it('should update claimed amount after claiming', async () => {
      const { privateSale, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      await privateSale.connect(buyer1).purchase(100, { value: ethers.parseEther('0.1') });

      const purchase = await privateSale.purchases(buyer1.address, 0);
      const immediate = (purchase.totalTokens * 40n) / 100n;

      await privateSale.connect(buyer1).claimTokens(0, immediate);

      const updatedPurchase = await privateSale.purchases(buyer1.address, 0);
      expect(updatedPurchase.claimedTokens).to.equal(immediate);
    });

    it('should emit TokensClaimed event', async () => {
      const { privateSale, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      await privateSale.connect(buyer1).purchase(100, { value: ethers.parseEther('0.1') });

      const purchase = await privateSale.purchases(buyer1.address, 0);
      const immediate = (purchase.totalTokens * 40n) / 100n;

      await expect(privateSale.connect(buyer1).claimTokens(0, immediate))
        .to.emit(privateSale, 'TokensClaimed')
        .withArgs(buyer1.address, 0, immediate);
    });

    it('should allow multiple partial claims', async () => {
      const { token, privateSale, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      await privateSale.connect(buyer1).purchase(100, { value: ethers.parseEther('0.1') });

      // Claim half of immediate unlock
      const purchase = await privateSale.purchases(buyer1.address, 0);
      const halfImmediate = (purchase.totalTokens * 40n) / 200n;

      await privateSale.connect(buyer1).claimTokens(0, halfImmediate);
      expect(await token.balanceOf(buyer1.address)).to.equal(halfImmediate);

      // Claim the other half
      await privateSale.connect(buyer1).claimTokens(0, halfImmediate);
      expect(await token.balanceOf(buyer1.address)).to.equal(halfImmediate * 2n);
    });
  });

  describe('Referral System', () => {
    it('should track referrer for purchase', async () => {
      const { privateSale, buyer1, buyer2 } = await loadFixture(deployPrivateSaleFixture);

      await privateSale
        .connect(buyer2)
        .purchaseWithReferral(100, buyer1.address, { value: ethers.parseEther('0.1') });

      const purchase = await privateSale.purchases(buyer2.address, 0);
      expect(purchase.referrer).to.equal(buyer1.address);
    });

    it('should calculate 5% referral bonus', async () => {
      const { privateSale, buyer1, buyer2 } = await loadFixture(deployPrivateSaleFixture);

      await privateSale
        .connect(buyer2)
        .purchaseWithReferral(100, buyer1.address, { value: ethers.parseEther('0.1') });

      const referralBonus = await privateSale.referralBonuses(buyer1.address);

      // 5% of 73,333.34 tokens ≈ 3,666.67 tokens
      expect(referralBonus).to.be.closeTo(ethers.parseEther('3666.67'), ethers.parseEther('10'));
    });

    it('should not allow self-referral', async () => {
      const { privateSale, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      await expect(
        privateSale
          .connect(buyer1)
          .purchaseWithReferral(100, buyer1.address, { value: ethers.parseEther('0.1') })
      ).to.be.revertedWith('Cannot refer yourself');
    });

    it('should allow claiming referral bonuses', async () => {
      const { token, privateSale, buyer1, buyer2 } = await loadFixture(deployPrivateSaleFixture);

      await privateSale
        .connect(buyer2)
        .purchaseWithReferral(100, buyer1.address, { value: ethers.parseEther('0.1') });

      const bonus = await privateSale.referralBonuses(buyer1.address);
      await privateSale.connect(buyer1).claimReferralBonus();

      expect(await token.balanceOf(buyer1.address)).to.equal(bonus);
    });
  });

  describe('Sale Management', () => {
    it('should allow owner to pause sale', async () => {
      const { privateSale, owner } = await loadFixture(deployPrivateSaleFixture);

      await privateSale.connect(owner).pauseSale();
      expect(await privateSale.isPaused()).to.be.true;
    });

    it('should prevent purchases when paused', async () => {
      const { privateSale, owner, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      await privateSale.connect(owner).pauseSale();

      await expect(
        privateSale.connect(buyer1).purchase(100, { value: ethers.parseEther('0.1') })
      ).to.be.revertedWith('Sale is paused');
    });

    it('should allow owner to unpause sale', async () => {
      const { privateSale, owner } = await loadFixture(deployPrivateSaleFixture);

      await privateSale.connect(owner).pauseSale();
      await privateSale.connect(owner).unpauseSale();

      expect(await privateSale.isPaused()).to.be.false;
    });

    it('should allow owner to withdraw funds', async () => {
      const { privateSale, owner, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      await privateSale.connect(buyer1).purchase(100, { value: ethers.parseEther('0.1') });

      const balanceBefore = await ethers.provider.getBalance(owner.address);
      await privateSale.connect(owner).withdrawFunds();
      const balanceAfter = await ethers.provider.getBalance(owner.address);

      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it('should not allow non-owner to pause', async () => {
      const { privateSale, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      await expect(privateSale.connect(buyer1).pauseSale()).to.be.reverted;
    });
  });

  describe('Security Tests', () => {
    it('should prevent reentrancy attacks', async () => {
      const { privateSale, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      // Deploy malicious contract
      const MaliciousContract = await ethers.getContractFactory('MaliciousReentrancy');
      const malicious = await MaliciousContract.deploy(await privateSale.getAddress());

      await expect(
        malicious.attack({ value: ethers.parseEther('0.1') })
      ).to.be.revertedWith('ReentrancyGuard');
    });

    it('should validate purchase amount matches sent value', async () => {
      const { privateSale, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      await expect(
        privateSale.connect(buyer1).purchase(100, { value: ethers.parseEther('0.05') })
      ).to.be.revertedWith('Incorrect ETH amount');
    });

    it('should prevent integer overflow in token calculations', async () => {
      const { privateSale, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      const maxUint256 = ethers.MaxUint256;

      await expect(
        privateSale.connect(buyer1).purchase(maxUint256, { value: ethers.parseEther('1') })
      ).to.be.reverted;
    });

    it('should handle zero address validation', async () => {
      const { privateSale, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      await expect(
        privateSale
          .connect(buyer1)
          .purchaseWithReferral(100, ethers.ZeroAddress, { value: ethers.parseEther('0.1') })
      ).to.be.revertedWith('Invalid referrer');
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple purchases from same buyer', async () => {
      const { privateSale, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      await privateSale.connect(buyer1).purchase(100, { value: ethers.parseEther('0.1') });
      await privateSale.connect(buyer1).purchase(200, { value: ethers.parseEther('0.2') });

      expect(await privateSale.getPurchaseCount(buyer1.address)).to.equal(2);
    });

    it('should handle sale reaching target', async () => {
      const { privateSale, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      // Purchase up to target
      const target = await privateSale.targetAmount();

      await expect(
        privateSale.connect(buyer1).purchase(Number(target), { value: ethers.parseEther('5000') })
      ).to.emit(privateSale, 'SaleCompleted');
    });

    it('should prevent purchases after sale ends', async () => {
      const { privateSale, owner, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      const endTime = (await time.latest()) + 30 * 24 * 60 * 60; // 30 days
      await privateSale.connect(owner).setEndTime(endTime);

      await time.increaseTo(endTime + 1);

      await expect(
        privateSale.connect(buyer1).purchase(100, { value: ethers.parseEther('0.1') })
      ).to.be.revertedWith('Sale has ended');
    });

    it('should handle exact minimum and maximum purchases', async () => {
      const { privateSale, buyer1, buyer2 } = await loadFixture(deployPrivateSaleFixture);

      // Minimum
      await expect(
        privateSale.connect(buyer1).purchase(50, { value: ethers.parseEther('0.05') })
      ).to.emit(privateSale, 'PurchaseCompleted');

      // Maximum
      await expect(
        privateSale.connect(buyer2).purchase(500, { value: ethers.parseEther('0.5') })
      ).to.emit(privateSale, 'PurchaseCompleted');
    });
  });

  describe('Gas Optimization', () => {
    it('should use reasonable gas for purchase', async () => {
      const { privateSale, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      const tx = await privateSale
        .connect(buyer1)
        .purchase(100, { value: ethers.parseEther('0.1') });
      const receipt = await tx.wait();

      expect(receipt?.gasUsed).to.be.lt(300000); // Should use less than 300k gas
    });

    it('should use reasonable gas for token claim', async () => {
      const { privateSale, buyer1 } = await loadFixture(deployPrivateSaleFixture);

      await privateSale.connect(buyer1).purchase(100, { value: ethers.parseEther('0.1') });

      const purchase = await privateSale.purchases(buyer1.address, 0);
      const immediate = (purchase.totalTokens * 40n) / 100n;

      const tx = await privateSale.connect(buyer1).claimTokens(0, immediate);
      const receipt = await tx.wait();

      expect(receipt?.gasUsed).to.be.lt(150000); // Should use less than 150k gas
    });
  });
});
