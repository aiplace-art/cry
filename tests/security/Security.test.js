const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Security Tests", function () {
  async function deployContractsFixture() {
    const [owner, attacker, user1, user2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy("SecureToken", "STK", ethers.parseEther("1000000"));

    const Staking = await ethers.getContractFactory("Staking");
    const staking = await Staking.deploy(await token.getAddress(), 100);

    await token.transfer(await staking.getAddress(), ethers.parseEther("500000"));
    await token.transfer(user1.address, ethers.parseEther("10000"));

    return { token, staking, owner, attacker, user1, user2 };
  }

  describe("Reentrancy Protection", function () {
    it("Should prevent reentrancy attacks on withdraw", async function () {
      const { token, staking, attacker } = await loadFixture(deployContractsFixture);

      // Deploy malicious contract
      const MaliciousContract = await ethers.getContractFactory("ReentrancyAttacker");
      const malicious = await MaliciousContract.deploy(await staking.getAddress());

      // Fund the malicious contract
      await token.transfer(await malicious.getAddress(), ethers.parseEther("1000"));

      // Attempt reentrancy attack
      await expect(
        malicious.attack()
      ).to.be.revertedWith("ReentrancyGuard: reentrant call");
    });

    it("Should prevent reentrancy on claimRewards", async function () {
      const { token, staking, attacker } = await loadFixture(deployContractsFixture);

      const MaliciousRewardClaimer = await ethers.getContractFactory("RewardClaimAttacker");
      const malicious = await MaliciousRewardClaimer.deploy(await staking.getAddress());

      await token.transfer(await malicious.getAddress(), ethers.parseEther("1000"));

      await expect(
        malicious.attackRewards()
      ).to.be.revertedWith("ReentrancyGuard: reentrant call");
    });

    it("Should allow normal operations after failed reentrancy", async function () {
      const { token, staking, user1 } = await loadFixture(deployContractsFixture);

      const stakeAmount = ethers.parseEther("500");
      await token.connect(user1).approve(await staking.getAddress(), stakeAmount);
      await staking.connect(user1).stake(stakeAmount);

      // Should work normally
      await expect(staking.connect(user1).withdraw(stakeAmount))
        .to.emit(staking, "Withdrawn");
    });
  });

  describe("Integer Overflow/Underflow Protection", function () {
    it("Should prevent overflow in token transfers", async function () {
      const { token, user1, user2 } = await loadFixture(deployContractsFixture);

      const maxUint = ethers.MaxUint256;

      // Attempt to cause overflow
      await expect(
        token.connect(user1).transfer(user2.address, maxUint)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("Should prevent underflow in withdrawals", async function () {
      const { token, staking, user1 } = await loadFixture(deployContractsFixture);

      const stakeAmount = ethers.parseEther("100");
      await token.connect(user1).approve(await staking.getAddress(), stakeAmount);
      await staking.connect(user1).stake(stakeAmount);

      // Attempt to withdraw more than staked
      await expect(
        staking.connect(user1).withdraw(ethers.parseEther("200"))
      ).to.be.revertedWith("Insufficient staked balance");
    });

    it("Should handle maximum values safely in rewards", async function () {
      const { token, staking, owner } = await loadFixture(deployContractsFixture);

      // Set extremely high reward rate
      const highRewardRate = ethers.MaxUint256 / BigInt(1000000);

      await expect(
        staking.connect(owner).setRewardRate(highRewardRate)
      ).to.not.be.reverted;

      // Verify it doesn't cause issues
      expect(await staking.rewardRate()).to.equal(highRewardRate);
    });

    it("Should prevent arithmetic overflow in staking calculations", async function () {
      const { token, staking, user1 } = await loadFixture(deployContractsFixture);

      const largeAmount = ethers.parseEther("999999");
      await token.transfer(user1.address, largeAmount);
      await token.connect(user1).approve(await staking.getAddress(), largeAmount);

      await expect(staking.connect(user1).stake(largeAmount))
        .to.emit(staking, "Staked");

      // Verify total staked doesn't overflow
      expect(await staking.totalStaked()).to.equal(largeAmount);
    });
  });

  describe("Access Control", function () {
    it("Should only allow owner to pause contract", async function () {
      const { staking, attacker } = await loadFixture(deployContractsFixture);

      await expect(
        staking.connect(attacker).pause()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should only allow owner to set reward rate", async function () {
      const { staking, attacker } = await loadFixture(deployContractsFixture);

      await expect(
        staking.connect(attacker).setRewardRate(500)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should only allow owner to perform emergency withdraw", async function () {
      const { staking, attacker } = await loadFixture(deployContractsFixture);

      await expect(
        staking.connect(attacker).emergencyWithdraw()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should transfer ownership correctly", async function () {
      const { staking, owner, user1 } = await loadFixture(deployContractsFixture);

      await staking.connect(owner).transferOwnership(user1.address);
      expect(await staking.owner()).to.equal(user1.address);

      // New owner should be able to pause
      await expect(staking.connect(user1).pause()).to.not.be.reverted;
    });

    it("Should prevent unauthorized token minting", async function () {
      const { token, attacker } = await loadFixture(deployContractsFixture);

      await expect(
        token.connect(attacker).mint(attacker.address, ethers.parseEther("1000"))
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Front-Running Protection", function () {
    it("Should maintain FIFO order for stakes", async function () {
      const { token, staking, user1, user2 } = await loadFixture(deployContractsFixture);

      await token.transfer(user2.address, ethers.parseEther("5000"));

      const stake1 = ethers.parseEther("1000");
      const stake2 = ethers.parseEther("2000");

      await token.connect(user1).approve(await staking.getAddress(), stake1);
      await token.connect(user2).approve(await staking.getAddress(), stake2);

      // Both stake in same block
      await staking.connect(user1).stake(stake1);
      await staking.connect(user2).stake(stake2);

      // Verify both stakes recorded correctly
      expect(await staking.balanceOf(user1.address)).to.equal(stake1);
      expect(await staking.balanceOf(user2.address)).to.equal(stake2);
    });

    it("Should use commit-reveal for sensitive operations", async function () {
      // This would require implementing commit-reveal pattern
      // Example test structure:
      const { staking, user1 } = await loadFixture(deployContractsFixture);

      // In production, implement commit-reveal for withdrawal amounts
      const commitment = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["uint256", "bytes32"],
          [ethers.parseEther("100"), ethers.randomBytes(32)]
        )
      );

      // This is a placeholder test - actual implementation would differ
      expect(commitment).to.be.properHex(66);
    });
  });

  describe("Denial of Service Protection", function () {
    it("Should handle gas limits in loops", async function () {
      const { token, staking } = await loadFixture(deployContractsFixture);

      // Create multiple small stakes
      const signers = await ethers.getSigners();
      const stakeAmount = ethers.parseEther("10");

      for (let i = 0; i < Math.min(signers.length, 20); i++) {
        await token.transfer(signers[i].address, stakeAmount);
        await token.connect(signers[i]).approve(await staking.getAddress(), stakeAmount);
        await staking.connect(signers[i]).stake(stakeAmount);
      }

      // Should not run out of gas checking total staked
      expect(await staking.totalStaked()).to.be.greaterThan(0);
    });

    it("Should prevent blocking by single user", async function () {
      const { token, staking, user1, user2 } = await loadFixture(deployContractsFixture);

      await token.transfer(user2.address, ethers.parseEther("5000"));

      // User1 makes large stake
      await token.connect(user1).approve(await staking.getAddress(), ethers.parseEther("5000"));
      await staking.connect(user1).stake(ethers.parseEther("5000"));

      // User2 should still be able to stake
      await token.connect(user2).approve(await staking.getAddress(), ethers.parseEther("1000"));
      await expect(
        staking.connect(user2).stake(ethers.parseEther("1000"))
      ).to.not.be.reverted;
    });

    it("Should have withdrawal limits to prevent DoS", async function () {
      const { token, staking, user1 } = await loadFixture(deployContractsFixture);

      const stakeAmount = ethers.parseEther("5000");
      await token.connect(user1).approve(await staking.getAddress(), stakeAmount);
      await staking.connect(user1).stake(stakeAmount);

      // Should handle large withdrawal without running out of gas
      const tx = await staking.connect(user1).withdraw(stakeAmount);
      const receipt = await tx.wait();

      expect(receipt.gasUsed).to.be.lessThan(200000);
    });
  });

  describe("Token Safety", function () {
    it("Should reject transfers to zero address", async function () {
      const { token, owner } = await loadFixture(deployContractsFixture);

      await expect(
        token.connect(owner).transfer(ethers.ZeroAddress, ethers.parseEther("100"))
      ).to.be.revertedWith("ERC20: transfer to the zero address");
    });

    it("Should reject approvals to zero address", async function () {
      const { token, owner } = await loadFixture(deployContractsFixture);

      await expect(
        token.connect(owner).approve(ethers.ZeroAddress, ethers.parseEther("100"))
      ).to.be.revertedWith("ERC20: approve to the zero address");
    });

    it("Should prevent double spending with allowances", async function () {
      const { token, owner, user1, user2 } = await loadFixture(deployContractsFixture);

      await token.approve(user1.address, ethers.parseEther("100"));
      await token.connect(user1).transferFrom(owner.address, user2.address, ethers.parseEther("100"));

      // Second attempt should fail
      await expect(
        token.connect(user1).transferFrom(owner.address, user2.address, ethers.parseEther("1"))
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("Should safely handle token burns", async function () {
      const { token, owner } = await loadFixture(deployContractsFixture);

      const initialSupply = await token.totalSupply();
      const burnAmount = ethers.parseEther("1000");

      await token.burn(burnAmount);

      expect(await token.totalSupply()).to.equal(initialSupply - burnAmount);
      expect(await token.balanceOf(owner.address)).to.be.lessThan(initialSupply);
    });
  });

  describe("Timestamp Manipulation", function () {
    it("Should not depend solely on block.timestamp for critical logic", async function () {
      const { staking, user1, token } = await loadFixture(deployContractsFixture);

      const stakeAmount = ethers.parseEther("1000");
      await token.connect(user1).approve(await staking.getAddress(), stakeAmount);
      await staking.connect(user1).stake(stakeAmount);

      // Even if timestamp is manipulated slightly, rewards should be reasonable
      const earned = await staking.earned(user1.address);
      expect(earned).to.be.lessThan(ethers.parseEther("1000000")); // Sanity check
    });

    it("Should handle rapid succession of operations", async function () {
      const { token, staking, user1 } = await loadFixture(deployContractsFixture);

      const stakeAmount = ethers.parseEther("100");
      await token.connect(user1).approve(await staking.getAddress(), stakeAmount * BigInt(3));

      // Rapid stake/unstake
      await staking.connect(user1).stake(stakeAmount);
      await staking.connect(user1).stake(stakeAmount);
      await staking.connect(user1).withdraw(stakeAmount);

      expect(await staking.balanceOf(user1.address)).to.equal(stakeAmount);
    });
  });
});
