use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use std::mem::size_of;

declare_id!("HypE11111111111111111111111111111111111111");

#[program]
pub mod hype_presale {
    use super::*;

    /// Initialize the presale program
    pub fn initialize(
        ctx: Context<Initialize>,
        soft_cap: u64,
        hard_cap: u64,
        multisig_owners: [Pubkey; 3],
    ) -> Result<()> {
        let presale = &mut ctx.accounts.presale;
        presale.authority = ctx.accounts.authority.key();
        presale.hype_mint = ctx.accounts.hype_mint.key();
        presale.soft_cap = soft_cap;
        presale.hard_cap = hard_cap;
        presale.total_raised = 0;
        presale.soft_cap_reached = false;
        presale.finalized = false;
        presale.current_round = Round::Private;
        presale.multisig_owners = multisig_owners;
        presale.withdraw_lock_time = Clock::get()?.unix_timestamp + (30 * 24 * 60 * 60); // 30 days
        presale.bump = *ctx.bumps.get("presale").unwrap();

        // Initialize rounds
        presale.rounds[Round::Private as usize] = RoundConfig {
            price: 10_000, // $0.01 in 6 decimals
            bonus: 20,
            allocation: 100_000_000 * 10u64.pow(9), // 100M tokens (9 decimals on Solana)
            sold: 0,
            start_time: Clock::get()?.unix_timestamp,
            end_time: Clock::get()?.unix_timestamp + (30 * 24 * 60 * 60),
            vesting_cliff: 0,
            vesting_duration: 90 * 24 * 60 * 60, // 90 days
            immediate_release: 25,
            requires_whitelist: true,
        };

        presale.rounds[Round::Presale1 as usize] = RoundConfig {
            price: 15_000, // $0.015
            bonus: 10,
            allocation: 100_000_000 * 10u64.pow(9),
            sold: 0,
            start_time: Clock::get()?.unix_timestamp + (30 * 24 * 60 * 60),
            end_time: Clock::get()?.unix_timestamp + (60 * 24 * 60 * 60),
            vesting_cliff: 0,
            vesting_duration: 30 * 24 * 60 * 60, // 30 days
            immediate_release: 50,
            requires_whitelist: false,
        };

        presale.rounds[Round::Presale2 as usize] = RoundConfig {
            price: 20_000, // $0.02
            bonus: 0,
            allocation: 100_000_000 * 10u64.pow(9),
            sold: 0,
            start_time: Clock::get()?.unix_timestamp + (60 * 24 * 60 * 60),
            end_time: Clock::get()?.unix_timestamp + (90 * 24 * 60 * 60),
            vesting_cliff: 0,
            vesting_duration: 0,
            immediate_release: 100,
            requires_whitelist: false,
        };

        Ok(())
    }

