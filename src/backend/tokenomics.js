/**
 * Tokenomics Calculator
 * Advanced calculations for token distribution, staking rewards, and economic modeling
 */

class TokenomicsCalculator {
    constructor(config = {}) {
        // Token configuration
        this.totalSupply = config.totalSupply || 1_000_000_000; // 1 Billion
        this.decimals = config.decimals || 18;

        // Distribution percentages
        this.distribution = {
            publicSale: 25,          // 25% - 250M tokens
            liquidityPool: 20,       // 20% - 200M tokens
            staking: 15,             // 15% - 150M tokens
            team: 15,                // 15% - 150M tokens
            treasury: 10,            // 10% - 100M tokens
            marketing: 8,            // 8% - 80M tokens
            partnerships: 5,         // 5% - 50M tokens
            airdrop: 2               // 2% - 20M tokens
        };

        // Vesting schedules (in months)
        this.vestingSchedules = {
            team: { cliff: 6, duration: 24, releaseInterval: 3 },
            treasury: { cliff: 3, duration: 18, releaseInterval: 1 },
            partnerships: { cliff: 2, duration: 12, releaseInterval: 1 }
        };

        // Staking tiers
        this.stakingTiers = {
            30: { baseAPY: 12, bonusAPY: 5, lockDays: 30 },
            90: { baseAPY: 12, bonusAPY: 15, lockDays: 90 },
            365: { baseAPY: 12, bonusAPY: 50, lockDays: 365 }
        };

        // Fee structure (in basis points)
        this.fees = {
            reflection: 200,    // 2%
            liquidity: 300,     // 3%
            burn: 100,          // 1%
            treasury: 200       // 2%
        };

        // Burn mechanism
        this.burnRate = 0.01; // 1% per transaction
        this.maxBurnSupply = this.totalSupply * 0.5; // Max 50% can be burned

        // Price simulation
        this.initialPrice = 0.001; // $0.001 starting price
        this.targetMarketCap = 100_000_000; // $100M target
    }

    /**
     * Calculate token distribution
     */
    calculateDistribution() {
        const distribution = {};

        for (const [category, percentage] of Object.entries(this.distribution)) {
            distribution[category] = {
                percentage,
                tokens: (this.totalSupply * percentage) / 100,
                tokensFormatted: this.formatTokenAmount((this.totalSupply * percentage) / 100)
            };
        }

        return distribution;
    }

    /**
     * Calculate vesting schedule with unlock dates
     */
    calculateVestingSchedule(category, startDate = new Date()) {
        const schedule = this.vestingSchedules[category];
        if (!schedule) return null;

        const totalTokens = (this.totalSupply * this.distribution[category]) / 100;
        const { cliff, duration, releaseInterval } = schedule;

        const releases = [];
        const releasesCount = Math.floor(duration / releaseInterval);
        const tokensPerRelease = totalTokens / releasesCount;

        // Cliff period
        const cliffDate = new Date(startDate);
        cliffDate.setMonth(cliffDate.getMonth() + cliff);

        // Release schedule
        for (let i = 0; i < releasesCount; i++) {
            const releaseDate = new Date(cliffDate);
            releaseDate.setMonth(releaseDate.getMonth() + (i * releaseInterval));

            releases.push({
                date: releaseDate.toISOString(),
                tokens: tokensPerRelease,
                tokensFormatted: this.formatTokenAmount(tokensPerRelease),
                percentage: (100 / releasesCount).toFixed(2),
                cumulativePercentage: ((i + 1) * (100 / releasesCount)).toFixed(2)
            });
        }

        return {
            category,
            totalTokens,
            totalTokensFormatted: this.formatTokenAmount(totalTokens),
            cliff: `${cliff} months`,
            duration: `${duration} months`,
            releaseInterval: `${releaseInterval} month(s)`,
            releases
        };
    }

    /**
     * Calculate staking rewards (APY)
     */
    calculateStakingRewards(amount, lockPeriod, customAPY = null) {
        const tier = this.stakingTiers[lockPeriod];
        if (!tier && !customAPY) {
            throw new Error('Invalid lock period. Choose 30, 90, or 365 days.');
        }

        const totalAPY = customAPY || (tier.baseAPY + tier.bonusAPY);
        const dailyRate = totalAPY / 365 / 100;

        // Daily rewards
        const dailyReward = amount * dailyRate;

        // Total rewards for lock period
        const totalReward = dailyReward * lockPeriod;

        // Compound interest (daily compounding)
        const compoundedAmount = amount * Math.pow(1 + dailyRate, lockPeriod);
        const compoundedReward = compoundedAmount - amount;

        return {
            principal: amount,
            principalFormatted: this.formatTokenAmount(amount),
            lockPeriod,
            lockPeriodDays: `${lockPeriod} days`,
            apy: totalAPY,
            apyFormatted: `${totalAPY}%`,
            dailyReward,
            dailyRewardFormatted: this.formatTokenAmount(dailyReward),
            totalReward,
            totalRewardFormatted: this.formatTokenAmount(totalReward),
            compoundedReward,
            compoundedRewardFormatted: this.formatTokenAmount(compoundedReward),
            finalAmount: compoundedAmount,
            finalAmountFormatted: this.formatTokenAmount(compoundedAmount)
        };
    }

