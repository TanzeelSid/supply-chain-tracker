## 📦 Supply Chain & Inventory Tracker

A robust, web-based Supply Chain and Inventory Management System designed to track products, manage warehouse capacities, handle supplier relations, process purchase orders, and monitor real-time stock movements. 

This project fulfills the laboratory and project requirements for the **Database Management Systems (CS-2101)** course at **DHA Suffa University**.

---

## 🎓 Course & Developer Information
- **Developer:** Muhammad Tanzeel Siddique
- **Student ID:** CS241280
- **Class Section:** BSCS 3A (4th Semester)
- **Institution:** DHA Suffa University (DSU), Karachi
- **Course:** Database Management Systems (CS-2101)
- **Project Deadline:** June 23, 2026

---

## 🚀 Tech Stack & Environment
- **Backend:** Python 3.12 + Flask Framework
- **Database:** MariaDB / MySQL (via XAMPP for Linux)
- **Frontend:** HTML5 + CSS3 (Custom Stylesheet) + JavaScript (Jinja2 Templating Engine)
- **Operating System:** Ubuntu Linux

---

## ✨ Core Features & Database Components

### 🖥️ Web Application Features
1. **Interactive Dashboard:** Real-time metrics showing total products, active suppliers, total warehouses, open pending orders, and low-stock alerts.
2. **Stock Manager:** Visual tracking of all inventory quantities across multiple warehouses with color-coded status badges (`LOW` vs `OK`).
3. **Product Catalog:** Comprehensive interface to view and register new items with categorized reorder levels.
4. **Supplier Management:** Comprehensive directory tracking supplier contacts, locations, and performance ratings.
5. **Purchase Order Processing:** Backend automation to place and log structural transactional records using MySQL stored procedures.
6. **Shipment Log:** Tracking system for active transits and carrier assignments.

### 🗄️ Advanced Database Configurations Included
- **8 Related Tables:** Designed to ensure strict relational integrity (`Supplier`, `Warehouse`, `Product`, `Employee`, `Stock`, `Purchase_Order`, `Shipment`, `Transaction_Log`).
- **2 Dedicated Database Views:** - `LowStockAlert`: Dynamically computes stock deficits against designated reorder limits.
  - `OrderSummary`: Seamlessly joins multi-table fields for detailed invoice generation.
- **2 Stored Procedures:**
  - `PlacePurchaseOrder`: Validates transaction safety constraints and registers dynamic orders.
  - `ReceiveShipment`: Automatically transfers transit logs into on-hand stocks and alters state flags.
- **1 Automated Trigger:**
  - `AfterStockUpdate`: Monitors updates on `Stock` to seamlessly maintain a `Transaction_Log` audit trail.

---

## 📂 Project Folder Structure
```
supply_chain_tracker/
│
├── app.py                    # Main Flask application entry point
├── .env                      # Environment variables (DB password, secret key)
├── .gitignore                # Files/folders excluded from Git control
├── requirements.txt          # Python package dependency list
│
├── database/
│   ├── schema.sql            # Core DDL statements (Table creations)
│   ├── sample_data.sql       # Initial mock testing records
│   └── procedures.sql        # Highly optimized Views, Procedures, and Triggers
│
├── templates/                # Jinja2 HTML layout components
│   ├── base.html             # Master navigation and skeleton view
│   ├── index.html            # Metrics Dashboard
│   ├── stock.html            # Inventory stock tracking table
│   ├── products.html         # Product addition & ledger view
│   ├── suppliers.html        # Vendor management panel
│   ├── orders.html           # Purchase order placement form
│   └── low_stock.html        # Targeted shortage alerts interface
│
└── static/
    └── css/
        └── style.css         # Custom responsive UI styling