    /// Buy tokens with SOL
    pub fn buy_tokens_sol(ctx: Context<BuyTokens>, sol_amount: u64) -> Result<()> {
        let presale = &mut ctx.accounts.presale;
        let buyer = &ctx.accounts.buyer;
        let buyer_state = &mut ctx.accounts.buyer_state;

        // Validate round
        require!(!presale.finalized, PresaleError::PresaleFinalized);
        let round_config = &presale.rounds[presale.current_round as usize];
        let current_time = Clock::get()?.unix_timestamp;
        require!(current_time >= round_config.start_time, PresaleError::RoundNotStarted);
        require!(current_time <= round_config.end_time, PresaleError::RoundEnded);

        // Check whitelist
        if round_config.requires_whitelist {
            require!(buyer_state.whitelisted, PresaleError::NotWhitelisted);
        }

        // Rate limiting
        require!(
            current_time >= buyer_state.last_purchase_time + 300, // 5 minutes
            PresaleError::RateLimitExceeded
        );

        // Convert SOL to USD (simplified - in production, use Pyth or Switchboard oracle)
        let sol_price = presale.price_feeds[PaymentMethod::Sol as usize];
        require!(sol_price > 0, PresaleError::PriceFeedNotSet);

        let usd_amount = (sol_amount as u128)
            .checked_mul(sol_price as u128)
            .unwrap()
            .checked_div(10u128.pow(9))
            .unwrap() as u64;

        // Validate purchase
        require!(
            usd_amount <= 10_000 * 10u64.pow(6),
            PresaleError::ExceedsMaxTransaction
        );

        if usd_amount > 5_000 * 10u64.pow(6) {
            require!(buyer_state.kyc_verified, PresaleError::KycRequired);
        }

        // Calculate token amount
        let token_amount = calculate_token_amount(usd_amount, round_config)?;

        // Check allocation
        require!(
            presale.rounds[presale.current_round as usize].sold + token_amount <= round_config.allocation,
            PresaleError::ExceedsRoundAllocation
        );
        require!(
            presale.total_raised + usd_amount <= presale.hard_cap,
            PresaleError::ExceedsHardCap
        );

        // Transfer SOL
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &buyer.key(),
            &presale.key(),
            sol_amount,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                buyer.to_account_info(),
                presale.to_account_info(),
            ],
        )?;

        // Process purchase
        process_purchase(
            presale,
            buyer_state,
            token_amount,
            usd_amount,
            current_time,
        )?;

        emit!(TokensPurchasedEvent {
            buyer: buyer.key(),
            amount: token_amount,
            price: round_config.price,
            payment_method: PaymentMethod::Sol,
            round: presale.current_round,
            timestamp: current_time,
        });

        Ok(())
    }

    /// Buy tokens with USDC
    pub fn buy_tokens_usdc(ctx: Context<BuyTokensToken>, usdc_amount: u64) -> Result<()> {
        let presale = &mut ctx.accounts.presale;
        let buyer_state = &mut ctx.accounts.buyer_state;

        // Validate round
        require!(!presale.finalized, PresaleError::PresaleFinalized);
        let round_config = &presale.rounds[presale.current_round as usize];
        let current_time = Clock::get()?.unix_timestamp;
        require!(current_time >= round_config.start_time, PresaleError::RoundNotStarted);
        require!(current_time <= round_config.end_time, PresaleError::RoundEnded);

        // Check whitelist
        if round_config.requires_whitelist {
            require!(buyer_state.whitelisted, PresaleError::NotWhitelisted);
        }

        // Rate limiting
        require!(
            current_time >= buyer_state.last_purchase_time + 300,
            PresaleError::RateLimitExceeded
        );

        let usd_amount = usdc_amount; // USDC is 6 decimals = USD

        // Validate purchase
        require!(
            usd_amount <= 10_000 * 10u64.pow(6),
            PresaleError::ExceedsMaxTransaction
        );

        if usd_amount > 5_000 * 10u64.pow(6) {
            require!(buyer_state.kyc_verified, PresaleError::KycRequired);
        }

        // Calculate token amount
        let token_amount = calculate_token_amount(usd_amount, round_config)?;

        // Check allocation
        require!(
            presale.rounds[presale.current_round as usize].sold + token_amount <= round_config.allocation,
            PresaleError::ExceedsRoundAllocation
        );
        require!(
            presale.total_raised + usd_amount <= presale.hard_cap,
            PresaleError::ExceedsHardCap
        );

        // Transfer USDC
        let cpi_accounts = Transfer {
            from: ctx.accounts.buyer_token_account.to_account_info(),
            to: ctx.accounts.presale_token_account.to_account_info(),
            authority: ctx.accounts.buyer.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, usdc_amount)?;

        // Process purchase
        process_purchase(
            presale,
            buyer_state,
            token_amount,
            usd_amount,
            current_time,
        )?;

        emit!(TokensPurchasedEvent {
            buyer: ctx.accounts.buyer.key(),
            amount: token_amount,
            price: round_config.price,
            payment_method: PaymentMethod::Usdc,
            round: presale.current_round,
            timestamp: current_time,
        });

        Ok(())
    }

    /// Claim vested tokens
    pub fn claim_tokens(ctx: Context<ClaimTokens>) -> Result<()> {
        let presale = &ctx.accounts.presale;
        let buyer_state = &mut ctx.accounts.buyer_state;

        require!(presale.finalized, PresaleError::PresaleNotFinalized);

        let claimable = calculate_claimable(buyer_state, Clock::get()?.unix_timestamp)?;
        require!(claimable > 0, PresaleError::NoTokensAvailable);

        buyer_state.vesting_schedule.released_amount += claimable;

        // Transfer HYPE tokens
        let seeds = &[
            b"presale".as_ref(),
            &[presale.bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.presale_hype_account.to_account_info(),
            to: ctx.accounts.buyer_hype_account.to_account_info(),
            authority: presale.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, claimable)?;

        emit!(TokensClaimedEvent {
            buyer: ctx.accounts.buyer.key(),
            amount: claimable,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Refund if soft cap not reached
    pub fn refund(ctx: Context<Refund>) -> Result<()> {
        let presale = &ctx.accounts.presale;
        let buyer_state = &mut ctx.accounts.buyer_state;

        require!(presale.finalized, PresaleError::PresaleNotFinalized);
        require!(!presale.soft_cap_reached, PresaleError::SoftCapReached);

        let refund_amount = buyer_state.total_invested_usd;
        require!(refund_amount > 0, PresaleError::AlreadyRefunded);

        // Reset buyer state
        buyer_state.total_invested_usd = 0;
        buyer_state.purchase_count = 0;

        // Transfer refund (simplified - track actual payment method)
        **presale.to_account_info().try_borrow_mut_lamports()? -= refund_amount;
        **ctx.accounts.buyer.to_account_info().try_borrow_mut_lamports()? += refund_amount;

        emit!(RefundIssuedEvent {
            buyer: ctx.accounts.buyer.key(),
            amount: refund_amount,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Whitelist address
    pub fn whitelist_address(ctx: Context<UpdateBuyerState>, status: bool) -> Result<()> {
        let buyer_state = &mut ctx.accounts.buyer_state;
        buyer_state.whitelisted = status;

        emit!(WhitelistUpdatedEvent {
            user: buyer_state.owner,
            status,
        });

        Ok(())
    }

    /// Verify KYC
    pub fn verify_kyc(ctx: Context<UpdateBuyerState>, status: bool) -> Result<()> {
        let buyer_state = &mut ctx.accounts.buyer_state;
        buyer_state.kyc_verified = status;

        emit!(KycVerifiedEvent {
            user: buyer_state.owner,
            status,
        });

        Ok(())
    }

    /// Update price feed
    pub fn update_price_feed(
        ctx: Context<UpdatePresale>,
        payment_method: PaymentMethod,
        price: u64,
    ) -> Result<()> {
        let presale = &mut ctx.accounts.presale;
        presale.price_feeds[payment_method as usize] = price;

        emit!(PriceFeedUpdatedEvent {
            method: payment_method,
            price,
        });

        Ok(())
    }

    /// Finalize presale
    pub fn finalize_presale(ctx: Context<UpdatePresale>) -> Result<()> {
        let presale = &mut ctx.accounts.presale;
        require!(!presale.finalized, PresaleError::AlreadyFinalized);

        presale.finalized = true;

        emit!(PresaleFinalizedEvent {
            total_raised: presale.total_raised,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Emergency withdraw (requires time lock)
    pub fn emergency_withdraw(ctx: Context<EmergencyWithdraw>, amount: u64) -> Result<()> {
        let presale = &ctx.accounts.presale;
        let current_time = Clock::get()?.unix_timestamp;

        require!(
            current_time >= presale.withdraw_lock_time,
            PresaleError::TimeLockActive
        );

        **presale.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.authority.to_account_info().try_borrow_mut_lamports()? += amount;

        emit!(EmergencyWithdrawEvent {
            owner: ctx.accounts.authority.key(),
            amount,
            timestamp: current_time,
        });

        Ok(())
    }
}

// ==================== HELPER FUNCTIONS ====================

fn calculate_token_amount(usd_amount: u64, config: &RoundConfig) -> Result<u64> {
    let base_amount = (usd_amount as u128)
        .checked_mul(10u128.pow(9))
        .unwrap()
        .checked_div(config.price as u128)
        .unwrap() as u64;

    let bonus_amount = (base_amount as u128)
        .checked_mul(config.bonus as u128)
        .unwrap()
        .checked_div(100)
        .unwrap() as u64;

    Ok(base_amount.checked_add(bonus_amount).unwrap())
}

fn process_purchase(
    presale: &mut Presale,
    buyer_state: &mut BuyerState,
    token_amount: u64,
    usd_amount: u64,
    current_time: i64,
) -> Result<()> {
    // Update presale state
    presale.rounds[presale.current_round as usize].sold += token_amount;
    presale.total_raised += usd_amount;

    // Update buyer state
    buyer_state.total_invested_usd += usd_amount;
    buyer_state.last_purchase_time = current_time;
    buyer_state.purchase_count += 1;

    // Setup vesting
    let round_config = &presale.rounds[presale.current_round as usize];
    if buyer_state.vesting_schedule.total_amount == 0 {
        buyer_state.vesting_schedule = VestingSchedule {
            total_amount: token_amount,
            released_amount: 0,
            start_time: current_time,
            cliff: round_config.vesting_cliff,
            duration: round_config.vesting_duration,
            immediate_release: round_config.immediate_release,
        };
    } else {
        buyer_state.vesting_schedule.total_amount += token_amount;
    }

    // Check soft cap
    if !presale.soft_cap_reached && presale.total_raised >= presale.soft_cap {
        presale.soft_cap_reached = true;
        emit!(SoftCapReachedEvent {
            amount: presale.total_raised,
            timestamp: current_time,
        });
    }

    Ok(())
}

fn calculate_claimable(buyer_state: &BuyerState, current_time: i64) -> Result<u64> {
    let schedule = &buyer_state.vesting_schedule;

    if schedule.total_amount == 0 {
        return Ok(0);
    }

    let immediate_amount = (schedule.total_amount as u128)
        .checked_mul(schedule.immediate_release as u128)
        .unwrap()
        .checked_div(100)
        .unwrap() as u64;

    if schedule.duration == 0 {
        return Ok(schedule.total_amount - schedule.released_amount);
    }

    if current_time < schedule.start_time + schedule.cliff {
        if schedule.released_amount < immediate_amount {
            return Ok(immediate_amount - schedule.released_amount);
        }
        return Ok(0);
    }

    let time_elapsed = current_time - schedule.start_time;
    let vested_amount = if time_elapsed >= schedule.duration {
        schedule.total_amount
    } else {
        let vesting_amount = schedule.total_amount - immediate_amount;
        let vested_portion = (vesting_amount as i128)
            .checked_mul(time_elapsed as i128)
            .unwrap()
            .checked_div(schedule.duration as i128)
            .unwrap() as u64;
        immediate_amount + vested_portion
    };

    Ok(vested_amount - schedule.released_amount)
}

// ==================== ACCOUNTS ====================

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + size_of::<Presale>(),
        seeds = [b"presale"],
        bump
    )]
    pub presale: Account<'info, Presale>,
    pub hype_mint: Account<'info, Mint>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BuyTokens<'info> {
    #[account(mut, seeds = [b"presale"], bump = presale.bump)]
    pub presale: Account<'info, Presale>,
    #[account(
        init_if_needed,
        payer = buyer,
        space = 8 + size_of::<BuyerState>(),
        seeds = [b"buyer", buyer.key().as_ref()],
        bump
    )]
    pub buyer_state: Account<'info, BuyerState>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BuyTokensToken<'info> {
    #[account(mut, seeds = [b"presale"], bump = presale.bump)]
    pub presale: Account<'info, Presale>,
    #[account(
        init_if_needed,
        payer = buyer,
        space = 8 + size_of::<BuyerState>(),
        seeds = [b"buyer", buyer.key().as_ref()],
        bump
    )]
    pub buyer_state: Account<'info, BuyerState>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub presale_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimTokens<'info> {
    #[account(seeds = [b"presale"], bump = presale.bump)]
    pub presale: Account<'info, Presale>,
    #[account(mut, seeds = [b"buyer", buyer.key().as_ref()], bump)]
    pub buyer_state: Account<'info, BuyerState>,
    pub buyer: Signer<'info>,
    #[account(mut)]
    pub buyer_hype_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub presale_hype_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Refund<'info> {
    #[account(mut, seeds = [b"presale"], bump = presale.bump)]
    pub presale: Account<'info, Presale>,
    #[account(mut, seeds = [b"buyer", buyer.key().as_ref()], bump)]
    pub buyer_state: Account<'info, BuyerState>,
    #[account(mut)]
    pub buyer: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateBuyerState<'info> {
    pub presale: Account<'info, Presale>,
    #[account(mut, seeds = [b"buyer", buyer_state.owner.as_ref()], bump)]
    pub buyer_state: Account<'info, BuyerState>,
    #[account(constraint = authority.key() == presale.authority)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdatePresale<'info> {
    #[account(mut, seeds = [b"presale"], bump = presale.bump)]
    pub presale: Account<'info, Presale>,
    #[account(constraint = authority.key() == presale.authority)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct EmergencyWithdraw<'info> {
    #[account(mut, seeds = [b"presale"], bump = presale.bump)]
    pub presale: Account<'info, Presale>,
    #[account(mut, constraint = authority.key() == presale.authority)]
    pub authority: Signer<'info>,
}

// ==================== STATE ====================

#[account]
pub struct Presale {
    pub authority: Pubkey,
    pub hype_mint: Pubkey,
    pub soft_cap: u64,
    pub hard_cap: u64,
    pub total_raised: u64,
    pub soft_cap_reached: bool,
    pub finalized: bool,
    pub current_round: Round,
    pub rounds: [RoundConfig; 3],
    pub price_feeds: [u64; 4],
    pub multisig_owners: [Pubkey; 3],
    pub withdraw_lock_time: i64,
    pub bump: u8,
}

#[account]
pub struct BuyerState {
    pub owner: Pubkey,
    pub total_invested_usd: u64,
    pub last_purchase_time: i64,
    pub purchase_count: u16,
    pub whitelisted: bool,
    pub kyc_verified: bool,
    pub vesting_schedule: VestingSchedule,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug)]
pub struct RoundConfig {
    pub price: u64,
    pub bonus: u8,
    pub allocation: u64,
    pub sold: u64,
    pub start_time: i64,
    pub end_time: i64,
    pub vesting_cliff: i64,
    pub vesting_duration: i64,
    pub immediate_release: u8,
    pub requires_whitelist: bool,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, Default)]
pub struct VestingSchedule {
    pub total_amount: u64,
    pub released_amount: u64,
    pub start_time: i64,
    pub cliff: i64,
    pub duration: i64,
    pub immediate_release: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq)]
pub enum Round {
    Private = 0,
    Presale1 = 1,
    Presale2 = 2,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug)]
pub enum PaymentMethod {
    Eth = 0,
    Usdt = 1,
    Usdc = 2,
    Sol = 3,
}

// ==================== EVENTS ====================

#[event]
pub struct TokensPurchasedEvent {
    pub buyer: Pubkey,
    pub amount: u64,
    pub price: u64,
    pub payment_method: PaymentMethod,
    pub round: Round,
    pub timestamp: i64,
}

#[event]
pub struct TokensClaimedEvent {
    pub buyer: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct RefundIssuedEvent {
    pub buyer: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct SoftCapReachedEvent {
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct PresaleFinalizedEvent {
    pub total_raised: u64,
    pub timestamp: i64,
}

#[event]
pub struct WhitelistUpdatedEvent {
    pub user: Pubkey,
    pub status: bool,
}

#[event]
pub struct KycVerifiedEvent {
    pub user: Pubkey,
    pub status: bool,
}

#[event]
pub struct EmergencyWithdrawEvent {
    pub owner: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct PriceFeedUpdatedEvent {
    pub method: PaymentMethod,
    pub price: u64,
}

// ==================== ERRORS ====================

#[error_code]
pub enum PresaleError {
    #[msg("Presale has been finalized")]
    PresaleFinalized,
    #[msg("Presale has not been finalized")]
    PresaleNotFinalized,
    #[msg("Round has not started")]
    RoundNotStarted,
    #[msg("Round has ended")]
    RoundEnded,
    #[msg("Not whitelisted")]
    NotWhitelisted,
    #[msg("Rate limit exceeded")]
    RateLimitExceeded,
    #[msg("Price feed not set")]
    PriceFeedNotSet,
    #[msg("Exceeds maximum transaction amount")]
    ExceedsMaxTransaction,
    #[msg("KYC verification required")]
    KycRequired,
    #[msg("Exceeds round allocation")]
    ExceedsRoundAllocation,
    #[msg("Exceeds hard cap")]
    ExceedsHardCap,
    #[msg("No tokens available to claim")]
    NoTokensAvailable,
    #[msg("Soft cap has been reached")]
    SoftCapReached,
    #[msg("Already refunded")]
    AlreadyRefunded,
    #[msg("Already finalized")]
    AlreadyFinalized,
    #[msg("Time lock is active")]
    TimeLockActive,
}