    /**
     * Calculate burn mechanics over time
     */
    calculateBurnProjection(days = 365, dailyVolume = 10_000_000) {
        const projections = [];
        let currentSupply = this.totalSupply;
        let totalBurned = 0;

        for (let day = 1; day <= days; day++) {
            const dailyBurn = dailyVolume * this.burnRate;

            // Check max burn limit
            if (totalBurned + dailyBurn <= this.maxBurnSupply) {
                currentSupply -= dailyBurn;
                totalBurned += dailyBurn;
            }

            if (day % 30 === 0 || day === 1) { // Monthly snapshots
                projections.push({
                    day,
                    month: Math.ceil(day / 30),
                    currentSupply,
                    currentSupplyFormatted: this.formatTokenAmount(currentSupply),
                    totalBurned,
                    totalBurnedFormatted: this.formatTokenAmount(totalBurned),
                    burnPercentage: ((totalBurned / this.totalSupply) * 100).toFixed(2),
                    circulatingSupply: currentSupply,
                    circulatingSupplyFormatted: this.formatTokenAmount(currentSupply)
                });
            }
        }

        return {
            initialSupply: this.totalSupply,
            maxBurnSupply: this.maxBurnSupply,
            dailyVolume,
            burnRate: `${this.burnRate * 100}%`,
            projections
        };
    }

    /**
     * Calculate liquidity pool incentives
     */
    calculateLiquidityIncentives(lpTokens, poolTVL, totalLPSupply, rewardAPR = 50) {
        const userPoolShare = (lpTokens / totalLPSupply) * 100;
        const userLiquidityValue = (poolTVL * lpTokens) / totalLPSupply;

        const dailyRewardRate = rewardAPR / 365 / 100;
        const dailyRewards = userLiquidityValue * dailyRewardRate;
        const monthlyRewards = dailyRewards * 30;
        const yearlyRewards = dailyRewards * 365;

        return {
            lpTokens,
            lpTokensFormatted: this.formatTokenAmount(lpTokens),
            poolShare: userPoolShare.toFixed(4),
            poolShareFormatted: `${userPoolShare.toFixed(4)}%`,
            liquidityValue: userLiquidityValue,
            liquidityValueFormatted: `$${this.formatNumber(userLiquidityValue)}`,
            apr: rewardAPR,
            aprFormatted: `${rewardAPR}%`,
            dailyRewards,
            dailyRewardsFormatted: `$${this.formatNumber(dailyRewards)}`,
            monthlyRewards,
            monthlyRewardsFormatted: `$${this.formatNumber(monthlyRewards)}`,
            yearlyRewards,
            yearlyRewardsFormatted: `$${this.formatNumber(yearlyRewards)}`
        };
    }

    /**
     * Calculate airdrop distribution
     */
    calculateAirdrop(participants, criteria = 'equal') {
        const airdropSupply = (this.totalSupply * this.distribution.airdrop) / 100;

        if (criteria === 'equal') {
            const tokensPerUser = airdropSupply / participants;
            return {
                totalParticipants: participants,
                totalTokens: airdropSupply,
                totalTokensFormatted: this.formatTokenAmount(airdropSupply),
                tokensPerUser,
                tokensPerUserFormatted: this.formatTokenAmount(tokensPerUser),
                distributionType: 'Equal Distribution'
            };
        } else if (criteria === 'tiered') {
            // Tiered distribution: 50% to top 10%, 30% to next 40%, 20% to rest
            const tier1Count = Math.floor(participants * 0.1);
            const tier2Count = Math.floor(participants * 0.4);
            const tier3Count = participants - tier1Count - tier2Count;

            const tier1Tokens = (airdropSupply * 0.5) / tier1Count;
            const tier2Tokens = (airdropSupply * 0.3) / tier2Count;
            const tier3Tokens = (airdropSupply * 0.2) / tier3Count;

            return {
                totalParticipants: participants,
                totalTokens: airdropSupply,
                totalTokensFormatted: this.formatTokenAmount(airdropSupply),
                distributionType: 'Tiered Distribution',
                tiers: [
                    {
                        tier: 'Tier 1 (Top 10%)',
                        participants: tier1Count,
                        tokensPerUser: tier1Tokens,
                        tokensPerUserFormatted: this.formatTokenAmount(tier1Tokens),
                        totalAllocation: airdropSupply * 0.5
                    },
                    {
                        tier: 'Tier 2 (Next 40%)',
                        participants: tier2Count,
                        tokensPerUser: tier2Tokens,
                        tokensPerUserFormatted: this.formatTokenAmount(tier2Tokens),
                        totalAllocation: airdropSupply * 0.3
                    },
                    {
                        tier: 'Tier 3 (Remaining 50%)',
                        participants: tier3Count,
                        tokensPerUser: tier3Tokens,
                        tokensPerUserFormatted: this.formatTokenAmount(tier3Tokens),
                        totalAllocation: airdropSupply * 0.2
                    }
                ]
            };
        }
    }

