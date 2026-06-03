/**
 * main.js — Supply Chain & Inventory Tracker
 * ============================================
 * Handles all client-side interactivity:
 *  1. Show/hide forms (toggle)
 *  2. Table search filtering
 *  3. Table column sorting
 *  4. Category / city filter dropdowns
 *  5. Shipment status filter (click on pill badges)
 *  6. Auto-fill unit price from product dropdown (orders page)
 *  7. Flash message auto-dismiss
 *  8. Active nav link highlight
 *  9. Confirm before delete (if added later)
 * 10. Print table utility
 */


/* ============================================
   1. TOGGLE FORM VISIBILITY
   Used by "Add Product", "Add Supplier" buttons.
   Smoothly slides form open/closed.
   ============================================ */
function toggleForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    if (form.style.display === 'none' || form.style.display === '') {
        // Show form with smooth slide-down
        form.style.display = 'block';
        form.style.opacity = '0';
        form.style.transform = 'translateY(-10px)';

        // Trigger reflow so transition works
        void form.offsetHeight;

        form.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        form.style.opacity    = '1';
        form.style.transform  = 'translateY(0)';

        // Scroll form into view
        form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
        // Hide form
        form.style.transition = 'opacity 0.2s ease';
        form.style.opacity = '0';
        setTimeout(() => {
            form.style.display = 'none';
        }, 200);
    }
}


/* ============================================
   2. TABLE SEARCH FILTER
   Called by oninput on search boxes.
   Hides rows that don't match the search term.
   ============================================ */
function filterTable(searchInputId, tableId) {
    const searchValue = document.getElementById(searchInputId)
                                 .value.toLowerCase().trim();
    const table = document.getElementById(tableId);
    if (!table) return;

    const rows = table.querySelectorAll('tbody tr');
    let visibleCount = 0;

    rows.forEach(row => {
        // Get all text content in the row
        const rowText = row.innerText.toLowerCase();

        if (rowText.includes(searchValue)) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });

    // Update the record count display
    updateCount(tableId, visibleCount);
}


/* ============================================
   3. TABLE COLUMN SORTING
   Called by onclick on sortable <th> elements.
   Toggles between ascending / descending.
   ============================================ */
// Store sort state per table
const sortState = {};

function sortTable(tableId, columnIndex) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const key = `${tableId}_${columnIndex}`;

    // Toggle direction
    sortState[key] = sortState[key] === 'asc' ? 'desc' : 'asc';
    const direction = sortState[key];

    const tbody = table.querySelector('tbody');
    const rows  = Array.from(tbody.querySelectorAll('tr'));

    rows.sort((a, b) => {
        const aText = a.cells[columnIndex]
                       ? a.cells[columnIndex].innerText.trim() : '';
        const bText = b.cells[columnIndex]
                       ? b.cells[columnIndex].innerText.trim() : '';

        // Try numeric sort first (for IDs, prices, quantities)
        const aNum = parseFloat(aText.replace(/[^0-9.-]/g, ''));
        const bNum = parseFloat(bText.replace(/[^0-9.-]/g, ''));

        if (!isNaN(aNum) && !isNaN(bNum)) {
            return direction === 'asc' ? aNum - bNum : bNum - aNum;
        }

        // Fall back to string sort
        return direction === 'asc'
            ? aText.localeCompare(bText)
            : bText.localeCompare(aText);
    });

    // Re-append sorted rows
    rows.forEach(row => tbody.appendChild(row));

    // Update sort icons in header
    updateSortIcons(table, columnIndex, direction);
}

function updateSortIcons(table, activeCol, direction) {
    const headers = table.querySelectorAll('th.sortable');
    headers.forEach((th, i) => {
        const icon = th.querySelector('.sort-icon');
        if (!icon) return;
        // Find the actual column index of this th
        const thIndex = Array.from(th.parentElement.children).indexOf(th);
        if (thIndex === activeCol) {
            icon.textContent = direction === 'asc' ? '↑' : '↓';
            icon.style.color = '#2b6cb0';
        } else {
            icon.textContent = '⇅';
            icon.style.color = '';
        }
    });
}


/* ============================================
   4a. FILTER PRODUCTS TABLE BY CATEGORY
   Called by the category <select> dropdown on products page.
   ============================================ */
function filterByCategory() {
    const selected = document.getElementById('categoryFilter').value.toLowerCase();
    const table    = document.getElementById('productsTable');
    if (!table) return;

    const rows = table.querySelectorAll('tbody tr');
    let count  = 0;

    rows.forEach(row => {
        const category = (row.dataset.category || '').toLowerCase();
        if (!selected || category === selected) {
            row.style.display = '';
            count++;
        } else {
            row.style.display = 'none';
        }
    });

    updateCount('productsTable', count);
}


/* ============================================
   4b. FILTER SUPPLIERS TABLE BY CITY
   Called by the city <select> dropdown on suppliers page.
   ============================================ */
function filterSupplierByCity() {
    const selected = document.getElementById('cityFilter').value.toLowerCase();
    const table    = document.getElementById('suppliersTable');
    if (!table) return;

    const rows = table.querySelectorAll('tbody tr');
    let count  = 0;

    rows.forEach(row => {
        const city = (row.dataset.city || '').toLowerCase();
        if (!selected || city === selected) {
            row.style.display = '';
            count++;
        } else {
            row.style.display = 'none';
        }
    });

    updateCount('suppliersTable', count);
}


