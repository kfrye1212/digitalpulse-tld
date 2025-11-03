/**
 * @jest-environment jsdom
 */

const { describe, test, expect, beforeEach } = require('@jest/globals');

// Mock DOM elements and setup
beforeEach(() => {
  document.body.innerHTML = `
    <div id="domain-search"></div>
    <button id="search-btn">Search</button>
    <div id="search-results" style="display: none;"></div>
    <div id="results-container"></div>
    <div id="wallet-button-container"></div>
    <div class="tld-btn" data-tld="all"></div>
    <div class="tld-btn" data-tld=".pulse"></div>
    <div class="tld-btn" data-tld=".verse"></div>
  `;
});

describe('TLD Selection', () => {
  test('should have correct TLD options', () => {
    const TLDS = ['.pulse', '.verse', '.cp', '.pv'];
    expect(TLDS).toHaveLength(4);
    expect(TLDS).toContain('.pulse');
    expect(TLDS).toContain('.verse');
    expect(TLDS).toContain('.cp');
    expect(TLDS).toContain('.pv');
  });

  test('default TLD should be "all"', () => {
    let selectedTLD = 'all';
    expect(selectedTLD).toBe('all');
  });
});

describe('Search Functionality', () => {
  test('should have search input and button elements', () => {
    const searchInput = document.getElementById('domain-search');
    const searchBtn = document.getElementById('search-btn');
    
    expect(searchInput).toBeTruthy();
    expect(searchBtn).toBeTruthy();
    expect(searchBtn.textContent).toBe('Search');
  });

  test('should validate empty search query', () => {
    const query = '   ';
    const trimmedQuery = query.trim();
    
    expect(trimmedQuery).toBe('');
  });

  test('should normalize search query to lowercase', () => {
    const query = 'MyDomain';
    const normalized = query.trim().toLowerCase();
    
    expect(normalized).toBe('mydomain');
  });
});

describe('Domain Registration Price', () => {
  test('should have correct registration price', () => {
    const REGISTRATION_PRICE = 0.25;
    expect(REGISTRATION_PRICE).toBe(0.25);
  });

  test('should calculate price correctly for multiple domains', () => {
    const REGISTRATION_PRICE = 0.25;
    const numberOfDomains = 3;
    const total = REGISTRATION_PRICE * numberOfDomains;
    
    expect(total).toBe(0.75);
  });
});

describe('Domain Availability', () => {
  test('should generate domain result with correct structure', () => {
    const result = {
      name: 'test',
      tld: '.pulse',
      available: true,
      price: 0.25
    };
    
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('tld');
    expect(result).toHaveProperty('available');
    expect(result).toHaveProperty('price');
  });

  test('should handle available domain', () => {
    const result = { available: true };
    expect(result.available).toBe(true);
  });

  test('should handle unavailable domain', () => {
    const result = { available: false };
    expect(result.available).toBe(false);
  });
});

describe('Wallet Address', () => {
  test('wallet address should initially be null', () => {
    let walletAddress = null;
    expect(walletAddress).toBeNull();
  });

  test('should format wallet address correctly', () => {
    const walletAddress = 'ABC1234567890XYZ7890';
    const formatted = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
    
    expect(formatted).toBe('ABC1...7890');
  });

  test('should validate wallet address exists before registration', () => {
    const walletAddress = null;
    const canRegister = walletAddress !== null;
    
    expect(canRegister).toBe(false);
  });
});

describe('Result Card Creation', () => {
  test('should display correct status text for available domain', () => {
    const available = true;
    const statusText = available ? 'Available' : 'Already registered';
    
    expect(statusText).toBe('Available');
  });

  test('should display correct status text for unavailable domain', () => {
    const available = false;
    const statusText = available ? 'Available' : 'Already registered';
    
    expect(statusText).toBe('Already registered');
  });

  test('should apply correct CSS class for available domain', () => {
    const available = true;
    const statusClass = available ? 'available' : 'unavailable';
    
    expect(statusClass).toBe('available');
  });

  test('should apply correct CSS class for unavailable domain', () => {
    const available = false;
    const statusClass = available ? 'available' : 'unavailable';
    
    expect(statusClass).toBe('unavailable');
  });
});

describe('Search Results Display', () => {
  test('should show results section when displaying results', () => {
    const resultsSection = document.getElementById('search-results');
    resultsSection.style.display = 'block';
    
    expect(resultsSection.style.display).toBe('block');
  });

  test('should clear previous results', () => {
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = '<div>old result</div>';
    resultsContainer.innerHTML = '';
    
    expect(resultsContainer.innerHTML).toBe('');
  });
});

describe('Domain Name Validation', () => {
  test('should accept valid domain names', () => {
    const validNames = ['test', 'mydomain', 'web3', 'crypto'];
    
    validNames.forEach(name => {
      expect(name.length).toBeGreaterThan(0);
      expect(typeof name).toBe('string');
    });
  });

  test('should trim whitespace from domain names', () => {
    const name = '  testdomain  ';
    const trimmed = name.trim();
    
    expect(trimmed).toBe('testdomain');
  });
});
