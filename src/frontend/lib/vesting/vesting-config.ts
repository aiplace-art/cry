/**
 * Vesting Configuration
 * CRITICAL: These values MUST match the smart contract exactly
 * Contract: HypeAIPrivateSaleWithVesting.sol
 */

// ============ VESTING PARAMETERS (MUST MATCH CONTRACT) ============

/**
 * Immediate unlock percentage (20%)
 * Contract value: IMMEDIATE_UNLOCK_PERCENTAGE = 2000 basis points
 */
export const IMMEDIATE_UNLOCK_PERCENTAGE = 0.20;

/**
 * Vesting percentage (80%)
 * Contract value: VESTING_PERCENTAGE = 8000 basis points
 */
export const VESTING_PERCENTAGE = 0.80;

/**
 * Cliff period in days (90 days = 3 months)
 * Contract value: CLIFF_DURATION = 90 days = 7776000 seconds
 */
export const CLIFF_DURATION_DAYS = 90;

/**
 * Cliff period in seconds
 * Contract value: 90 * 24 * 60 * 60 = 7776000 seconds
 */
export const CLIFF_DURATION_SECONDS = 7776000;

/**
 * Vesting duration in days AFTER cliff (540 days = 18 months)
 * Contract value: VESTING_DURATION = 540 days = 46656000 seconds
 */
export const VESTING_DURATION_DAYS = 540;

/**
 * Vesting duration in seconds AFTER cliff
 * Contract value: 540 * 24 * 60 * 60 = 46656000 seconds
 */
export const VESTING_DURATION_SECONDS = 46656000;

/**
 * Total duration in days (cliff + vesting = 630 days = 21 months)
 */
export const TOTAL_DURATION_DAYS = CLIFF_DURATION_DAYS + VESTING_DURATION_DAYS;

/**
 * Total duration in seconds
 */
export const TOTAL_DURATION_SECONDS = CLIFF_DURATION_SECONDS + VESTING_DURATION_SECONDS;

/**
 * Token price in USD
 * Contract value: $0.00008
 */
export const TOKEN_PRICE_USD = 0.00008;

/**
 * Minimum purchase amount in USD
 * Contract value: $400
 */
export const MIN_PURCHASE_USD = 400;

/**
 * Maximum purchase amount in USD
 * Contract value: $8,000
 */
export const MAX_PURCHASE_USD = 8000;

/**
 * Bonus percentage for referrals/early birds
 * Contract value: 10% = 1000 basis points
 */
export const BONUS_PERCENTAGE = 0.10;

/**
 * Basis points denominator
 * Contract value: 10000
 */
export const BASIS_POINTS = 10000;

// ============ CALCULATION FUNCTIONS (MUST MATCH CONTRACT EXACTLY) ============

/**
 * Calculate total tokens from USD investment
 * @param usdAmount USD amount invested
 * @param applyBonus Whether to apply bonus percentage
 * @returns Object with baseTokens, bonusTokens, and totalTokens
 *
 * Example: calculateTokensFromUSD(1000, true)
 *   baseTokens = 1000 / 0.00008 = 12,500,000
 *   bonusTokens = 12,500,000 * 0.10 = 1,250,000
 *   totalTokens = 13,750,000
 */
export function calculateTokensFromUSD(
  usdAmount: number,
  applyBonus: boolean = false
): {
  baseTokens: number;
  bonusTokens: number;
  totalTokens: number;
} {
  // Calculate base tokens: usdAmount / tokenPrice
  const baseTokens = usdAmount / TOKEN_PRICE_USD;

  // Calculate bonus tokens if applicable
  const bonusTokens = applyBonus ? baseTokens * BONUS_PERCENTAGE : 0;

  // Total tokens
  const totalTokens = baseTokens + bonusTokens;

  return {
    baseTokens,
    bonusTokens,
    totalTokens,
  };
}

/**
 * Calculate immediate and vested token amounts
 * @param totalTokens Total tokens purchased
 * @returns Object with immediateTokens and vestedTokens
 *
 * Example: splitTokensForVesting(13750000)
 *   immediateTokens = 13,750,000 * 0.20 = 2,750,000
 *   vestedTokens = 13,750,000 * 0.80 = 11,000,000
 */
