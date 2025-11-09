use anchor_lang::prelude::*;

declare_id!("AoK7A4kRVL6UYA4ydwUkjEXujBBPjcVh5VZvM4i8uKVt");

// Initial wallet addresses (can be updated after deployment)
pub const INITIAL_AUTHORITY_WALLET: &str = "GJUdwrWeFVBZkwVSwjzfnhJMPyGo3hUeQ7ZxmonaWMdH";
pub const INITIAL_TREASURY_WALLET: &str = "6pXoej1tiPgvPDiFHxbuBh8EJpsCNgqrK6JQ7reSoobU";

// Fee structure
pub const REGISTRATION_FEE: u64 = 250_000_000; // 0.25 SOL
pub const RENEWAL_FEE: u64 = 150_000_000; // 0.15 SOL
pub const ROYALTY_PERCENTAGE: u8 = 5; // 5%

// Domain duration constants
pub const DOMAIN_DURATION_SECONDS: i64 = 365 * 24 * 60 * 60; // 1 year

#[program]
pub mod digitalpulse_tld {
    use super::*;

    pub fn initialize_service(ctx: Context<InitializeService>) -> Result<()> {
        let service = &mut ctx.accounts.service;
        service.authority = INITIAL_AUTHORITY_WALLET
            .parse()
            .map_err(|_| ErrorCode::InvalidWalletAddress)?;
        service.treasury = INITIAL_TREASURY_WALLET
            .parse()
            .map_err(|_| ErrorCode::InvalidWalletAddress)?;
        service.total_domains = 0;
        service.total_tlds = 0;
        
        msg!("DigitalPulse TLD Service initialized");
        msg!("Authority: {}", service.authority);
        msg!("Treasury: {}", service.treasury);
        
        Ok(())
    }

    pub fn create_tld(ctx: Context<CreateTLD>, name: String, price: u64) -> Result<()> {
        require!(name.len() <= 10, ErrorCode::TLDNameTooLong);
        require!(price > 0, ErrorCode::InvalidPrice);
        
        let tld = &mut ctx.accounts.tld;
        tld.name = name.clone();
        tld.price = price;
        tld.owner = ctx.accounts.authority.key();
        tld.created_at = Clock::get()?.unix_timestamp;
        tld.is_active = true;
        tld.total_domains = 0;
        
        let service = &mut ctx.accounts.service;
        service.total_tlds += 1;
        
        msg!("TLD created: .{} with price: {} lamports", name, price);
        Ok(())
    }

    pub fn register_domain(
        ctx: Context<RegisterDomain>,
        domain_name: String,
        tld_name: String,
    ) -> Result<()> {
        require!(domain_name.len() <= 63, ErrorCode::DomainNameTooLong);
        require!(domain_name.len() >= 1, ErrorCode::DomainNameTooShort);
        
        let domain = &mut ctx.accounts.domain;
        let tld = &mut ctx.accounts.tld;
        let service = &mut ctx.accounts.service;
        let clock = Clock::get()?;
        
        // Validate TLD is active
        require!(tld.is_active, ErrorCode::TLDNotActive);
        
        // Check if owner is authority
        let is_authority = ctx.accounts.owner.key() == service.authority;
        
        if !is_authority {
            // Regular users pay registration fee
            require!(
                ctx.accounts.owner.lamports() >= REGISTRATION_FEE,
                ErrorCode::InsufficientFunds
            );
            
            // Transfer registration fee to treasury
            let transfer_instruction = anchor_lang::system_program::Transfer {
                from: ctx.accounts.owner.to_account_info(),
                to: ctx.accounts.treasury.to_account_info(),
            };
            
            anchor_lang::system_program::transfer(
                CpiContext::new(
                    ctx.accounts.system_program.to_account_info(),
                    transfer_instruction,
                ),
                REGISTRATION_FEE,
            )?;
            
            msg!("Registration fee paid: {} SOL", REGISTRATION_FEE as f64 / 1_000_000_000.0);
        } else {
            msg!("Authority wallet - FREE registration");
        }
        
        // Set domain data
        domain.name = domain_name.clone();
        domain.tld = tld_name.clone();
        domain.owner = ctx.accounts.owner.key();
        domain.registered_at = clock.unix_timestamp;
        domain.expires_at = clock.unix_timestamp + DOMAIN_DURATION_SECONDS;
        domain.is_active = true;
        
        tld.total_domains += 1;
        service.total_domains += 1;
        
        msg!("Domain registered: {}.{}", domain_name, tld_name);
        Ok(())
    }

