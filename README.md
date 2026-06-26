# 📦 Supply Chain & Inventory Tracker

> A web-based Supply Chain & Inventory Management System built with **Python Flask** and **MySQL**.  
> Developed as a DBMS Course Project — DHA Suffa University, Karachi (2026)

---

## 🖼️ Project Preview

| Dashboard | Stock Levels | Low Stock Alerts |
|---|---|---|
| Summary cards with live DB counts | Full stock table with status badges | Auto-detected low stock via SQL VIEW |

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Python 3 + Flask |
| **Database** | MySQL 8 (via XAMPP) |
| **Frontend** | HTML5 + CSS3 + JavaScript (Jinja2 templates) |
| **Dev Tools** | VS Code / Cursor, phpMyAdmin, Git |
| **OS** | Ubuntu Linux |

---

## 📁 Project Structure

```
supply_chain_tracker/
│
├── app.py                        ← Flask app — all routes & DB logic
├── .env                          ← DB credentials (NOT uploaded to GitHub)
├── .gitignore                    ← Files excluded from Git
├── requirements.txt              ← Python dependencies
├── README.md                     ← This file
│
├── database/
│   ├── schema.sql                ← CREATE TABLE for all 8 tables
│   ├── sample_data.sql           ← Sample INSERT data
│   └── procedures.sql            ← Views, Stored Procedures, Triggers
│
├── templates/                    ← Jinja2 HTML pages
│   ├── base.html                 ← Shared layout (navbar, footer)
│   ├── index.html                ← Dashboard
│   ├── stock.html                ← Stock levels
│   ├── products.html             ← Products (view + add)
│   ├── suppliers.html            ← Suppliers (view + add)
│   ├── orders.html               ← Purchase orders (view + place)
│   ├── shipments.html            ← Shipment tracking
│   └── low_stock.html            ← Low stock alerts
│
└── static/
    ├── css/
    │   └── style.css             ← All page styling
    └── js/
        └── main.js               ← Search, sort, filter, form toggle
```

---

## ⚙️ Prerequisites

Make sure the following are installed on your Ubuntu system before running the project:

| Tool | Check Command | Install Command |
|---|---|---|
| Python 3 | `python3 --version` | `sudo apt install python3 -y` |
| pip | `pip3 --version` | `sudo apt install python3-pip -y` |
| XAMPP | Check `/opt/lampp/` exists | See setup below |
| Git | `git --version` | `sudo apt install git -y` |

---

## 🚀 Setup & Installation

### Step 1 — Clone the Repository

```bash
git clone https://github.com/TanzeelSid/supply-chain-tracker.git
cd supply-chain-tracker
```

> If you don't have Git set up yet:
> ```bash
> sudo apt install git -y
> git config --global user.name "Your Name"
> git config --global user.email "your@email.com"
> ```

---

### Step 2 — Start XAMPP (MySQL)

```bash
# Start XAMPP services (Apache + MySQL)
sudo /opt/lampp/lampp start

# Verify MySQL is running
sudo /opt/lampp/lampp status
```

Expected output:
```
XAMPP: Starting Apache...OK.
XAMPP: Starting MySQL...OK.
```

> 💡 Open phpMyAdmin in browser: `http://localhost/phpmyadmin`  
> Default login — Username: `root` | Password: *(leave blank)*

---

### Step 3 — Create the Database

**Option A — via phpMyAdmin (recommended for beginners):**

1. Open `http://localhost/phpmyadmin`
2. Click **New** in the left sidebar
3. Name: `supply_chain_db` → Collation: `utf8mb4_general_ci`
4. Click **Create**

**Option B — via terminal:**

```bash
/opt/lampp/bin/mysql -u root -e "CREATE DATABASE supply_chain_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"
```

---

### Step 4 — Load the Database

Run the three SQL files **in this exact order**:

