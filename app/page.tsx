'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

const TLDS = ['.pulse', '.verse', '.cp', '.pv'];

interface DomainResult {
  name: string;
  tld: string;
  available: boolean;
  price: number;
}

export default function Home() {
  const { connected, publicKey } = useWallet();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTLD, setSelectedTLD] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<DomainResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate results for all TLDs or selected TLD
    const tldsToSearch = selectedTLD ? [selectedTLD] : TLDS;
    const results: DomainResult[] = tldsToSearch.map(tld => ({
      name: searchQuery.toLowerCase(),
      tld,
      available: Math.random() > 0.3, // Random availability for demo
      price: 0.25,
    }));
    
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleRegister = async (domain: DomainResult) => {
    if (!connected) {
      alert('Please connect your wallet first!');
      return;
    }
    
    // TODO: Implement actual domain registration with smart contract
    alert(`Registering ${domain.name}${domain.tld} for ${domain.price} SOL\n\nSmart contract integration coming soon!`);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Gradient backgrounds */}
      <div className="gradient-bg" style={{ top: '-200px', right: '-200px' }}></div>
      <div className="gradient-bg-2" style={{ bottom: '-150px', left: '-150px' }}></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 glow-cyan font-orbitron">
            <span className="text-primary">DIGITAL PULSE</span>
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gradient font-orbitron">
            TLD Domain Registration
          </h2>
          <p className="text-xl text-foreground/80 max-w-2xl mx-auto mb-8 font-inter">
            Register your Web3 identity on Solana blockchain. Own .pulse, .verse, .cp, or .pv domains as NFTs.
          </p>
          
          {/* Key metrics */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="card-glass px-6 py-3">
              <span className="text-2xl font-bold text-secondary font-orbitron">4</span>
              <span className="text-foreground/60 ml-2 font-inter">TLD Options</span>
            </div>
            <div className="card-glass px-6 py-3">
              <span className="text-2xl font-bold text-primary font-orbitron">0.25</span>
              <span className="text-foreground/60 ml-2 font-inter">SOL Price</span>
            </div>
            <div className="card-glass px-6 py-3">
              <span className="text-2xl font-bold text-accent font-orbitron">Instant</span>
              <span className="text-foreground/60 ml-2 font-inter">Registration</span>
            </div>
          </div>
        </div>

        {/* Search Interface */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="card-glass p-8">
            <h3 className="text-2xl font-bold text-primary mb-6 font-orbitron">Search Domain</h3>
            
            {/* TLD Selector */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={() => setSelectedTLD(null)}
                className={`px-6 py-3 rounded-lg font-bold font-orbitron transition-all ${
                  selectedTLD === null
                    ? 'bg-gradient-pulse text-background shadow-glow-cyan'
                    : 'bg-muted text-foreground/60 hover:bg-muted/80'
                }`}
              >
                All TLDs
              </button>
              {TLDS.map(tld => (
                <button
                  key={tld}
                  onClick={() => setSelectedTLD(tld)}
                  className={`px-6 py-3 rounded-lg font-bold font-orbitron transition-all ${
                    selectedTLD === tld
                      ? 'bg-gradient-pulse text-background shadow-glow-cyan'
                      : 'bg-muted text-foreground/60 hover:bg-muted/80'
                  }`}
                >
                  {tld}
                </button>
              ))}
            </div>
            
            {/* Search Input */}
            <div className="flex gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter domain name..."
                className="input-cyber flex-1"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="btn-primary px-8 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-primary mb-6 font-orbitron">Search Results</h3>
            <div className="grid gap-4">
              {searchResults.map((result, index) => (
                <div key={index} className="card-glass flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${result.available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div>
                      <p className="text-xl font-bold font-orbitron">
                        {result.name}<span className="text-primary">{result.tld}</span>
                      </p>
                      <p className="text-sm text-foreground/60 font-inter">
                        {result.available ? 'Available' : 'Already registered'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gradient font-orbitron">{result.price} SOL</p>
                      <p className="text-sm text-foreground/60 font-inter">Registration fee</p>
                    </div>
                    {result.available ? (
                      <button
                        onClick={() => handleRegister(result)}
                        className="btn-primary"
                      >
                        Register
                      </button>
                    ) : (
                      <button
                        disabled
                        className="btn-secondary opacity-50 cursor-not-allowed"
                      >
                        Unavailable
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-20 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card-glass text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h4 className="text-lg font-bold text-primary mb-2 font-orbitron">Search Domains</h4>
            <p className="text-sm text-foreground/60 font-inter">Find your perfect Web3 identity</p>
          </div>
          <div className="card-glass text-center">
            <div className="text-4xl mb-4">💎</div>
            <h4 className="text-lg font-bold text-primary mb-2 font-orbitron">NFT Ownership</h4>
            <p className="text-sm text-foreground/60 font-inter">Domains as tradeable NFTs</p>
          </div>
          <div className="card-glass text-center">
            <div className="text-4xl mb-4">🛒</div>
            <h4 className="text-lg font-bold text-primary mb-2 font-orbitron">Marketplace</h4>
            <p className="text-sm text-foreground/60 font-inter">Buy and sell domains</p>
          </div>
          <div className="card-glass text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h4 className="text-lg font-bold text-primary mb-2 font-orbitron">Instant</h4>
            <p className="text-sm text-foreground/60 font-inter">Register in seconds</p>
          </div>
        </div>
      </div>
    </div>
  );
}

