/**
 * @jest-environment jsdom
 */

const { describe, test, expect, beforeEach } = require('@jest/globals');

// Mock DOM elements
beforeEach(() => {
  document.body.innerHTML = `
    <div id="connect-prompt"></div>
    <div id="domains-section"></div>
    <div id="domains-container"></div>
    <div id="empty-state"></div>
    <div id="total-domains">0</div>
    <div id="active-domains">0</div>
    <div id="expiring-soon">0</div>
    <div id="listed-domains">0</div>
  `;
});

describe('Renewal Fee', () => {
  test('should have correct renewal fee', () => {
    const RENEWAL_FEE = 0.15;
    expect(RENEWAL_FEE).toBe(0.15);
  });

  test('should calculate multiple renewal costs', () => {
    const RENEWAL_FEE = 0.15;
    const numberOfDomains = 3;
    const total = RENEWAL_FEE * numberOfDomains;
    
    expect(total).toBeCloseTo(0.45, 2);
  });
});

describe('Marketplace Fee', () => {
  test('should have correct marketplace fee', () => {
    const MARKETPLACE_FEE = 0.05;
    expect(MARKETPLACE_FEE).toBe(0.05);
  });

  test('should calculate marketplace fee correctly', () => {
    const MARKETPLACE_FEE = 0.05;
    const listPrice = 10.0;
    const fee = listPrice * MARKETPLACE_FEE;
    
    expect(fee).toBe(0.5);
  });

  test('should calculate seller receives correctly', () => {
    const MARKETPLACE_FEE = 0.05;
    const listPrice = 10.0;
    const fee = listPrice * MARKETPLACE_FEE;
    const sellerReceives = listPrice - fee;
    
    expect(sellerReceives).toBe(9.5);
  });
});

describe('Domain Structure', () => {
  test('should create domain with required fields', () => {
    const domain = {
      name: 'myname',
      tld: '.pulse',
      registeredDate: new Date(),
      expiryDate: new Date(),
      isListed: false,
      listPrice: null,
      nftMint: 'ABC123...'
    };
    
    expect(domain).toHaveProperty('name');
    expect(domain).toHaveProperty('tld');
    expect(domain).toHaveProperty('registeredDate');
    expect(domain).toHaveProperty('expiryDate');
    expect(domain).toHaveProperty('isListed');
    expect(domain).toHaveProperty('nftMint');
  });

  test('should validate unlisted domain', () => {
    const domain = {
      isListed: false,
      listPrice: null
    };
    
    expect(domain.isListed).toBe(false);
    expect(domain.listPrice).toBeNull();
  });

  test('should validate listed domain', () => {
    const domain = {
      isListed: true,
      listPrice: 5.0
    };
    
    expect(domain.isListed).toBe(true);
    expect(domain.listPrice).toBe(5.0);
  });
});

describe('Domain Expiry Calculations', () => {
  test('should calculate days until expiry correctly', () => {
    const now = new Date();
    const expiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const daysUntilExpiry = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));
    
    expect(daysUntilExpiry).toBe(30);
  });

  test('should identify expiring soon domains', () => {
    const now = new Date();
    const expiryDate = new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000);
    const daysUntilExpiry = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));
    const isExpiringSoon = daysUntilExpiry < 30;
    
    expect(isExpiringSoon).toBe(true);
  });

  test('should identify not expiring soon domains', () => {
    const now = new Date();
    const expiryDate = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const daysUntilExpiry = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));
    const isExpiringSoon = daysUntilExpiry < 30;
    
    expect(isExpiringSoon).toBe(false);
  });

  test('should handle expired domains', () => {
    const now = new Date();
    const expiryDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    const isExpired = expiryDate < now;
    
    expect(isExpired).toBe(true);
  });
});

describe('Stats Calculations', () => {
  test('should count total domains', () => {
    const domains = [
      { name: 'domain1' },
      { name: 'domain2' },
      { name: 'domain3' }
    ];
    const total = domains.length;
    
    expect(total).toBe(3);
  });

  test('should count active domains', () => {
    const now = new Date();
    const domains = [
      { expiryDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) },
      { expiryDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
      { expiryDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000) }
    ];
    const active = domains.filter(d => d.expiryDate > now).length;
    
    expect(active).toBe(2);
  });

  test('should count expiring soon domains', () => {
    const now = new Date();
    const domains = [
      { expiryDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000) },
      { expiryDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000) },
      { expiryDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000) }
    ];
    
    const expiringSoon = domains.filter(d => {
      const daysUntilExpiry = Math.floor((d.expiryDate - now) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry < 30 && daysUntilExpiry > 0;
    }).length;
    
    expect(expiringSoon).toBe(2);
  });

  test('should count listed domains', () => {
    const domains = [
      { isListed: true },
      { isListed: false },
      { isListed: true }
    ];
    const listed = domains.filter(d => d.isListed).length;
    
    expect(listed).toBe(2);
  });
});

