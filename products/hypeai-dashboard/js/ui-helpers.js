/* HypeAI Dashboard - UI Helper Functions */
window.UIHelpers = {
    showLoadingIndicator(selector, message = 'Loading...') {
        console.log(`🔄 Loading: ${message}`);
    },
    
    hideLoadingIndicator(selector) {
        console.log('✅ Loading complete');
    },
    
    showConnectionStatusBar() {
        console.log('📡 Connection status bar created');
    },
    
    showConnectionStatus(status, message) {
        console.log(`📊 Status: ${status} - ${message}`);
    },
    
    createRefreshButton() {
        const btn = document.createElement('button');
        btn.className = 'btn-refresh';
        btn.innerHTML = '🔄 Refresh';
        btn.style.cssText = 'background:#8e32e9;color:#fff;padding:8px 16px;border:none;border-radius:6px;cursor:pointer;margin-left:10px;transition:all 0.2s;font-weight:500;';
        btn.onmouseover = () => btn.style.background = '#a855f7';
        btn.onmouseout = () => btn.style.background = '#8e32e9';
        btn.onclick = () => {
            window.dispatchEvent(new CustomEvent('twitter:refresh', {
                detail: { force: true }
            }));
        };
        
        const header = document.querySelector('.header-right');
        if (header) {
            header.insertBefore(btn, header.firstChild);
        }
        return btn;
    },
    
    showToast(message, type = 'info', duration = 3000) {
        console.log(`🍞 Toast (${type}): ${message}`);
        
        const colors = {
            error: '#ff4444',
            warning: '#ffaa00',
            success: '#00ff88',
            info: '#00d4ff'
        };
        
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #181824;
            color: #fff;
            padding: 15px 25px;
            border-radius: 8px;
            border-left: 4px solid ${colors[type] || colors.info};
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            font-weight: 500;
            animation: slideIn 0.3s ease;
            max-width: 400px;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
};

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

console.log('✅ UIHelpers loaded successfully');