```bash
# 1. Create all 8 tables
/opt/lampp/bin/mysql -u root supply_chain_db < database/schema.sql

# 2. Insert sample data
/opt/lampp/bin/mysql -u root supply_chain_db < database/sample_data.sql

# 3. Create views, stored procedures, trigger
/opt/lampp/bin/mysql -u root supply_chain_db < database/procedures.sql
```

Verify tables were created:
```bash
/opt/lampp/bin/mysql -u root supply_chain_db -e "SHOW TABLES;"
```

Expected output:
```
+---------------------------+
| Tables_in_supply_chain_db |
+---------------------------+
| Employee                  |
| Product                   |
| Purchase_Order            |
| Shipment                  |
| Stock                     |
| Supplier                  |
| Transaction_Log           |
| Warehouse                 |
+---------------------------+
```

> ⚠️ **If you have a MySQL root password**, add `-p` flag:
> ```bash
> /opt/lampp/bin/mysql -u root -p supply_chain_db < database/schema.sql
> ```

---

### Step 5 — Create Virtual Environment

```bash
# Create a Python virtual environment named 'venv'
python3 -m venv venv

# Activate it
source venv/bin/activate

# Your terminal prompt will now show: (venv) $
```

> To deactivate later: `deactivate`

---

### Step 6 — Install Python Dependencies

```bash
# Make sure venv is activated first
pip install -r requirements.txt
```

If `requirements.txt` is missing, install manually:

```bash
pip install flask mysql-connector-python python-dotenv
pip freeze > requirements.txt
```

---

### Step 7 — Configure Environment Variables

Create a `.env` file in the project root:

```bash
touch .env
```

Open `.env` and add the following:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=supply_chain_db
SECRET_KEY=supply_chain_secret_2026
```

> 🔒 **Important:**
> - If you set a MySQL root password in XAMPP, enter it after `DB_PASSWORD=`
> - If no password was set, leave `DB_PASSWORD=` blank
> - The `.env` file is listed in `.gitignore` — it will NOT be pushed to GitHub

---

### Step 8 — Test the Database Connection

Before running the full app, verify Flask can connect to MySQL:

```bash
python3 -c "
from dotenv import load_dotenv
import mysql.connector, os
load_dotenv()
try:
    conn = mysql.connector.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME')
    )
    print('✅ Database connected successfully!')
    conn.close()
except Exception as e:
    print(f'❌ Connection failed: {e}')
"
```

---

### Step 9 — Run the Application

```bash
python3 app.py
```

Expected terminal output:
```
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://0.0.0.0:5000
 * Press CTRL+C to quit
```

Open your browser and go to: **`http://localhost:5000`**

---

## 🌐 Application Pages

| URL | Page | Description |
|---|---|---|
| `/` | Dashboard | Summary cards — products, suppliers, warehouses, alerts |
| `/stock` | Stock Levels | All stock entries with LOW / OK status badges |
| `/products` | Products | View all products, add new product |
| `/suppliers` | Suppliers | View all suppliers, add new supplier |
| `/orders` | Purchase Orders | Place and view purchase orders |
| `/shipments` | Shipments | Track all shipment deliveries |
| `/low-stock` | Low Stock Alerts | Products below reorder level (uses SQL VIEW) |

---

## 🗄️ Database Schema Overview

```
Supplier ──────────────────────────┐
                                   ↓
Warehouse ← Employee         Purchase_Order
    ↑                               ↓
    │                           Shipment
    │                               ↓
    └──── Stock ←──── Product ──────┘
               ↓
         Transaction_Log  ← (auto-filled by TRIGGER)
```

### Tables Summary

| Table | Purpose |
|---|---|
| `Supplier` | Companies that supply products |
| `Warehouse` | Physical storage locations |
| `Product` | Items tracked in inventory |
| `Employee` | Staff assigned to warehouses |
| `Stock` | Current quantity of each product per warehouse |
| `Purchase_Order` | Orders placed with suppliers |
| `Shipment` | Delivery tracking for each order |
| `Transaction_Log` | Auto-audit log (filled by trigger on stock update) |