/* ============================================
   5. FILTER SHIPMENTS BY STATUS
   Called by clicking the colored status pills at the top.
   Pass empty string '' to show all rows.
   ============================================ */
function filterShipmentStatus(status) {
    const table = document.getElementById('shipmentsTable');
    if (!table) return;

    const rows = table.querySelectorAll('tbody tr');
    let count  = 0;

    rows.forEach(row => {
        const rowStatus = row.dataset.status || '';
        if (!status || rowStatus === status) {
            row.style.display = '';
            count++;
        } else {
            row.style.display = 'none';
        }
    });

    updateCount('shipmentsTable', count);

    // Highlight active pill
    document.querySelectorAll('.status-pill').forEach(pill => {
        pill.classList.remove('pill-active');
    });
}


/* ============================================
   6. AUTO-FILL UNIT PRICE FROM PRODUCT DROPDOWN
   On the Orders page: when user selects a product,
   automatically populate the unit price field.
   ============================================ */
function setupProductPriceAutofill() {
    const productSelect = document.querySelector('select[name="product_id"]');
    const priceInput    = document.querySelector('input[name="unit_price"]');

    if (!productSelect || !priceInput) return;

    productSelect.addEventListener('change', function () {
        const selectedOption = this.options[this.selectedIndex];
        // Option text format: "Product Name (Rs. 250.00)"
        const text  = selectedOption.text;
        const match = text.match(/Rs\.\s*([\d.]+)/);

        if (match) {
            priceInput.value = parseFloat(match[1]).toFixed(2);
            // Brief highlight to show it was auto-filled
            priceInput.style.background = '#e6fffa';
            setTimeout(() => {
                priceInput.style.background = '';
            }, 800);
        }
    });
}


/* ============================================
   7. FLASH MESSAGE AUTO-DISMISS
   Green/red flash banners disappear after 4 seconds.
   ============================================ */
function setupFlashAutoDismiss() {
    const flashes = document.querySelectorAll('.flash');
    flashes.forEach(flash => {
        setTimeout(() => {
            flash.style.transition = 'opacity 0.5s ease';
            flash.style.opacity    = '0';
            setTimeout(() => flash.remove(), 500);
        }, 4000);
    });
}


/* ============================================
   8. ACTIVE NAV LINK HIGHLIGHT
   Compares current URL path to each nav link href.
   Adds class "active" to the matching link.
   ============================================ */
function setupActiveNav() {
    const currentPath = window.location.pathname;
    const navLinks    = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        const linkPath = new URL(link.href).pathname;

        // Exact match OR dashboard root
        if (linkPath === currentPath ||
           (currentPath === '/' && linkPath === '/')) {
            link.classList.add('active');
        }
    });
}


/* ============================================
   9. CONFIRM DELETE (utility — use if you add delete buttons later)
   Example usage in HTML:
   <button onclick="confirmDelete('/delete/product/5', 'product')">Delete</button>
   ============================================ */
function confirmDelete(url, itemType) {
    if (confirm(`Are you sure you want to delete this ${itemType}?\nThis action cannot be undone.`)) {
        window.location.href = url;
    }
}


/* ============================================
   10. PRINT TABLE UTILITY
   Opens a print dialog with just the table content.
   Example usage: <button onclick="printTable('productsTable')">Print</button>
   ============================================ */
function printTable(tableId) {
    const table    = document.getElementById(tableId);
    if (!table) return;

    const printWin = window.open('', '_blank');
    printWin.document.write(`
        <html>
        <head>
            <title>Print</title>
            <style>
                body  { font-family: Arial, sans-serif; font-size: 12px; }
                table { border-collapse: collapse; width: 100%; }
                th    { background: #1a365d; color: white; padding: 8px; }
                td    { border: 1px solid #ddd; padding: 6px; }
                tr:nth-child(even) { background: #f5f5f5; }
            </style>
        </head>
        <body>${table.outerHTML}</body>
        </html>
    `);
    printWin.document.close();
    printWin.print();
}


/* ============================================
   HELPER: Update visible record count display
   ============================================ */
function updateCount(tableId, count) {
    // Map table IDs to their count display element IDs
    const countMap = {
        'productsTable'  : 'productCount',
        'suppliersTable' : 'supplierCount',
        'shipmentsTable' : 'shipmentCount',
        'ordersTable'    : 'orderCount',
    };

    const countElId = countMap[tableId];
    if (!countElId) return;

    const el = document.getElementById(countElId);
    if (el) {
        // Determine singular/plural label
        const label = tableId.replace('Table', '').replace(/s$/, '');
        el.textContent = `${count} ${label}(s)`;
    }
}


/* ============================================
   INITIALIZE ON DOM READY
   All setup functions run once the page loads.
   ============================================ */
document.addEventListener('DOMContentLoaded', function () {
    setupActiveNav();
    setupFlashAutoDismiss();
    setupProductPriceAutofill();

    // Add transition style to nav active link
    const style = document.createElement('style');
    style.textContent = `
        .nav-links a.active {
            color: #ffffff !important;
            font-weight: 700;
            border-bottom: 2px solid #63b3ed;
            padding-bottom: 2px;
        }
        .nav-links a {
            transition: color 0.2s, border-bottom 0.2s;
        }
    `;
    document.head.appendChild(style);

    console.log('✅ Supply Chain Tracker — JS loaded');
});