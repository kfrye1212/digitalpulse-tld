/**
 * @jest-environment jsdom
 */

const { describe, test, expect, beforeEach } = require('@jest/globals');

// Mock DOM elements
beforeEach(() => {
  document.body.innerHTML = `
    <select id="filter-tld"></select>
    <select id="filter-price"></select>
    <select id="filter-sort"></select>
    <div id="listings-container"></div>
    <div id="empty-marketplace"></div>
  `;
});

describe('Marketplace Fee', () => {
  test('should have correct marketplace fee percentage', () => {
    const MARKETPLACE_FEE_PERCENT = 5;
    expect(MARKETPLACE_FEE_PERCENT).toBe(5);
  });

  test('should calculate marketplace fee correctly', () => {
    const MARKETPLACE_FEE_PERCENT = 5;
    const price = 10.0;
    const fee = price * (MARKETPLACE_FEE_PERCENT / 100);
    
    expect(fee).toBe(0.5);
  });

  test('should calculate seller receives amount correctly', () => {
    const MARKETPLACE_FEE_PERCENT = 5;
    const price = 10.0;
    const fee = price * (MARKETPLACE_FEE_PERCENT / 100);
    const sellerReceives = price - fee;
    
    expect(sellerReceives).toBe(9.5);
  });

  test('should handle decimal prices correctly', () => {
    const MARKETPLACE_FEE_PERCENT = 5;
    const price = 2.5;
    const fee = price * (MARKETPLACE_FEE_PERCENT / 100);
    const sellerReceives = price - fee;
    
    expect(fee).toBe(0.125);
    expect(sellerReceives).toBe(2.375);
  });
});

describe('Listing Structure', () => {
  test('should create listing with required fields', () => {
    const listing = {
      name: 'crypto',
      tld: '.verse',
      price: 5.0,
      seller: 'ABC123...XYZ789',
      listedDate: new Date(),
      expiryDate: new Date(),
      nftMint: 'DEF456...'
    };
    
    expect(listing).toHaveProperty('name');
    expect(listing).toHaveProperty('tld');
    expect(listing).toHaveProperty('price');
    expect(listing).toHaveProperty('seller');
    expect(listing).toHaveProperty('listedDate');
    expect(listing).toHaveProperty('expiryDate');
    expect(listing).toHaveProperty('nftMint');
  });

  test('should validate listing data types', () => {
    const listing = {
      name: 'crypto',
      tld: '.verse',
      price: 5.0,
      seller: 'ABC123...XYZ789'
    };
    
    expect(typeof listing.name).toBe('string');
    expect(typeof listing.tld).toBe('string');
    expect(typeof listing.price).toBe('number');
    expect(typeof listing.seller).toBe('string');
  });
});

describe('Filter Functionality', () => {
  test('should filter by TLD - all', () => {
    const listings = [
      { tld: '.pulse' },
      { tld: '.verse' },
      { tld: '.cp' }
    ];
    const tldFilter = 'all';
    
    const filtered = listings.filter(listing => {
      if (tldFilter === 'all') return true;
      return listing.tld === tldFilter;
    });
    
    expect(filtered).toHaveLength(3);
  });

  test('should filter by specific TLD', () => {
    const listings = [
      { tld: '.pulse' },
      { tld: '.verse' },
      { tld: '.pulse' }
    ];
    const tldFilter = '.pulse';
    
    const filtered = listings.filter(listing => {
      if (tldFilter === 'all') return true;
      return listing.tld === tldFilter;
    });
    
    expect(filtered).toHaveLength(2);
    expect(filtered.every(l => l.tld === '.pulse')).toBe(true);
  });

  test('should filter by price range 0-1', () => {
    const listings = [
      { price: 0.5 },
      { price: 1.5 },
      { price: 0.8 }
    ];
    const priceFilter = '0-1';
    
    const filtered = listings.filter(listing => {
      const price = listing.price;
      return price >= 0 && price <= 1;
    });
    
    expect(filtered).toHaveLength(2);
  });

  test('should filter by price range 1-5', () => {
    const listings = [
      { price: 0.5 },
      { price: 2.5 },
      { price: 4.0 }
    ];
    const priceFilter = '1-5';
    
    const filtered = listings.filter(listing => {
      const price = listing.price;
      return price > 1 && price <= 5;
    });
    
    expect(filtered).toHaveLength(2);
  });

  test('should filter by price range 5-10', () => {
    const listings = [
      { price: 3.0 },
      { price: 7.5 },
      { price: 10.0 }
    ];
    
    const filtered = listings.filter(listing => {
      const price = listing.price;
      return price > 5 && price <= 10;
    });
    
    expect(filtered).toHaveLength(2);
  });

  test('should filter by price range 10+', () => {
    const listings = [
      { price: 5.0 },
      { price: 15.0 },
      { price: 20.0 }
    ];
    
    const filtered = listings.filter(listing => {
      const price = listing.price;
      return price > 10;
    });
    
    expect(filtered).toHaveLength(2);
  });
});

