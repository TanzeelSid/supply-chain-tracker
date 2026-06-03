USE supply_chain_db;

-- Suppliers
INSERT INTO Supplier (name, contact_phone, email, city, rating) VALUES
('TechParts Ltd',     '0300-1234567', 'tech@parts.pk',   'Karachi',   4.5),
('FastSupply Co',     '0321-9876543', 'fast@supply.pk',  'Lahore',    4.0),
('GlobalGoods Inc',   '0333-1112233', 'global@goods.pk', 'Islamabad', 3.8),
('QuickStock PK',     '0311-5556677', 'quick@stock.pk',  'Karachi',   4.7),
('Prime Distributors','0301-4445566', 'prime@dist.pk',   'Peshawar',  3.5);

-- Warehouses
INSERT INTO Warehouse (name, location, city, capacity, manager_name) VALUES
('Main Hub',       'Korangi Industrial Area', 'Karachi',   5000, 'Asim Raza'),
('North Depot',    'Gulberg III',             'Lahore',    3000, 'Sana Khan'),
('Capital Store',  'Blue Area',               'Islamabad', 2000, 'Bilal Ahmed'),
('South Facility', 'SITE Area',               'Karachi',   4000, 'Nadia Malik');

-- Products
INSERT INTO Product (name, category, unit_price, unit_of_measure, reorder_level) VALUES
('USB-C Cable 1m',      'Electronics',  250.00, 'pcs',  50),
('A4 Paper Ream',       'Stationery',   450.00, 'ream', 30),
('Bubble Wrap Roll',    'Packaging',    800.00, 'roll', 20),
('HDMI Cable 2m',       'Electronics',  350.00, 'pcs',  40),
('Thermal Label 100mm', 'Packaging',    600.00, 'roll', 25),
('Ball Pen Blue (Box)', 'Stationery',   120.00, 'box',  60),
('Ethernet Cable Cat6', 'Electronics',  300.00, 'pcs',  35),
('Cardboard Box 12x12', 'Packaging',    180.00, 'pcs',  80);

-- Employees
INSERT INTO Employee (full_name, role, email, warehouse_id, hired_on) VALUES
('Farhan Siddiqui', 'Stock Manager',  'farhan@sc.pk',  1, '2023-01-15'),
('Ayesha Tariq',    'Logistics Lead', 'ayesha@sc.pk',  2, '2022-06-01'),
('Omar Sheikh',     'Warehouse Exec', 'omar@sc.pk',    3, '2023-03-20'),
('Zara Hussain',    'Stock Manager',  'zara@sc.pk',    4, '2021-11-10'),
('Ahmed Nawaz',     'Data Analyst',   'ahmed@sc.pk',   1, '2024-01-08');

-- Stock (product in warehouse)
INSERT INTO Stock (product_id, warehouse_id, quantity) VALUES
(1, 1, 200), (1, 2,  80),
(2, 1, 150), (2, 3,  40),
(3, 1,  25), (3, 4,  15),   -- 15 is below reorder_level=20 → alert!
(4, 1, 120), (4, 2,  55),
(5, 1,  18), (5, 4,  30),   -- 18 is below reorder_level=25 → alert!
(6, 2, 300), (6, 3, 180),
(7, 1,  10), (7, 2,  22),   -- 10 is below reorder_level=35 → alert!
(8, 1, 500), (8, 4, 210);

-- Purchase Orders
INSERT INTO Purchase_Order (supplier_id, product_id, quantity, unit_price, order_date, expected_date, status) VALUES
(1, 3, 100, 750.00, '2026-05-01', '2026-05-10', 'Received'),
(2, 7, 200, 280.00, '2026-05-15', '2026-05-25', 'Shipped'),
(3, 5,  50, 580.00, '2026-05-20', '2026-06-01', 'Pending'),
(4, 1, 500, 230.00, '2026-05-22', '2026-06-05', 'Approved'),
(1, 8, 300, 170.00, '2026-05-25', '2026-06-10', 'Pending');

-- Shipments
INSERT INTO Shipment (po_id, warehouse_id, shipped_date, received_date, carrier_name, tracking_no, status) VALUES
(1, 1, '2026-05-02', '2026-05-09', 'TCS Courier',  'TCS123456', 'Delivered'),
(2, 2, '2026-05-16', NULL,          'Leopards',     'LEO789012', 'In Transit'),
(4, 1, '2026-05-23', NULL,          'M&P Express',  'MNP345678', 'In Transit');