export function splitTokensForVesting(totalTokens: number): {
  immediateTokens: number;
  vestedTokens: number;
} {
  const immediateTokens = totalTokens * IMMEDIATE_UNLOCK_PERCENTAGE;
  const vestedTokens = totalTokens * VESTING_PERCENTAGE;

  return {
    immediateTokens,
    vestedTokens,
  };
}

/**
 * Calculate unlocked tokens at a specific time WITH CLIFF
 * @param purchaseTime Timestamp when tokens were purchased (Unix timestamp in seconds)
 * @param currentTime Current timestamp (Unix timestamp in seconds)
 * @param totalTokens Total tokens purchased
 * @returns Object with unlockedAmount and vestingProgress
 *
 * CRITICAL: This formula MUST match the smart contract exactly
 *
 * Contract formula with cliff:
 *   elapsedTime = currentTime - purchaseTime
 *   if (elapsedTime < CLIFF_DURATION) {
 *     unlockedFromVesting = 0  // Cliff period - nothing unlocks
 *   } else {
 *     vestingElapsed = elapsedTime - CLIFF_DURATION
 *     if (vestingElapsed >= VESTING_DURATION) {
 *       unlockedFromVesting = vestedTokens  // Full unlock
 *     } else {
 *       unlockedFromVesting = vestedTokens * (vestingElapsed / VESTING_DURATION)
 *     }
 *   }
 *   totalUnlocked = immediateTokens + unlockedFromVesting
 *
 * Vesting logic:
 * 1. Immediate tokens (20%) are ALWAYS unlocked from day 0
 * 2. During cliff (0-90 days): Only immediate tokens available
 * 3. After cliff (90+ days): Linear unlock of vested tokens over 540 days
 * 4. Total duration: 630 days (90 cliff + 540 vesting = 21 months)
 */
export function calculateUnlockedAmount(
  purchaseTime: number,
  currentTime: number,
  totalTokens: number
): {
  unlockedAmount: number;
  vestingProgress: number; // 0.0 to 1.0 (overall progress including cliff)
  unlockedFromVesting: number;
  immediateTokens: number;
  vestedTokens: number;
  isInCliff: boolean;
  cliffEnds: number; // Timestamp when cliff ends
} {
  // Split into immediate and vested
  const { immediateTokens, vestedTokens } = splitTokensForVesting(totalTokens);

  // Calculate elapsed time since purchase
  const elapsedTime = currentTime - purchaseTime;

  // Cliff end timestamp
  const cliffEnds = purchaseTime + CLIFF_DURATION_SECONDS;

  // Check if still in cliff
  const isInCliff = elapsedTime < CLIFF_DURATION_SECONDS;

  // Calculate unlocked from vesting portion
  let unlockedFromVesting: number;

  if (isInCliff) {
    // Still in cliff period - no vested tokens unlocked yet
    unlockedFromVesting = 0;
  } else {
    // Cliff period passed - calculate vested unlock
    const vestingElapsed = elapsedTime - CLIFF_DURATION_SECONDS;

    if (vestingElapsed >= VESTING_DURATION_SECONDS) {
      // Full vesting period elapsed - all vested tokens unlocked
      unlockedFromVesting = vestedTokens;
    } else {
      // Partial vesting - linear unlock
      // unlockedFromVesting = vestedTokens * (vestingElapsed / vestingDuration)
      unlockedFromVesting = vestedTokens * (vestingElapsed / VESTING_DURATION_SECONDS);
    }
  }

  // Total unlocked = immediate (always available) + unlocked from vesting
  const unlockedAmount = immediateTokens + unlockedFromVesting;

  // Calculate overall vesting progress (includes cliff + vesting)
  const totalDuration = TOTAL_DURATION_SECONDS;
  let vestingProgress: number;

  if (elapsedTime >= totalDuration) {
    vestingProgress = 1.0; // 100%
  } else if (elapsedTime <= 0) {
    vestingProgress = 0.0;
  } else {
    vestingProgress = elapsedTime / totalDuration;
  }

  return {
    unlockedAmount,
    vestingProgress,
    unlockedFromVesting,
    immediateTokens,
    vestedTokens,
    isInCliff,
    cliffEnds,
  };
}

