'use client';

import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-2xl font-bold text-gradient font-orbitron tracking-wider">
              DIGITAL PULSE
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-foreground/80 hover:text-primary transition-colors font-inter">
              Search
            </Link>
            <Link href="/my-domains" className="text-foreground/80 hover:text-primary transition-colors font-inter">
              My Domains
            </Link>
            <Link href="/marketplace" className="text-foreground/80 hover:text-primary transition-colors font-inter">
              Marketplace
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <WalletMultiButton className="!bg-gradient-pulse !rounded-lg !font-orbitron !font-bold hover:!shadow-glow-cyan transition-all" />
          </div>
        </div>
      </div>
    </nav>
  );
}

