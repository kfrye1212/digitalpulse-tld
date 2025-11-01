export default function Footer() {
  return (
    <footer className="border-t border-border bg-background/50 backdrop-blur-lg mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-gradient font-orbitron mb-4">DIGITAL PULSE</h3>
            <p className="text-foreground/60 text-sm font-inter">
              Next-generation decentralized domain registration on Solana blockchain
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-primary font-orbitron mb-4">TLD Options</h4>
            <ul className="space-y-2 text-foreground/60 text-sm font-inter">
              <li>.pulse domains</li>
              <li>.verse domains</li>
              <li>.cp domains</li>
              <li>.pv domains</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-primary font-orbitron mb-4">Features</h4>
            <ul className="space-y-2 text-foreground/60 text-sm font-inter">
              <li>Instant Registration</li>
              <li>NFT Ownership</li>
              <li>Integrated Marketplace</li>
              <li>Domain Management</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-primary font-orbitron mb-4">Network</h4>
            <ul className="space-y-2 text-foreground/60 text-sm font-inter">
              <li>Solana Mainnet</li>
              <li>0.25 SOL Registration</li>
              <li>0.15 SOL Renewal</li>
              <li>5% Marketplace Fee</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-foreground/40 text-sm font-inter">
            © 2025 Digital Pulse. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="https://chainpulse.info" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark transition-colors text-sm font-inter">
              chainpulse.info
            </a>
            <a href="https://chainpulse.network" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark transition-colors text-sm font-inter">
              chainpulse.network
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

