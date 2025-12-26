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
                }
            });
        }
    }
});

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

async function loadBooks() {
    try {
        const response = await fetch('/api/books');
        const books = await response.json();
        displayBooks(books);
    } catch (error) {
        console.error('Error loading books:', error);
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
        const response = await fetch(`/api/books/search?${params}`);
        const books = await response.json();
        displayBooks(books);
    } catch (error) {
        console.error('Error searching books:', error);
    }
}

function displayBooks(books) {
    const container = document.getElementById('booksList');
    if(container){
        container.innerHTML = '';

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
        const response = await fetch('/api/cart/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isbn, quantity: 1 })
        });

        if (response.ok) {
            alert('Book added to cart!');
        } else {
            alert('Failed to add book to cart');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
}

async function loadCart() {
    try {
        const response = await fetch('/api/cart');
        const cart = await response.json();
        
        const container = document.getElementById('cartContent');
        if(container){
            container.innerHTML = '';

            if (cart.items.length === 0) {
                container.innerHTML = '<p>Your cart is empty.</p>';
                return;
            }

            let itemsHtml = '<ul class="list-group mb-3">';
            cart.items.forEach(item => {
                itemsHtml += `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="my-0">${item.title}</h6>
                            <small class="text-muted">Quantity: ${item.quantity}</small>
                        </div>
                        <span class="text-muted">$${item.subtotal.toFixed(2)}</span>
                        <button class="btn btn-danger btn-sm" onclick="removeFromCart('${item.ISBN}')">Remove</button>
                    </li>
                `;
            });
            itemsHtml += `
                <li class="list-group-item d-flex justify-content-between">
                    <span>Total (USD)</span>
                    <strong>$${cart.total.toFixed(2)}</strong>
                </li>
            `;
            itemsHtml += '</ul>';

            container.innerHTML = itemsHtml;
            container.innerHTML += `
                <a href="/customer/checkout.html" class="btn btn-primary w-100">
                    Proceed to Checkout
                </a>
            `;
        }

    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

async function removeFromCart(isbn) {
    try {
        const response = await fetch(`/api/cart/items/${isbn}`, { method: 'DELETE' });
        if (response.ok) {
            loadCart();
        } else {
            alert('Failed to remove item.');
        }
    } catch (error) {
        console.error('Error removing item:', error);
    }
}

async function loadOrders() {
    try {
        const response = await fetch('/api/customer/orders');
        const orders = await response.json();
        
        const tableBody = document.getElementById('ordersTableBody');
        if(tableBody){
            tableBody.innerHTML = '';

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
    }
}

async function loadProfile() {
    try {
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
    }
}
