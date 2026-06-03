-- ============================================
-- Supply Chain & Inventory Tracker
-- Views, Stored Procedures, and Triggers
-- DBMS Project | DHA Suffa University
-- ============================================

USE supply_chain_db;

-- ============================================
-- 1. VIEWS
-- ============================================

-- VIEW: Low Stock Alert
-- Shows all products currently below their designated reorder level
CREATE OR REPLACE VIEW LowStockAlert AS
SELECT
    p.product_id,
    p.name           AS product_name,
    p.category,
    p.reorder_level,
    w.name           AS warehouse_name,
    s.quantity       AS current_stock,
    (p.reorder_level - s.quantity) AS shortage
FROM Stock s
JOIN Product   p ON s.product_id   = p.product_id
JOIN Warehouse w ON s.warehouse_id = w.warehouse_id
WHERE s.quantity < p.reorder_level
ORDER BY shortage DESC;

-- VIEW: Order Summary
-- Combines purchase orders with supplier and product details for the frontend
CREATE OR REPLACE VIEW OrderSummary AS
SELECT
    po.po_id,
    s.name  AS supplier_name,
    p.name  AS product_name,
    po.quantity,
    po.unit_price,
    (po.quantity * po.unit_price) AS total_value,
    po.order_date,
    po.status
FROM Purchase_Order po
JOIN Supplier s ON po.supplier_id = s.supplier_id
JOIN Product  p ON po.product_id  = p.product_id
ORDER BY po.order_date DESC;


-- ============================================
-- 2. STORED PROCEDURES
-- ============================================

-- STORED PROCEDURE: Place a Purchase Order
DROP PROCEDURE IF EXISTS PlacePurchaseOrder;
DELIMITER $$
CREATE PROCEDURE PlacePurchaseOrder(
    IN p_supplier_id INT,
    IN p_product_id  INT,
    IN p_quantity    INT,
    IN p_unit_price  DECIMAL(10,2),
    IN p_expected    DATE
)
BEGIN
    -- Validate quantity
    IF p_quantity <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Quantity must be greater than zero';
    END IF;

    INSERT INTO Purchase_Order
        (supplier_id, product_id, quantity, unit_price, order_date, expected_date, status)
    VALUES
        (p_supplier_id, p_product_id, p_quantity, p_unit_price, CURDATE(), p_expected, 'Pending');

    SELECT LAST_INSERT_ID() AS new_po_id;
END $$
DELIMITER ;


-- STORED PROCEDURE: Update Stock After Shipment
-- To be invoked automatically or manually when a shipment status becomes 'Delivered'
DROP PROCEDURE IF EXISTS ReceiveShipment;
DELIMITER $$
CREATE PROCEDURE ReceiveShipment(
    IN p_shipment_id  INT,
    IN p_warehouse_id INT
)
BEGIN
    DECLARE v_product_id INT;
    DECLARE v_quantity   INT;

    -- Get product and quantity from the linked purchase order
    SELECT po.product_id, po.quantity
    INTO v_product_id, v_quantity
    FROM Shipment sh
    JOIN Purchase_Order po ON sh.po_id = po.po_id
    WHERE sh.shipment_id = p_shipment_id;

    -- Update stock (INSERT if it doesn't exist yet, otherwise increment quantity)
    INSERT INTO Stock (product_id, warehouse_id, quantity)
    VALUES (v_product_id, p_warehouse_id, v_quantity)
    ON DUPLICATE KEY UPDATE quantity = quantity + v_quantity;

    -- Mark shipment as Delivered
    UPDATE Shipment
    SET status = 'Delivered', received_date = CURDATE()
    WHERE shipment_id = p_shipment_id;

    -- Log the transaction explicitly
    INSERT INTO Transaction_Log (product_id, warehouse_id, type, quantity, notes)
    VALUES (v_product_id, p_warehouse_id, 'STOCK_IN', v_quantity,
            CONCAT('Received via Shipment #', p_shipment_id));
END $$
DELIMITER ;


-- ============================================
-- 3. TRIGGERS
-- ============================================

-- TRIGGER: Auto-log stock changes
-- Fires transparently AFTER any UPDATE event occurs on the Stock table
DROP TRIGGER IF EXISTS AfterStockUpdate;
DELIMITER $$
CREATE TRIGGER AfterStockUpdate
AFTER UPDATE ON Stock
FOR EACH ROW
BEGIN
    DECLARE v_type ENUM('STOCK_IN','STOCK_OUT','ADJUSTMENT');

    IF NEW.quantity > OLD.quantity THEN
        SET v_type = 'STOCK_IN';
    ELSEIF NEW.quantity < OLD.quantity THEN
        SET v_type = 'STOCK_OUT';
    ELSE
        SET v_type = 'ADJUSTMENT';
    END IF;

    INSERT INTO Transaction_Log (product_id, warehouse_id, type, quantity, notes)
    VALUES (
        NEW.product_id,
        NEW.warehouse_id,
        v_type,
        ABS(NEW.quantity - OLD.quantity),
        CONCAT('Stock changed from ', OLD.quantity, ' to ', NEW.quantity)
    );
END $$
DELIMITER ;