/**
 * Calculate claimable tokens
 * @param purchaseTime Purchase timestamp
 * @param currentTime Current timestamp
 * @param totalTokens Total tokens
 * @param claimedTokens Tokens already claimed
 * @returns Claimable token amount
 */
export function calculateClaimableAmount(
  purchaseTime: number,
  currentTime: number,
  totalTokens: number,
  claimedTokens: number
): number {
  const { unlockedAmount } = calculateUnlockedAmount(
    purchaseTime,
    currentTime,
    totalTokens
  );

  const claimableAmount = unlockedAmount - claimedTokens;

  return claimableAmount > 0 ? claimableAmount : 0;
}

/**
 * Generate vesting schedule milestones WITH CLIFF
 * @param purchaseTime Purchase timestamp
 * @param totalTokens Total tokens
 * @returns Array of milestone objects
 *
 * Example milestones: Day 0, 30, 60, 90 (cliff ends), 180, 270, 360, 450, 540, 630 (full unlock)
 */
export function generateVestingSchedule(
  purchaseTime: number,
  totalTokens: number
): Array<{
  day: number;
  timestamp: number;
  date: Date;
  unlockedTokens: number;
  unlockedPercentage: number;
  progress: number;
  isCliffEnd?: boolean;
  isVestingEnd?: boolean;
}> {
  const { immediateTokens, vestedTokens } = splitTokensForVesting(totalTokens);

  // Milestones: Day 0, 30, 60, 90 (cliff), 180, 270, 360, 450, 540, 630 (end)
  const milestones = [0, 30, 60, 90, 180, 270, 360, 450, 540, 630];

  return milestones.map((day) => {
    const daysInSeconds = day * 24 * 60 * 60;
    const timestamp = purchaseTime + daysInSeconds;

    const { unlockedAmount, vestingProgress, isInCliff } = calculateUnlockedAmount(
      purchaseTime,
      timestamp,
      totalTokens
    );

    return {
      day,
      timestamp,
      date: new Date(timestamp * 1000),
      unlockedTokens: unlockedAmount,
      unlockedPercentage: (unlockedAmount / totalTokens) * 100,
      progress: vestingProgress,
      isCliffEnd: day === CLIFF_DURATION_DAYS,
      isVestingEnd: day === TOTAL_DURATION_DAYS,
    };
  });
}

/**
 * Format token amount for display
 * @param amount Token amount
 * @param decimals Number of decimal places
 * @returns Formatted string
 */
export function formatTokenAmount(amount: number, decimals: number = 0): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format USD amount for display
 * @param amount USD amount
 * @returns Formatted string
 */
export function formatUSD(amount: number): string {
  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Validate purchase amount
 * @param usdAmount USD amount
 * @returns Object with isValid and error message
 */
export function validatePurchaseAmount(usdAmount: number): {
  isValid: boolean;
  error?: string;
} {
  if (usdAmount < MIN_PURCHASE_USD) {
    return {
      isValid: false,
      error: `Minimum purchase is ${formatUSD(MIN_PURCHASE_USD)}`,
    };
  }

  if (usdAmount > MAX_PURCHASE_USD) {
    return {
      isValid: false,
      error: `Maximum purchase is ${formatUSD(MAX_PURCHASE_USD)}`,
    };
  }

  return { isValid: true };
}

// ============ TYPE DEFINITIONS ============

export interface VestingInfo {
  totalTokens: number;
  immediateTokens: number;
  vestedTokens: number;
  claimedTokens: number;
  unlockedTokens: number;
  claimableTokens: number;
  purchaseTime: number;
  vestingEndTime: number;
  vestingProgress: number; // 0.0 to 1.0
  purchaseAmountUSD: number;
  hasBonus: boolean;
}

export interface VestingScheduleItem {
  day: number;
  timestamp: number;
  date: Date;
  unlockedTokens: number;
  unlockedPercentage: number;
  progress: number;
}