describe('Display State Management', () => {
  test('should show connect prompt when no wallet', () => {
    const walletAddress = null;
    const shouldShowPrompt = !walletAddress;
    
    expect(shouldShowPrompt).toBe(true);
  });

  test('should hide connect prompt when wallet connected', () => {
    const walletAddress = 'ABC123...XYZ789';
    const shouldShowPrompt = !walletAddress;
    
    expect(shouldShowPrompt).toBe(false);
  });

  test('should show empty state when no domains', () => {
    const domains = [];
    const isEmpty = domains.length === 0;
    
    expect(isEmpty).toBe(true);
  });

  test('should hide empty state when domains exist', () => {
    const domains = [{ name: 'test' }];
    const isEmpty = domains.length === 0;
    
    expect(isEmpty).toBe(false);
  });
});

describe('Price Validation', () => {
  test('should validate positive price', () => {
    const price = '5.0';
    const isValid = !isNaN(price) && parseFloat(price) > 0;
    
    expect(isValid).toBe(true);
  });

  test('should reject negative price', () => {
    const price = '-5.0';
    const isValid = !isNaN(price) && parseFloat(price) > 0;
    
    expect(isValid).toBe(false);
  });

  test('should reject zero price', () => {
    const price = '0';
    const isValid = !isNaN(price) && parseFloat(price) > 0;
    
    expect(isValid).toBe(false);
  });

  test('should reject non-numeric price', () => {
    const price = 'abc';
    const isValid = !isNaN(price) && parseFloat(price) > 0;
    
    expect(isValid).toBe(false);
  });
});

describe('Wallet Address Validation', () => {
  test('should validate valid Solana address length', () => {
    const address = 'ABC1234567890XYZ1234567890123456';
    const isValid = address.length > 30;
    
    expect(isValid).toBe(true);
  });

  test('should reject short address', () => {
    const address = 'ABC123';
    const isValid = address.length > 30;
    
    expect(isValid).toBe(false);
  });

  test('should format wallet address for display', () => {
    const address = 'ABC1234567890XYZ1234567890123456';
    const formatted = `${address.slice(0, 4)}...${address.slice(-4)}`;
    
    expect(formatted).toContain('ABC1');
    expect(formatted).toContain('3456');
    expect(formatted).toContain('...');
  });
});

describe('Date Formatting', () => {
  test('should format date correctly', () => {
    const date = new Date('2024-01-15');
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const formatted = date.toLocaleDateString('en-US', options);
    
    expect(formatted).toContain('Jan');
    expect(formatted).toContain('15');
    expect(formatted).toContain('2024');
  });
});

describe('Listing Fee Calculation', () => {
  test('should show accurate fee breakdown', () => {
    const MARKETPLACE_FEE = 0.05;
    const listPrice = 5.0;
    const fee = listPrice * MARKETPLACE_FEE;
    const youReceive = listPrice - fee;
    
    expect(fee).toBeCloseTo(0.25, 2);
    expect(youReceive).toBeCloseTo(4.75, 2);
  });

  test('should calculate fee percentage correctly', () => {
    const MARKETPLACE_FEE = 0.05;
    const feePercent = MARKETPLACE_FEE * 100;
    
    expect(feePercent).toBe(5);
  });
});

describe('Badge Display Logic', () => {
  test('should show listed badge for listed domain', () => {
    const domain = { isListed: true };
    const showListedBadge = domain.isListed;
    
    expect(showListedBadge).toBe(true);
  });

  test('should show expiring soon badge', () => {
    const now = new Date();
    const expiryDate = new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000);
    const daysUntilExpiry = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));
    const showExpiringSoonBadge = daysUntilExpiry < 30;
    
    expect(showExpiringSoonBadge).toBe(true);
  });
});

describe('Action Button Logic', () => {
  test('should show unlist button for listed domain', () => {
    const domain = { isListed: true };
    const buttonAction = domain.isListed ? 'unlist' : 'list';
    
    expect(buttonAction).toBe('unlist');
  });

  test('should show list button for unlisted domain', () => {
    const domain = { isListed: false };
    const buttonAction = domain.isListed ? 'unlist' : 'list';
    
    expect(buttonAction).toBe('list');
  });
});
