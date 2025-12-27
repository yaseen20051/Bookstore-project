// public/js/customer.js

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('browse.html')) {
        loadBooks();
    }
    if (window.location.pathname.endsWith('cart.html')) {
        loadCart();
    }
    if (window.location.pathname.endsWith('checkout.html')) {
        const form = document.getElementById('checkoutForm');
        if(form){
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
    
                const formData = {
                    credit_card_number: document.getElementById('credit_card_number').value,
                    card_expiry: document.getElementById('card_expiry').value
                };
    
                try {
                    showSpinner();
                    const response = await fetch('/api/cart/checkout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(formData)
                    });
    
                    const data = await response.json();
    
                    if (response.ok) {
                        alert('Purchase successful! Your order ID is ' + data.sale_id);
                        window.location.href = '/customer/orders.html';
                    } else {
                        alert(data.error || 'Checkout failed');
                    }
                } catch (error) {
                    console.error('Checkout error:', error);
                    alert('An error occurred during checkout.');
                } finally {
                    hideSpinner();
                }
            });
        }
    }
    if (window.location.pathname.endsWith('orders.html')) {
        loadOrders();
    }
    if (window.location.pathname.endsWith('profile.html')) {
        loadProfile();
        const form = document.getElementById('profileForm');
        if(form){
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
    
                const formData = {
                    first_name: document.getElementById('first_name').value,
                    last_name: document.getElementById('last_name').value,
                    email: document.getElementById('email').value,
                    phone: document.getElementById('phone').value,
                    shipping_address: document.getElementById('shipping_address').value
                };
    
                try {
                    showSpinner();
                    const response = await fetch('/api/customer/profile', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(formData)
                    });
    
                    if (response.ok) {
                        alert('Profile updated successfully!');
                    } else {
                        const data = await response.json();
                        alert(data.error || 'Failed to update profile');
                    }
                } catch (error) {
                    console.error('Error updating profile:', error);
                    alert('An error occurred while updating your profile.');
                } finally {
                    hideSpinner();
                }
            });
        }
    }
});

// Utility functions for browse page
function showLoading(show) {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = show ? 'block' : 'none';
    }
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

function hideError() {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

// Load all books on page load
window.onload = () => {
    if (window.location.pathname.endsWith('browse.html')) {
        loadBooks();
    }
    if (window.location.pathname.endsWith('cart.html')) {
        loadCart();
    }
    if (window.location.pathname.endsWith('orders.html')) {
        loadOrders();
    }
    if (window.location.pathname.endsWith('profile.html')) {
        loadProfile();
    }
};

// Allow search on Enter key for browse page
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.endsWith('browse.html')) {
        const inputs = ['searchTitle', 'searchAuthor'];
        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        searchBooks();
                    }
                });
            }
        });
    }
});

async function loadBooks() {
    try {
        showSpinner();
        const response = await fetch('/api/books');
        const books = await response.json();
        displayBooks(books);
    } catch (error) {
        console.error('Error loading books:', error);
    } finally {
        hideSpinner();
    }
}

async function searchBooks() {
    const title = document.getElementById('searchTitle').value;
    const author = document.getElementById('searchAuthor').value;
    const category = document.getElementById('searchCategory').value;

    const params = new URLSearchParams();
    if (title) params.append('title', title);
    if (author) params.append('author', author);
    if (category) params.append('category', category);

    try {
        showSpinner();
        const response = await fetch(`/api/books/search?${params}`);
        const books = await response.json();
        displayBooks(books);
    } catch (error) {
        console.error('Error searching books:', error);
    } finally {
        hideSpinner();
    }
}

