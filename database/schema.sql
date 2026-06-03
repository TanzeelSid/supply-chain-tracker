-- ============================================
-- Supply Chain & Inventory Tracker
-- Database Schema
-- DBMS Project | DHA Suffa University
-- ============================================

USE supply_chain_db;

-- 1. Supplier Table
CREATE TABLE IF NOT EXISTS Supplier (
    supplier_id   INT          PRIMARY KEY AUTO_INCREMENT,
    name          VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20),
    email         VARCHAR(150) UNIQUE,
    city          VARCHAR(50),
    country       VARCHAR(50)  DEFAULT 'Pakistan',
    rating        DECIMAL(2,1) CHECK (rating BETWEEN 1.0 AND 5.0),
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- 2. Warehouse Table
CREATE TABLE IF NOT EXISTS Warehouse (
    warehouse_id  INT          PRIMARY KEY AUTO_INCREMENT,
    name          VARCHAR(100) NOT NULL,
    location      VARCHAR(150),
    city          VARCHAR(50),
    capacity      INT          NOT NULL COMMENT 'Max units storable',
    manager_name  VARCHAR(100),
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- 3. Product Table
CREATE TABLE IF NOT EXISTS Product (
    product_id    INT            PRIMARY KEY AUTO_INCREMENT,
    name          VARCHAR(100)   NOT NULL,
    category      VARCHAR(50),
    unit_price    DECIMAL(10,2)  NOT NULL CHECK (unit_price > 0),
    unit_of_measure VARCHAR(20)  DEFAULT 'units',
    reorder_level INT            NOT NULL DEFAULT 10 COMMENT 'Alert when stock drops below this',
    created_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
);

-- 4. Employee Table
CREATE TABLE IF NOT EXISTS Employee (
    employee_id   INT          PRIMARY KEY AUTO_INCREMENT,
    full_name     VARCHAR(100) NOT NULL,
    role          VARCHAR(50),
    email         VARCHAR(150) UNIQUE,
    warehouse_id  INT,
    hired_on      DATE,
    FOREIGN KEY (warehouse_id) REFERENCES Warehouse(warehouse_id) ON DELETE SET NULL
);

-- 5. Stock Table (links Product to Warehouse)
CREATE TABLE IF NOT EXISTS Stock (
    stock_id      INT       PRIMARY KEY AUTO_INCREMENT,
    product_id    INT       NOT NULL,
    warehouse_id  INT       NOT NULL,
    quantity      INT       NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    last_updated  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id)   REFERENCES Product(product_id)   ON DELETE CASCADE,
    FOREIGN KEY (warehouse_id) REFERENCES Warehouse(warehouse_id) ON DELETE CASCADE,
    UNIQUE KEY unique_stock (product_id, warehouse_id)
);

-- 6. Purchase Order Table
CREATE TABLE IF NOT EXISTS Purchase_Order (
    po_id         INT          PRIMARY KEY AUTO_INCREMENT,
    supplier_id   INT          NOT NULL,
    product_id    INT          NOT NULL,
    quantity      INT          NOT NULL CHECK (quantity > 0),
    unit_price    DECIMAL(10,2),
    order_date    DATE         NOT NULL DEFAULT (CURRENT_DATE),
    expected_date DATE,
    status        ENUM('Pending','Approved','Shipped','Received','Cancelled') DEFAULT 'Pending',
    FOREIGN KEY (supplier_id) REFERENCES Supplier(supplier_id) ON DELETE RESTRICT,
    FOREIGN KEY (product_id)  REFERENCES Product(product_id)   ON DELETE RESTRICT
);

-- 7. Shipment Table
CREATE TABLE IF NOT EXISTS Shipment (
    shipment_id    INT    PRIMARY KEY AUTO_INCREMENT,
    po_id          INT    NOT NULL,
    warehouse_id   INT    NOT NULL,
    shipped_date   DATE,
    received_date  DATE,
    carrier_name   VARCHAR(100),
    tracking_no    VARCHAR(100),
    status         ENUM('In Transit','Delivered','Delayed','Cancelled') DEFAULT 'In Transit',
    FOREIGN KEY (po_id)         REFERENCES Purchase_Order(po_id)    ON DELETE CASCADE,
    FOREIGN KEY (warehouse_id)  REFERENCES Warehouse(warehouse_id)  ON DELETE RESTRICT
);

-- 8. Transaction Log Table (auto-filled by trigger)
CREATE TABLE IF NOT EXISTS Transaction_Log (
    log_id       INT       PRIMARY KEY AUTO_INCREMENT,
    product_id   INT       NOT NULL,
    warehouse_id INT,
    type         ENUM('STOCK_IN','STOCK_OUT','ADJUSTMENT') NOT NULL,
    quantity     INT       NOT NULL,
    notes        VARCHAR(200),
    logged_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES Product(product_id) ON DELETE CASCADE
);