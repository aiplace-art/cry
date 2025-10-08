const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Staking Contract", function () {
  // Fixture to deploy contracts
  async function deployStakingFixture() {
    const [owner, addr1, addr2, addr3] = await ethers.getSigners();

    // Deploy Token
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy("StakeToken", "STK", ethers.parseEther("10000000"));

    // Deploy Staking Contract
    const Staking = await ethers.getContractFactory("Staking");
    const rewardRate = 100; // 100 tokens per second
    const staking = await Staking.deploy(await token.getAddress(), rewardRate);

    // Transfer tokens to staking contract for rewards
    await token.transfer(await staking.getAddress(), ethers.parseEther("1000000"));

    // Transfer tokens to test addresses
    await token.transfer(addr1.address, ethers.parseEther("10000"));
    await token.transfer(addr2.address, ethers.parseEther("10000"));

    return { token, staking, owner, addr1, addr2, addr3, rewardRate };
  }

  describe("Deployment", function () {
    it("Should set the correct token address", async function () {
      const { token, staking } = await loadFixture(deployStakingFixture);
      expect(await staking.stakingToken()).to.equal(await token.getAddress());
    });

    it("Should set the correct reward rate", async function () {
      const { staking, rewardRate } = await loadFixture(deployStakingFixture);
      expect(await staking.rewardRate()).to.equal(rewardRate);
    });

    it("Should set the owner correctly", async function () {
      const { staking, owner } = await loadFixture(deployStakingFixture);
      expect(await staking.owner()).to.equal(owner.address);
    });

    it("Should have zero initial staked amount", async function () {
      const { staking } = await loadFixture(deployStakingFixture);
      expect(await staking.totalStaked()).to.equal(0);
    });
  });

  describe("Staking", function () {
    it("Should allow users to stake tokens", async function () {
      const { token, staking, addr1 } = await loadFixture(deployStakingFixture);
      const stakeAmount = ethers.parseEther("1000");

      await token.connect(addr1).approve(await staking.getAddress(), stakeAmount);
      await expect(staking.connect(addr1).stake(stakeAmount))
        .to.emit(staking, "Staked")
        .withArgs(addr1.address, stakeAmount);

      expect(await staking.balanceOf(addr1.address)).to.equal(stakeAmount);
      expect(await staking.totalStaked()).to.equal(stakeAmount);
    });

    it("Should fail to stake without approval", async function () {
      const { staking, addr1 } = await loadFixture(deployStakingFixture);
      const stakeAmount = ethers.parseEther("1000");

      await expect(
        staking.connect(addr1).stake(stakeAmount)
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("Should fail to stake zero tokens", async function () {
      const { staking, addr1 } = await loadFixture(deployStakingFixture);

      await expect(
        staking.connect(addr1).stake(0)
      ).to.be.revertedWith("Cannot stake 0 tokens");
    });

    it("Should fail to stake more than balance", async function () {
      const { token, staking, addr1 } = await loadFixture(deployStakingFixture);
      const tooMuch = ethers.parseEther("100000");

      await token.connect(addr1).approve(await staking.getAddress(), tooMuch);
      await expect(
        staking.connect(addr1).stake(tooMuch)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("Should handle multiple stakes from same user", async function () {
      const { token, staking, addr1 } = await loadFixture(deployStakingFixture);
      const firstStake = ethers.parseEther("500");
      const secondStake = ethers.parseEther("300");

      await token.connect(addr1).approve(await staking.getAddress(), firstStake + secondStake);

      await staking.connect(addr1).stake(firstStake);
      await staking.connect(addr1).stake(secondStake);

      expect(await staking.balanceOf(addr1.address)).to.equal(firstStake + secondStake);
    });

    it("Should handle stakes from multiple users", async function () {
      const { token, staking, addr1, addr2 } = await loadFixture(deployStakingFixture);
      const stake1 = ethers.parseEther("1000");
      const stake2 = ethers.parseEther("2000");

      await token.connect(addr1).approve(await staking.getAddress(), stake1);
      await token.connect(addr2).approve(await staking.getAddress(), stake2);

      await staking.connect(addr1).stake(stake1);
      await staking.connect(addr2).stake(stake2);

      expect(await staking.totalStaked()).to.equal(stake1 + stake2);
    });
  });

  describe("Withdrawing", function () {
    it("Should allow users to withdraw staked tokens", async function () {
      const { token, staking, addr1 } = await loadFixture(deployStakingFixture);
      const stakeAmount = ethers.parseEther("1000");

      await token.connect(addr1).approve(await staking.getAddress(), stakeAmount);
      await staking.connect(addr1).stake(stakeAmount);

      await expect(staking.connect(addr1).withdraw(stakeAmount))
        .to.emit(staking, "Withdrawn")
        .withArgs(addr1.address, stakeAmount);

      expect(await staking.balanceOf(addr1.address)).to.equal(0);
      expect(await token.balanceOf(addr1.address)).to.equal(ethers.parseEther("10000"));
    });

    it("Should fail to withdraw more than staked", async function () {
      const { token, staking, addr1 } = await loadFixture(deployStakingFixture);
      const stakeAmount = ethers.parseEther("1000");

      await token.connect(addr1).approve(await staking.getAddress(), stakeAmount);
      await staking.connect(addr1).stake(stakeAmount);

      await expect(
        staking.connect(addr1).withdraw(ethers.parseEther("2000"))
      ).to.be.revertedWith("Insufficient staked balance");
    });

    it("Should fail to withdraw zero tokens", async function () {
      const { staking, addr1 } = await loadFixture(deployStakingFixture);

      await expect(
        staking.connect(addr1).withdraw(0)
      ).to.be.revertedWith("Cannot withdraw 0 tokens");
    });

    it("Should allow partial withdrawals", async function () {
      const { token, staking, addr1 } = await loadFixture(deployStakingFixture);
      const stakeAmount = ethers.parseEther("1000");
      const withdrawAmount = ethers.parseEther("400");

      await token.connect(addr1).approve(await staking.getAddress(), stakeAmount);
      await staking.connect(addr1).stake(stakeAmount);
      await staking.connect(addr1).withdraw(withdrawAmount);

      expect(await staking.balanceOf(addr1.address)).to.equal(stakeAmount - withdrawAmount);
    });
  });

  describe("Rewards", function () {
    it("Should calculate rewards correctly over time", async function () {
      const { token, staking, addr1, rewardRate } = await loadFixture(deployStakingFixture);
      const stakeAmount = ethers.parseEther("1000");

      await token.connect(addr1).approve(await staking.getAddress(), stakeAmount);
      await staking.connect(addr1).stake(stakeAmount);

      // Fast forward 100 seconds
      await time.increase(100);

      const earned = await staking.earned(addr1.address);
      const expectedReward = BigInt(rewardRate) * BigInt(100);

      expect(earned).to.be.closeTo(expectedReward, ethers.parseEther("10")); // Allow 10 token variance
    });

    it("Should allow users to claim rewards", async function () {
      const { token, staking, addr1 } = await loadFixture(deployStakingFixture);
      const stakeAmount = ethers.parseEther("1000");

      await token.connect(addr1).approve(await staking.getAddress(), stakeAmount);
      await staking.connect(addr1).stake(stakeAmount);

      await time.increase(100);

      const initialBalance = await token.balanceOf(addr1.address);
      await staking.connect(addr1).claimRewards();
      const finalBalance = await token.balanceOf(addr1.address);

      expect(finalBalance).to.be.greaterThan(initialBalance);
    });

    it("Should emit RewardPaid event on claim", async function () {
      const { token, staking, addr1 } = await loadFixture(deployStakingFixture);
      const stakeAmount = ethers.parseEther("1000");

      await token.connect(addr1).approve(await staking.getAddress(), stakeAmount);
      await staking.connect(addr1).stake(stakeAmount);

      await time.increase(100);

      await expect(staking.connect(addr1).claimRewards())
        .to.emit(staking, "RewardPaid");
    });

    it("Should distribute rewards proportionally to multiple stakers", async function () {
      const { token, staking, addr1, addr2 } = await loadFixture(deployStakingFixture);

      // addr1 stakes 2x more than addr2
      const stake1 = ethers.parseEther("2000");
      const stake2 = ethers.parseEther("1000");

      await token.connect(addr1).approve(await staking.getAddress(), stake1);
      await token.connect(addr2).approve(await staking.getAddress(), stake2);

      await staking.connect(addr1).stake(stake1);
      await staking.connect(addr2).stake(stake2);

      await time.increase(300);

      const earned1 = await staking.earned(addr1.address);
      const earned2 = await staking.earned(addr2.address);

      // addr1 should earn approximately 2x addr2
      expect(earned1).to.be.closeTo(earned2 * BigInt(2), ethers.parseEther("20"));
    });

    it("Should reset rewards after claiming", async function () {
      const { token, staking, addr1 } = await loadFixture(deployStakingFixture);
      const stakeAmount = ethers.parseEther("1000");

      await token.connect(addr1).approve(await staking.getAddress(), stakeAmount);
      await staking.connect(addr1).stake(stakeAmount);

      await time.increase(100);
      await staking.connect(addr1).claimRewards();

      const earnedAfterClaim = await staking.earned(addr1.address);
      expect(earnedAfterClaim).to.equal(0);
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow owner to pause staking", async function () {
      const { staking, owner } = await loadFixture(deployStakingFixture);

      await expect(staking.connect(owner).pause())
        .to.emit(staking, "Paused");

      expect(await staking.paused()).to.be.true;
    });

    it("Should prevent staking when paused", async function () {
      const { token, staking, owner, addr1 } = await loadFixture(deployStakingFixture);

      await staking.connect(owner).pause();

      await token.connect(addr1).approve(await staking.getAddress(), ethers.parseEther("1000"));
      await expect(
        staking.connect(addr1).stake(ethers.parseEther("1000"))
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should allow owner to unpause", async function () {
      const { staking, owner } = await loadFixture(deployStakingFixture);

      await staking.connect(owner).pause();
      await expect(staking.connect(owner).unpause())
        .to.emit(staking, "Unpaused");

      expect(await staking.paused()).to.be.false;
    });

    it("Should allow emergency withdrawal", async function () {
      const { token, staking, owner } = await loadFixture(deployStakingFixture);
      const contractBalance = await token.balanceOf(await staking.getAddress());

      await staking.connect(owner).emergencyWithdraw();

      expect(await token.balanceOf(owner.address)).to.be.greaterThan(0);
      expect(await token.balanceOf(await staking.getAddress())).to.equal(0);
    });

    it("Should only allow owner to call emergency functions", async function () {
      const { staking, addr1 } = await loadFixture(deployStakingFixture);

      await expect(
        staking.connect(addr1).pause()
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await expect(
        staking.connect(addr1).emergencyWithdraw()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Gas Optimization", function () {
    it("Should efficiently stake tokens", async function () {
      const { token, staking, addr1 } = await loadFixture(deployStakingFixture);
      const stakeAmount = ethers.parseEther("1000");

      await token.connect(addr1).approve(await staking.getAddress(), stakeAmount);
      const tx = await staking.connect(addr1).stake(stakeAmount);
      const receipt = await tx.wait();

      console.log(`Stake gas used: ${receipt.gasUsed}`);
      expect(receipt.gasUsed).to.be.lessThan(150000);
    });

    it("Should efficiently claim rewards", async function () {
      const { token, staking, addr1 } = await loadFixture(deployStakingFixture);
      const stakeAmount = ethers.parseEther("1000");

      await token.connect(addr1).approve(await staking.getAddress(), stakeAmount);
      await staking.connect(addr1).stake(stakeAmount);
      await time.increase(100);

      const tx = await staking.connect(addr1).claimRewards();
      const receipt = await tx.wait();

      console.log(`Claim rewards gas used: ${receipt.gasUsed}`);
      expect(receipt.gasUsed).to.be.lessThan(100000);
    });
  });
});