    /**
     * Price projection model
     */
    calculatePriceProjection(days = 365, growthRate = 0.02) {
        const projections = [];
        let currentPrice = this.initialPrice;
        let currentMarketCap = this.initialPrice * this.totalSupply;

        for (let day = 1; day <= days; day++) {
            // Apply daily growth rate with some volatility
            const volatility = (Math.random() - 0.5) * 0.1; // ±5% random volatility
            currentPrice = currentPrice * (1 + growthRate + volatility);
            currentMarketCap = currentPrice * this.totalSupply;

            if (day % 30 === 0 || day === 1) { // Monthly snapshots
                projections.push({
                    day,
                    month: Math.ceil(day / 30),
                    price: currentPrice,
                    priceFormatted: `$${currentPrice.toFixed(6)}`,
                    marketCap: currentMarketCap,
                    marketCapFormatted: `$${this.formatNumber(currentMarketCap)}`,
                    priceChange: ((currentPrice - this.initialPrice) / this.initialPrice * 100).toFixed(2),
                    priceChangeFormatted: `${((currentPrice - this.initialPrice) / this.initialPrice * 100).toFixed(2)}%`
                });
            }
        }

        return {
            initialPrice: this.initialPrice,
            targetMarketCap: this.targetMarketCap,
            targetPrice: this.targetMarketCap / this.totalSupply,
            growthRate: `${growthRate * 100}%`,
            projections
        };
    }

    /**
     * Calculate reflection rewards for holders
     */
    calculateReflectionRewards(holdings, totalReflectionPool, circulatingSupply) {
        const holderShare = (holdings / circulatingSupply) * 100;
        const reflectionReward = (totalReflectionPool * holdings) / circulatingSupply;

        return {
            holdings,
            holdingsFormatted: this.formatTokenAmount(holdings),
            holderShare: holderShare.toFixed(4),
            holderShareFormatted: `${holderShare.toFixed(4)}%`,
            reflectionReward,
            reflectionRewardFormatted: this.formatTokenAmount(reflectionReward),
            totalReflectionPool,
            totalReflectionPoolFormatted: this.formatTokenAmount(totalReflectionPool)
        };
    }

    /**
     * Complete tokenomics summary
     */
    getTokenomicsSummary() {
        return {
            token: {
                name: 'HypedToken',
                symbol: 'HYPE',
                totalSupply: this.totalSupply,
                totalSupplyFormatted: this.formatTokenAmount(this.totalSupply),
                decimals: this.decimals
            },
            distribution: this.calculateDistribution(),
            fees: {
                reflection: `${this.fees.reflection / 100}%`,
                liquidity: `${this.fees.liquidity / 100}%`,
                burn: `${this.fees.burn / 100}%`,
                treasury: `${this.fees.treasury / 100}%`,
                total: `${(this.fees.reflection + this.fees.liquidity + this.fees.burn + this.fees.treasury) / 100}%`
            },
            stakingTiers: this.stakingTiers,
            burnMechanism: {
                burnRate: `${this.burnRate * 100}%`,
                maxBurnSupply: this.maxBurnSupply,
                maxBurnSupplyFormatted: this.formatTokenAmount(this.maxBurnSupply),
                maxBurnPercentage: '50%'
            },
            initialPrice: `$${this.initialPrice}`,
            targetMarketCap: `$${this.formatNumber(this.targetMarketCap)}`
        };
    }

    // Utility functions
    formatTokenAmount(amount) {
        if (amount >= 1_000_000) {
            return `${(amount / 1_000_000).toFixed(2)}M`;
        } else if (amount >= 1_000) {
            return `${(amount / 1_000).toFixed(2)}K`;
        }
        return amount.toFixed(2);
    }

    formatNumber(num) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
    }
}

// Example usage and exports
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TokenomicsCalculator;
}

// Example demonstrations
function demonstrateCalculations() {
    const calculator = new TokenomicsCalculator();

    console.log('=== TOKENOMICS SUMMARY ===');
    console.log(JSON.stringify(calculator.getTokenomicsSummary(), null, 2));

    console.log('\n=== TOKEN DISTRIBUTION ===');
    console.log(JSON.stringify(calculator.calculateDistribution(), null, 2));

    console.log('\n=== TEAM VESTING SCHEDULE ===');
    console.log(JSON.stringify(calculator.calculateVestingSchedule('team'), null, 2));

    console.log('\n=== STAKING REWARDS (100K tokens, 365 days) ===');
    console.log(JSON.stringify(calculator.calculateStakingRewards(100000, 365), null, 2));

    console.log('\n=== BURN PROJECTION (1 Year) ===');
    console.log(JSON.stringify(calculator.calculateBurnProjection(365, 10_000_000), null, 2));

    console.log('\n=== AIRDROP DISTRIBUTION (10,000 users) ===');
    console.log(JSON.stringify(calculator.calculateAirdrop(10000, 'tiered'), null, 2));

    console.log('\n=== PRICE PROJECTION (1 Year) ===');
    console.log(JSON.stringify(calculator.calculatePriceProjection(365, 0.02), null, 2));
}

// Uncomment to run demonstrations
// demonstrateCalculations();
