// public/js/admin.js

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('add-book.html')) {
        const form = document.getElementById('addBookForm');
        if(form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
    
                const authors = document.getElementById('authors').value.split(',').map(s => s.trim());
    
                const formData = {
                    isbn: document.getElementById('isbn').value,
                    title: document.getElementById('title').value,
                    publisher_id: parseInt(document.getElementById('publisher_id').value),
                    publication_year: parseInt(document.getElementById('publication_year').value),
                    price: parseFloat(document.getElementById('price').value),
                    category: document.getElementById('category').value,
                    quantity_in_stock: parseInt(document.getElementById('quantity_in_stock').value),
                    threshold_quantity: parseInt(document.getElementById('threshold_quantity').value),
                    authors: authors
                };
    
                try {
                    const response = await fetch('/api/admin/books', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(formData)
                    });
    
                    if (response.ok) {
                        alert('Book added successfully!');
                        document.getElementById('addBookForm').reset();
                    } else {
                        const data = await response.json();
                        alert(data.error || 'Failed to add book');
                    }
                } catch (error) {
                    console.error('Error adding book:', error);
                    alert('An error occurred while adding the book.');
                }
            });
        }
    }

    if (window.location.pathname.endsWith('orders.html')) {
        loadPendingOrders();
    }

    if (window.location.pathname.endsWith('reports.html')) {
        // Add event listeners for report buttons
        const prevMonthBtn = document.querySelector('button[data-bs-target="#collapseOne"]');
        if(prevMonthBtn) prevMonthBtn.addEventListener('click', loadPreviousMonthSales);

        const topCustomersBtn = document.querySelector('button[data-bs-target="#collapseTwo"]');
        if(topCustomersBtn) topCustomersBtn.addEventListener('click', loadTopCustomers);

        const topBooksBtn = document.querySelector('button[data-bs-target="#collapseThree"]');
        if(topBooksBtn) topBooksBtn.addEventListener('click', loadTopBooks);
    }
    if(window.location.pathname.endsWith('dashboard.html')) {
        loadDashboardStats();
    }
    if(window.location.pathname.endsWith('manage-books.html')) {
        loadAllBooks();
    }
    if(window.location.pathname.endsWith('edit-book.html')) {
        const isbn = new URLSearchParams(window.location.search).get('isbn');
        loadBookForEdit(isbn);

        const form = document.getElementById('editBookForm');
        if(form){
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                updateBook(isbn);
            });
        }
    }
});

