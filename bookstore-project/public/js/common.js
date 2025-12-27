// Spinner functions
function showSpinner() {
    let spinner = document.getElementById('spinner-container');
    if (!spinner) {
        spinner = document.createElement('div');
        spinner.id = 'spinner-container';
        spinner.className = 'spinner-container';
        spinner.innerHTML = '<div class="spinner"></div>';
        document.body.appendChild(spinner);
    }
    spinner.style.display = 'flex';
}

function hideSpinner() {
    const spinner = document.getElementById('spinner-container');
    if (spinner) {
        spinner.style.display = 'none';
    }
}

// Logout function
async function logout() {
    try {
        showSpinner();
        const response = await fetch('/api/auth/logout', { 
            method: 'POST',
            credentials: 'include' // Include cookies for session authentication
        });
        
        let data;
        try {
            data = await response.json();
        } catch (e) {
            // If response is not JSON, continue with status check
            console.error('Non-JSON response from logout:', response.status);
        }
        
        if (response.ok) {
            if (window.toast) {
                window.toast.success('Logged out successfully');
            }
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 500);
        } else {
            const errorMsg = data?.error || 'Logout failed';
            console.error('Logout failed:', response.status, errorMsg);
            if (window.toast) {
                window.toast.error(errorMsg);
            } else {
                alert(errorMsg);
            }
        }
    } catch (error) {
        console.error('Logout error:', error);
        if (window.toast) {
            window.toast.error('An error occurred during logout: ' + error.message);
        } else {
            alert('An error occurred during logout: ' + error.message);
        }
    } finally {
        hideSpinner();
    }
}

// Make logout globally accessible for onclick handlers
window.logout = logout;

// API helper with better error handling
async function apiRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            credentials: 'include', // Include cookies for session authentication
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || data.error || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Debounce function for search inputs
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Confirm dialog helper
function confirm(message) {
    return window.confirm(message);
}
