'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useState } from 'react';

interface Domain {
  name: string;
  tld: string;
  expiresAt: string;
  listedForSale: boolean;
  salePrice?: number;
}

export default function MyDomains() {
  const { connected, publicKey } = useWallet();
  
  // Mock data - will be replaced with actual blockchain data
  const [domains] = useState<Domain[]>([
    {
      name: 'digitalpulse',
      tld: '.pulse',
      expiresAt: '2026-10-31',
      listedForSale: false,
    },
    {
      name: 'mywallet',
      tld: '.verse',
      expiresAt: '2026-08-15',
      listedForSale: true,
      salePrice: 1.5,
    },
  ]);

  const handleRenew = (domain: Domain) => {
    if (!connected) {
      alert('Please connect your wallet first!');
      return;
    }
    alert(`Renewing ${domain.name}${domain.tld} for 0.15 SOL\n\nSmart contract integration coming soon!`);
  };

  const handleList = (domain: Domain) => {
    if (!connected) {
      alert('Please connect your wallet first!');
      return;
    }
    const price = prompt('Enter sale price in SOL:');
    if (price) {
      alert(`Listing ${domain.name}${domain.tld} for ${price} SOL\n\nSmart contract integration coming soon!`);
    }
  };

  const handleTransfer = (domain: Domain) => {
    if (!connected) {
      alert('Please connect your wallet first!');
      return;
    }
    const address = prompt('Enter recipient wallet address:');
    if (address) {
      alert(`Transferring ${domain.name}${domain.tld} to ${address}\n\nSmart contract integration coming soon!`);
    }
  };

  if (!connected) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <div className="gradient-bg" style={{ top: '-200px', right: '-200px' }}></div>
        <div className="gradient-bg-2" style={{ bottom: '-150px', left: '-150px' }}></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6 text-gradient font-orbitron">My Domains</h1>
            <p className="text-xl text-foreground/60 mb-8 font-inter">
              Connect your wallet to view your domains
            </p>
            <div className="card-glass inline-block px-8 py-6">
              <p className="text-foreground/80 font-inter">👆 Click "Select Wallet" in the top right corner</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="gradient-bg" style={{ top: '-200px', right: '-200px' }}></div>
      <div className="gradient-bg-2" style={{ bottom: '-150px', left: '-150px' }}></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 text-gradient font-orbitron">My Domains</h1>
          <p className="text-xl text-foreground/60 font-inter">
            Manage your registered domains
          </p>
        </div>

        {domains.length === 0 ? (
          <div className="card-glass text-center py-16">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-primary mb-4 font-orbitron">No Domains Yet</h3>
            <p className="text-foreground/60 mb-8 font-inter">Register your first domain to get started!</p>
            <a href="/" className="btn-primary inline-block">
              Search Domains
            </a>
          </div>
        ) : (
          <div className="grid gap-6">
            {domains.map((domain, index) => (
              <div key={index} className="card-glass">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-3xl font-bold font-orbitron mb-2">
                      {domain.name}<span className="text-primary">{domain.tld}</span>
                    </h3>
                    <p className="text-foreground/60 font-inter">
                      Expires: {new Date(domain.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  {domain.listedForSale && (
                    <div className="bg-accent/20 border border-accent px-4 py-2 rounded-lg">
                      <p className="text-sm text-accent font-orbitron font-bold">
                        Listed for {domain.salePrice} SOL
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleRenew(domain)}
                    className="btn-secondary"
                  >
                    Renew (0.15 SOL)
                  </button>
                  <button
                    onClick={() => handleList(domain)}
                    className="btn-secondary"
                  >
                    {domain.listedForSale ? 'Update Listing' : 'List for Sale'}
                  </button>
                  <button
                    onClick={() => handleTransfer(domain)}
                    className="btn-secondary"
                  >
                    Transfer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="card-glass text-center">
            <p className="text-4xl font-bold text-gradient font-orbitron mb-2">{domains.length}</p>
            <p className="text-foreground/60 font-inter">Total Domains</p>
          </div>
          <div className="card-glass text-center">
            <p className="text-4xl font-bold text-gradient font-orbitron mb-2">
              {domains.filter(d => d.listedForSale).length}
            </p>
            <p className="text-foreground/60 font-inter">Listed for Sale</p>
          </div>
          <div className="card-glass text-center">
            <p className="text-4xl font-bold text-gradient font-orbitron mb-2">
              {domains.filter(d => new Date(d.expiresAt) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length}
            </p>
            <p className="text-foreground/60 font-inter">Expiring Soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}

