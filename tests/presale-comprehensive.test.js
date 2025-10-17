const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

/**
 * Comprehensive Test Suite for HYPE Presale Contract
 *
 * This test suite covers:
 * 1. Purchase limits and validations
 * 2. Vesting schedules and calculations
 * 3. Bonus calculations
 * 4. Edge cases and boundary conditions
 * 5. Multiple transactions and accumulation
 * 6. Time-based token unlocking
 * 7. Multiple claim scenarios
 */
describe("HYPEPresale - Comprehensive Tests", function () {
    // Fixture to deploy contracts with clean state
    async function deployPresaleFixture() {
        const [owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7] = await ethers.getSigners();

        // Deploy mock tokens
        const MockERC20 = await ethers.getContractFactory("MockERC20");
        const hypeToken = await MockERC20.deploy("HYPE Token", "HYPE", ethers.parseEther("1000000000")); // 1B tokens
        const usdtToken = await MockERC20.deploy("Tether USD", "USDT", ethers.parseUnits("10000000", 6)); // 10M USDT
        const usdcToken = await MockERC20.deploy("USD Coin", "USDC", ethers.parseUnits("10000000", 6)); // 10M USDC

        // Deploy presale contract
        const HYPEPresale = await ethers.getContractFactory("HYPEPresale");
        const multisigOwners = [owner.address, addr1.address, addr2.address];
        const softCap = ethers.parseUnits("100000", 6); // $100k
        const hardCap = ethers.parseUnits("5000000", 6); // $5M

        const presale = await HYPEPresale.deploy(
            await hypeToken.getAddress(),
            await usdtToken.getAddress(),
            await usdcToken.getAddress(),
            multisigOwners,
            softCap,
            hardCap
        );

        // Transfer presale tokens to contract
        await hypeToken.transfer(await presale.getAddress(), ethers.parseEther("300000000")); // 300M tokens

        // Mint stablecoins to test accounts
        const stablecoinAmount = ethers.parseUnits("100000", 6); // $100k each
        for (const addr of [addr3, addr4, addr5, addr6, addr7]) {
            await usdtToken.transfer(addr.address, stablecoinAmount);
            await usdcToken.transfer(addr.address, stablecoinAmount);
        }

        // Set price feeds (in USD with 6 decimals)
        await presale.updatePriceFeed(0, ethers.parseUnits("2000", 6)); // ETH = $2000
        await presale.updatePriceFeed(1, ethers.parseUnits("1", 6)); // USDT = $1
        await presale.updatePriceFeed(2, ethers.parseUnits("1", 6)); // USDC = $1
        await presale.updatePriceFeed(3, ethers.parseUnits("300", 6)); // BNB = $300

        return {
            presale,
            hypeToken,
            usdtToken,
            usdcToken,
            owner,
            addr1,
            addr2,
            addr3,
            addr4,
            addr5,
            addr6,
            addr7,
            multisigOwners
        };
    }

    describe("1. Purchase Limit Tests", function () {
        describe("1.1 Single Transaction Limits", function () {
            it("Should allow purchase up to $10,000 max limit", async function () {
                const { presale, addr3 } = await loadFixture(deployPresaleFixture);
                await presale.whitelistAddress(addr3.address, true);
                await presale.verifyKYC(addr3.address, true);

                // Purchase exactly $10,000 (5 ETH @ $2000)
                const ethAmount = ethers.parseEther("5");
                await expect(
                    presale.connect(addr3).buyTokensETH({ value: ethAmount })
                ).to.not.be.reverted;

                expect(await presale.totalInvestedUSD(addr3.address)).to.equal(
                    ethers.parseUnits("10000", 6)
                );
            });

            it("Should reject purchase over $10,000 limit", async function () {
                const { presale, addr3 } = await loadFixture(deployPresaleFixture);
                await presale.whitelistAddress(addr3.address, true);
                await presale.verifyKYC(addr3.address, true);

                // Try to purchase $10,001 (5.0005 ETH @ $2000)
                const ethAmount = ethers.parseEther("5.0005");
                await expect(
                    presale.connect(addr3).buyTokensETH({ value: ethAmount })
                ).to.be.revertedWith("Exceeds max transaction");
            });

            it("Should allow purchase exactly at KYC threshold ($5,000) with KYC", async function () {
                const { presale, addr3 } = await loadFixture(deployPresaleFixture);
                await presale.whitelistAddress(addr3.address, true);
                await presale.verifyKYC(addr3.address, true);

                // Purchase exactly $5,000 (2.5 ETH @ $2000)
                const ethAmount = ethers.parseEther("2.5");
                await expect(
                    presale.connect(addr3).buyTokensETH({ value: ethAmount })
                ).to.not.be.reverted;

                expect(await presale.totalInvestedUSD(addr3.address)).to.equal(
                    ethers.parseUnits("5000", 6)
                );
            });

            it("Should reject purchase above $5,000 without KYC", async function () {
                const { presale, addr3 } = await loadFixture(deployPresaleFixture);
                await presale.whitelistAddress(addr3.address, true);
                // No KYC verification

                // Try to purchase $5,001 (2.50005 ETH @ $2000)
                const ethAmount = ethers.parseEther("2.50005");
                await expect(
                    presale.connect(addr3).buyTokensETH({ value: ethAmount })
                ).to.be.revertedWith("KYC required");
            });

            it("Should allow purchase below $5,000 without KYC", async function () {
                const { presale, addr3 } = await loadFixture(deployPresaleFixture);
                await presale.whitelistAddress(addr3.address, true);

                // Purchase $4,999 (2.4995 ETH @ $2000)
                const ethAmount = ethers.parseEther("2.4995");
                await expect(
                    presale.connect(addr3).buyTokensETH({ value: ethAmount })
                ).to.not.be.reverted;
            });
        });

        describe("1.2 Multiple Purchase Accumulation", function () {
            it("Should track total investment across multiple purchases", async function () {
                const { presale, addr3 } = await loadFixture(deployPresaleFixture);
                await presale.whitelistAddress(addr3.address, true);

                const ethAmount = ethers.parseEther("1"); // $2000 each

                // First purchase
                await presale.connect(addr3).buyTokensETH({ value: ethAmount });
                expect(await presale.totalInvestedUSD(addr3.address)).to.equal(
                    ethers.parseUnits("2000", 6)
                );

                await time.increase(300); // Wait 5 minutes

                // Second purchase
                await presale.connect(addr3).buyTokensETH({ value: ethAmount });
                expect(await presale.totalInvestedUSD(addr3.address)).to.equal(
                    ethers.parseUnits("4000", 6)
                );

                await time.increase(300);

                // Third purchase
                await presale.connect(addr3).buyTokensETH({ value: ethAmount });
                expect(await presale.totalInvestedUSD(addr3.address)).to.equal(
                    ethers.parseUnits("6000", 6)
                );
            });

            it("Should allow multiple small purchases up to max limit", async function () {
                const { presale, addr3 } = await loadFixture(deployPresaleFixture);
                await presale.whitelistAddress(addr3.address, true);
                await presale.verifyKYC(addr3.address, true);

                const ethAmount = ethers.parseEther("2"); // $4000 each
                const purchaseCount = 3; // Total: $12,000 but each tx is within limit

                for (let i = 0; i < purchaseCount; i++) {
                    await presale.connect(addr3).buyTokensETH({ value: ethAmount });
                    await time.increase(300);
                }

                // Total should be $12,000 (no per-user limit, only per-transaction)
                expect(await presale.totalInvestedUSD(addr3.address)).to.equal(
                    ethers.parseUnits("12000", 6)
                );
            });

            it("Should create separate purchase records for each transaction", async function () {
                const { presale, addr3 } = await loadFixture(deployPresaleFixture);
                await presale.whitelistAddress(addr3.address, true);

                const ethAmount = ethers.parseEther("1");

                await presale.connect(addr3).buyTokensETH({ value: ethAmount });
                await time.increase(300);
                await presale.connect(addr3).buyTokensETH({ value: ethAmount });
                await time.increase(300);
                await presale.connect(addr3).buyTokensETH({ value: ethAmount });

                expect(await presale.getPurchaseCount(addr3.address)).to.equal(3);
            });
        });

        describe("1.3 Round Allocation Limits", function () {
            it("Should enforce round allocation limits", async function () {
                const { presale, addr3, addr4, addr5, addr6, addr7 } = await loadFixture(deployPresaleFixture);

                const addresses = [addr3, addr4, addr5, addr6, addr7];

                // Whitelist and KYC all addresses
                for (const addr of addresses) {
                    await presale.whitelistAddress(addr.address, true);
                    await presale.verifyKYC(addr.address, true);
                }

                // Private round allocation: 100M tokens
                // At $0.01 with 20% bonus, each $10k purchase = 1.2M tokens
                // So ~83 purchases of $10k would fill the round

                const ethAmount = ethers.parseEther("5"); // $10k per purchase
                let totalPurchased = 0;
                let addressIndex = 0;
                let allocationReached = false;

                // Make purchases until allocation is reached
                while (totalPurchased < 50 && !allocationReached) {
                    const addr = addresses[addressIndex % addresses.length];

                    try {
                        await presale.connect(addr).buyTokensETH({ value: ethAmount });
                        await time.increase(300);
                        totalPurchased++;
                        addressIndex++;
                    } catch (error) {
                        if (error.message.includes("Exceeds round allocation")) {
                            allocationReached = true;
                        } else {
                            throw error;
                        }
                    }
                }

                expect(allocationReached).to.equal(true);

                // Verify round sold amount is close to allocation
                const privateRound = await presale.getRoundConfig(0);
                expect(privateRound.sold).to.be.closeTo(
                    ethers.parseEther("100000000"),
                    ethers.parseEther("2000000") // Allow 2M token variance
                );
            });

            it("Should reject purchase that exceeds remaining round allocation", async function () {
                const { presale, addr3, addr4, addr5, addr6 } = await loadFixture(deployPresaleFixture);

                const addresses = [addr3, addr4, addr5, addr6];

                for (const addr of addresses) {
                    await presale.whitelistAddress(addr.address, true);
                    await presale.verifyKYC(addr.address, true);
                }

                // Fill most of the allocation
                const ethAmount = ethers.parseEther("5"); // $10k

                for (let i = 0; i < 80; i++) {
                    const addr = addresses[i % addresses.length];
                    try {
                        await presale.connect(addr).buyTokensETH({ value: ethAmount });
                        await time.increase(300);
                    } catch (error) {
                        if (error.message.includes("Exceeds round allocation")) {
                            break;
                        }
                    }
                }

                // Next large purchase should fail
                await expect(
                    presale.connect(addr3).buyTokensETH({ value: ethAmount })
                ).to.be.revertedWith("Exceeds round allocation");
            });
        });

        describe("1.4 Hard Cap Limits", function () {
            it("Should enforce hard cap across all purchases", async function () {
                const { presale, addr3, addr4, addr5, addr6, addr7 } = await loadFixture(deployPresaleFixture);

                const addresses = [addr3, addr4, addr5, addr6, addr7];

                for (const addr of addresses) {
                    await presale.whitelistAddress(addr.address, true);
                    await presale.verifyKYC(addr.address, true);
                }

                // Hard cap is $5M
                const ethAmount = ethers.parseEther("5"); // $10k per purchase
                const hardCap = ethers.parseUnits("5000000", 6);

                let totalRaised = 0n;
                let addressIndex = 0;

                // Make purchases approaching hard cap
                while (totalRaised < hardCap - ethers.parseUnits("20000", 6)) {
                    const addr = addresses[addressIndex % addresses.length];

                    try {
                        await presale.connect(addr).buyTokensETH({ value: ethAmount });
                        totalRaised += ethers.parseUnits("10000", 6);
                        await time.increase(300);
                        addressIndex++;
                    } catch (error) {
                        break;
                    }
                }

                // Should be close to hard cap
                expect(await presale.totalRaised()).to.be.closeTo(
                    hardCap,
                    ethers.parseUnits("50000", 6)
                );
            });
        });
    });

    describe("2. Vesting Tests", function () {
        describe("2.1 Vesting Schedule Setup", function () {
            it("Should setup correct vesting for Private round (25% immediate, 90-day duration)", async function () {
                const { presale, addr3 } = await loadFixture(deployPresaleFixture);
                await presale.whitelistAddress(addr3.address, true);

                await presale.connect(addr3).buyTokensETH({ value: ethers.parseEther("1") });

                const schedule = await presale.getVestingSchedule(addr3.address);
                expect(schedule.immediateRelease).to.equal(25);
                expect(schedule.duration).to.equal(90 * 24 * 60 * 60); // 90 days
                expect(schedule.cliff).to.equal(0);
            });

            it("Should setup correct vesting for Presale 1 (50% immediate, 30-day duration)", async function () {
                const { presale, addr3 } = await loadFixture(deployPresaleFixture);

                // Move to Presale 1
                await presale.setCurrentRound(1);
                await time.increase(30 * 24 * 60 * 60); // Move to round start

                await presale.connect(addr3).buyTokensETH({ value: ethers.parseEther("1") });

                const schedule = await presale.getVestingSchedule(addr3.address);
                expect(schedule.immediateRelease).to.equal(50);
                expect(schedule.duration).to.equal(30 * 24 * 60 * 60); // 30 days
            });

            it("Should setup correct vesting for Presale 2 (100% immediate, no vesting)", async function () {
                const { presale, addr3 } = await loadFixture(deployPresaleFixture);

                // Move to Presale 2
                await presale.setCurrentRound(2);
                await time.increase(60 * 24 * 60 * 60);

                await presale.connect(addr3).buyTokensETH({ value: ethers.parseEther("1") });

                const schedule = await presale.getVestingSchedule(addr3.address);
                expect(schedule.immediateRelease).to.equal(100);
                expect(schedule.duration).to.equal(0); // No vesting
            });

            it("Should accumulate vesting for multiple purchases", async function () {
                const { presale, addr3 } = await loadFixture(deployPresaleFixture);
                await presale.whitelistAddress(addr3.address, true);

                const ethAmount = ethers.parseEther("1");

                // First purchase: 240,000 tokens
                await presale.connect(addr3).buyTokensETH({ value: ethAmount });
                await time.increase(300);

                // Second purchase: another 240,000 tokens
                await presale.connect(addr3).buyTokensETH({ value: ethAmount });

                const schedule = await presale.getVestingSchedule(addr3.address);
                expect(schedule.totalAmount).to.equal(ethers.parseEther("480000")); // 2 * 240k
            });
        });

        describe("2.2 Immediate Release Claims", function () {
            it("Should allow claiming 25% immediately for Private round", async function () {
                const { presale, hypeToken, addr3 } = await loadFixture(deployPresaleFixture);
                await presale.whitelistAddress(addr3.address, true);

                // Buy 240,000 tokens (200k base + 40k bonus)
                await presale.connect(addr3).buyTokensETH({ value: ethers.parseEther("1") });

                await presale.finalizePresale();

                // Should be able to claim 25% = 60,000 tokens
                const claimable = await presale.getClaimableAmount(addr3.address);
                expect(claimable).to.equal(ethers.parseEther("60000"));

                await presale.connect(addr3).claimTokens();

                const balance = await hypeToken.balanceOf(addr3.address);
                expect(balance).to.equal(ethers.parseEther("60000"));
            });

            it("Should allow claiming 50% immediately for Presale 1", async function () {
                const { presale, hypeToken, addr3 } = await loadFixture(deployPresaleFixture);

                await presale.setCurrentRound(1);
                await time.increase(30 * 24 * 60 * 60);

                // Buy 220,000 tokens (200k base + 20k bonus at $0.015 with 10% bonus)
                await presale.connect(addr3).buyTokensETH({ value: ethers.parseEther("1.5") }); // $3000

                await presale.finalizePresale();

                const schedule = await presale.getVestingSchedule(addr3.address);
                const expectedTokens = schedule.totalAmount / 2n; // 50%

                await presale.connect(addr3).claimTokens();

                const balance = await hypeToken.balanceOf(addr3.address);
                expect(balance).to.equal(expectedTokens);
            });

            it("Should allow claiming 100% immediately for Presale 2", async function () {
                const { presale, hypeToken, addr3 } = await loadFixture(deployPresaleFixture);

                await presale.setCurrentRound(2);
                await time.increase(60 * 24 * 60 * 60);

                await presale.connect(addr3).buyTokensETH({ value: ethers.parseEther("1") });

                await presale.finalizePresale();

                const schedule = await presale.getVestingSchedule(addr3.address);

                await presale.connect(addr3).claimTokens();

                const balance = await hypeToken.balanceOf(addr3.address);
                expect(balance).to.equal(schedule.totalAmount); // 100%
            });
        });

        describe("2.3 Linear Vesting Over Time", function () {
            it("Should calculate correct vested amount at 25% of vesting period", async function () {
                const { presale, addr3 } = await loadFixture(deployPresaleFixture);
                await presale.whitelistAddress(addr3.address, true);

                await presale.connect(addr3).buyTokensETH({ value: ethers.parseEther("1") });
                await presale.finalizePresale();

                // Claim immediate release
                await presale.connect(addr3).claimTokens();

                // Fast forward 22.5 days (25% of 90 days)
                await time.increase(22.5 * 24 * 60 * 60);

                // Total: 240k, Immediate: 60k, Vesting: 180k
                // At 25% of vesting: 45k additional
                const claimable = await presale.getClaimableAmount(addr3.address);
                expect(claimable).to.be.closeTo(
                    ethers.parseEther("45000"),
                    ethers.parseEther("2000")
                );
            });

            it("Should calculate correct vested amount at 50% of vesting period", async function () {
                const { presale, addr3 } = await loadFixture(deployPresaleFixture);
                await presale.whitelistAddress(addr3.address, true);

                await presale.connect(addr3).buyTokensETH({ value: ethers.parseEther("1") });
                await presale.finalizePresale();

                await presale.connect(addr3).claimTokens();

                // Fast forward 45 days (50% of 90 days)
                await time.increase(45 * 24 * 60 * 60);

                // At 50% of vesting: 90k additional
                const claimable = await presale.getClaimableAmount(addr3.address);
                expect(claimable).to.be.closeTo(
                    ethers.parseEther("90000"),
                    ethers.parseEther("2000")
                );
            });

            it("Should calculate correct vested amount at 75% of vesting period", async function () {
                const { presale, addr3 } = await loadFixture(deployPresaleFixture);
                await presale.whitelistAddress(addr3.address, true);

                await presale.connect(addr3).buyTokensETH({ value: ethers.parseEther("1") });
                await presale.finalizePresale();

                await presale.connect(addr3).claimTokens();

                // Fast forward 67.5 days (75% of 90 days)
                await time.increase(67.5 * 24 * 60 * 60);

                // At 75% of vesting: 135k additional
                const claimable = await presale.getClaimableAmount(addr3.address);
                expect(claimable).to.be.closeTo(
                    ethers.parseEther("135000"),
                    ethers.parseEther("2000")
                );
            });

            it("Should allow full claim at 100% of vesting period", async function () {
                const { presale, hypeToken, addr3 } = await loadFixture(deployPresaleFixture);
                await presale.whitelistAddress(addr3.address, true);

                await presale.connect(addr3).buyTokensETH({ value: ethers.parseEther("1") });
                await presale.finalizePresale();

                // Fast forward 90 days
                await time.increase(90 * 24 * 60 * 60);

                await presale.connect(addr3).claimTokens();

                const balance = await hypeToken.balanceOf(addr3.address);
                expect(balance).to.equal(ethers.parseEther("240000"));
            });

            it("Should not allow claiming more than vested amount", async function () {
                const { presale, hypeToken, addr3 } = await loadFixture(deployPresaleFixture);
                await presale.whitelistAddress(addr3.address, true);

                await presale.connect(addr3).buyTokensETH({ value: ethers.parseEther("1") });
                await presale.finalizePresale();

                // Claim immediately
                await presale.connect(addr3).claimTokens();
                const firstClaim = await hypeToken.balanceOf(addr3.address);

                // Try to claim again immediately
                await expect(
                    presale.connect(addr3).claimTokens()
                ).to.be.revertedWith("No tokens available");

                // Balance shouldn't change
                expect(await hypeToken.balanceOf(addr3.address)).to.equal(firstClaim);
            });
        });

        describe("2.4 Multiple Claims Over Time", function () {
            it("Should allow claiming vested tokens in multiple increments", async function () {
                const { presale, hypeToken, addr3 } = await loadFixture(deployPresaleFixture);
                await presale.whitelistAddress(addr3.address, true);

                await presale.connect(addr3).buyTokensETH({ value: ethers.parseEther("1") });
                await presale.finalizePresale();

                // First claim: immediate 25%
                await presale.connect(addr3).claimTokens();
                const firstBalance = await hypeToken.balanceOf(addr3.address);
                expect(firstBalance).to.equal(ethers.parseEther("60000"));

                // Second claim after 30 days
                await time.increase(30 * 24 * 60 * 60);
                await presale.connect(addr3).claimTokens();
                const secondBalance = await hypeToken.balanceOf(addr3.address);
                expect(secondBalance).to.be.greaterThan(firstBalance);

                // Third claim after another 30 days
                await time.increase(30 * 24 * 60 * 60);
                await presale.connect(addr3).claimTokens();
                const thirdBalance = await hypeToken.balanceOf(addr3.address);
                expect(thirdBalance).to.be.greaterThan(secondBalance);

                // Fourth claim after another 30 days (90 days total)
                await time.increase(30 * 24 * 60 * 60);
                await presale.connect(addr3).claimTokens();
                const finalBalance = await hypeToken.balanceOf(addr3.address);
                expect(finalBalance).to.equal(ethers.parseEther("240000"));
            });

            it("Should track released amount correctly across multiple claims", async function () {
                const { presale, addr3 } = await loadFixture(deployPresaleFixture);
                await presale.whitelistAddress(addr3.address, true);

                await presale.connect(addr3).buyTokensETH({ value: ethers.parseEther("1") });
                await presale.finalizePresale();

                // First claim
                await presale.connect(addr3).claimTokens();
                let schedule = await presale.getVestingSchedule(addr3.address);
                const firstRelease = schedule.releasedAmount;

                // Second claim
                await time.increase(30 * 24 * 60 * 60);
                await presale.connect(addr3).claimTokens();
                schedule = await presale.getVestingSchedule(addr3.address);
                expect(schedule.releasedAmount).to.be.greaterThan(firstRelease);

                // Final claim
                await time.increase(60 * 24 * 60 * 60);
                await presale.connect(addr3).claimTokens();
                schedule = await presale.getVestingSchedule(addr3.address);
                expect(schedule.releasedAmount).to.equal(schedule.totalAmount);
            });

            it("Should allow claiming daily for gradual vesting", async function () {
                const { presale, hypeToken, addr3 } = await loadFixture(deployPresaleFixture);
                await presale.whitelistAddress(addr3.address, true);

                await presale.connect(addr3).buyTokensETH({ value: ethers.parseEther("1") });
                await presale.finalizePresale();

                let previousBalance = 0n;

                // Claim daily for 10 days
                for (let day = 0; day < 10; day++) {
                    if (day > 0) {
                        await time.increase(24 * 60 * 60); // 1 day
                    }

                    const claimable = await presale.getClaimableAmount(addr3.address);
                    if (claimable > 0) {
                        await presale.connect(addr3).claimTokens();
                        const currentBalance = await hypeToken.balanceOf(addr3.address);
                        expect(currentBalance).to.be.greaterThan(previousBalance);
                        previousBalance = currentBalance;
                    }
                }
            });
        });

        describe("2.5 Vesting Edge Cases", function () {
            it("Should handle vesting with very small token amounts", async function () {
                const { presale, hypeToken, addr3 } = await loadFixture(deployPresaleFixture);
                await presale.whitelistAddress(addr3.address, true);

                // Buy with very small amount: 0.001 ETH = $2 = 240 tokens
                await presale.connect(addr3).buyTokensETH({ value: ethers.parseEther("0.001") });
                await presale.finalizePresale();

                const claimable = await presale.getClaimableAmount(addr3.address);
                expect(claimable).to.be.greaterThan(0);

                await presale.connect(addr3).claimTokens();
                expect(await hypeToken.balanceOf(addr3.address)).to.be.greaterThan(0);
            });

            it("Should handle vesting after presale finalization at different times", async function () {
                const { presale, addr3, addr4 } = await loadFixture(deployPresaleFixture);
                await presale.whitelistAddress(addr3.address, true);
                await presale.whitelistAddress(addr4.address, true);

                // addr3 buys immediately
                await presale.connect(addr3).buyTokensETH({ value: ethers.parseEther("1") });

                // Wait 10 days
                await time.increase(10 * 24 * 60 * 60);

                // addr4 buys later
                await presale.connect(addr4).buyTokensETH({ value: ethers.parseEther("1") });

                // Finalize
                await presale.finalizePresale();

                // Both should have vesting from purchase time
                const schedule3 = await presale.getVestingSchedule(addr3.address);
                const schedule4 = await presale.getVestingSchedule(addr4.address);

                expect(schedule3.startTime).to.be.lessThan(schedule4.startTime);
            });

            it("Should correctly calculate vesting for purchases at exact vesting completion", async function () {
                const { presale, hypeToken, addr3 } = await loadFixture(deployPresaleFixture);
                await presale.whitelistAddress(addr3.address, true);

                await presale.connect(addr3).buyTokensETH({ value: ethers.parseEther("1") });
                await presale.finalizePresale();

                // Fast forward exactly 90 days
                await time.increase(90 * 24 * 60 * 60);

                const claimable = await presale.getClaimableAmount(addr3.address);
                expect(claimable).to.equal(ethers.parseEther("240000"));

                // Fast forward beyond vesting period
                await time.increase(30 * 24 * 60 * 60);

                const claimableAfter = await presale.getClaimableAmount(addr3.address);
                expect(claimableAfter).to.equal(ethers.parseEther("240000")); // Should not exceed total
            });
        });
    });

    describe("3. Bonus Calculation Tests", function () {
        describe("3.1 Bonus Percentages by Round", function () {
            it("Should apply 20% bonus in Private round", async function () {
                const { presale, addr3 } = await loadFixture(deployPresaleFixture);
                await presale.whitelistAddress(addr3.address, true);

                // $2000 / $0.01 = 200,000 tokens
                // 20% bonus = 40,000 tokens
                // Total = 240,000 tokens
                await presale.connect(addr3).buyTokensETH({ value: ethers.parseEther("1") });

                const purchase = await presale.getPurchase(addr3.address, 0);
                expect(purchase.amount).to.equal(ethers.parseEther("240000"));
            });

            it("Should apply 10% bonus in Presale 1", async function () {
                const { presale, addr3 } = await loadFixture(deployPresaleFixture);

                await presale.setCurrentRound(1);
                await time.increase(30 * 24 * 60 * 60);

                // $2000 / $0.015 = 133,333.33 tokens
                // 10% bonus = 13,333.33 tokens
                // Total = 146,666.66 tokens
                await presale.connect(addr3).buyTokensETH({ value: ethers.parseEther("1") });

                const purchase = await presale.getPurchase(addr3.address, 0);
                expect(purchase.amount).to.be.closeTo(
                    ethers.parseEther("146666.666666666666666666"),
                    ethers.parseEther("1")
                );
            });

            it("Should apply 0% bonus in Presale 2", async function () {
                const { presale, addr3 } = await loadFixture(deployPresaleFixture);

                await presale.setCurrentRound(2);
                await time.increase(60 * 24 * 60 * 60);

                // $2000 / $0.02 = 100,000 tokens
                // 0% bonus = 0 tokens
                // Total = 100,000 tokens
                await presale.connect(addr3).buyTokensETH({ value: ethers.parseEther("1") });

                const purchase = await presale.getPurchase(addr3.address, 0);
                expect(purchase.amount).to.equal(ethers.parseEther("100000"));
            });
        });

        describe("3.2 Bonus Scaling with Purchase Amount", function () {
            it("Should scale bonus proportionally with purchase amount", async function () {
                const { presale, addr3, addr4 } = await loadFixture(deployPresaleFixture);
                await presale.whitelistAddress(addr3.address, true);
                await presale.whitelistAddress(addr4.address, true);

                // Small purchase: 0.5 ETH = $1000 = 100k base + 20k bonus = 120k
                await presale.connect(addr3).buyTokensETH({ value: ethers.parseEther("0.5") });

                // Large purchase: 2 ETH = $4000 = 400k base + 80k bonus = 480k
                await presale.connect(addr4).buyTokensETH({ value: ethers.parseEther("2") });

                const purchase1 = await presale.getPurchase(addr3.address, 0);
                const purchase2 = await presale.getPurchase(addr4.address, 0);

                // Bonus should scale 4x
                expect(purchase2.amount).to.equal(purchase1.amount * 4n);
            });

            it("Should include bonus in vesting calculations", async function () {
                const { presale, addr3 } = await loadFixture(deployPresaleFixture);
                await presale.whitelistAddress(addr3.address, true);

                await presale.connect(addr3).buyTokensETH({ value: ethers.parseEther("1") });
                await presale.finalizePresale();

                // Total with bonus: 240,000 tokens
                // 25% immediate release: 60,000 tokens (includes bonus portion)
                const claimable = await presale.getClaimableAmount(addr3.address);
                expect(claimable).to.equal(ethers.parseEther("60000"));

                const schedule = await presale.getVestingSchedule(addr3.address);
                expect(schedule.totalAmount).to.equal(ethers.parseEther("240000"));
            });
        });

        describe("3.3 Bonus Calculation Precision", function () {
            it("Should calculate bonus correctly for fractional amounts", async function () {
                const { presale, addr3 } = await loadFixture(deployPresaleFixture);
                await presale.whitelistAddress(addr3.address, true);

                // 0.123 ETH = $246 = 24,600 base + 4,920 bonus = 29,520 tokens
                await presale.connect(addr3).buyTokensETH({ value: ethers.parseEther("0.123") });

                const purchase = await presale.getPurchase(addr3.address, 0);
                expect(purchase.amount).to.be.closeTo(
                    ethers.parseEther("29520"),
                    ethers.parseEther("10")
                );
            });

            it("Should maintain precision across multiple purchases with bonuses", async function () {
                const { presale, addr3 } = await loadFixture(deployPresaleFixture);
                await presale.whitelistAddress(addr3.address, true);

                // Three different amounts
                await presale.connect(addr3).buyTokensETH({ value: ethers.parseEther("0.333") });
                await time.increase(300);
                await presale.connect(addr3).buyTokensETH({ value: ethers.parseEther("0.666") });
                await time.increase(300);
                await presale.connect(addr3).buyTokensETH({ value: ethers.parseEther("0.999") });

                const schedule = await presale.getVestingSchedule(addr3.address);

                // Verify total includes all bonuses
                const purchase1 = await presale.getPurchase(addr3.address, 0);
                const purchase2 = await presale.getPurchase(addr3.address, 1);
                const purchase3 = await presale.getPurchase(addr3.address, 2);

                const expectedTotal = purchase1.amount + purchase2.amount + purchase3.amount;
                expect(schedule.totalAmount).to.equal(expectedTotal);
            });
        });
    });

    describe("4. Rate Limiting and Security", function () {
        it("Should enforce 5-minute rate limit between purchases", async function () {
            const { presale, addr3 } = await loadFixture(deployPresaleFixture);
            await presale.whitelistAddress(addr3.address, true);

            await presale.connect(addr3).buyTokensETH({ value: ethers.parseEther("1") });

            // Should fail immediately
            await expect(
                presale.connect(addr3).buyTokensETH({ value: ethers.parseEther("1") })
            ).to.be.revertedWith("Rate limit exceeded");

            // Should succeed after 5 minutes
            await time.increase(300);
            await expect(
                presale.connect(addr3).buyTokensETH({ value: ethers.parseEther("1") })
            ).to.not.be.reverted;
        });

        it("Should allow purchases exactly at rate limit boundary", async function () {
            const { presale, addr3 } = await loadFixture(deployPresaleFixture);
            await presale.whitelistAddress(addr3.address, true);

            await presale.connect(addr3).buyTokensETH({ value: ethers.parseEther("1") });

            // Wait exactly 5 minutes
            await time.increase(300);

            await expect(
                presale.connect(addr3).buyTokensETH({ value: ethers.parseEther("1") })
            ).to.not.be.reverted;
        });

        it("Should reject claims before presale finalization", async function () {
            const { presale, addr3 } = await loadFixture(deployPresaleFixture);
            await presale.whitelistAddress(addr3.address, true);

            await presale.connect(addr3).buyTokensETH({ value: ethers.parseEther("1") });

            await expect(
                presale.connect(addr3).claimTokens()
            ).to.be.revertedWith("Presale not finalized");
        });

        it("Should prevent purchases when paused", async function () {
            const { presale, addr3 } = await loadFixture(deployPresaleFixture);
            await presale.whitelistAddress(addr3.address, true);

            await presale.pause();

            await expect(
                presale.connect(addr3).buyTokensETH({ value: ethers.parseEther("1") })
            ).to.be.revertedWith("Pausable: paused");
        });
    });

    describe("5. Integration Tests - Complex Scenarios", function () {
        it("Should handle complete user journey from purchase to full claim", async function () {
            const { presale, hypeToken, addr3 } = await loadFixture(deployPresaleFixture);
            await presale.whitelistAddress(addr3.address, true);

            // 1. Purchase
            await presale.connect(addr3).buyTokensETH({ value: ethers.parseEther("1") });
            expect(await presale.getPurchaseCount(addr3.address)).to.equal(1);

            // 2. Finalize
            await presale.finalizePresale();

            // 3. Claim immediate
            await presale.connect(addr3).claimTokens();
            expect(await hypeToken.balanceOf(addr3.address)).to.equal(ethers.parseEther("60000"));

            // 4. Wait and claim more
            await time.increase(45 * 24 * 60 * 60); // 50% vested
            await presale.connect(addr3).claimTokens();
            expect(await hypeToken.balanceOf(addr3.address)).to.be.closeTo(
                ethers.parseEther("150000"),
                ethers.parseEther("2000")
            );

            // 5. Final claim
            await time.increase(45 * 24 * 60 * 60);
            await presale.connect(addr3).claimTokens();
            expect(await hypeToken.balanceOf(addr3.address)).to.equal(ethers.parseEther("240000"));
        });

        it("Should handle multiple users with different purchase amounts and claim schedules", async function () {
            const { presale, hypeToken, addr3, addr4, addr5 } = await loadFixture(deployPresaleFixture);

            await presale.whitelistAddress(addr3.address, true);
            await presale.whitelistAddress(addr4.address, true);
            await presale.whitelistAddress(addr5.address, true);

            // Different purchase amounts
            await presale.connect(addr3).buyTokensETH({ value: ethers.parseEther("1") });
            await time.increase(300);
            await presale.connect(addr4).buyTokensETH({ value: ethers.parseEther("2") });
            await time.increase(300);
            await presale.connect(addr5).buyTokensETH({ value: ethers.parseEther("0.5") });

            await presale.finalizePresale();

            // All claim immediately
            await presale.connect(addr3).claimTokens();
            await presale.connect(addr4).claimTokens();
            await presale.connect(addr5).claimTokens();

            // Verify proportional claims
            const balance3 = await hypeToken.balanceOf(addr3.address);
            const balance4 = await hypeToken.balanceOf(addr4.address);
            const balance5 = await hypeToken.balanceOf(addr5.address);

            expect(balance4).to.equal(balance3 * 2n); // addr4 bought 2x more
            expect(balance5).to.equal(balance3 / 2n); // addr5 bought 0.5x
        });

        it("Should handle transition between rounds correctly", async function () {
            const { presale, addr3, addr4 } = await loadFixture(deployPresaleFixture);
            await presale.whitelistAddress(addr3.address, true);

            // Buy in Private round
            await presale.connect(addr3).buyTokensETH({ value: ethers.parseEther("1") });

            // Move to Presale 1
            await presale.setCurrentRound(1);
            await time.increase(30 * 24 * 60 * 60);

            // Buy in Presale 1
            await presale.connect(addr4).buyTokensETH({ value: ethers.parseEther("1") });

            // Verify different bonuses
            const purchase1 = await presale.getPurchase(addr3.address, 0);
            const purchase2 = await presale.getPurchase(addr4.address, 0);

            expect(purchase1.round).to.equal(0); // Private
            expect(purchase2.round).to.equal(1); // Presale1
            expect(purchase1.amount).to.be.greaterThan(purchase2.amount); // Higher bonus in Private
        });
    });
});
