# ============================================
# app.py — Supply Chain & Inventory Tracker
# Flask Application Entry Point
# ============================================

from flask import Flask, render_template, request, redirect, url_for, flash
import mysql.connector
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'dev_secret_key')


# ============================================
# DATABASE CONNECTION HELPER
# Call this function whenever you need DB access
# ============================================
def get_db_connection():
    """Returns a MySQL connection object."""
    conn = mysql.connector.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        port=int(os.getenv('DB_PORT', 3306)),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', ''),
        database=os.getenv('DB_NAME', 'supply_chain_db')
    )
    return conn


# ============================================
# ROUTE: Dashboard / Home Page
# ============================================
@app.route('/')
def dashboard():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Total products
    cursor.execute("SELECT COUNT(*) AS total FROM Product")
    total_products = cursor.fetchone()['total']

    # Total suppliers
    cursor.execute("SELECT COUNT(*) AS total FROM Supplier")
    total_suppliers = cursor.fetchone()['total']

    # Total warehouses
    cursor.execute("SELECT COUNT(*) AS total FROM Warehouse")
    total_warehouses = cursor.fetchone()['total']

    # Low stock count (using the view)
    cursor.execute("SELECT COUNT(*) AS total FROM LowStockAlert")
    low_stock_count = cursor.fetchone()['total']

    # Pending orders
    cursor.execute("SELECT COUNT(*) AS total FROM Purchase_Order WHERE status='Pending'")
    pending_orders = cursor.fetchone()['total']

    # Recent 5 transactions
    cursor.execute("""
        SELECT tl.log_id, p.name AS product_name, tl.type, tl.quantity, tl.logged_at
        FROM Transaction_Log tl
        JOIN Product p ON tl.product_id = p.product_id
        ORDER BY tl.logged_at DESC LIMIT 5
    """)
    recent_transactions = cursor.fetchall()

    cursor.close()
    conn.close()

    return render_template('index.html',
        total_products=total_products,
        total_suppliers=total_suppliers,
        total_warehouses=total_warehouses,
        low_stock_count=low_stock_count,
        pending_orders=pending_orders,
        recent_transactions=recent_transactions
    )


# ============================================
# ROUTE: Stock Levels Page
# ============================================
@app.route('/stock')
def stock():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT s.stock_id, p.name AS product_name, p.category,
               w.name AS warehouse_name, w.city,
               s.quantity, p.reorder_level,
               CASE WHEN s.quantity < p.reorder_level THEN 'LOW' ELSE 'OK' END AS stock_status,
               s.last_updated
        FROM Stock s
        JOIN Product   p ON s.product_id   = p.product_id
        JOIN Warehouse w ON s.warehouse_id = w.warehouse_id
        ORDER BY stock_status DESC, p.name
    """)
    stocks = cursor.fetchall()

    cursor.close()
    conn.close()

    return render_template('stock.html', stocks=stocks)


# ============================================
# ROUTE: Products Page (View + Add)
# ============================================
@app.route('/products', methods=['GET', 'POST'])
def products():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == 'POST':
        # Add new product
        name    = request.form['name']
        category = request.form['category']
        price   = request.form['unit_price']
        uom     = request.form['unit_of_measure']
        reorder = request.form['reorder_level']

        cursor.execute("""
            INSERT INTO Product (name, category, unit_price, unit_of_measure, reorder_level)
            VALUES (%s, %s, %s, %s, %s)
        """, (name, category, price, uom, reorder))
        conn.commit()
        flash('Product added successfully!', 'success')
        return redirect(url_for('products'))

    cursor.execute("SELECT * FROM Product ORDER BY created_at DESC")
    products_list = cursor.fetchall()

    cursor.close()
    conn.close()

    return render_template('products.html', products=products_list)


# ============================================
# ROUTE: Suppliers Page
# ============================================
@app.route('/suppliers', methods=['GET', 'POST'])
def suppliers():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == 'POST':
        cursor.execute("""
            INSERT INTO Supplier (name, contact_phone, email, city, rating)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            request.form['name'],
            request.form['contact_phone'],
            request.form['email'],
            request.form['city'],
            request.form['rating']
        ))
        conn.commit()
        flash('Supplier added!', 'success')
        return redirect(url_for('suppliers'))

    cursor.execute("SELECT * FROM Supplier ORDER BY name")
    suppliers_list = cursor.fetchall()

    cursor.close()
    conn.close()

    return render_template('suppliers.html', suppliers=suppliers_list)


# ============================================
# ROUTE: Purchase Orders Page
# ============================================
@app.route('/orders', methods=['GET', 'POST'])
def orders():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == 'POST':
        # Use stored procedure to place order
        cursor.callproc('PlacePurchaseOrder', [
            int(request.form['supplier_id']),
            int(request.form['product_id']),
            int(request.form['quantity']),
            float(request.form['unit_price']),
            request.form['expected_date']
        ])
        conn.commit()
        flash('Purchase order placed!', 'success')
        return redirect(url_for('orders'))

    # Use the OrderSummary view
    cursor.execute("SELECT * FROM OrderSummary")
    orders_list = cursor.fetchall()

    # For dropdowns in the form
    cursor.execute("SELECT supplier_id, name FROM Supplier ORDER BY name")
    suppliers_list = cursor.fetchall()

    cursor.execute("SELECT product_id, name, unit_price FROM Product ORDER BY name")
    products_list = cursor.fetchall()

    cursor.close()
    conn.close()

    return render_template('orders.html',
        orders=orders_list,
        suppliers=suppliers_list,
        products=products_list
    )


# ============================================
# ROUTE: Shipments Page
# ============================================
@app.route('/shipments')
def shipments():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT sh.shipment_id, sh.status, sh.shipped_date, sh.received_date,
               sh.carrier_name, sh.tracking_no,
               p.name  AS product_name,
               s.name  AS supplier_name,
               w.name  AS warehouse_name,
               po.quantity
        FROM Shipment sh
        JOIN Purchase_Order po ON sh.po_id       = po.po_id
        JOIN Product        p  ON po.product_id  = p.product_id
        JOIN Supplier       s  ON po.supplier_id = s.supplier_id
        JOIN Warehouse      w  ON sh.warehouse_id= w.warehouse_id
        ORDER BY sh.shipped_date DESC
    """)
    shipments_list = cursor.fetchall()

    cursor.close()
    conn.close()

    return render_template('shipments.html', shipments=shipments_list)


# ============================================
# ROUTE: Low Stock Alerts (uses VIEW)
# ============================================
@app.route('/low-stock')
def low_stock():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM LowStockAlert")
    alerts = cursor.fetchall()

    cursor.close()
    conn.close()

    return render_template('low_stock.html', alerts=alerts)


# ============================================
# MAIN — Run the App
# ============================================
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)