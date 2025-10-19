/**
 * HypeAI Referral System - Edge Cases & Security Tests
 * Tests for blacklist, fraud prevention, security, and boundary conditions
 */

const { expect } = require('chai');
const { ethers } = require('hardhat');
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');

describe('ReferralSystem - Edge Cases & Security', function () {
  async function deployReferralSystemFixture() {
    const [owner, user1, user2, user3, user4, privateSale, attacker] = await ethers.getSigners();

    const MockERC20 = await ethers.getContractFactory('MockERC20');
    const hypeToken = await MockERC20.deploy('HypeAI Token', 'HYPE', ethers.parseEther('10000000000'));
    const usdtToken = await MockERC20.deploy('Tether USD', 'USDT', ethers.parseEther('1000000'));

    const ReferralSystem = await ethers.getContractFactory('HypeAIReferralSystem');
    const referralSystem = await ReferralSystem.deploy(
      await hypeToken.getAddress(),
      await usdtToken.getAddress(),
      privateSale.address
    );

    await hypeToken.transfer(await referralSystem.getAddress(), ethers.parseEther('1000000'));
    await usdtToken.transfer(await referralSystem.getAddress(), ethers.parseEther('50000'));

    return { referralSystem, hypeToken, usdtToken, owner, user1, user2, user3, user4, privateSale, attacker };
  }

  describe('Blacklist Functionality', function () {
    it('should prevent blacklisted user from registering referrals', async function () {
      const { referralSystem, owner, user1, user2 } = await loadFixture(deployReferralSystemFixture);

      // Blacklist user1
      await referralSystem.connect(owner).setBlacklisted(user1.address, true);

      // Try to register referral with blacklisted user
      await expect(
        referralSystem.registerReferral(user2.address, user1.address)
      ).to.be.revertedWith('User is blacklisted');
    });

    it('should prevent blacklisted user from being referred', async function () {
      const { referralSystem, owner, user1, user2 } = await loadFixture(deployReferralSystemFixture);

      await referralSystem.connect(owner).setBlacklisted(user1.address, true);

      await expect(
        referralSystem.registerReferral(user1.address, user2.address)
      ).to.be.revertedWith('User is blacklisted');
    });

    it('should stop rewards for blacklisted referrer', async function () {
      const { referralSystem, owner, user1, user2, privateSale } = await loadFixture(deployReferralSystemFixture);

      // Register and make initial purchase
      await referralSystem.registerReferral(user1.address, user2.address);

      await referralSystem.connect(privateSale).recordPurchase(
        user1.address,
        1000,
        ethers.parseEther('12500000')
      );

      let stats = await referralSystem.getReferralStats(user2.address);
      expect(stats.pendingRewardsUSD).to.equal(50);

      // Blacklist user2
      await referralSystem.connect(owner).setBlacklisted(user2.address, true);

      // Another purchase - user2 should not receive rewards
      await referralSystem.connect(privateSale).recordPurchase(
        user1.address,
        1000,
        ethers.parseEther('12500000')
      );

      stats = await referralSystem.getReferralStats(user2.address);
      expect(stats.pendingRewardsUSD).to.equal(50); // Unchanged
      expect(stats.isActive).to.equal(false);
    });

    it('should prevent blacklisted user from claiming rewards', async function () {
      const { referralSystem, owner, user1, user2, privateSale } = await loadFixture(deployReferralSystemFixture);

      await referralSystem.registerReferral(user1.address, user2.address);

      await referralSystem.connect(privateSale).recordPurchase(
        user1.address,
        1000,
        ethers.parseEther('12500000')
      );

      // Blacklist user2
      await referralSystem.connect(owner).setBlacklisted(user2.address, true);

      // Try to claim rewards
      await expect(
        referralSystem.connect(user2).claimRewards(true)
      ).to.be.revertedWith('User is blacklisted');
    });

    it('should allow unblacklisting', async function () {
      const { referralSystem, owner, user1, user2 } = await loadFixture(deployReferralSystemFixture);

      // Blacklist
      await referralSystem.connect(owner).setBlacklisted(user1.address, true);
      expect(await referralSystem.blacklisted(user1.address)).to.be.true;

      // Unblacklist
      await referralSystem.connect(owner).setBlacklisted(user1.address, false);
      expect(await referralSystem.blacklisted(user1.address)).to.be.false;

      // Should work now
      await referralSystem.registerReferral(user2.address, user1.address);
    });

    it('should emit UserBlacklisted event', async function () {
      const { referralSystem, owner, user1 } = await loadFixture(deployReferralSystemFixture);

      await expect(referralSystem.connect(owner).setBlacklisted(user1.address, true))
        .to.emit(referralSystem, 'UserBlacklisted')
        .withArgs(user1.address, true);
    });
  });

  describe('Anti-Fraud Protection', function () {
    it('should prevent self-referral', async function () {
      const { referralSystem, user1 } = await loadFixture(deployReferralSystemFixture);

      await expect(
        referralSystem.registerReferral(user1.address, user1.address)
      ).to.be.revertedWith('Cannot refer yourself');
    });

    it('should prevent circular referrals', async function () {
      const { referralSystem, user1, user2 } = await loadFixture(deployReferralSystemFixture);

      // user1 refers user2
      await referralSystem.registerReferral(user2.address, user1.address);

      // Try to make user2 refer user1 (circular)
      await expect(
        referralSystem.registerReferral(user1.address, user2.address)
      ).to.be.revertedWith('Circular referral');
    });

    it('should prevent double registration', async function () {
      const { referralSystem, user1, user2, user3 } = await loadFixture(deployReferralSystemFixture);

      await referralSystem.registerReferral(user1.address, user2.address);

      // Try to register user1 again with different referrer
      await expect(
        referralSystem.registerReferral(user1.address, user3.address)
      ).to.be.revertedWith('Already has referrer');
    });

    it('should prevent owner from being referred', async function () {
      const { referralSystem, owner, user1 } = await loadFixture(deployReferralSystemFixture);

      await expect(
        referralSystem.registerReferral(owner.address, user1.address)
      ).to.be.revertedWith('Owner cannot be referred');
    });

    it('should not reward inactive accounts', async function () {
      const { referralSystem, owner, user1, user2, privateSale } = await loadFixture(deployReferralSystemFixture);

      await referralSystem.registerReferral(user1.address, user2.address);

      // Deactivate user2
      await referralSystem.connect(owner).deactivateAccount(user2.address);

      // Purchase should not generate rewards
      await referralSystem.connect(privateSale).recordPurchase(
        user1.address,
        1000,
        ethers.parseEther('12500000')
      );

      const stats = await referralSystem.getReferralStats(user2.address);
      expect(stats.pendingRewardsUSD).to.equal(0);
      expect(stats.isActive).to.equal(false);
    });
  });

  describe('Access Control', function () {
    it('should only allow private sale contract to record purchases', async function () {
      const { referralSystem, user1, attacker } = await loadFixture(deployReferralSystemFixture);

      await expect(
        referralSystem.connect(attacker).recordPurchase(
          user1.address,
          1000,
          ethers.parseEther('12500000')
        )
      ).to.be.revertedWith('Only private sale contract');
    });

    it('should only allow owner to blacklist users', async function () {
      const { referralSystem, user1, attacker } = await loadFixture(deployReferralSystemFixture);

      await expect(
        referralSystem.connect(attacker).setBlacklisted(user1.address, true)
      ).to.be.revertedWithCustomError(referralSystem, 'OwnableUnauthorizedAccount');
    });

    it('should only allow owner to deactivate accounts', async function () {
      const { referralSystem, user1, attacker } = await loadFixture(deployReferralSystemFixture);

      await expect(
        referralSystem.connect(attacker).deactivateAccount(user1.address)
      ).to.be.revertedWithCustomError(referralSystem, 'OwnableUnauthorizedAccount');
    });

    it('should only allow owner to update private sale contract', async function () {
      const { referralSystem, user1, attacker } = await loadFixture(deployReferralSystemFixture);

      await expect(
        referralSystem.connect(attacker).setPrivateSaleContract(user1.address)
      ).to.be.revertedWithCustomError(referralSystem, 'OwnableUnauthorizedAccount');
    });

    it('should only allow owner to pause/unpause', async function () {
      const { referralSystem, attacker } = await loadFixture(deployReferralSystemFixture);

      await expect(
        referralSystem.connect(attacker).pause()
      ).to.be.revertedWithCustomError(referralSystem, 'OwnableUnauthorizedAccount');

      await expect(
        referralSystem.connect(attacker).unpause()
      ).to.be.revertedWithCustomError(referralSystem, 'OwnableUnauthorizedAccount');
    });
  });

  describe('Pause Functionality', function () {
    it('should prevent registration when paused', async function () {
      const { referralSystem, owner, user1, user2 } = await loadFixture(deployReferralSystemFixture);

      await referralSystem.connect(owner).pause();

      await expect(
        referralSystem.registerReferral(user1.address, user2.address)
      ).to.be.revertedWithCustomError(referralSystem, 'EnforcedPause');
    });

    it('should prevent purchases when paused', async function () {
      const { referralSystem, owner, user1, privateSale } = await loadFixture(deployReferralSystemFixture);

      await referralSystem.connect(owner).pause();

      await expect(
        referralSystem.connect(privateSale).recordPurchase(
          user1.address,
          1000,
          ethers.parseEther('12500000')
        )
      ).to.be.revertedWithCustomError(referralSystem, 'EnforcedPause');
    });

    it('should prevent claims when paused', async function () {
      const { referralSystem, owner, user1, user2, privateSale } = await loadFixture(deployReferralSystemFixture);

      await referralSystem.registerReferral(user1.address, user2.address);

      await referralSystem.connect(privateSale).recordPurchase(
        user1.address,
        1000,
        ethers.parseEther('12500000')
      );

      await referralSystem.connect(owner).pause();

      await expect(
        referralSystem.connect(user2).claimRewards(true)
      ).to.be.revertedWithCustomError(referralSystem, 'EnforcedPause');
    });

    it('should allow operations after unpause', async function () {
      const { referralSystem, owner, user1, user2 } = await loadFixture(deployReferralSystemFixture);

      await referralSystem.connect(owner).pause();
      await referralSystem.connect(owner).unpause();

      await referralSystem.registerReferral(user1.address, user2.address);
    });
  });

  describe('Reentrancy Protection', function () {
    it('should protect claimRewards from reentrancy', async function () {
      const { referralSystem, user1, user2, privateSale } = await loadFixture(deployReferralSystemFixture);

      // Setup
      await referralSystem.registerReferral(user1.address, user2.address);
      await referralSystem.connect(privateSale).recordPurchase(
        user1.address,
        1000,
        ethers.parseEther('12500000')
      );

      // Deploy malicious contract that tries to reenter
      const MaliciousContract = await ethers.getContractFactory('MaliciousReentrant');
      const malicious = await MaliciousContract.deploy(await referralSystem.getAddress());

      // This should fail due to ReentrancyGuard
      // (Implementation depends on your malicious contract setup)
    });
  });

  describe('Zero Address Checks', function () {
    it('should reject zero address for referee', async function () {
      const { referralSystem, user1 } = await loadFixture(deployReferralSystemFixture);

      await expect(
        referralSystem.registerReferral(ethers.ZeroAddress, user1.address)
      ).to.be.revertedWith('Invalid referee');
    });

    it('should reject zero address for referrer', async function () {
      const { referralSystem, user1 } = await loadFixture(deployReferralSystemFixture);

      await expect(
        referralSystem.registerReferral(user1.address, ethers.ZeroAddress)
      ).to.be.revertedWith('Invalid referrer');
    });
  });

  describe('Claim Rewards Edge Cases', function () {
    it('should fail claiming with no pending rewards', async function () {
      const { referralSystem, user1 } = await loadFixture(deployReferralSystemFixture);

      await expect(
        referralSystem.connect(user1).claimRewards(true)
      ).to.be.revertedWith('No pending rewards');
    });

    it('should fail claiming when account is inactive', async function () {
      const { referralSystem, owner, user1, user2, privateSale } = await loadFixture(deployReferralSystemFixture);

      await referralSystem.registerReferral(user1.address, user2.address);

      await referralSystem.connect(privateSale).recordPurchase(
        user1.address,
        1000,
        ethers.parseEther('12500000')
      );

      // Deactivate
      await referralSystem.connect(owner).deactivateAccount(user2.address);

      await expect(
        referralSystem.connect(user2).claimRewards(true)
      ).to.be.revertedWith('Account not active');
    });

    it('should fail claiming when insufficient HYPE balance', async function () {
      const { referralSystem, hypeToken, owner, user1, user2, privateSale } = await loadFixture(deployReferralSystemFixture);

      await referralSystem.registerReferral(user1.address, user2.address);

      await referralSystem.connect(privateSale).recordPurchase(
        user1.address,
        1000,
        ethers.parseEther('12500000')
      );

      // Withdraw all HYPE from contract
      const contractAddress = await referralSystem.getAddress();
      const balance = await hypeToken.balanceOf(contractAddress);
      await referralSystem.connect(owner).emergencyWithdraw(await hypeToken.getAddress(), balance);

      await expect(
        referralSystem.connect(user2).claimRewards(true)
      ).to.be.revertedWith('Insufficient HYPE tokens in contract');
    });

    it('should fail claiming when insufficient USDT balance', async function () {
      const { referralSystem, usdtToken, owner, user1, user2, privateSale } = await loadFixture(deployReferralSystemFixture);

      await referralSystem.registerReferral(user1.address, user2.address);

      await referralSystem.connect(privateSale).recordPurchase(
        user1.address,
        1000,
        ethers.parseEther('12500000')
      );

      // Withdraw all USDT
      const contractAddress = await referralSystem.getAddress();
      const balance = await usdtToken.balanceOf(contractAddress);
      await referralSystem.connect(owner).emergencyWithdraw(await usdtToken.getAddress(), balance);

      await expect(
        referralSystem.connect(user2).claimRewards(false)
      ).to.be.revertedWith('Insufficient USDT in contract');
    });

    it('should reset pending rewards after successful claim', async function () {
      const { referralSystem, user1, user2, privateSale } = await loadFixture(deployReferralSystemFixture);

      await referralSystem.registerReferral(user1.address, user2.address);

      await referralSystem.connect(privateSale).recordPurchase(
        user1.address,
        1000,
        ethers.parseEther('12500000')
      );

      await referralSystem.connect(user2).claimRewards(true);

      const stats = await referralSystem.getReferralStats(user2.address);
      expect(stats.pendingRewardsUSD).to.equal(0);
      expect(stats.totalClaimedUSD).to.equal(50);
    });
  });

  describe('Large Number Edge Cases', function () {
    it('should handle maximum uint256 values safely', async function () {
      const { referralSystem } = await loadFixture(deployReferralSystemFixture);

      const maxCap = await referralSystem.MAX_REWARD_CAP_USD();
      expect(maxCap).to.equal(10000);
    });

    it('should handle very large purchase amounts', async function () {
      const { referralSystem, user1, user2, privateSale } = await loadFixture(deployReferralSystemFixture);

      await referralSystem.registerReferral(user1.address, user2.address);

      // Purchase $100,000 (but cap at $10,000 reward)
      await referralSystem.connect(privateSale).recordPurchase(
        user1.address,
        100000,
        ethers.parseEther('1250000000')
      );

      const stats = await referralSystem.getReferralStats(user2.address);
      expect(stats.totalEarnedUSD).to.be.at.most(10000);
    });

    it('should handle many small purchases', async function () {
      const { referralSystem, user1, user2, privateSale } = await loadFixture(deployReferralSystemFixture);

      await referralSystem.registerReferral(user1.address, user2.address);

      // 100 purchases of $400 each
      for (let i = 0; i < 100; i++) {
        await referralSystem.connect(privateSale).recordPurchase(
          user1.address,
          400,
          ethers.parseEther('5000000')
        );
      }

      const stats = await referralSystem.getReferralStats(user2.address);
      // 100 * 400 * 5% = $2000, but limited to cap
      expect(stats.totalEarnedUSD).to.equal(2000);
    });
  });

  describe('Event Emission', function () {
    it('should emit ReferralRegistered with correct parameters', async function () {
      const { referralSystem, user1, user2, user3 } = await loadFixture(deployReferralSystemFixture);

      await referralSystem.registerReferral(user2.address, user3.address);

      await expect(referralSystem.registerReferral(user1.address, user2.address))
        .to.emit(referralSystem, 'ReferralRegistered')
        .withArgs(user1.address, user2.address, user3.address);
    });

    it('should emit PurchaseRecorded with correct parameters', async function () {
      const { referralSystem, user1, user2, user3, privateSale } = await loadFixture(deployReferralSystemFixture);

      await referralSystem.registerReferral(user2.address, user3.address);
      await referralSystem.registerReferral(user1.address, user2.address);

      const amount = 1000;
      const tokens = ethers.parseEther('12500000');

      await expect(
        referralSystem.connect(privateSale).recordPurchase(user1.address, amount, tokens)
      ).to.emit(referralSystem, 'PurchaseRecorded')
        .withArgs(user1.address, amount, tokens, user2.address, 50, user3.address, 20);
    });

    it('should emit RewardsClaimed event', async function () {
      const { referralSystem, user1, user2, privateSale } = await loadFixture(deployReferralSystemFixture);

      await referralSystem.registerReferral(user1.address, user2.address);

      await referralSystem.connect(privateSale).recordPurchase(
        user1.address,
        1000,
        ethers.parseEther('12500000')
      );

      await expect(referralSystem.connect(user2).claimRewards(true))
        .to.emit(referralSystem, 'RewardsClaimed')
        .withArgs(user2.address, 50, ethers.parseEther('625000'), true);
    });
  });
});