    pub fn renew_domain(ctx: Context<RenewDomain>) -> Result<()> {
        let domain = &mut ctx.accounts.domain;
        let service = &ctx.accounts.service;
        let clock = Clock::get()?;
        
        require!(domain.is_active, ErrorCode::DomainNotActive);
        
        // Verify domain ownership
        require!(
            domain.owner == ctx.accounts.owner.key(),
            ErrorCode::NotDomainOwner
        );
        
        // Check if owner is authority
        let is_authority = ctx.accounts.owner.key() == service.authority;
        
        if !is_authority {
            // Regular users pay renewal fee
            require!(
                ctx.accounts.owner.lamports() >= RENEWAL_FEE,
                ErrorCode::InsufficientFunds
            );
            
            // Transfer renewal fee to treasury
            let transfer_instruction = anchor_lang::system_program::Transfer {
                from: ctx.accounts.owner.to_account_info(),
                to: ctx.accounts.treasury.to_account_info(),
            };
            
            anchor_lang::system_program::transfer(
                CpiContext::new(
                    ctx.accounts.system_program.to_account_info(),
                    transfer_instruction,
                ),
                RENEWAL_FEE,
            )?;
            
            msg!("Renewal fee paid: {} SOL", RENEWAL_FEE as f64 / 1_000_000_000.0);
        } else {
            msg!("Authority wallet - FREE renewal");
        }
        
        // Extend domain expiration by 1 year
        domain.expires_at = clock.unix_timestamp + DOMAIN_DURATION_SECONDS;
        
        msg!("Domain renewed: {}.{}", domain.name, domain.tld);
        Ok(())
    }

    pub fn transfer_domain(
        ctx: Context<TransferDomain>,
        sale_price: u64,
    ) -> Result<()> {
        let domain = &mut ctx.accounts.domain;
        
        require!(domain.is_active, ErrorCode::DomainNotActive);
        require!(domain.owner == ctx.accounts.current_owner.key(), ErrorCode::Unauthorized);
        
        // Calculate royalty
        let royalty = sale_price * ROYALTY_PERCENTAGE as u64 / 100;
        let seller_amount = sale_price - royalty;
        
        msg!("Transferring domain: {}.{}", domain.name, domain.tld);
        msg!("Sale price: {} SOL", sale_price as f64 / 1_000_000_000.0);
        msg!("Royalty (5%): {} SOL", royalty as f64 / 1_000_000_000.0);
        msg!("Seller receives: {} SOL", seller_amount as f64 / 1_000_000_000.0);
        
        // Transfer sale amount to seller
        let transfer_seller = anchor_lang::system_program::Transfer {
            from: ctx.accounts.new_owner.to_account_info(),
            to: ctx.accounts.current_owner.to_account_info(),
        };
        
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                transfer_seller,
            ),
            seller_amount,
        )?;
        
        // Transfer royalty to treasury
        let transfer_royalty = anchor_lang::system_program::Transfer {
            from: ctx.accounts.new_owner.to_account_info(),
            to: ctx.accounts.treasury.to_account_info(),
        };
        
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                transfer_royalty,
            ),
            royalty,
        )?;
        
        domain.owner = ctx.accounts.new_owner.key();
        
        msg!("Domain transferred to: {}", ctx.accounts.new_owner.key());
        Ok(())
    }

    pub fn update_authority(ctx: Context<UpdateAuthority>, new_authority: Pubkey) -> Result<()> {
        let service = &mut ctx.accounts.service;
        
        // Verify current authority
        require!(
            ctx.accounts.authority.key() == service.authority,
            ErrorCode::Unauthorized
        );
        
        let old_authority = service.authority;
        service.authority = new_authority;
        
        msg!("Authority wallet updated");
        msg!("Old authority: {}", old_authority);
        msg!("New authority: {}", new_authority);
        
        emit!(AuthorityUpdated {
            old_authority,
            new_authority,
        });
        
        Ok(())
    }

    pub fn update_treasury(ctx: Context<UpdateTreasury>, new_treasury: Pubkey) -> Result<()> {
        let service = &mut ctx.accounts.service;
        
        // Verify current authority
        require!(
            ctx.accounts.authority.key() == service.authority,
            ErrorCode::Unauthorized
        );
        
        let old_treasury = service.treasury;
        service.treasury = new_treasury;
        
        msg!("Treasury wallet updated");
        msg!("Old treasury: {}", old_treasury);
        msg!("New treasury: {}", new_treasury);
        
        emit!(TreasuryUpdated {
            old_treasury,
            new_treasury,
        });
        
        Ok(())
    }
}