---

## 🔧 SQL Features Implemented

| Feature | Name | Purpose |
|---|---|---|
| **VIEW** | `LowStockAlert` | Shows all products with quantity below reorder level |
| **VIEW** | `OrderSummary` | Joins orders with supplier and product names |
| **STORED PROCEDURE** | `PlacePurchaseOrder` | Validates and inserts a new purchase order |
| **STORED PROCEDURE** | `ReceiveShipment` | Updates stock and marks shipment as delivered |
| **TRIGGER** | `AfterStockUpdate` | Auto-logs every stock change into Transaction_Log |

---

## 🐛 Troubleshooting

### ❌ `ModuleNotFoundError: No module named 'flask'`
Virtual environment not activated.
```bash
source venv/bin/activate
```

---

### ❌ `Access denied for user 'root'@'localhost'`
Wrong password in `.env` file.
```bash
# Check your .env file
cat .env

# Test MySQL login directly
/opt/lampp/bin/mysql -u root -p
```

---

### ❌ `Can't connect to MySQL server on 'localhost'`
XAMPP MySQL is not running.
```bash
sudo /opt/lampp/lampp start
sudo /opt/lampp/lampp status
```

---

### ❌ `Table 'supply_chain_db.Stock' doesn't exist`
SQL files were not loaded. Re-run them:
```bash
/opt/lampp/bin/mysql -u root supply_chain_db < database/schema.sql
/opt/lampp/bin/mysql -u root supply_chain_db < database/sample_data.sql
/opt/lampp/bin/mysql -u root supply_chain_db < database/procedures.sql
```

---

### ❌ `Address already in use — Port 5000`
Another process is using port 5000.
```bash
# Kill the process using port 5000
kill $(lsof -ti:5000)

# Then run again
python3 app.py
```

---

### ❌ XAMPP MySQL conflicts with system MySQL
```bash
# Stop system MySQL first, then start XAMPP
sudo systemctl stop mysql
sudo /opt/lampp/lampp start
```

---

### ❌ `TemplateNotFound: index.html`
HTML files not inside the `templates/` folder. Check structure:
```bash
ls templates/
# Should list: base.html, index.html, stock.html, etc.
```

---

## 📋 Daily Development Workflow

```bash
# 1. Start MySQL
sudo /opt/lampp/lampp start

# 2. Go to project folder
cd ~/supply_chain_tracker

# 3. Activate virtual environment
source venv/bin/activate

# 4. Run the Flask app
python3 app.py

# 5. Open browser
# http://localhost:5000

# 6. When done — stop the app
# Press CTRL + C

# 7. Deactivate venv (optional)
deactivate
```

---

## 🔁 Git Workflow

```bash
# Check status of changed files
git status

# Stage all changes
git add .

# Commit with a meaningful message
git commit -m "Add: low stock alert view"

# Push to GitHub
git push
```

---

## 👥 Team Members

| Name | Role | Student ID |
|---|---|---|
| Muhammad Tanzeel Siddique | Database Design + Backend | CS241280 |
| Hussain Abbas | Database Design + Backend | CS241040 |
| Haani Raza | Frontend + SQL Queries | CS241010 |
| Azhan Nadeem Malik | Testing + Report | CS241201 |

---

## 📄 License

This project is developed for academic purposes at **DHA Suffa University, Karachi**.  
Not intended for commercial use.

---

## 🔮 Future Scope

- ☁️ Deploy MySQL to **AWS RDS** for cloud-hosted database
- 🐳 Containerize with **Docker** for portable deployment
- 📊 Add **Chart.js** dashboard with live inventory graphs
- 🔔 Email alerts via **SMTP** when stock drops below reorder level
- 🔐 User authentication with **Flask-Login**
- 🚀 CI/CD pipeline using **GitHub Actions**

---

*DBMS Project — CS-2101 | 4th Semester | DHA Suffa University | June 2026*