function displayBooks(books) {
    const container = document.getElementById('booksList');
    if(container){
        container.innerHTML = '';

        if (books.length === 0) {
            container.innerHTML = '<p class="text-center">No books found matching your criteria.</p>';
            return;
        }

        books.forEach(book => {
            const bookCard = `
                <div class="col-md-4 mb-4">
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">${book.title}</h5>
                            <p class="card-text">
                                <strong>Author(s):</strong> ${book.authors || 'N/A'}<br>
                                <strong>Category:</strong> ${book.category}<br>
                                <strong>Price:</strong> $${book.price}<br>
                                <strong>Stock:</strong> ${book.quantity_in_stock}
                            </p>
                            <button class="btn btn-success w-100" 
                                    onclick="addToCart('${book.ISBN}')"
                                    ${book.quantity_in_stock === 0 ? 'disabled' : ''}>
                                ${book.quantity_in_stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += bookCard;
        });
    }
}

async function addToCart(isbn) {
    try {
        showSpinner();
        const response = await fetch('/api/cart/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isbn, quantity: 1 })
        });
        
        const data = await response.json();

        if (response.ok) {
            toast.success('Book added to cart successfully!');
        } else {
            toast.error(data.error || 'Failed to add book to cart');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        toast.error('An error occurred while adding to cart');
    } finally {
        hideSpinner();
    }
}

async function loadCart() {
    try {
        showSpinner();
        const response = await fetch('/api/cart');
        const cart = await response.json();
        
        const container = document.getElementById('cartContent');
        if(container){
            container.innerHTML = '';

            if (cart.items.length === 0) {
                container.innerHTML = '<div class="alert alert-info text-center">Your cart is empty.</div>';
                return;
            }

            let itemsHtml = '<div class="card"><div class="card-body">';
            itemsHtml += '<h5 class="card-title mb-3">Cart Items</h5>';
            
            cart.items.forEach(item => {
                itemsHtml += `
                    <div class="row mb-3 border-bottom pb-3">
                        <div class="col-md-4">
                            <h6 class="my-0">${item.title}</h6>
                            <small class="text-muted">ISBN: ${item.ISBN}</small>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">Quantity</label>
                            <div class="input-group">
                                <button class="btn btn-outline-secondary" type="button" onclick="updateQuantity('${item.ISBN}', ${item.quantity - 1})">-</button>
                                <input type="number" class="form-control text-center" value="${item.quantity}" 
                                       min="1" max="${item.quantity_in_stock}" 
                                       onchange="updateQuantityInput('${item.ISBN}', this.value)">
                                <button class="btn btn-outline-secondary" type="button" onclick="updateQuantity('${item.ISBN}', ${item.quantity + 1})">+</button>
                            </div>
                            <small class="text-muted">Max: ${item.quantity_in_stock}</small>
                        </div>
                        <div class="col-md-2 text-center">
                            <span class="fw-bold">$${item.subtotal.toFixed(2)}</span>
                        </div>
                        <div class="col-md-3 text-center">
                            <button class="btn btn-danger btn-sm" onclick="removeFromCart('${item.ISBN}')">
                                <i class="bi bi-trash"></i> Remove
                            </button>
                        </div>
                    </div>
                `;
            });
            
            itemsHtml += `
                <div class="row mt-4">
                    <div class="col-md-6">
                        <h4>Total: $${cart.total.toFixed(2)}</h4>
                    </div>
                    <div class="col-md-6 text-end">
                        <a href="/customer/checkout.html" class="btn btn-success btn-lg">
                            Proceed to Checkout
                        </a>
                    </div>
                </div>
            `;
            
            itemsHtml += '</div></div>';

            container.innerHTML = itemsHtml;
        }

    } catch (error) {
        console.error('Error loading cart:', error);
        const container = document.getElementById('cartContent');
        if(container){
            container.innerHTML = '<div class="alert alert-danger">Error loading cart. Please try again.</div>';
        }
    } finally {
        hideSpinner();
    }
}

async function removeFromCart(isbn) {
    if (!confirm('Are you sure you want to remove this item from your cart?')) {
        return;
    }
    
    try {
        showSpinner();
        const response = await fetch(`/api/cart/items/${isbn}`, { method: 'DELETE' });
        const data = await response.json();
        
        if (response.ok) {
            toast.success('Item removed from cart successfully');
            loadCart();
        } else {
            toast.error(data.error || 'Failed to remove item');
        }
    } catch (error) {
        console.error('Error removing item:', error);
        toast.error('An error occurred while removing the item');
    } finally {
        hideSpinner();
    }
}

async function updateQuantity(isbn, newQuantity) {
    if (newQuantity < 1) {
        return; // Don't allow quantity less than 1
    }
    
    try {
        showSpinner();
        const response = await fetch(`/api/cart/items/${isbn}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: newQuantity })
        });
        const data = await response.json();
        
        if (response.ok) {
            loadCart();
        } else {
            toast.error(data.error || 'Failed to update quantity');
        }
    } catch (error) {
        console.error('Error updating quantity:', error);
        toast.error('An error occurred while updating quantity');
    } finally {
        hideSpinner();
    }
}

async function updateQuantityInput(isbn, quantity) {
    const newQuantity = parseInt(quantity);
    if (isNaN(newQuantity) || newQuantity < 1) {
        toast.error('Quantity must be at least 1');
        loadCart(); // Reset the display
        return;
    }
    
    updateQuantity(isbn, newQuantity);
}

async function clearCart() {
    if (!confirm('Are you sure you want to clear your entire cart? This action cannot be undone.')) {
        return;
    }
    
    try {
        showSpinner();
        const response = await fetch('/api/cart', { method: 'DELETE' });
        const data = await response.json();
        
        if (response.ok) {
            toast.success('Cart cleared successfully');
            loadCart();
        } else {
            toast.error(data.error || 'Failed to clear cart');
        }
    } catch (error) {
        console.error('Error clearing cart:', error);
        toast.error('An error occurred while clearing the cart');
    } finally {
        hideSpinner();
    }
}

async function loadOrders() {
    try {
        showSpinner();
        const response = await fetch('/api/customer/orders');
        const orders = await response.json();
        
        const tableBody = document.getElementById('ordersTableBody');
        if(tableBody){
            tableBody.innerHTML = '';

            if (orders.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4" class="text-center">You have no past orders.</td></tr>';
                return;
            }

            orders.forEach(order => {
                const row = `
                    <tr>
                        <td>${order.sale_id}</td>
                        <td>${new Date(order.sale_date).toLocaleDateString()}</td>
                        <td>$${order.total_amount.toFixed(2)}</td>
                        <td>${order.items}</td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        }
    } catch (error) {
        console.error('Error loading orders:', error);
    } finally {
        hideSpinner();
    }
}

async function loadProfile() {
    try {
        showSpinner();
        const response = await fetch('/api/customer/profile');
        const profile = await response.json();

        if (response.ok) {
            document.getElementById('username').value = profile.username;
            document.getElementById('email').value = profile.email;
            document.getElementById('first_name').value = profile.first_name;
            document.getElementById('last_name').value = profile.last_name;
            document.getElementById('phone').value = profile.phone;
            document.getElementById('shipping_address').value = profile.shipping_address;
        } else {
            alert(profile.error || 'Failed to load profile');
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        alert('An error occurred while loading your profile.');
    } finally {
        hideSpinner();
    }
}
