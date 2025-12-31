-- =============================
-- STORED PROCEDURES
-- =============================

DELIMITER $$

-- Tạo tài khoản
DROP PROCEDURE IF EXISTS sp_create_account $$
CREATE PROCEDURE sp_create_account(
        IN p_username VARCHAR(50),
        IN p_password VARCHAR(255),
        IN p_role VARCHAR(20)
)
BEGIN
        INSERT INTO ACCOUNT(username, password, role)
        VALUES (p_username, p_password, p_role);
END $$


-- Login: trả về (username, role) nếu đúng password
DROP PROCEDURE IF EXISTS sp_login $$
CREATE PROCEDURE sp_login(
        IN p_username VARCHAR(50),
        IN p_password VARCHAR(255)
)
BEGIN
        SELECT username, role
        FROM ACCOUNT
        WHERE username = p_username
            AND password = p_password;
END $$

-- Tạo giao dịch thanh toán: trả về transID
DROP PROCEDURE IF EXISTS sp_create_payment_transaction $$
CREATE PROCEDURE sp_create_payment_transaction(
        IN p_residentID INT,
        IN p_amount DECIMAL(18,0),
        IN p_paymentContent VARCHAR(50),
        IN p_paymentMethod VARCHAR(20),
        IN p_gatewayTransCode VARCHAR(100),
        OUT o_transID INT
)
BEGIN
        INSERT INTO PAYMENT_TRANSACTION(residentID, amount, paymentContent, paymentMethod, status, gatewayTransCode)
        VALUES (p_residentID, p_amount, p_paymentContent, p_paymentMethod, 'Pending', p_gatewayTransCode);

        SET o_transID = LAST_INSERT_ID();
END $$

-- Thêm chi tiết thanh toán cho 1 bill
DROP PROCEDURE IF EXISTS sp_add_transaction_detail $$
CREATE PROCEDURE sp_add_transaction_detail(
        IN p_transID INT,
        IN p_billID INT,
        IN p_amount DECIMAL(18,0)
)
BEGIN
        INSERT INTO TRANSACTION_DETAIL(transID, billID, amount)
        VALUES (p_transID, p_billID, p_amount);
END $$

-- Xác nhận giao dịch thành công và cập nhật các hóa đơn liên quan
DROP PROCEDURE IF EXISTS sp_mark_transaction_success $$
CREATE PROCEDURE sp_mark_transaction_success(
        IN p_transID INT
)
BEGIN
        UPDATE PAYMENT_TRANSACTION
        SET status = 'Success',
            payDate = NOW()
        WHERE transID = p_transID;

        -- Nếu mà thanh toán đủ => set Paid cho các bill trong giao dịch
        UPDATE BILL b
        JOIN TRANSACTION_DETAIL d ON d.billID = b.billID
        JOIN PAYMENT_TRANSACTION t ON t.transID = d.transID
        SET b.status = 'Paid',
                b.paymentMethod = t.paymentMethod
        WHERE d.transID = p_transID;
END $$

-- Lấy danh sách hóa đơn theo căn hộ
DROP PROCEDURE IF EXISTS sp_get_bills_by_apartment $$
CREATE PROCEDURE sp_get_bills_by_apartment(
        IN p_apartmentID VARCHAR(10)
)
BEGIN
        SELECT *
        FROM BILL
        WHERE apartmentID = p_apartmentID
        ORDER BY createDate DESC;
END $$

-- Lấy danh sách cư dân
-- Filter:
--   p_buildingID: NULL hoặc '' => không lọc theo tòa
--   p_apartmentID: NULL hoặc '' => không lọc theo căn
--   p_isOwner: NULL => không lọc; 0/1 => lọc theo chủ hộ
--   p_keyword: NULL hoặc '' => không lọc; nếu có => tìm theo fullName/phoneNumber/username
DROP PROCEDURE IF EXISTS sp_list_residents $$
CREATE PROCEDURE sp_list_residents(
        IN p_buildingID VARCHAR(10),
        IN p_apartmentID VARCHAR(10),
        IN p_isOwner TINYINT,
        IN p_keyword VARCHAR(100)
)
BEGIN
        SELECT
                r.residentID,
                r.fullName,
                r.age,
                r.date,
                r.phoneNumber,
                r.isOwner,
                r.username,
                r.apartmentID,
                a.buildingID
        FROM RESIDENT r
        LEFT JOIN APARTMENT a ON a.apartmentID = r.apartmentID
        WHERE
                (p_buildingID IS NULL OR p_buildingID = '' OR a.buildingID = p_buildingID)
            AND (p_apartmentID IS NULL OR p_apartmentID = '' OR r.apartmentID = p_apartmentID)
            AND (p_isOwner IS NULL OR r.isOwner = p_isOwner)
            AND (
                    p_keyword IS NULL OR p_keyword = ''
                    OR r.fullName LIKE CONCAT('%', p_keyword, '%')
                    OR r.phoneNumber LIKE CONCAT('%', p_keyword, '%')
                    OR r.username LIKE CONCAT('%', p_keyword, '%')
                )
        ORDER BY a.buildingID, r.apartmentID, r.isOwner DESC, r.fullName;
END $$

DELIMITER ;