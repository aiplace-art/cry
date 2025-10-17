const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("TeamTokenVesting", function () {
  let teamVesting, hypeToken;
  let owner, team1, team2, team3, team4, nonTeam;

  const TEAM_ALLOCATION = ethers.parseEther("2100000000"); // 10% of supply
  const CLIFF_DURATION = 6 * 30 * 24 * 60 * 60; // 6 months
  const VESTING_DURATION = 24 * 30 * 24 * 60 * 60; // 24 months
  const TOTAL_DURATION = CLIFF_DURATION + VESTING_DURATION; // 30 months total

  beforeEach(async function () {
    [owner, team1, team2, team3, team4, nonTeam] = await ethers.getSigners();

    // Deploy HypeToken
    const HypeToken = await ethers.getContractFactory("HypeToken");
    hypeToken = await HypeToken.deploy();

    // Deploy TeamTokenVesting
    const TeamTokenVesting = await ethers.getContractFactory("TeamTokenVesting");
    teamVesting = await TeamTokenVesting.deploy(hypeToken.target);

    // Transfer team allocation to vesting contract
    await hypeToken.transfer(teamVesting.target, TEAM_ALLOCATION);
  });

  describe("Add Beneficiaries Before Vesting Starts", function () {
    it("should allow owner to add beneficiaries before vesting starts", async function () {
      const allocation = ethers.parseEther("500000000"); // 500M tokens

      await expect(
        teamVesting.connect(owner).addBeneficiary(team1.address, allocation)
      ).to.emit(teamVesting, "BeneficiaryAdded")
        .withArgs(team1.address, allocation);

      const info = await teamVesting.getVestingInfo(team1.address);
      expect(info.totalAllocation).to.equal(allocation);
      expect(info.released).to.equal(0);
    });

    it("should allow adding multiple beneficiaries", async function () {
      const allocation1 = ethers.parseEther("500000000");
      const allocation2 = ethers.parseEther("700000000");
      const allocation3 = ethers.parseEther("900000000");

      await teamVesting.connect(owner).addBeneficiary(team1.address, allocation1);
      await teamVesting.connect(owner).addBeneficiary(team2.address, allocation2);
      await teamVesting.connect(owner).addBeneficiary(team3.address, allocation3);

      const info1 = await teamVesting.getVestingInfo(team1.address);
      const info2 = await teamVesting.getVestingInfo(team2.address);
      const info3 = await teamVesting.getVestingInfo(team3.address);

      expect(info1.totalAllocation).to.equal(allocation1);
      expect(info2.totalAllocation).to.equal(allocation2);
      expect(info3.totalAllocation).to.equal(allocation3);
    });

    it("should prevent non-owner from adding beneficiaries", async function () {
      const allocation = ethers.parseEther("500000000");

      await expect(
        teamVesting.connect(team1).addBeneficiary(team2.address, allocation)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should prevent adding beneficiary with zero address", async function () {
      const allocation = ethers.parseEther("500000000");

      await expect(
        teamVesting.connect(owner).addBeneficiary(ethers.ZeroAddress, allocation)
      ).to.be.revertedWith("Invalid beneficiary address");
    });

    it("should prevent adding beneficiary with zero allocation", async function () {
      await expect(
        teamVesting.connect(owner).addBeneficiary(team1.address, 0)
      ).to.be.revertedWith("Allocation must be greater than zero");
    });

    it("should prevent adding same beneficiary twice", async function () {
      const allocation = ethers.parseEther("500000000");

      await teamVesting.connect(owner).addBeneficiary(team1.address, allocation);

      await expect(
        teamVesting.connect(owner).addBeneficiary(team1.address, allocation)
      ).to.be.revertedWith("Beneficiary already exists");
    });

    it("should prevent allocations exceeding total team tokens", async function () {
      const excessiveAllocation = ethers.parseEther("2200000000"); // More than 2.1B

      await expect(
        teamVesting.connect(owner).addBeneficiary(team1.address, excessiveAllocation)
      ).to.be.revertedWith("Exceeds total allocation");
    });

    it("should track total allocated correctly", async function () {
      const allocation1 = ethers.parseEther("700000000");
      const allocation2 = ethers.parseEther("800000000");
      const allocation3 = ethers.parseEther("600000000");

      await teamVesting.connect(owner).addBeneficiary(team1.address, allocation1);
      await teamVesting.connect(owner).addBeneficiary(team2.address, allocation2);
      await teamVesting.connect(owner).addBeneficiary(team3.address, allocation3);

      const totalAllocated = await teamVesting.totalAllocated();
      expect(totalAllocated).to.equal(allocation1 + allocation2 + allocation3);
    });
  });

  describe("Cannot Add After Vesting Starts", function () {
    it("should prevent adding beneficiaries after vesting starts", async function () {
      // Start vesting
      await teamVesting.connect(owner).startVesting();

      const allocation = ethers.parseEther("500000000");

      await expect(
        teamVesting.connect(owner).addBeneficiary(team1.address, allocation)
      ).to.be.revertedWith("Vesting already started");
    });

    it("should allow adding before start even if some time has passed", async function () {
      // Wait some time but don't start vesting
      await time.increase(30 * 24 * 60 * 60); // 30 days

      const allocation = ethers.parseEther("500000000");

      await expect(
        teamVesting.connect(owner).addBeneficiary(team1.address, allocation)
      ).to.not.be.reverted;
    });
  });

  describe("Start Vesting", function () {
    beforeEach(async function () {
      // Add some beneficiaries
      await teamVesting.connect(owner).addBeneficiary(team1.address, ethers.parseEther("700000000"));
      await teamVesting.connect(owner).addBeneficiary(team2.address, ethers.parseEther("800000000"));
    });

    it("should allow owner to start vesting", async function () {
      const tx = await teamVesting.connect(owner).startVesting();
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      const startTime = await teamVesting.vestingStart();
      expect(startTime).to.equal(block.timestamp);
    });

    it("should emit VestingStarted event", async function () {
      await expect(
        teamVesting.connect(owner).startVesting()
      ).to.emit(teamVesting, "VestingStarted");
    });

    it("should prevent non-owner from starting vesting", async function () {
      await expect(
        teamVesting.connect(team1).startVesting()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should prevent starting vesting twice", async function () {
      await teamVesting.connect(owner).startVesting();

      await expect(
        teamVesting.connect(owner).startVesting()
      ).to.be.revertedWith("Vesting already started");
    });

    it("should prevent starting with no beneficiaries", async function () {
      const TeamTokenVesting = await ethers.getContractFactory("TeamTokenVesting");
      const emptyVesting = await TeamTokenVesting.deploy(hypeToken.target);

      await expect(
        emptyVesting.connect(owner).startVesting()
      ).to.be.revertedWith("No beneficiaries added");
    });
  });

  describe("No Tokens Released Before Cliff", function () {
    beforeEach(async function () {
      await teamVesting.connect(owner).addBeneficiary(team1.address, ethers.parseEther("600000000"));
      await teamVesting.connect(owner).startVesting();
    });

    it("should return zero releasable tokens during cliff period", async function () {
      // Check at various points during cliff
      for (let month = 1; month <= 5; month++) {
        await time.increase(30 * 24 * 60 * 60); // 1 month

        const releasable = await teamVesting.getReleasableAmount(team1.address);
        expect(releasable).to.equal(0);
      }
    });

    it("should prevent token release during cliff", async function () {
      await time.increase(3 * 30 * 24 * 60 * 60); // 3 months (mid-cliff)

      await expect(
        teamVesting.connect(team1).release()
      ).to.be.revertedWith("No tokens available for release");
    });

    it("should prevent release right before cliff ends", async function () {
      await time.increase(CLIFF_DURATION - 60); // 1 minute before cliff ends

      await expect(
        teamVesting.connect(team1).release()
      ).to.be.revertedWith("No tokens available for release");
    });

    it("should show correct vesting info during cliff", async function () {
      await time.increase(3 * 30 * 24 * 60 * 60); // 3 months

      const info = await teamVesting.getVestingInfo(team1.address);
      expect(info.released).to.equal(0);
      expect(info.releasable).to.equal(0);
      expect(info.revoked).to.be.false;
    });
  });

  describe("Linear Vesting After Cliff", function () {
    beforeEach(async function () {
      await teamVesting.connect(owner).addBeneficiary(team1.address, ethers.parseEther("600000000"));
      await teamVesting.connect(owner).startVesting();
    });

    it("should vest linearly after cliff period", async function () {
      // Move past cliff
      await time.increase(CLIFF_DURATION + 1);

      // At month 6 (cliff end), should have 0% vested
      let releasable = await teamVesting.getReleasableAmount(team1.address);
      expect(releasable).to.be.closeTo(0, ethers.parseEther("10000")); // Small tolerance

      // At month 12 (25% of vesting period), should have ~25% vested
      await time.increase(6 * 30 * 24 * 60 * 60);
      releasable = await teamVesting.getReleasableAmount(team1.address);
      const expected25 = ethers.parseEther("150000000"); // 25% of 600M
      expect(releasable).to.be.closeTo(expected25, ethers.parseEther("10000000"));

      // At month 18 (50% of vesting period), should have ~50% vested
      await time.increase(6 * 30 * 24 * 60 * 60);
      releasable = await teamVesting.getReleasableAmount(team1.address);
      const expected50 = ethers.parseEther("300000000"); // 50% of 600M
      expect(releasable).to.be.closeTo(expected50, ethers.parseEther("10000000"));

      // At month 24 (75% of vesting period), should have ~75% vested
      await time.increase(6 * 30 * 24 * 60 * 60);
      releasable = await teamVesting.getReleasableAmount(team1.address);
      const expected75 = ethers.parseEther("450000000"); // 75% of 600M
      expect(releasable).to.be.closeTo(expected75, ethers.parseEther("10000000"));

      // At month 30 (100% of vesting period), should have 100% vested
      await time.increase(6 * 30 * 24 * 60 * 60);
      releasable = await teamVesting.getReleasableAmount(team1.address);
      const expected100 = ethers.parseEther("600000000"); // 100% of 600M
      expect(releasable).to.be.closeTo(expected100, ethers.parseEther("10000000"));
    });

    it("should cap at total allocation after vesting completes", async function () {
      // Move past entire vesting period
      await time.increase(TOTAL_DURATION + 365 * 24 * 60 * 60); // Extra year

      const releasable = await teamVesting.getReleasableAmount(team1.address);
      const totalAllocation = ethers.parseEther("600000000");

      expect(releasable).to.equal(totalAllocation);
    });

    it("should handle partial releases correctly", async function () {
      // Move to 50% of vesting
      await time.increase(CLIFF_DURATION + (VESTING_DURATION / 2));

      // Release half
      await teamVesting.connect(team1).release();
      const balance1 = await hypeToken.balanceOf(team1.address);

      // Move to 100% of vesting
      await time.increase(VESTING_DURATION / 2);

      // Release remaining
      await teamVesting.connect(team1).release();
      const balance2 = await hypeToken.balanceOf(team1.address);

      // Should have received full allocation
      expect(balance2).to.be.closeTo(ethers.parseEther("600000000"), ethers.parseEther("10000000"));
    });
  });

  describe("Release Tokens to Beneficiary", function () {
    beforeEach(async function () {
      await teamVesting.connect(owner).addBeneficiary(team1.address, ethers.parseEther("600000000"));
      await teamVesting.connect(owner).addBeneficiary(team2.address, ethers.parseEther("400000000"));
      await teamVesting.connect(owner).startVesting();
    });

    it("should allow beneficiary to release vested tokens", async function () {
      // Move past cliff to 50% vesting
      await time.increase(CLIFF_DURATION + (VESTING_DURATION / 2));

      const initialBalance = await hypeToken.balanceOf(team1.address);

      await expect(
        teamVesting.connect(team1).release()
      ).to.emit(teamVesting, "TokensReleased")
        .withArgs(team1.address, ethers.parseEther("300000000"));

      const finalBalance = await hypeToken.balanceOf(team1.address);
      const received = finalBalance - initialBalance;

      expect(received).to.be.closeTo(ethers.parseEther("300000000"), ethers.parseEther("10000000"));
    });

    it("should update released amount after release", async function () {
      await time.increase(CLIFF_DURATION + (VESTING_DURATION / 2));

      await teamVesting.connect(team1).release();

      const info = await teamVesting.getVestingInfo(team1.address);
      expect(info.released).to.be.closeTo(ethers.parseEther("300000000"), ethers.parseEther("10000000"));
    });

    it("should prevent double release without new vesting", async function () {
      await time.increase(CLIFF_DURATION + (VESTING_DURATION / 2));

      await teamVesting.connect(team1).release();

      // Try to release again immediately
      await expect(
        teamVesting.connect(team1).release()
      ).to.be.revertedWith("No tokens available for release");
    });

    it("should allow release after more tokens vest", async function () {
      await time.increase(CLIFF_DURATION + (VESTING_DURATION / 4));
      await teamVesting.connect(team1).release();
      const balance1 = await hypeToken.balanceOf(team1.address);

      // Wait for more vesting
      await time.increase(VESTING_DURATION / 4);

      await teamVesting.connect(team1).release();
      const balance2 = await hypeToken.balanceOf(team1.address);

      expect(balance2).to.be.gt(balance1);
    });

    it("should handle multiple beneficiaries independently", async function () {
      await time.increase(CLIFF_DURATION + (VESTING_DURATION / 2));

      await teamVesting.connect(team1).release();
      await teamVesting.connect(team2).release();

      const balance1 = await hypeToken.balanceOf(team1.address);
      const balance2 = await hypeToken.balanceOf(team2.address);

      expect(balance1).to.be.closeTo(ethers.parseEther("300000000"), ethers.parseEther("10000000"));
      expect(balance2).to.be.closeTo(ethers.parseEther("200000000"), ethers.parseEther("10000000"));
    });

    it("should prevent non-beneficiary from releasing", async function () {
      await time.increase(TOTAL_DURATION);

      await expect(
        teamVesting.connect(nonTeam).release()
      ).to.be.revertedWith("Not a beneficiary");
    });
  });

  describe("Revoke Vesting", function () {
    beforeEach(async function () {
      await teamVesting.connect(owner).addBeneficiary(team1.address, ethers.parseEther("600000000"));
      await teamVesting.connect(owner).startVesting();
    });

    it("should allow owner to revoke vesting", async function () {
      await time.increase(CLIFF_DURATION + (VESTING_DURATION / 2));

      await expect(
        teamVesting.connect(owner).revoke(team1.address)
      ).to.emit(teamVesting, "VestingRevoked")
        .withArgs(team1.address);
    });

    it("should transfer unvested tokens back to owner on revoke", async function () {
      await time.increase(CLIFF_DURATION + (VESTING_DURATION / 2));

      const ownerBalanceBefore = await hypeToken.balanceOf(owner.address);

      await teamVesting.connect(owner).revoke(team1.address);

      const ownerBalanceAfter = await hypeToken.balanceOf(owner.address);
      const returned = ownerBalanceAfter - ownerBalanceBefore;

      // Should return ~50% unvested
      expect(returned).to.be.closeTo(ethers.parseEther("300000000"), ethers.parseEther("10000000"));
    });

    it("should allow beneficiary to claim vested tokens before revoke", async function () {
      await time.increase(CLIFF_DURATION + (VESTING_DURATION / 2));

      // Beneficiary claims vested tokens
      await teamVesting.connect(team1).release();
      const beneficiaryBalance = await hypeToken.balanceOf(team1.address);

      // Owner revokes
      await teamVesting.connect(owner).revoke(team1.address);

      // Beneficiary keeps claimed tokens
      const finalBalance = await hypeToken.balanceOf(team1.address);
      expect(finalBalance).to.equal(beneficiaryBalance);
    });

    it("should mark beneficiary as revoked", async function () {
      await teamVesting.connect(owner).revoke(team1.address);

      const info = await teamVesting.getVestingInfo(team1.address);
      expect(info.revoked).to.be.true;
    });

    it("should prevent releasing after revoke", async function () {
      await teamVesting.connect(owner).revoke(team1.address);

      await time.increase(VESTING_DURATION);

      await expect(
        teamVesting.connect(team1).release()
      ).to.be.revertedWith("Vesting revoked");
    });

    it("should prevent double revoke", async function () {
      await teamVesting.connect(owner).revoke(team1.address);

      await expect(
        teamVesting.connect(owner).revoke(team1.address)
      ).to.be.revertedWith("Already revoked");
    });

    it("should prevent non-owner from revoking", async function () {
      await expect(
        teamVesting.connect(team2).revoke(team1.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should handle revoke before cliff correctly", async function () {
      await time.increase(3 * 30 * 24 * 60 * 60); // 3 months (during cliff)

      const ownerBalanceBefore = await hypeToken.balanceOf(owner.address);

      await teamVesting.connect(owner).revoke(team1.address);

      const ownerBalanceAfter = await hypeToken.balanceOf(owner.address);
      const returned = ownerBalanceAfter - ownerBalanceBefore;

      // Should return entire allocation (nothing vested during cliff)
      expect(returned).to.equal(ethers.parseEther("600000000"));
    });
  });

  describe("Multiple Beneficiaries", function () {
    beforeEach(async function () {
      await teamVesting.connect(owner).addBeneficiary(team1.address, ethers.parseEther("500000000"));
      await teamVesting.connect(owner).addBeneficiary(team2.address, ethers.parseEther("600000000"));
      await teamVesting.connect(owner).addBeneficiary(team3.address, ethers.parseEther("700000000"));
      await teamVesting.connect(owner).startVesting();
    });

    it("should handle independent vesting schedules", async function () {
      await time.increase(CLIFF_DURATION + (VESTING_DURATION / 2));

      await teamVesting.connect(team1).release();
      await teamVesting.connect(team2).release();
      await teamVesting.connect(team3).release();

      const balance1 = await hypeToken.balanceOf(team1.address);
      const balance2 = await hypeToken.balanceOf(team2.address);
      const balance3 = await hypeToken.balanceOf(team3.address);

      expect(balance1).to.be.closeTo(ethers.parseEther("250000000"), ethers.parseEther("10000000"));
      expect(balance2).to.be.closeTo(ethers.parseEther("300000000"), ethers.parseEther("10000000"));
      expect(balance3).to.be.closeTo(ethers.parseEther("350000000"), ethers.parseEther("10000000"));
    });

    it("should allow revoking one beneficiary without affecting others", async function () {
      await time.increase(CLIFF_DURATION + (VESTING_DURATION / 2));

      await teamVesting.connect(owner).revoke(team2.address);

      // Team1 and Team3 should still be able to release
      await expect(teamVesting.connect(team1).release()).to.not.be.reverted;
      await expect(teamVesting.connect(team3).release()).to.not.be.reverted;

      // Team2 should be blocked
      await expect(teamVesting.connect(team2).release()).to.be.revertedWith("Vesting revoked");
    });

    it("should track total allocated across all beneficiaries", async function () {
      const totalAllocated = await teamVesting.totalAllocated();
      const expected = ethers.parseEther("1800000000"); // 500M + 600M + 700M

      expect(totalAllocated).to.equal(expected);
    });
  });

  describe("getVestingInfo() View Function", function () {
    beforeEach(async function () {
      await teamVesting.connect(owner).addBeneficiary(team1.address, ethers.parseEther("600000000"));
      await teamVesting.connect(owner).startVesting();
    });

    it("should return correct data during cliff", async function () {
      await time.increase(3 * 30 * 24 * 60 * 60); // 3 months

      const info = await teamVesting.getVestingInfo(team1.address);

      expect(info.totalAllocation).to.equal(ethers.parseEther("600000000"));
      expect(info.released).to.equal(0);
      expect(info.releasable).to.equal(0);
      expect(info.revoked).to.be.false;
    });

    it("should return correct data during vesting", async function () {
      await time.increase(CLIFF_DURATION + (VESTING_DURATION / 2));

      const info = await teamVesting.getVestingInfo(team1.address);

      expect(info.totalAllocation).to.equal(ethers.parseEther("600000000"));
      expect(info.released).to.equal(0); // Haven't released yet
      expect(info.releasable).to.be.closeTo(ethers.parseEther("300000000"), ethers.parseEther("10000000"));
      expect(info.revoked).to.be.false;
    });

    it("should return correct data after release", async function () {
      await time.increase(CLIFF_DURATION + (VESTING_DURATION / 2));
      await teamVesting.connect(team1).release();

      const info = await teamVesting.getVestingInfo(team1.address);

      expect(info.released).to.be.closeTo(ethers.parseEther("300000000"), ethers.parseEther("10000000"));
      expect(info.releasable).to.be.closeTo(0, ethers.parseEther("1000000")); // Small due to time passage
    });

    it("should return correct data after revoke", async function () {
      await time.increase(CLIFF_DURATION + (VESTING_DURATION / 2));
      await teamVesting.connect(owner).revoke(team1.address);

      const info = await teamVesting.getVestingInfo(team1.address);

      expect(info.revoked).to.be.true;
      expect(info.releasable).to.equal(0);
    });

    it("should be callable by anyone", async function () {
      const info1 = await teamVesting.connect(owner).getVestingInfo(team1.address);
      const info2 = await teamVesting.connect(team2).getVestingInfo(team1.address);
      const info3 = await teamVesting.connect(nonTeam).getVestingInfo(team1.address);

      expect(info1.totalAllocation).to.equal(info2.totalAllocation);
      expect(info2.totalAllocation).to.equal(info3.totalAllocation);
    });
  });

  describe("Edge Cases and Security", function () {
    it("should handle exact cliff boundary", async function () {
      await teamVesting.connect(owner).addBeneficiary(team1.address, ethers.parseEther("600000000"));
      await teamVesting.connect(owner).startVesting();

      await time.increase(CLIFF_DURATION);

      const releasable = await teamVesting.getReleasableAmount(team1.address);
      expect(releasable).to.be.gte(0); // Should be at or just past cliff
    });

    it("should handle very small allocations", async function () {
      await teamVesting.connect(owner).addBeneficiary(team1.address, ethers.parseEther("1"));
      await teamVesting.connect(owner).startVesting();

      await time.increase(TOTAL_DURATION);

      await expect(teamVesting.connect(team1).release()).to.not.be.reverted;
    });

    it("should prevent overflow with large allocations", async function () {
      const largeAllocation = ethers.parseEther("2000000000");
      await teamVesting.connect(owner).addBeneficiary(team1.address, largeAllocation);
      await teamVesting.connect(owner).startVesting();

      await time.increase(TOTAL_DURATION);

      const releasable = await teamVesting.getReleasableAmount(team1.address);
      expect(releasable).to.equal(largeAllocation);
    });

    it("should handle rapid release attempts", async function () {
      await teamVesting.connect(owner).addBeneficiary(team1.address, ethers.parseEther("600000000"));
      await teamVesting.connect(owner).startVesting();

      await time.increase(TOTAL_DURATION);

      // Multiple rapid release attempts
      await teamVesting.connect(team1).release();
      await expect(teamVesting.connect(team1).release()).to.be.revertedWith("No tokens available for release");
      await expect(teamVesting.connect(team1).release()).to.be.revertedWith("No tokens available for release");
    });
  });
});
