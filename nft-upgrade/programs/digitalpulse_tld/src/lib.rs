use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount, mint_to, MintTo},
    metadata::{
        create_metadata_accounts_v3,
        CreateMetadataAccountsV3,
        Metadata as MetadataProgram,
        mpl_token_metadata::types::{DataV2, Creator, CollectionDetails},
    },
};

declare_id!("2skfTcCdVRkrVdhrvQ9JTWyccgt9jmuPP2S7iT8RSEcJ");

// Initial wallet addresses (can be updated after deployment)
pub const INITIAL_AUTHORITY_WALLET: &str = "GJUdwrWeFVBZkwVSwjzfnhJMPyGo3hUeQ7ZxmonaWMdH";
pub const INITIAL_TREASURY_WALLET: &str = "ETGuhexB39NqELD9RFkqtCELPsAB7KsNLFUbQxcLLzpe";

// Fee structure
pub const REGISTRATION_FEE: u64 = 250_000_000; // 0.25 SOL
pub const RENEWAL_FEE: u64 = 150_000_000; // 0.15 SOL
pub const ROYALTY_PERCENTAGE: u16 = 500; // 5% in basis points (500/10000)

#[program]
pub mod digitalpulse_tld {
    use super::*;

    pub fn initialize_service(ctx: Context<InitializeService>) -> Result<()> {
        let service = &mut ctx.accounts.service;
        service.authority = INITIAL_AUTHORITY_WALLET.parse().unwrap();
        service.treasury = INITIAL_TREASURY_WALLET.parse().unwrap();
        service.total_domains = 0;
        service.total_tlds = 0;
        
        msg!("DigitalPulse TLD Service initialized with NFT support");
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

    pub fn register_domain_nft(
        ctx: Context<RegisterDomainNFT>,
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
        let is_authority = ctx.accounts.owner.key().to_string() == service.authority.to_string();
        
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
        domain.expires_at = clock.unix_timestamp + (365 * 24 * 60 * 60); // 1 year
        domain.is_active = true;
        domain.mint = ctx.accounts.mint.key();
        
        // Mint NFT (1 token)
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        mint_to(cpi_ctx, 1)?;
        
        // Create NFT metadata
        let full_domain = format!("{}.{}", domain_name, tld_name);
        let metadata_uri = format!("https://digitalpulse.pv/metadata/{}.json", full_domain);
        
        let creators = vec![
            Creator {
                address: service.treasury,
                verified: false,
                share: 100,
            },
        ];
        
        let data_v2 = DataV2 {
            name: full_domain.clone(),
            symbol: String::from("DPULSE"),
            uri: metadata_uri,
            seller_fee_basis_points: ROYALTY_PERCENTAGE,
            creators: Some(creators),
            collection: None,
            uses: None,
        };
        
        let cpi_accounts = CreateMetadataAccountsV3 {
            metadata: ctx.accounts.metadata.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            mint_authority: ctx.accounts.owner.to_account_info(),
            update_authority: ctx.accounts.owner.to_account_info(),
            payer: ctx.accounts.owner.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            rent: ctx.accounts.rent.to_account_info(),
        };
        
        let cpi_program = ctx.accounts.metadata_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        create_metadata_accounts_v3(
            cpi_ctx,
            data_v2,
            true,  // is_mutable
            true,  // update_authority_is_signer
            None,  // collection_details
        )?;
        
        tld.total_domains += 1;
        service.total_domains += 1;
        
        msg!("Domain registered as NFT: {}.{}", domain_name, tld_name);
        msg!("NFT Mint: {}", ctx.accounts.mint.key());
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
        let is_authority = ctx.accounts.owner.key().to_string() == service.authority.to_string();
        
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
        domain.expires_at = clock.unix_timestamp + (365 * 24 * 60 * 60);
        
        msg!("Domain renewed: {}.{}", domain.name, domain.tld);
        Ok(())
    }

    pub fn transfer_domain_nft(
        ctx: Context<TransferDomainNFT>,
        sale_price: u64,
    ) -> Result<()> {
        let domain = &mut ctx.accounts.domain;
        
        require!(domain.is_active, ErrorCode::DomainNotActive);
        require!(domain.owner == ctx.accounts.current_owner.key(), ErrorCode::Unauthorized);
        
        // Calculate royalty (5%)
        let royalty = sale_price * ROYALTY_PERCENTAGE as u64 / 10000;
        let seller_amount = sale_price - royalty;
        
        msg!("Transferring domain NFT: {}.{}", domain.name, domain.tld);
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
        
        // Transfer NFT token
        let cpi_accounts = anchor_spl::token::Transfer {
            from: ctx.accounts.current_owner_token_account.to_account_info(),
            to: ctx.accounts.new_owner_token_account.to_account_info(),
            authority: ctx.accounts.current_owner.to_account_info(),
        };
        
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        anchor_spl::token::transfer(cpi_ctx, 1)?;
        
        domain.owner = ctx.accounts.new_owner.key();
        
        msg!("Domain NFT transferred to: {}", ctx.accounts.new_owner.key());
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
    pub mint: Pubkey,  // NFT mint address
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
pub struct RegisterDomainNFT<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + 4 + domain_name.len() + 4 + tld_name.len() + 32 + 8 + 8 + 1 + 32,
        seeds = [b"domain", domain_name.as_bytes(), tld_name.as_bytes()],
        bump
    )]
    pub domain: Account<'info, Domain>,
    #[account(mut)]
    pub tld: Account<'info, TLD>,
    #[account(mut)]
    pub service: Account<'info, Service>,
    #[account(mut)]
    pub owner: Signer<'info>,
    /// CHECK: Treasury wallet for fee collection
    #[account(mut)]
    pub treasury: AccountInfo<'info>,
    
    // NFT-related accounts
    #[account(
        init,
        payer = owner,
        mint::decimals = 0,
        mint::authority = owner,
        mint::freeze_authority = owner,
    )]
    pub mint: Account<'info, Mint>,
    #[account(
        init,
        payer = owner,
        associated_token::mint = mint,
        associated_token::authority = owner,
    )]
    pub token_account: Account<'info, TokenAccount>,
    /// CHECK: Metadata account
    #[account(mut)]
    pub metadata: AccountInfo<'info>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub metadata_program: Program<'info, MetadataProgram>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct RenewDomain<'info> {
    #[account(mut)]
    pub domain: Account<'info, Domain>,
    pub service: Account<'info, Service>,
    #[account(mut)]
    pub owner: Signer<'info>,
    /// CHECK: Treasury wallet for fee collection
    #[account(mut)]
    pub treasury: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct TransferDomainNFT<'info> {
    #[account(mut)]
    pub domain: Account<'info, Domain>,
    pub service: Account<'info, Service>,
    #[account(mut)]
    pub current_owner: Signer<'info>,
    /// CHECK: New owner wallet
    #[account(mut)]
    pub new_owner: AccountInfo<'info>,
    /// CHECK: Treasury wallet for royalty collection
    #[account(mut)]
    pub treasury: AccountInfo<'info>,
    
    // NFT token accounts
    #[account(mut)]
    pub current_owner_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub new_owner_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
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
}
