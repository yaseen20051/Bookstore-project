// public/js/toast.js

/**
 * Toast notification system
 */
class Toast {
    constructor() {
        this.container = this.createContainer();
    }

    createContainer() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 400px;
            `;
            document.body.appendChild(container);
        }
        return container;
    }

    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const colors = {
            success: { bg: '#dcfce7', border: '#16a34a', text: '#15803d' },
            error: { bg: '#fee2e2', border: '#dc2626', text: '#b91c1c' },
            warning: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
            info: { bg: '#e0f2fe', border: '#0ea5e9', text: '#075985' }
        };

        const color = colors[type] || colors.info;

        toast.style.cssText = `
            background-color: ${color.bg};
            border-left: 4px solid ${color.border};
            color: ${color.text};
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 12px;
            animation: slideIn 0.3s ease;
            font-size: 14px;
            font-weight: 500;
            min-width: 300px;
        `;

        const icon = this.getIcon(type);
        toast.innerHTML = `
            <span style="font-size: 20px;">${icon}</span>
            <span style="flex: 1;">${message}</span>
            <button onclick="this.parentElement.remove()" style="
                background: none;
                border: none;
                color: ${color.text};
                cursor: pointer;
                font-size: 18px;
                padding: 0;
                margin: 0;
                opacity: 0.6;
            ">&times;</button>
        `;

        this.container.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }

    success(message, duration) {
        this.show(message, 'success', duration);
    }

    error(message, duration) {
        this.show(message, 'error', duration);
    }

    warning(message, duration) {
        this.show(message, 'warning', duration);
    }

    info(message, duration) {
        this.show(message, 'info', duration);
    }
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Create global toast instance
const toast = new Toast();

// Make it available globally
window.toast = toast;