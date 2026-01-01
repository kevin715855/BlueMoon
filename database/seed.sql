-- =============================
-- SEED DATA (Dữ liệu mẫu)
-- Note: pass bên dưới là demo thôi mấy con gà :>
-- =============================

-- ACCOUNT
INSERT INTO ACCOUNT (username, password, role) VALUES
    ('admin',      'demo$admin123',      'Admin'),
    ('manager_a',  'demo$manager123',    'Manager'),
    ('manager_b',  'demo$manager123',    'Manager'),
    ('acc_01',     'demo$acc123',        'Accountant'),
    ('res_01',     'demo$res123',        'Resident'),
    ('res_02',     'demo$res123',        'Resident'),
    ('res_03',     'demo$res123',        'Resident'),
    ('res_04',     'demo$res123',        'Resident'),
    ('res_05',     'demo$res123',        'Resident'), 
    ('res_06',     'demo$res123',        'Resident');

-- BUILDING_MANAGER
INSERT INTO BUILDING_MANAGER (managerID, name, phoneNumber, username) VALUES
    (1, 'Nguyễn Văn Quản Lý A', '0900000001', 'manager_a'),
    (2, 'Trần Thị Quản Lý B',  '0900000002', 'manager_b');

-- ACCOUNTANT
INSERT INTO ACCOUNTANT (accountantID, username) VALUES
    (1, 'acc_01');

-- BUILDING
INSERT INTO BUILDING (buildingID, managerID, address, numApartment) VALUES
    ('A', 1, 'Tòa A - BlueMoon', 6),
    ('B', 2, 'Tòa B - BlueMoon', 6);

-- APARTMENT
INSERT INTO APARTMENT (apartmentID, buildingID, numResident) VALUES
    ('A101', 'A', 2),
    ('A102', 'A', 1),
    ('A103', 'A', 1),
    ('A201', 'A', 1),
    ('B101', 'B', 2),
    ('B102', 'B', 1);

-- RESIDENT
INSERT INTO RESIDENT (residentID, apartmentID, fullName, age, date, phoneNumber, isOwner, username) VALUES
    (1, 'A101', 'Lê Văn An',    35, '1990-01-02', '0911111111', 1, 'res_01'),
    (2, 'A101', 'Phạm Thị Bình',31, '1994-03-05', '0922222222', 0, 'res_02'),
    (3, 'A102', 'Ngô Văn Cường',28, '1997-04-10', '0933333333', 1, 'res_03'),
    (4, 'A103', 'Đặng Thị Dung',26, '1999-07-20', '0944444444', 1, 'res_04'),
    (5, 'B101', 'Vũ Văn Em',    40, '1985-09-12', '0955555555', 1, 'res_05'),
    (6, 'B101', 'Hoàng Thị Giang',38,'1987-11-30', '0966666666', 0, 'res_06');

-- SERVICE_FEE
INSERT INTO SERVICE_FEE (serviceID, serviceName, unitPrice, buildingID) VALUES
    (1, 'Phí quản lý', 200000, 'A'),
    (2, 'Phí gửi xe',  100000, 'A'),
    (3, 'Phí quản lý', 180000, 'B'),
    (4, 'Phí gửi xe',  120000, 'B');

-- BILL
INSERT INTO BILL (billID, apartmentID, accountantID, createDate, deadline, typeOfBill, amount, total, status, paymentMethod) VALUES
    (1, 'A101', 1, '2025-12-01 08:00:00', '2025-12-10', 'Điện',     350000, 350000, 'Unpaid', NULL),
    (2, 'A101', 1, '2025-12-01 08:00:00', '2025-12-10', 'Nước',     120000, 120000, 'Unpaid', NULL),
    (3, 'A102', 1, '2025-12-01 08:00:00', '2025-12-10', 'Phí quản lý',200000,200000,'Paid',  'Cash'),
    (4, 'A103', 1, '2025-12-01 08:00:00', '2025-12-10', 'Phí gửi xe',100000,100000,'Unpaid', NULL),
    (5, 'B101', 1, '2025-12-01 08:00:00', '2025-12-10', 'Điện',     420000, 420000, 'Unpaid', NULL),
    (6, 'B101', 1, '2025-12-01 08:00:00', '2025-12-10', 'Nước',     150000, 150000, 'Unpaid', NULL);

-- PAYMENT_TRANSACTION + TRANSACTION_DETAIL
INSERT INTO PAYMENT_TRANSACTION (transID, residentID, amount, paymentContent, paymentMethod, status, createdDate, payDate, gatewayTransCode)
VALUES
    (1, 1, 470000, 'Thanh toan bill A101', 'SePay', 'Success', '2025-12-05 10:00:00', '2025-12-05 10:01:00', 'GATEWAY-DEMO-0001');

INSERT INTO TRANSACTION_DETAIL (detailID, transID, billID, amount) VALUES
    (1, 1, 1, 350000),
    (2, 1, 2, 120000);

-- Cập nhật hóa đơn đã được thanh toán qua giao dịch demo
UPDATE BILL SET status='Paid', paymentMethod='SePay' WHERE billID IN (1, 2);