async function loadPendingOrders() {
    try {
        const response = await fetch('/api/admin/orders/pending');
        const orders = await response.json();
        
        const tableBody = document.getElementById('ordersTableBody');
        if(tableBody) {
            tableBody.innerHTML = '';

            orders.forEach(order => {
                const row = `
                    <tr>
                        <td>${order.order_id}</td>
                        <td>${order.title}</td>
                        <td>${order.publisher_name}</td>
                        <td>${order.quantity}</td>
                        <td>${new Date(order.order_date).toLocaleDateString()}</td>
                        <td>
                            <button class="btn btn-success" onclick="confirmOrder(${order.order_id})">
                                Confirm
                            </button>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        }
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

async function confirmOrder(orderId) {
    try {
        const response = await fetch(`/api/admin/orders/${orderId}/confirm`, {
            method: 'PUT'
        });

        if (response.ok) {
            alert('Order confirmed!');
            loadPendingOrders(); // Refresh the list
        } else {
            alert('Failed to confirm order');
        }
    } catch (error) {
        console.error('Error confirming order:', error);
    }
}


async function loadPreviousMonthSales() {
    const container = document.getElementById('prevMonthSales');
    if(container){
        try {
            const res = await fetch('/api/admin/reports/sales/previous-month');
            const data = await res.json();
            container.innerHTML = `
                <p>Total Sales: $${data.total_sales || 0}</p>
                <p>Number of Orders: ${data.num_orders || 0}</p>
            `;
        } catch (err) { container.innerHTML = '<p>Error loading report.</p>'; }
    }
}

async function loadTopCustomers() {
    const container = document.getElementById('topCustomers');
    if(container){
        try {
            const res = await fetch('/api/admin/reports/customers/top5');
            const customers = await res.json();
            let html = '<ul class="list-group">';
            customers.forEach(c => {
                html += `<li class="list-group-item">
                    ${c.first_name} ${c.last_name} - 
                    Spent: $${c.total_spent}, 
                    Orders: ${c.num_orders}
                </li>`;
            });
            html += '</ul>';
            container.innerHTML = html;
        } catch (err) { container.innerHTML = '<p>Error loading report.</p>'; }
    }
}

async function loadTopBooks() {
    const container = document.getElementById('topBooks');
    if(container){
        try {
            const res = await fetch('/api/admin/reports/books/top10');
            const books = await res.json();
            let html = '<ul class="list-group">';
            books.forEach(b => {
                html += `<li class="list-group-item">
                    ${b.title} (ISBN: ${b.ISBN}) - 
                    Sold: ${b.total_sold}, 
                    Revenue: $${b.total_revenue}
                </li>`;
            });
            html += '</ul>';
            container.innerHTML = html;
        } catch (err) { container.innerHTML = '<p>Error loading report.</p>'; }
    }
}

async function loadDashboardStats() {
    try {
        const [customers, books, orders] = await Promise.all([
            fetch('/api/admin/stats/customers').then(res => res.json()),
            fetch('/api/admin/stats/books').then(res => res.json()),
            fetch('/api/admin/stats/pending-orders').then(res => res.json())
        ]);

        document.getElementById('customerCount').textContent = customers.count;
        document.getElementById('bookCount').textContent = books.count;
        document.getElementById('orderCount').textContent = orders.count;

    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

async function loadAllBooks() {
    try {
        const response = await fetch('/api/books');
        const books = await response.json();
        
        const tableBody = document.getElementById('booksTableBody');
        if(tableBody) {
            tableBody.innerHTML = '';

            books.forEach(book => {
                const row = `
                    <tr>
                        <td>${book.ISBN}</td>
                        <td>${book.title}</td>
                        <td>${book.price}</td>
                        <td>${book.quantity_in_stock}</td>
                        <td>
                            <a href="/admin/edit-book.html?isbn=${book.ISBN}" class="btn btn-primary btn-sm">Edit</a>
                            <button class="btn btn-danger btn-sm" onclick="deleteBook('${book.ISBN}')">Delete</button>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        }
    } catch (error) {
        console.error('Error loading books:', error);
    }
}

async function deleteBook(isbn) {
    if (!confirm('Are you sure you want to delete this book?')) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/books/${isbn}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Book deleted successfully!');
            loadAllBooks();
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to delete book');
        }
    } catch (error) {
        console.error('Error deleting book:', error);
        alert('An error occurred while deleting the book.');
    }
}

async function loadBookForEdit(isbn) {
    try {
        const response = await fetch(`/api/books/${isbn}`);
        const book = await response.json();

        if (response.ok) {
            document.getElementById('isbn').value = book.ISBN;
            document.getElementById('title').value = book.title;
            document.getElementById('publisher_id').value = book.publisher_id;
            document.getElementById('publication_year').value = book.publication_year;
            document.getElementById('price').value = book.price;
            document.getElementById('category').value = book.category;
            document.getElementById('quantity_in_stock').value = book.quantity_in_stock;
            document.getElementById('threshold_quantity').value = book.threshold_quantity;
        } else {
            alert(book.error || 'Failed to load book details');
        }
    } catch (error) {
        console.error('Error loading book:', error);
        alert('An error occurred while loading book details.');
    }
}

async function updateBook(isbn) {
    const formData = {
        title: document.getElementById('title').value,
        publisher_id: parseInt(document.getElementById('publisher_id').value),
        publication_year: parseInt(document.getElementById('publication_year').value),
        price: parseFloat(document.getElementById('price').value),
        category: document.getElementById('category').value,
        quantity_in_stock: parseInt(document.getElementById('quantity_in_stock').value),
        threshold_quantity: parseInt(document.getElementById('threshold_quantity').value)
    };

    try {
        const response = await fetch(`/api/admin/books/${isbn}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('Book updated successfully!');
            window.location.href = '/admin/manage-books.html';
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to update book');
        }
    } catch (error) {
        console.error('Error updating book:', error);
        alert('An error occurred while updating the book.');
    }
}
