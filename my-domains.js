// My Domains Page JavaScript

// Demo domains (replace with actual blockchain query when contract is deployed)
const demoDomains = [
    {
        name: 'myname.pulse',
        registered: '2025-01-15',
        expires: '2026-01-15',
        value: '0.5'
    },
    {
        name: 'crypto.verse',
        registered: '2025-02-01',
        expires: '2026-02-01',
        value: '0.8'
    },
    {
        name: 'web3.cp',
        registered: '2025-02-20',
        expires: '2026-02-20',
        value: '0.3'
    }
];

let selectedDomain = null;

// Check wallet connection on page load
window.addEventListener('load', () => {
    setTimeout(() => {
        if (walletConnected) {
            showDomains();
        } else {
            document.getElementById('notConnected').classList.remove('hidden');
        }
    }, 500);
});

// Watch for wallet connection changes
setInterval(() => {
    if (walletConnected && document.getElementById('notConnected').classList.contains('hidden') === false) {
        document.getElementById('notConnected').classList.add('hidden');
        showDomains();
    }
}, 1000);

function showDomains() {
    document.getElementById('notConnected').classList.add('hidden');
    document.getElementById('domainsList').classList.remove('hidden');
    
    // In production, fetch domains from blockchain
    // For now, use demo data
    const domains = demoDomains;
    
    if (domains.length === 0) {
        document.getElementById('emptyState').classList.remove('hidden');
        return;
    }
    
    // Update stats
    document.getElementById('totalDomains').textContent = domains.length;
    
    const totalValue = domains.reduce((sum, d) => sum + parseFloat(d.value), 0);
    document.getElementById('portfolioValue').textContent = `${totalValue.toFixed(2)} SOL`;
    
    const expiringSoon = domains.filter(d => {
        const daysUntilExpiry = Math.floor((new Date(d.expires) - new Date()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry < 30;
    }).length;
    document.getElementById('expiringSoon').textContent = expiringSoon;
    
    // Populate table
    const tbody = document.getElementById('domainsTableBody');
    tbody.innerHTML = '';
    
    domains.forEach(domain => {
        const row = document.createElement('tr');
        
        const daysUntilExpiry = Math.floor((new Date(domain.expires) - new Date()) / (1000 * 60 * 60 * 24));
        const expiryClass = daysUntilExpiry < 30 ? 'text-red-400' : 'text-gray-300';
        
        row.innerHTML = `
            <td class="font-bold text-cyan-400">${domain.name}</td>
            <td class="text-gray-300">${formatDate(domain.registered)}</td>
            <td class="${expiryClass}">${formatDate(domain.expires)} (${daysUntilExpiry}d)</td>
            <td class="text-gradient font-bold">${domain.value} SOL</td>
            <td>
                <button onclick="openActionsModal('${domain.name}')" class="btn btn-outline px-4 py-2 text-sm">
                    Manage
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function openActionsModal(domainName) {
    selectedDomain = domainName;
    document.getElementById('modalDomain').textContent = domainName;
    document.getElementById('actionsModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('actionsModal').classList.add('hidden');
    selectedDomain = null;
}

function renewDomain() {
    if (!selectedDomain) return;
    
    if (confirm(`Renew ${selectedDomain} for 0.15 SOL?`)) {
        showNotification(`${selectedDomain} renewed successfully!`, 'success');
        closeModal();
        // In production, execute Solana transaction here
    }
}

function transferDomain() {
    if (!selectedDomain) return;
    
    const recipient = prompt('Enter recipient wallet address:');
    if (recipient && recipient.length > 0) {
        if (confirm(`Transfer ${selectedDomain} to ${recipient}?`)) {
            showNotification(`${selectedDomain} transferred successfully!`, 'success');
            closeModal();
            // In production, execute Solana transaction here
        }
    }
}

function listForSale() {
    if (!selectedDomain) return;
    
    const price = prompt('Enter sale price in SOL:');
    if (price && parseFloat(price) > 0) {
        if (confirm(`List ${selectedDomain} for ${price} SOL?`)) {
            showNotification(`${selectedDomain} listed on marketplace!`, 'success');
            closeModal();
            setTimeout(() => {
                window.location.href = 'marketplace.html';
            }, 2000);
            // In production, execute Solana transaction here
        }
    }
}

function deleteDomain() {
    if (!selectedDomain) return;
    
    if (confirm(`Are you sure you want to delete ${selectedDomain}? This action cannot be undone.`)) {
        showNotification(`${selectedDomain} deleted`, 'success');
        closeModal();
        // In production, execute Solana transaction here
        setTimeout(() => location.reload(), 1500);
    }
}

// Close modal when clicking outside
document.getElementById('actionsModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'actionsModal') {
        closeModal();
    }
});

