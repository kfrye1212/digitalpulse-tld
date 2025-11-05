// Shared Wallet Integration Module
// Eliminates code duplication and provides consistent wallet management

class WalletManager {
    constructor() {
        this.walletAddress = null;
        this.listeners = [];
    }

    async initialize() {
        const walletButtonContainer = document.getElementById('wallet-button-container');
        
        if (!walletButtonContainer) {
            console.warn('Wallet button container not found');
            return;
        }

        // Check if Phantom wallet is installed
        const isPhantomInstalled = window.solana && window.solana.isPhantom;
        
        if (!isPhantomInstalled) {
            walletButtonContainer.innerHTML = `
                <a href="https://phantom.app/" target="_blank" class="btn-secondary">
                    Install Phantom
                </a>
            `;
            return;
        }
        
        // Create wallet button
        const walletBtn = document.createElement('button');
        walletBtn.className = 'btn-primary';
        walletBtn.textContent = 'Connect Wallet';
        walletBtn.onclick = () => this.connect();
        
        walletButtonContainer.appendChild(walletBtn);
        
        // Set up wallet event listeners
        this._setupWalletEvents();
        
        // Check if already connected
        try {
            const response = await window.solana.connect({ onlyIfTrusted: true });
            this.walletAddress = response.publicKey.toString();
            this._updateButton();
            this._notifyListeners('connect', this.walletAddress);
        } catch (err) {
            // Not connected yet
        }
    }

    async connect() {
        try {
            const response = await window.solana.connect();
            this.walletAddress = response.publicKey.toString();
            this._updateButton();
            this._notifyListeners('connect', this.walletAddress);
            console.log('Connected to wallet:', this.walletAddress);
        } catch (err) {
            console.error('Failed to connect wallet:', err);
            this._showError('Failed to connect wallet. Please try again.');
        }
    }

    async disconnect() {
        try {
            await window.solana.disconnect();
            this.walletAddress = null;
            this._updateButton();
            this._notifyListeners('disconnect');
            console.log('Disconnected wallet');
        } catch (err) {
            console.error('Failed to disconnect wallet:', err);
        }
    }

    getAddress() {
        return this.walletAddress;
    }

    isConnected() {
        return this.walletAddress !== null;
    }

    // Event listener pattern for wallet state changes
    on(event, callback) {
        this.listeners.push({ event, callback });
    }

    off(event, callback) {
        this.listeners = this.listeners.filter(
            listener => !(listener.event === event && listener.callback === callback)
        );
    }

    _notifyListeners(event, data) {
        this.listeners.forEach(listener => {
            if (listener.event === event) {
                listener.callback(data);
            }
        });
    }

    _setupWalletEvents() {
        if (!window.solana) return;

        window.solana.on('connect', (publicKey) => {
            this.walletAddress = publicKey.toString();
            this._updateButton();
            this._notifyListeners('connect', this.walletAddress);
        });
        
        window.solana.on('disconnect', () => {
            this.walletAddress = null;
            this._updateButton();
            this._notifyListeners('disconnect');
        });

        window.solana.on('accountChanged', (publicKey) => {
            if (publicKey) {
                this.walletAddress = publicKey.toString();
                this._updateButton();
                this._notifyListeners('accountChanged', this.walletAddress);
            } else {
                this.disconnect();
            }
        });
    }

    _updateButton() {
        const btn = document.querySelector('#wallet-button-container button');
        if (!btn) return;

        if (this.walletAddress) {
            btn.textContent = `${this.walletAddress.slice(0, 4)}...${this.walletAddress.slice(-4)}`;
            btn.onclick = () => this.disconnect();
        } else {
            btn.textContent = 'Connect Wallet';
            btn.onclick = () => this.connect();
        }
    }

    _showError(message) {
        // Use a simple alert for now, could be enhanced with a better UI
        alert(message);
    }
}

// Create global wallet instance
const walletManager = new WalletManager();

// Legacy compatibility - maintain global walletAddress for existing code
Object.defineProperty(window, 'walletAddress', {
    get: function() {
        return walletManager.getAddress();
    },
    set: function(value) {
        // Prevent direct setting
        console.warn('Direct walletAddress assignment is deprecated. Use walletManager instead.');
    }
});

// Initialize wallet on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => walletManager.initialize());
} else {
    walletManager.initialize();
}
