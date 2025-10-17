const { expect } = require("chai");
const { ethers } = require("hardhat");
const { increaseTime, TIME } = require("./helpers/test-helpers.cjs");

describe("TeamTokenVesting", function() {
  let vesting;
  let token;
  let owner, treasury, liquidity, team1, team2, team3, team4;

  const TOTAL_ALLOCATION = ethers.parseEther("1000000000"); // 1B tokens
  const CLIFF_DURATION = TIME.DAY * 180; // 6 months
  const VESTING_DURATION = TIME.DAY * 730; // 24 months

  beforeEach(async function() {
    [owner, treasury, liquidity, team1, team2, team3, team4] = await ethers.getSigners();

    // Deploy HypeAI token
    const Token = await ethers.getContractFactory("HypeAI");
    token = await Token.deploy(treasury.address, liquidity.address);
    await token.waitForDeployment();

    // Enable trading
    await token.enableTrading();

    // Deploy vesting contract
    const Vesting = await ethers.getContractFactory("TeamTokenVesting");
    vesting = await Vesting.deploy(await token.getAddress());
    await vesting.waitForDeployment();

    // Exclude vesting contract from limits (it needs to transfer large amounts)
    await token.excludeFromLimits(await vesting.getAddress(), true);

    // Transfer team tokens to vesting contract
    await token.transfer(await vesting.getAddress(), TOTAL_ALLOCATION);
  });

  describe("Vesting Schedule Setup", function() {
    it("has 6-month cliff (180 days)", async function() {
      expect(await vesting.CLIFF_DURATION()).to.equal(TIME.DAY * 180);
    });

    it("has 24-month vesting (730 days)", async function() {
      expect(await vesting.VESTING_DURATION()).to.equal(TIME.DAY * 730);
    });

    it("has 1B token allocation", async function() {
      expect(await vesting.TOTAL_TEAM_ALLOCATION()).to.equal(TOTAL_ALLOCATION);
    });

    it("vesting not started initially", async function() {
      expect(await vesting.vestingStartTime()).to.equal(0);
    });
  });

  describe("Adding Beneficiaries", function() {
    it("owner can add beneficiary", async function() {
      const amount = ethers.parseEther("100000000"); // 100M tokens

      await vesting.addBeneficiary(team1.address, amount);

      const schedule = await vesting.vestingSchedules(team1.address);
      expect(schedule.totalAmount).to.equal(amount);
      expect(schedule.released).to.equal(0);
      expect(schedule.revoked).to.be.false;
    });

    it("tracks total allocated", async function() {
      const amount = ethers.parseEther("100000000");

      await vesting.addBeneficiary(team1.address, amount);

      expect(await vesting.totalAllocated()).to.equal(amount);
    });

    it("adds to beneficiaries array", async function() {
      await vesting.addBeneficiary(team1.address, ethers.parseEther("100000000"));

      const beneficiaries = await vesting.getBeneficiaries();
      expect(beneficiaries.length).to.equal(1);
      expect(beneficiaries[0]).to.equal(team1.address);
    });

    it("can add multiple beneficiaries", async function() {
      await vesting.addBeneficiary(team1.address, ethers.parseEther("200000000"));
      await vesting.addBeneficiary(team2.address, ethers.parseEther("300000000"));
      await vesting.addBeneficiary(team3.address, ethers.parseEther("500000000"));

      expect(await vesting.getBeneficiaryCount()).to.equal(3);
      expect(await vesting.totalAllocated()).to.equal(ethers.parseEther("1000000000"));
    });

    it("rejects duplicate beneficiary", async function() {
      await vesting.addBeneficiary(team1.address, ethers.parseEther("100000000"));

      await expect(
        vesting.addBeneficiary(team1.address, ethers.parseEther("50000000"))
      ).to.be.revertedWith("Beneficiary already exists");
    });

    it("rejects zero address", async function() {
      await expect(
        vesting.addBeneficiary(ethers.ZeroAddress, ethers.parseEther("100000000"))
      ).to.be.revertedWith("Invalid beneficiary");
    });

    it("rejects zero amount", async function() {
      await expect(
        vesting.addBeneficiary(team1.address, 0)
      ).to.be.revertedWith("Amount must be greater than 0");
    });

    it("rejects exceeding total allocation", async function() {
      await expect(
        vesting.addBeneficiary(team1.address, TOTAL_ALLOCATION + 1n)
      ).to.be.revertedWith("Exceeds total allocation");
    });

    it("cannot add after vesting started", async function() {
      await vesting.addBeneficiary(team1.address, ethers.parseEther("100000000"));
      await vesting.startVesting();

      await expect(
        vesting.addBeneficiary(team2.address, ethers.parseEther("100000000"))
      ).to.be.revertedWith("Vesting already started");
    });
  });

  describe("Batch Add Beneficiaries", function() {
    it("can add multiple at once", async function() {
      const addresses = [team1.address, team2.address, team3.address];
      const amounts = [
        ethers.parseEther("200000000"),
        ethers.parseEther("300000000"),
        ethers.parseEther("500000000")
      ];

      await vesting.addBeneficiaries(addresses, amounts);

      expect(await vesting.getBeneficiaryCount()).to.equal(3);
      expect(await vesting.totalAllocated()).to.equal(ethers.parseEther("1000000000"));
    });

    it("rejects mismatched array lengths", async function() {
      await expect(
        vesting.addBeneficiaries(
          [team1.address, team2.address],
          [ethers.parseEther("100000000")]
        )
      ).to.be.revertedWith("Arrays length mismatch");
    });
  });

  describe("Starting Vesting", function() {
    beforeEach(async function() {
      await vesting.addBeneficiary(team1.address, ethers.parseEther("500000000"));
      await vesting.addBeneficiary(team2.address, ethers.parseEther("500000000"));
    });

    it("owner can start vesting", async function() {
      await vesting.startVesting();

      const startTime = await vesting.vestingStartTime();
      expect(startTime).to.be.gt(0);
    });

    it("cannot start without beneficiaries", async function() {
      const emptyVesting = await (await ethers.getContractFactory("TeamTokenVesting"))
        .deploy(await token.getAddress());

      await expect(
        emptyVesting.startVesting()
      ).to.be.revertedWith("No beneficiaries added");
    });

    it("cannot start twice", async function() {
      await vesting.startVesting();

      await expect(
        vesting.startVesting()
      ).to.be.revertedWith("Vesting already started");
    });

    it("emits VestingStarted event", async function() {
      await expect(vesting.startVesting())
        .to.emit(vesting, "VestingStarted");
    });
  });

  describe("Vesting Calculation - Before Cliff", function() {
    beforeEach(async function() {
      await vesting.addBeneficiary(team1.address, ethers.parseEther("100000000"));
      await vesting.startVesting();
    });

    it("vestedAmount is 0 before cliff", async function() {
      const vested = await vesting.vestedAmount(team1.address);
      expect(vested).to.equal(0);
    });

    it("releasableAmount is 0 before cliff", async function() {
      const releasable = await vesting.releasableAmount(team1.address);
      expect(releasable).to.equal(0);
    });

    it("cannot release before cliff", async function() {
      await expect(
        vesting.connect(team1).release()
      ).to.be.revertedWith("No tokens to release");
    });

    it("still 0 at 5 months (before cliff)", async function() {
      await increaseTime(TIME.DAY * 150);

      const vested = await vesting.vestedAmount(team1.address);
      expect(vested).to.equal(0);
    });

    it("still 0 at 179 days (one day before cliff)", async function() {
      await increaseTime(TIME.DAY * 179);

      const vested = await vesting.vestedAmount(team1.address);
      expect(vested).to.equal(0);
    });
  });

  describe("Vesting Calculation - After Cliff", function() {
    beforeEach(async function() {
      await vesting.addBeneficiary(team1.address, ethers.parseEther("730000")); // Use even number for testing
      await vesting.startVesting();
    });

    it("can release after cliff", async function() {
      // Need cliff + some vesting time to have releasable amount
      await increaseTime(CLIFF_DURATION + TIME.DAY);

      const releasable = await vesting.releasableAmount(team1.address);
      expect(releasable).to.be.gt(0);
    });

    it("vesting is linear after cliff", async function() {
      // After cliff, at 1/4 of vesting period
      await increaseTime(CLIFF_DURATION + (VESTING_DURATION / 4));

      const vested = await vesting.vestedAmount(team1.address);
      const totalAmount = ethers.parseEther("730000");
      const expected = totalAmount / 4n; // 25% vested

      // Allow small rounding tolerance
      expect(vested).to.be.closeTo(expected, ethers.parseEther("1000"));
    });

    it("50% vested at halfway point", async function() {
      await increaseTime(CLIFF_DURATION + (VESTING_DURATION / 2));

      const vested = await vesting.vestedAmount(team1.address);
      const totalAmount = ethers.parseEther("730000");
      const expected = totalAmount / 2n;

      expect(vested).to.be.closeTo(expected, ethers.parseEther("1000"));
    });

    it("75% vested at three-quarters point", async function() {
      await increaseTime(CLIFF_DURATION + (VESTING_DURATION * 3 / 4));

      const vested = await vesting.vestedAmount(team1.address);
      const totalAmount = ethers.parseEther("730000");
      const expected = (totalAmount * 3n) / 4n;

      expect(vested).to.be.closeTo(expected, ethers.parseEther("1000"));
    });

    it("100% vested after full period", async function() {
      await increaseTime(CLIFF_DURATION + VESTING_DURATION);

      const vested = await vesting.vestedAmount(team1.address);
      const totalAmount = ethers.parseEther("730000");

      expect(vested).to.equal(totalAmount);
    });

    it("stays 100% after full period", async function() {
      await increaseTime(CLIFF_DURATION + VESTING_DURATION + TIME.YEAR);

      const vested = await vesting.vestedAmount(team1.address);
      const totalAmount = ethers.parseEther("730000");

      expect(vested).to.equal(totalAmount);
    });
  });

  describe("Token Release", function() {
    beforeEach(async function() {
      await vesting.addBeneficiary(team1.address, ethers.parseEther("1000000"));
      await vesting.startVesting();
    });

    it("beneficiary can release own tokens", async function() {
      await increaseTime(CLIFF_DURATION + TIME.DAY * 30);

      const balanceBefore = await token.balanceOf(team1.address);
      await vesting.connect(team1).release();
      const balanceAfter = await token.balanceOf(team1.address);

      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("tracks released amount", async function() {
      await increaseTime(CLIFF_DURATION + TIME.DAY * 30);

      await vesting.connect(team1).release();

      const schedule = await vesting.vestingSchedules(team1.address);
      expect(schedule.released).to.be.gt(0);
    });

    it("cannot release twice immediately", async function() {
      // Advance past cliff so there are tokens to release
      await increaseTime(CLIFF_DURATION + TIME.DAY);

      await vesting.connect(team1).release();

      // Immediately trying again should fail (no new vesting yet)
      await expect(
        vesting.connect(team1).release()
      ).to.be.revertedWith("No tokens to release");
    });

    it("can release again after more vesting", async function() {
      // First release after cliff
      await increaseTime(CLIFF_DURATION + TIME.DAY);
      await vesting.connect(team1).release();

      // Wait more time, should have more releasable
      await increaseTime(TIME.DAY * 30);

      const releasable = await vesting.releasableAmount(team1.address);
      expect(releasable).to.be.gt(0);
    });

    it("emits TokensReleased event", async function() {
      await increaseTime(CLIFF_DURATION);

      await expect(vesting.connect(team1).release())
        .to.emit(vesting, "TokensReleased");
    });
  });

  describe("ReleaseFor", function() {
    beforeEach(async function() {
      await vesting.addBeneficiary(team1.address, ethers.parseEther("1000000"));
      await vesting.startVesting();
      await increaseTime(CLIFF_DURATION);
    });

    it("anyone can release for beneficiary", async function() {
      const balanceBefore = await token.balanceOf(team1.address);

      await vesting.connect(team2).releaseFor(team1.address);

      const balanceAfter = await token.balanceOf(team1.address);
      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("tokens go to beneficiary, not caller", async function() {
      const team1Before = await token.balanceOf(team1.address);
      const team2Before = await token.balanceOf(team2.address);

      await vesting.connect(team2).releaseFor(team1.address);

      const team1After = await token.balanceOf(team1.address);
      const team2After = await token.balanceOf(team2.address);

      expect(team1After).to.be.gt(team1Before);
      expect(team2After).to.equal(team2Before);
    });
  });

  describe("Multiple Beneficiaries", function() {
    beforeEach(async function() {
      await vesting.addBeneficiary(team1.address, ethers.parseEther("300000000"));
      await vesting.addBeneficiary(team2.address, ethers.parseEther("200000000"));
      await vesting.addBeneficiary(team3.address, ethers.parseEther("500000000"));
      await vesting.startVesting();
    });

    it("each beneficiary vests independently", async function() {
      await increaseTime(CLIFF_DURATION + (VESTING_DURATION / 2));

      const vested1 = await vesting.vestedAmount(team1.address);
      const vested2 = await vesting.vestedAmount(team2.address);
      const vested3 = await vesting.vestedAmount(team3.address);

      expect(vested1).to.be.closeTo(ethers.parseEther("150000000"), ethers.parseEther("1000000"));
      expect(vested2).to.be.closeTo(ethers.parseEther("100000000"), ethers.parseEther("1000000"));
      expect(vested3).to.be.closeTo(ethers.parseEther("250000000"), ethers.parseEther("1000000"));
    });

    it("each can release independently", async function() {
      await increaseTime(CLIFF_DURATION);

      await vesting.connect(team1).release();
      await vesting.connect(team3).release();

      // team2 hasn't released yet
      const releasable = await vesting.releasableAmount(team2.address);
      expect(releasable).to.be.gt(0);
    });

    it("tracks total released across beneficiaries", async function() {
      await increaseTime(CLIFF_DURATION + VESTING_DURATION);

      await vesting.connect(team1).release();
      await vesting.connect(team2).release();
      await vesting.connect(team3).release();

      const status = await vesting.getStatus();
      expect(status.totalReleasedTokens).to.equal(ethers.parseEther("1000000000"));
    });
  });

  describe("Revoke Vesting", function() {
    beforeEach(async function() {
      await vesting.addBeneficiary(team1.address, ethers.parseEther("1000000"));
      await vesting.startVesting();
    });

    it("owner can revoke vesting", async function() {
      await increaseTime(CLIFF_DURATION + TIME.DAY * 365);

      await vesting.revokeVesting(team1.address);

      const schedule = await vesting.vestingSchedules(team1.address);
      expect(schedule.revoked).to.be.true;
    });

    it("releases vested tokens to beneficiary", async function() {
      await increaseTime(CLIFF_DURATION + (VESTING_DURATION / 2));

      const balanceBefore = await token.balanceOf(team1.address);
      await vesting.revokeVesting(team1.address);
      const balanceAfter = await token.balanceOf(team1.address);

      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("returns unvested tokens to owner", async function() {
      await increaseTime(CLIFF_DURATION + (VESTING_DURATION / 2));

      const ownerBalanceBefore = await token.balanceOf(owner.address);
      await vesting.revokeVesting(team1.address);
      const ownerBalanceAfter = await token.balanceOf(owner.address);

      expect(ownerBalanceAfter).to.be.gt(ownerBalanceBefore);
    });

    it("cannot revoke twice", async function() {
      await increaseTime(CLIFF_DURATION);

      await vesting.revokeVesting(team1.address);

      await expect(
        vesting.revokeVesting(team1.address)
      ).to.be.revertedWith("Vesting already revoked");
    });

    it("revoked beneficiary cannot release more", async function() {
      await increaseTime(CLIFF_DURATION);
      await vesting.revokeVesting(team1.address);

      await increaseTime(TIME.DAY * 365);

      await expect(
        vesting.connect(team1).release()
      ).to.be.revertedWith("No tokens to release");
    });

    it("emits VestingRevoked event", async function() {
      await increaseTime(CLIFF_DURATION);

      await expect(vesting.revokeVesting(team1.address))
        .to.emit(vesting, "VestingRevoked");
    });
  });

  describe("Vesting Info", function() {
    beforeEach(async function() {
      await vesting.addBeneficiary(team1.address, ethers.parseEther("1000000"));
      await vesting.startVesting();
    });

    it("returns complete vesting info", async function() {
      await increaseTime(CLIFF_DURATION + TIME.DAY * 30);

      const info = await vesting.getVestingInfo(team1.address);

      expect(info.totalAmount).to.equal(ethers.parseEther("1000000"));
      expect(info.released).to.equal(0);
      expect(info.vested).to.be.gt(0);
      expect(info.releasable).to.be.gt(0);
      expect(info.cliffPassed).to.be.true;
      expect(info.fullyVested).to.be.false;
      expect(info.revoked).to.be.false;
    });

    it("shows cliff not passed before cliff", async function() {
      const info = await vesting.getVestingInfo(team1.address);
      expect(info.cliffPassed).to.be.false;
    });

    it("shows fully vested after period", async function() {
      await increaseTime(CLIFF_DURATION + VESTING_DURATION);

      const info = await vesting.getVestingInfo(team1.address);
      expect(info.fullyVested).to.be.true;
    });
  });

  describe("Contract Status", function() {
    it("returns status before vesting starts", async function() {
      await vesting.addBeneficiary(team1.address, ethers.parseEther("500000000"));

      const status = await vesting.getStatus();

      expect(status.vestingStarted).to.be.false;
      expect(status.totalAllocatedTokens).to.equal(ethers.parseEther("500000000"));
      expect(status.beneficiaryCount).to.equal(1);
    });

    it("returns status after vesting starts", async function() {
      await vesting.addBeneficiary(team1.address, ethers.parseEther("500000000"));
      await vesting.startVesting();

      const status = await vesting.getStatus();

      expect(status.vestingStarted).to.be.true;
      expect(status.startTime).to.be.gt(0);
    });

    it("tracks contract balance", async function() {
      const status = await vesting.getStatus();
      expect(status.contractBalance).to.equal(TOTAL_ALLOCATION);
    });
  });

  describe("Emergency Withdraw", function() {
    it("owner can withdraw before vesting starts", async function() {
      const balanceBefore = await token.balanceOf(owner.address);

      await vesting.emergencyWithdraw();

      const balanceAfter = await token.balanceOf(owner.address);
      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("cannot withdraw after vesting starts", async function() {
      await vesting.addBeneficiary(team1.address, ethers.parseEther("100000000"));
      await vesting.startVesting();

      await expect(
        vesting.emergencyWithdraw()
      ).to.be.revertedWith("Vesting already started");
    });
  });
});