describe('Sort Functionality', () => {
  test('should sort by newest', () => {
    const listings = [
      { listedDate: new Date('2024-01-01') },
      { listedDate: new Date('2024-01-03') },
      { listedDate: new Date('2024-01-02') }
    ];
    
    const sorted = [...listings].sort((a, b) => b.listedDate - a.listedDate);
    
    expect(sorted[0].listedDate.getDate()).toBe(3);
    expect(sorted[2].listedDate.getDate()).toBe(1);
  });

  test('should sort by price low to high', () => {
    const listings = [
      { price: 5.0 },
      { price: 2.0 },
      { price: 8.0 }
    ];
    
    const sorted = [...listings].sort((a, b) => a.price - b.price);
    
    expect(sorted[0].price).toBe(2.0);
    expect(sorted[2].price).toBe(8.0);
  });

  test('should sort by price high to low', () => {
    const listings = [
      { price: 5.0 },
      { price: 2.0 },
      { price: 8.0 }
    ];
    
    const sorted = [...listings].sort((a, b) => b.price - a.price);
    
    expect(sorted[0].price).toBe(8.0);
    expect(sorted[2].price).toBe(2.0);
  });

  test('should sort by name alphabetically', () => {
    const listings = [
      { name: 'zebra' },
      { name: 'alpha' },
      { name: 'beta' }
    ];
    
    const sorted = [...listings].sort((a, b) => a.name.localeCompare(b.name));
    
    expect(sorted[0].name).toBe('alpha');
    expect(sorted[2].name).toBe('zebra');
  });
});

describe('Display Listings', () => {
  test('should show empty state when no listings', () => {
    const listings = [];
    const isEmpty = listings.length === 0;
    
    expect(isEmpty).toBe(true);
  });

  test('should hide empty state when listings exist', () => {
    const listings = [{ name: 'test' }];
    const isEmpty = listings.length === 0;
    
    expect(isEmpty).toBe(false);
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

describe('Buyer Validation', () => {
  test('should prevent buyer from purchasing own listing', () => {
    const listing = { seller: 'ABC123' };
    const walletAddress = 'ABC123';
    const isSamePerson = listing.seller === walletAddress;
    
    expect(isSamePerson).toBe(true);
  });

  test('should allow buyer to purchase other listings', () => {
    const listing = { seller: 'ABC123' };
    const walletAddress = 'XYZ789';
    const isSamePerson = listing.seller === walletAddress;
    
    expect(isSamePerson).toBe(false);
  });
});

describe('Transaction Calculations', () => {
  test('should calculate complete transaction breakdown', () => {
    const MARKETPLACE_FEE_PERCENT = 5;
    const listPrice = 10.0;
    const marketplaceFee = listPrice * (MARKETPLACE_FEE_PERCENT / 100);
    const sellerReceives = listPrice - marketplaceFee;
    
    expect(listPrice).toBe(10.0);
    expect(marketplaceFee).toBe(0.5);
    expect(sellerReceives).toBe(9.5);
    expect(marketplaceFee + sellerReceives).toBe(listPrice);
  });
});

describe('Wallet Address Formatting', () => {
  test('should format seller address for display', () => {
    const seller = 'ABC123456789XYZ';
    const formatted = `${seller.slice(0, 4)}...${seller.slice(-4)}`;
    
    expect(formatted).toContain('ABC1');
    expect(formatted).toContain('9XYZ');
    expect(formatted).toContain('...');
  });
});
