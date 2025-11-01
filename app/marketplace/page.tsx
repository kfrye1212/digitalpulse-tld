'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useState } from 'react';

interface ListedDomain {
  name: string;
  tld: string;
  price: number;
  seller: string;
  listedAt: string;
}

const TLDS = ['.pulse', '.verse', '.cp', '.pv'];

export default function Marketplace() {
  const { connected, publicKey } = useWallet();
  const [selectedTLD, setSelectedTLD] = useState<string | null>(null);
  const [priceFilter, setPriceFilter] = useState<string>('all');
  
  // Mock data - will be replaced with actual blockchain data
  const [listedDomains] = useState<ListedDomain[]>([
    {
      name: 'crypto',
      tld: '.pulse',
      price: 5.0,
      seller: 'ABC...XYZ',
      listedAt: '2025-10-25',
    },
    {
      name: 'nft',
      tld: '.verse',
      price: 3.5,
      seller: 'DEF...UVW',
      listedAt: '2025-10-28',
    },
    {
      name: 'defi',
      tld: '.cp',
      price: 2.8,
      seller: 'GHI...RST',
      listedAt: '2025-10-29',
    },
    {
      name: 'web3',
      tld: '.pv',
      price: 4.2,
      seller: 'JKL...OPQ',
      listedAt: '2025-10-30',
    },
    {
      name: 'blockchain',
      tld: '.pulse',
      price: 6.5,
      seller: 'MNO...LMN',
      listedAt: '2025-10-31',
    },
  ]);

  const filteredDomains = listedDomains.filter(domain => {
    if (selectedTLD && domain.tld !== selectedTLD) return false;
    if (priceFilter === 'low' && domain.price > 3) return false;
    if (priceFilter === 'mid' && (domain.price <= 3 || domain.price > 5)) return false;
    if (priceFilter === 'high' && domain.price <= 5) return false;
    return true;
  });

  const handleBuy = (domain: ListedDomain) => {
    if (!connected) {
      alert('Please connect your wallet first!');
      return;
    }
    
    const totalPrice = domain.price + (domain.price * 0.05); // 5% marketplace fee
    alert(`Buying ${domain.name}${domain.tld}\n\nPrice: ${domain.price} SOL\nMarketplace Fee (5%): ${(domain.price * 0.05).toFixed(2)} SOL\nTotal: ${totalPrice.toFixed(2)} SOL\n\nSmart contract integration coming soon!`);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="gradient-bg" style={{ top: '-200px', right: '-200px' }}></div>
      <div className="gradient-bg-2" style={{ bottom: '-150px', left: '-150px' }}></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 text-gradient font-orbitron">Marketplace</h1>
          <p className="text-xl text-foreground/60 font-inter">
            Buy and sell domains with 5% marketplace fee
          </p>
        </div>

        {/* Filters */}
        <div className="card-glass p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* TLD Filter */}
            <div>
              <h3 className="text-lg font-bold text-primary mb-3 font-orbitron">Filter by TLD</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedTLD(null)}
                  className={`px-4 py-2 rounded-lg font-bold font-orbitron text-sm transition-all ${
                    selectedTLD === null
                      ? 'bg-gradient-pulse text-background'
                      : 'bg-muted text-foreground/60 hover:bg-muted/80'
                  }`}
                >
                  All
                </button>
                {TLDS.map(tld => (
                  <button
                    key={tld}
                    onClick={() => setSelectedTLD(tld)}
                    className={`px-4 py-2 rounded-lg font-bold font-orbitron text-sm transition-all ${
                      selectedTLD === tld
                        ? 'bg-gradient-pulse text-background'
                        : 'bg-muted text-foreground/60 hover:bg-muted/80'
                    }`}
                  >
                    {tld}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <h3 className="text-lg font-bold text-primary mb-3 font-orbitron">Filter by Price</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setPriceFilter('all')}
                  className={`px-4 py-2 rounded-lg font-bold font-orbitron text-sm transition-all ${
                    priceFilter === 'all'
                      ? 'bg-gradient-pulse text-background'
                      : 'bg-muted text-foreground/60 hover:bg-muted/80'
                  }`}
                >
                  All Prices
                </button>
                <button
                  onClick={() => setPriceFilter('low')}
                  className={`px-4 py-2 rounded-lg font-bold font-orbitron text-sm transition-all ${
                    priceFilter === 'low'
                      ? 'bg-gradient-pulse text-background'
                      : 'bg-muted text-foreground/60 hover:bg-muted/80'
                  }`}
                >
                  &lt; 3 SOL
                </button>
                <button
                  onClick={() => setPriceFilter('mid')}
                  className={`px-4 py-2 rounded-lg font-bold font-orbitron text-sm transition-all ${
                    priceFilter === 'mid'
                      ? 'bg-gradient-pulse text-background'
                      : 'bg-muted text-foreground/60 hover:bg-muted/80'
                  }`}
                >
                  3-5 SOL
                </button>
                <button
                  onClick={() => setPriceFilter('high')}
                  className={`px-4 py-2 rounded-lg font-bold font-orbitron text-sm transition-all ${
                    priceFilter === 'high'
                      ? 'bg-gradient-pulse text-background'
                      : 'bg-muted text-foreground/60 hover:bg-muted/80'
                  }`}
                >
                  &gt; 5 SOL
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-foreground/60 font-inter">
            Showing {filteredDomains.length} of {listedDomains.length} domains
          </p>
        </div>

        {filteredDomains.length === 0 ? (
          <div className="card-glass text-center py-16">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-primary mb-4 font-orbitron">No Domains Found</h3>
            <p className="text-foreground/60 font-inter">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDomains.map((domain, index) => (
              <div key={index} className="card-glass hover:border-primary/50 transition-all">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold font-orbitron mb-2">
                    {domain.name}<span className="text-primary">{domain.tld}</span>
                  </h3>
                  <p className="text-sm text-foreground/60 font-inter">
                    Seller: {domain.seller}
                  </p>
                  <p className="text-sm text-foreground/60 font-inter">
                    Listed: {new Date(domain.listedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-3xl font-bold text-gradient font-orbitron mb-1">
                    {domain.price} SOL
                  </p>
                  <p className="text-xs text-foreground/40 font-inter">
                    + {(domain.price * 0.05).toFixed(2)} SOL marketplace fee
                  </p>
                </div>

                <button
                  onClick={() => handleBuy(domain)}
                  className="btn-primary w-full"
                >
                  Buy Now
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Marketplace Info */}
        <div className="mt-12 card-glass p-6">
          <h3 className="text-xl font-bold text-primary mb-4 font-orbitron">Marketplace Information</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm font-inter">
            <div>
              <p className="text-foreground/60 mb-1">Marketplace Fee</p>
              <p className="text-xl font-bold text-gradient font-orbitron">5%</p>
            </div>
            <div>
              <p className="text-foreground/60 mb-1">Total Listings</p>
              <p className="text-xl font-bold text-gradient font-orbitron">{listedDomains.length}</p>
            </div>
            <div>
              <p className="text-foreground/60 mb-1">Instant Transfer</p>
              <p className="text-xl font-bold text-gradient font-orbitron">Yes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

