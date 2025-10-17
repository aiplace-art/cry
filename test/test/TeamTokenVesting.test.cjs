const { expect } = require("chai");
const { ethers } = require("hardhat");
const { increaseTime, getBlockTimestamp, parseEther, formatEther, TIME } = require("./helpers/test-helpers.cjs");

describe("HypeAI Team Token Vesting", function() {
  let vesting, token;
  let owner, team1, team2, team3, team4, team5;

  const TEAM_ALLOCATION = parseEther("100000000"); // 100M tokens
  const CLIFF_DURATION = TIME.SIX_MONTHS; // 6 months
  const VESTING_DURATION = TIME.TWENTY_FOUR_MONTHS; // 24 months

  beforeEach(async function() {
    [owner, team1, team2, team3, team4, team5] = await ethers.getSigners();

    // Deploy token
    const Token = await ethers.getContractFactory("HypeAI");
    token = await Token.deploy(owner.address, owner.address);
    await token.waitForDeployment();

    // Deploy vesting contract
    const Vesting = await ethers.getContractFactory("TeamTokenVesting");
    vesting = await Vesting.deploy(await token.getAddress());
    await vesting.waitForDeployment();

    // Transfer team allocation to vesting contract
    await token.transfer(await vesting.getAddress(), TEAM_ALLOCATION);
  });

  describe("Adding Beneficiaries Before Vesting Starts", function() {
    it("should add single beneficiary successfully", async function() {
      const amount = parseEther("10000000"); // 10M tokens

      await vesting.addBeneficiary(team1.address, amount);

      const info = await vesting.getVestingInfo(team1.address);
      expect(info.totalAllocation).to.equal(amount);
      expect(info.released).to.equal(0);
    });

    it("should add multiple beneficiaries individually", async function() {
      await vesting.addBeneficiary(team1.address, parseEther("10000000"));
      await vesting.addBeneficiary(team2.address, parseEther("15000000"));
      await vesting.addBeneficiary(team3.address, parseEther("20000000"));

      const info1 = await vesting.getVestingInfo(team1.address);
      const info2 = await vesting.getVestingInfo(team2.address);
      const info3 = await vesting.getVestingInfo(team3.address);

      expect(info1.totalAllocation).to.equal(parseEther("10000000"));
      expect(info2.totalAllocation).to.equal(parseEther("15000000"));
      expect(info3.totalAllocation).to.equal(parseEther("20000000"));
    });

    it("should emit BeneficiaryAdded event", async function() {
      const amount = parseEther("10000000");

      await expect(vesting.addBeneficiary(team1.address, amount))
        .to.emit(vesting, "BeneficiaryAdded")
        .withArgs(team1.address, amount);
    });

    it("should prevent adding beneficiary with zero allocation", async function() {
      await expect(
        vesting.addBeneficiary(team1.address, 0)
      ).to.be.revertedWith("Amount must be greater than 0");
    });

    it("should prevent adding zero address as beneficiary", async function() {
      await expect(
        vesting.addBeneficiary(ethers.ZeroAddress, parseEther("10000000"))
      ).to.be.revertedWith("Invalid beneficiary address");
    });

    it("should prevent non-owner from adding beneficiaries", async function() {
      await expect(
        vesting.connect(team1).addBeneficiary(team2.address, parseEther("10000000"))
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should prevent duplicate beneficiary", async function() {
      await vesting.addBeneficiary(team1.address, parseEther("10000000"));

      await expect(
        vesting.addBeneficiary(team1.address, parseEther("5000000"))
      ).to.be.revertedWith("Beneficiary already exists");
    });
  });

  describe("Batch Adding Beneficiaries", function() {
    it("should add multiple beneficiaries in batch", async function() {
      const beneficiaries = [team1.address, team2.address, team3.address];
      const amounts = [
        parseEther("10000000"),
        parseEther("15000000"),
        parseEther("20000000")
      ];

      await vesting.addBeneficiariesBatch(beneficiaries, amounts);

      const info1 = await vesting.getVestingInfo(team1.address);
      const info2 = await vesting.getVestingInfo(team2.address);
      const info3 = await vesting.getVestingInfo(team3.address);

      expect(info1.totalAllocation).to.equal(amounts[0]);
      expect(info2.totalAllocation).to.equal(amounts[1]);
      expect(info3.totalAllocation).to.equal(amounts[2]);
    });

    it("should reject batch with mismatched array lengths", async function() {
      const beneficiaries = [team1.address, team2.address];
      const amounts = [parseEther("10000000")]; // Mismatched length

      await expect(
        vesting.addBeneficiariesBatch(beneficiaries, amounts)
      ).to.be.revertedWith("Array length mismatch");
    });

    it("should reject empty batch", async function() {
      await expect(
        vesting.addBeneficiariesBatch([], [])
      ).to.be.revertedWith("Empty arrays");
    });

    it("should handle batch of 10 beneficiaries", async function() {
      const signers = await ethers.getSigners();
      const beneficiaries = signers.slice(1, 11).map(s => s.address);
      const amounts = Array(10).fill(parseEther("10000000"));

      await vesting.addBeneficiariesBatch(beneficiaries, amounts);

      for (let i = 0; i < 10; i++) {
        const info = await vesting.getVestingInfo(beneficiaries[i]);
        expect(info.totalAllocation).to.equal(amounts[i]);
      }
    });
  });

  describe("Cannot Add Beneficiaries After Vesting Starts", function() {
    beforeEach(async function() {
      await vesting.addBeneficiary(team1.address, parseEther("10000000"));
      await vesting.startVesting();
    });

    it("should prevent adding beneficiary after vesting starts", async function() {
      await expect(
        vesting.addBeneficiary(team2.address, parseEther("10000000"))
      ).to.be.revertedWith("Vesting already started");
    });

    it("should prevent batch adding after vesting starts", async function() {
      await expect(
        vesting.addBeneficiariesBatch(
          [team2.address],
          [parseEther("10000000")]
        )
      ).to.be.revertedWith("Vesting already started");
    });
  });

  describe("Starting Vesting", function() {
    beforeEach(async function() {
      await vesting.addBeneficiary(team1.address, parseEther("10000000"));
    });

    it("should start vesting successfully", async function() {
      const tx = await vesting.startVesting();
      const receipt = await tx.wait();

      const startTime = await vesting.vestingStartTime();
      expect(startTime).to.be.gt(0);
    });

    it("should emit VestingStarted event", async function() {
      await expect(vesting.startVesting())
        .to.emit(vesting, "VestingStarted");
    });

    it("should prevent starting vesting twice", async function() {
      await vesting.startVesting();

      await expect(vesting.startVesting())
        .to.be.revertedWith("Vesting already started");
    });

    it("should prevent non-owner from starting vesting", async function() {
      await expect(
        vesting.connect(team1).startVesting()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should set correct cliff end time", async function() {
      await vesting.startVesting();

      const startTime = await vesting.vestingStartTime();
      const info = await vesting.getVestingInfo(team1.address);

      expect(info.cliffEnd).to.equal(startTime + BigInt(CLIFF_DURATION));
    });

    it("should set correct vesting end time", async function() {
      await vesting.startVesting();

      const startTime = await vesting.vestingStartTime();
      const info = await vesting.getVestingInfo(team1.address);

      expect(info.vestingEnd).to.equal(startTime + BigInt(VESTING_DURATION));
    });
  });

  describe("Cliff Period - Zero Tokens Released", function() {
    beforeEach(async function() {
      await vesting.addBeneficiary(team1.address, parseEther("10000000"));
      await vesting.startVesting();
    });

    it("should have zero releasable tokens during cliff", async function() {
      await increaseTime(TIME.MONTH); // 1 month into cliff

      const releasable = await vesting.releasableAmount(team1.address);
      expect(releasable).to.equal(0);
    });

    it("should have zero releasable at cliff end - 1 second", async function() {
      await increaseTime(CLIFF_DURATION - 1);

      const releasable = await vesting.releasableAmount(team1.address);
      expect(releasable).to.equal(0);
    });

    it("should revert release during cliff period", async function() {
      await increaseTime(TIME.MONTH * 3); // 3 months

      await expect(
        vesting.connect(team1).release()
      ).to.be.revertedWith("No tokens available for release");
    });

    it("should track cliff status correctly", async function() {
      const info = await vesting.getVestingInfo(team1.address);
      const currentTime = await getBlockTimestamp();

      expect(currentTime).to.be.lt(info.cliffEnd);
    });
  });

  describe("Tokens Available After Cliff", function() {
    beforeEach(async function() {
      await vesting.addBeneficiary(team1.address, parseEther("10000000"));
      await vesting.startVesting();
    });

    it("should have tokens available immediately after cliff", async function() {
      await increaseTime(CLIFF_DURATION + 1);

      const releasable = await vesting.releasableAmount(team1.address);
      expect(releasable).to.be.gt(0);
    });

    it("should calculate correct amount after cliff", async function() {
      await increaseTime(CLIFF_DURATION);

      const releasable = await vesting.releasableAmount(team1.address);
      const allocation = parseEther("10000000");

      // After 6 months (cliff), should have 25% vested (6/24 months)
      const expectedVested = (allocation * BigInt(25)) / BigInt(100);

      expect(releasable).to.be.closeTo(expectedVested, parseEther("100000"));
    });
  });

  describe("Linear Vesting Over 24 Months", function() {
    beforeEach(async function() {
      await vesting.addBeneficiary(team1.address, parseEther("10000000"));
      await vesting.startVesting();
      await increaseTime(CLIFF_DURATION); // Pass cliff
    });

    it("should vest 25% after 6 months (cliff end)", async function() {
      const releasable = await vesting.releasableAmount(team1.address);
      const allocation = parseEther("10000000");
      const expected = (allocation * BigInt(25)) / BigInt(100);

      expect(releasable).to.be.closeTo(expected, parseEther("100000"));
    });

    it("should vest 50% after 12 months", async function() {
      await increaseTime(TIME.MONTH * 6); // +6 months (total 12)

      const releasable = await vesting.releasableAmount(team1.address);
      const allocation = parseEther("10000000");
      const expected = (allocation * BigInt(50)) / BigInt(100);

      expect(releasable).to.be.closeTo(expected, parseEther("100000"));
    });

    it("should vest 75% after 18 months", async function() {
      await increaseTime(TIME.MONTH * 12); // +12 months (total 18)

      const releasable = await vesting.releasableAmount(team1.address);
      const allocation = parseEther("10000000");
      const expected = (allocation * BigInt(75)) / BigInt(100);

      expect(releasable).to.be.closeTo(expected, parseEther("100000"));
    });

    it("should vest 100% after 24 months", async function() {
      await increaseTime(TIME.MONTH * 18); // +18 months (total 24)

      const releasable = await vesting.releasableAmount(team1.address);
      const allocation = parseEther("10000000");

      expect(releasable).to.be.closeTo(allocation, parseEther("100000"));
    });

    it("should maintain 100% after vesting period ends", async function() {
      await increaseTime(TIME.MONTH * 30); // Beyond vesting period

      const releasable = await vesting.releasableAmount(team1.address);
      const allocation = parseEther("10000000");

      expect(releasable).to.be.closeTo(allocation, parseEther("100000"));
    });
  });

  describe("Releasing Tokens", function() {
    beforeEach(async function() {
      await vesting.addBeneficiary(team1.address, parseEther("10000000"));
      await vesting.startVesting();
      await increaseTime(CLIFF_DURATION);
    });

    it("should release tokens to beneficiary", async function() {
      const balanceBefore = await token.balanceOf(team1.address);

      await vesting.connect(team1).release();

      const balanceAfter = await token.balanceOf(team1.address);
      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("should update released amount", async function() {
      await vesting.connect(team1).release();

      const info = await vesting.getVestingInfo(team1.address);
      expect(info.released).to.be.gt(0);
    });

    it("should emit TokensReleased event", async function() {
      const releasable = await vesting.releasableAmount(team1.address);

      await expect(vesting.connect(team1).release())
        .to.emit(vesting, "TokensReleased")
        .withArgs(team1.address, releasable);
    });

    it("should prevent releasing when no tokens available", async function() {
      await vesting.connect(team1).release(); // Release once

      // Try to release again immediately
      await expect(
        vesting.connect(team1).release()
      ).to.be.revertedWith("No tokens available for release");
    });

    it("should allow multiple releases over time", async function() {
      await vesting.connect(team1).release();
      const released1 = (await vesting.getVestingInfo(team1.address)).released;

      await increaseTime(TIME.MONTH * 6);
      await vesting.connect(team1).release();
      const released2 = (await vesting.getVestingInfo(team1.address)).released;

      expect(released2).to.be.gt(released1);
    });
  });

  describe("Releasable Amount Over Time", function() {
    beforeEach(async function() {
      await vesting.addBeneficiary(team1.address, parseEther("10000000"));
      await vesting.startVesting();
      await increaseTime(CLIFF_DURATION);
    });

    it("should increase releasable amount linearly", async function() {
      const releasable1 = await vesting.releasableAmount(team1.address);

      await increaseTime(TIME.MONTH * 3);
      const releasable2 = await vesting.releasableAmount(team1.address);

      await increaseTime(TIME.MONTH * 3);
      const releasable3 = await vesting.releasableAmount(team1.address);

      expect(releasable2).to.be.gt(releasable1);
      expect(releasable3).to.be.gt(releasable2);
    });

    it("should account for already released tokens", async function() {
      const releasable1 = await vesting.releasableAmount(team1.address);
      await vesting.connect(team1).release();

      await increaseTime(TIME.MONTH);
      const releasable2 = await vesting.releasableAmount(team1.address);

      expect(releasable2).to.be.lt(releasable1); // Some already released
    });
  });

  describe("Revoking Vesting", function() {
    beforeEach(async function() {
      await vesting.addBeneficiary(team1.address, parseEther("10000000"));
      await vesting.startVesting();
      await increaseTime(CLIFF_DURATION + TIME.MONTH * 6); // 12 months total
    });

    it("should revoke vesting successfully", async function() {
      await vesting.connect(owner).revoke(team1.address);

      const info = await vesting.getVestingInfo(team1.address);
      expect(info.revoked).to.be.true;
    });

    it("should return unvested tokens to owner", async function() {
      const ownerBalanceBefore = await token.balanceOf(owner.address);

      await vesting.connect(owner).revoke(team1.address);

      const ownerBalanceAfter = await token.balanceOf(owner.address);
      expect(ownerBalanceAfter).to.be.gt(ownerBalanceBefore);
    });

    it("should allow beneficiary to claim vested tokens after revocation", async function() {
      const releasableBefore = await vesting.releasableAmount(team1.address);

      await vesting.connect(owner).revoke(team1.address);

      await vesting.connect(team1).release();

      const balance = await token.balanceOf(team1.address);
      expect(balance).to.be.closeTo(releasableBefore, parseEther("10000"));
    });

    it("should prevent non-owner from revoking", async function() {
      await expect(
        vesting.connect(team1).revoke(team1.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should emit VestingRevoked event", async function() {
      await expect(vesting.connect(owner).revoke(team1.address))
        .to.emit(vesting, "VestingRevoked")
        .withArgs(team1.address);
    });

    it("should prevent double revocation", async function() {
      await vesting.connect(owner).revoke(team1.address);

      await expect(
        vesting.connect(owner).revoke(team1.address)
      ).to.be.revertedWith("Already revoked");
    });
  });

  describe("Multiple Beneficiaries Independence", function() {
    beforeEach(async function() {
      await vesting.addBeneficiary(team1.address, parseEther("10000000"));
      await vesting.addBeneficiary(team2.address, parseEther("15000000"));
      await vesting.addBeneficiary(team3.address, parseEther("20000000"));
      await vesting.startVesting();
      await increaseTime(CLIFF_DURATION);
    });

    it("should track each beneficiary independently", async function() {
      const info1 = await vesting.getVestingInfo(team1.address);
      const info2 = await vesting.getVestingInfo(team2.address);
      const info3 = await vesting.getVestingInfo(team3.address);

      expect(info1.totalAllocation).to.equal(parseEther("10000000"));
      expect(info2.totalAllocation).to.equal(parseEther("15000000"));
      expect(info3.totalAllocation).to.equal(parseEther("20000000"));
    });

    it("should allow independent releases", async function() {
      await vesting.connect(team1).release();

      const info1 = await vesting.getVestingInfo(team1.address);
      const info2 = await vesting.getVestingInfo(team2.address);

      expect(info1.released).to.be.gt(0);
      expect(info2.released).to.equal(0);
    });

    it("should calculate different releasable amounts", async function() {
      const releasable1 = await vesting.releasableAmount(team1.address);
      const releasable2 = await vesting.releasableAmount(team2.address);
      const releasable3 = await vesting.releasableAmount(team3.address);

      // team3 has 2x allocation of team1, should have 2x releasable
      expect(releasable3).to.be.closeTo(releasable1 * BigInt(2), parseEther("100000"));
    });

    it("should allow revoking one without affecting others", async function() {
      await vesting.connect(owner).revoke(team2.address);

      const info1 = await vesting.getVestingInfo(team1.address);
      const info2 = await vesting.getVestingInfo(team2.address);
      const info3 = await vesting.getVestingInfo(team3.address);

      expect(info1.revoked).to.be.false;
      expect(info2.revoked).to.be.true;
      expect(info3.revoked).to.be.false;
    });
  });

  describe("getVestingInfo Accuracy", function() {
    beforeEach(async function() {
      await vesting.addBeneficiary(team1.address, parseEther("10000000"));
      await vesting.startVesting();
    });

    it("should return accurate vesting info", async function() {
      const info = await vesting.getVestingInfo(team1.address);

      expect(info.totalAllocation).to.equal(parseEther("10000000"));
      expect(info.released).to.equal(0);
      expect(info.revoked).to.be.false;
      expect(info.cliffEnd).to.be.gt(0);
      expect(info.vestingEnd).to.be.gt(0);
    });

    it("should update info after release", async function() {
      await increaseTime(CLIFF_DURATION);
      await vesting.connect(team1).release();

      const info = await vesting.getVestingInfo(team1.address);
      expect(info.released).to.be.gt(0);
    });

    it("should show revoked status", async function() {
      await increaseTime(CLIFF_DURATION);
      await vesting.connect(owner).revoke(team1.address);

      const info = await vesting.getVestingInfo(team1.address);
      expect(info.revoked).to.be.true;
    });
  });

  describe("Edge Cases", function() {
    it("should handle release immediately after cliff ends", async function() {
      await vesting.addBeneficiary(team1.address, parseEther("10000000"));
      await vesting.startVesting();
      await increaseTime(CLIFF_DURATION);

      await expect(vesting.connect(team1).release()).to.not.be.reverted;
    });

    it("should handle multiple consecutive releases", async function() {
      await vesting.addBeneficiary(team1.address, parseEther("10000000"));
      await vesting.startVesting();
      await increaseTime(CLIFF_DURATION);

      await vesting.connect(team1).release();

      await increaseTime(TIME.MONTH);
      await vesting.connect(team1).release();

      await increaseTime(TIME.MONTH);
      await vesting.connect(team1).release();

      const info = await vesting.getVestingInfo(team1.address);
      expect(info.released).to.be.gt(0);
    });

    it("should handle vesting info query for non-beneficiary", async function() {
      const info = await vesting.getVestingInfo(team5.address);
      expect(info.totalAllocation).to.equal(0);
    });

    it("should handle very small allocation", async function() {
      await vesting.addBeneficiary(team1.address, 1000); // 1000 wei
      await vesting.startVesting();
      await increaseTime(CLIFF_DURATION);

      const releasable = await vesting.releasableAmount(team1.address);
      expect(releasable).to.be.gte(0);
    });

    it("should handle maximum allocation", async function() {
      const maxAlloc = TEAM_ALLOCATION;
      await vesting.addBeneficiary(team1.address, maxAlloc);
      await vesting.startVesting();
      await increaseTime(CLIFF_DURATION);

      const releasable = await vesting.releasableAmount(team1.address);
      expect(releasable).to.be.gt(0);
    });
  });
});