// Account structures
#[account]
pub struct Service {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub total_domains: u64,
    pub total_tlds: u64,
}

#[account]
pub struct TLD {
    pub name: String,
    pub price: u64,
    pub owner: Pubkey,
    pub created_at: i64,
    pub is_active: bool,
    pub total_domains: u64,
}

#[account]
pub struct Domain {
    pub name: String,
    pub tld: String,
    pub owner: Pubkey,
    pub registered_at: i64,
    pub expires_at: i64,
    pub is_active: bool,
}

// Context structures
#[derive(Accounts)]
pub struct InitializeService<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 8 + 8,
        seeds = [b"service"],
        bump
    )]
    pub service: Account<'info, Service>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateTLD<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 4 + name.len() + 8 + 32 + 8 + 1 + 8,
        seeds = [b"tld", name.as_bytes()],
        bump
    )]
    pub tld: Account<'info, TLD>,
    #[account(mut)]
    pub service: Account<'info, Service>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(domain_name: String, tld_name: String)]
pub struct RegisterDomain<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + 4 + domain_name.len() + 4 + tld_name.len() + 32 + 8 + 8 + 1,
        seeds = [b"domain", domain_name.as_bytes(), tld_name.as_bytes()],
        bump
    )]
    pub domain: Account<'info, Domain>,
    #[account(
        mut,
        seeds = [b"tld", tld_name.as_bytes()],
        bump
    )]
    pub tld: Account<'info, TLD>,
    #[account(mut)]
    pub service: Account<'info, Service>,
    #[account(mut)]
    pub owner: Signer<'info>,
    /// CHECK: Treasury account for receiving fees
    #[account(mut)]
    pub treasury: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RenewDomain<'info> {
    #[account(mut)]
    pub domain: Account<'info, Domain>,
    #[account(mut)]
    pub service: Account<'info, Service>,
    #[account(mut)]
    pub owner: Signer<'info>,
    /// CHECK: Treasury account for receiving fees
    #[account(mut)]
    pub treasury: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct TransferDomain<'info> {
    #[account(mut)]
    pub domain: Account<'info, Domain>,
    #[account(mut)]
    pub service: Account<'info, Service>,
    #[account(mut)]
    pub current_owner: Signer<'info>,
    /// CHECK: New owner account
    #[account(mut)]
    pub new_owner: AccountInfo<'info>,
    /// CHECK: Treasury account for receiving royalties
    #[account(mut)]
    pub treasury: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateAuthority<'info> {
    #[account(mut)]
    pub service: Account<'info, Service>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateTreasury<'info> {
    #[account(mut)]
    pub service: Account<'info, Service>,
    pub authority: Signer<'info>,
}

// Events
#[event]
pub struct AuthorityUpdated {
    pub old_authority: Pubkey,
    pub new_authority: Pubkey,
}

#[event]
pub struct TreasuryUpdated {
    pub old_treasury: Pubkey,
    pub new_treasury: Pubkey,
}

// Error codes
#[error_code]
pub enum ErrorCode {
    #[msg("TLD name is too long")]
    TLDNameTooLong,
    #[msg("Domain name is too long")]
    DomainNameTooLong,
    #[msg("Domain name is too short")]
    DomainNameTooShort,
    #[msg("Invalid price")]
    InvalidPrice,
    #[msg("TLD is not active")]
    TLDNotActive,
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Domain is not active")]
    DomainNotActive,
    #[msg("Not the domain owner")]
    NotDomainOwner,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Invalid wallet address")]
    InvalidWalletAddress,
}
