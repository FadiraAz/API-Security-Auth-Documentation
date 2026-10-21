USE review_kantin;
GO

-- ================================================================ USERS
IF NOT EXISTS (SELECT 1 FROM dbo.USERS)
BEGIN
    SET IDENTITY_INSERT dbo.USERS ON;
    INSERT INTO dbo.USERS (id, name, email, password_hash, role) VALUES
        -- admin
        (1,  N'Admin Kantin', N'admin@kantin.test',   N'hash_admin',  N'admin'),
        -- owner (1 owner per warung)
        (2,  N'Bu Tini',      N'tini@kantin.test',    N'hash_owner1', N'owner'),
        (3,  N'Pak Slamet',   N'slamet@kantin.test',  N'hash_owner2', N'owner'),
        (4,  N'Pak Makmur',   N'makmur@kantin.test',  N'hash_owner3', N'owner'),
        (5,  N'Cak Nur',      N'caknur@kantin.test',  N'hash_owner4', N'owner'),
        (6,  N'Bu Wati',      N'wati@kantin.test',    N'hash_owner5', N'owner'),
        (7,  N'Mas Bayu',     N'bayu@kantin.test',    N'hash_owner6', N'owner'),
        (8,  N'Mas Andre',    N'andre@kantin.test',   N'hash_owner7', N'owner'),
        (9,  N'Bu Inah',      N'inah@kantin.test',    N'hash_owner8', N'owner'),
        (10, N'Bu Sari',      N'sari@kantin.test',    N'hash_owner9', N'owner'),
        (11, N'Pak Hasan',    N'hasan@kantin.test',   N'hash_owner10',N'owner'),
        -- customer
        (12, N'Bagas Pratama',N'bagas@student.test',  N'hash_cust1',  N'customer'),
        (13, N'Sinta Maharani',N'sinta@student.test', N'hash_cust2',  N'customer'),
        (14, N'Yoga Saputra', N'yoga@student.test',   N'hash_cust3',  N'customer'),
        (15, N'Dewi Lestari', N'dewi@student.test',   N'hash_cust4',  N'customer');
    SET IDENTITY_INSERT dbo.USERS OFF;
    DBCC CHECKIDENT ('dbo.USERS', RESEED, 15) WITH NO_INFOMSGS;
    PRINT 'Seed USERS selesai.';
END
GO

-- =============================================================== STALLS
IF NOT EXISTS (SELECT 1 FROM dbo.STALLS)
BEGIN
    SET IDENTITY_INSERT dbo.STALLS ON;
    INSERT INTO dbo.STALLS (id, owner_id, name, category, location, description, avg_rating, review_count) VALUES
        (1,  2,  N'Warung Bu Tini',    N'Kwetiau', N'Kantin FKIP',  N'Kedai kwetiau goreng & kuah',          4.50, 2),
        (2,  9,  N'Dapur Bu Inah',     N'Nasi',    N'Kantin FKIP',  N'Nasi goreng dadakan',                  4.00, 1),
        (3,  3,  N'Kedai Pak Slamet',  N'Bakso',   N'Kantin FK',    N'Bakso urat jumbo & beranak',           4.67, 3),
        (4,  5,  N'Kedai Cak Nur',     N'Mie',     N'Kantin FK',    N'Mie ayam original & pangsit',          4.00, 1),
        (5,  4,  N'Warung Makmur',     N'Minuman', N'Kantin FEB',   N'Aneka es teh',                         4.50, 2),
        (6,  10, N'Kedai Segar',       N'Minuman', N'Kantin FEB',   N'Jus buah tanpa gula tambahan',         5.00, 1),
        (7,  7,  N'Dapur Mas Bayu',    N'Western', N'Kantin FEB',   N'Chicken steak & katsu hot plate',      4.50, 2),
        (8,  8,  N'Warung Mas Andre',  N'Sate',    N'Kantin FISIP', N'Sate ayam & kambing bumbu kacang',     4.00, 1),
        (9,  6,  N'Warung Bu Wati',    N'Soto',    N'Kantin FISIP', N'Soto ayam kuah bening',                4.50, 2),
        (10, 11, N'Dapur Pak Hasan',   N'Nasi',    N'Kantin FKIP',  N'Nasi uduk dengan aneka lauk',          4.00, 1);
    SET IDENTITY_INSERT dbo.STALLS OFF;
    DBCC CHECKIDENT ('dbo.STALLS', RESEED, 10) WITH NO_INFOMSGS;
    PRINT 'Seed STALLS selesai.';
END
GO

-- =========================================================== MENU_ITEMS
IF NOT EXISTS (SELECT 1 FROM dbo.MENU_ITEMS)
BEGIN
    SET IDENTITY_INSERT dbo.MENU_ITEMS ON;
    INSERT INTO dbo.MENU_ITEMS (id, stall_id, name, price, is_available) VALUES
        (1,  1, N'Kwetiau Goreng Spesial', 15000, 1),
        (2,  1, N'Kwetiau Kuah',           13000, 1),
        (3,  2, N'Nasi Goreng Spesial',    14000, 1),
        (4,  2, N'Nasi Goreng Telur',      12000, 1),
        (5,  3, N'Bakso Urat Jumbo',       18000, 1),
        (6,  3, N'Bakso Beranak',          25000, 1),
        (7,  4, N'Mie Ayam Original',      12000, 1),
        (8,  4, N'Mie Ayam Pangsit',       15000, 1),
        (9,  5, N'Es Teh Manis',            4000, 1),
        (10, 5, N'Es Teh Jumbo',            6000, 1),
        (11, 6, N'Jus Alpukat',            12000, 1),
        (12, 6, N'Jus Mangga',             10000, 1),
        (13, 7, N'Chicken Steak Hot Plate',25000, 1),
        (14, 7, N'Chicken Katsu',          22000, 1),
        (15, 8, N'Sate Ayam 10 Tusuk',     20000, 1),
        (16, 8, N'Sate Kambing 10 Tusuk',  30000, 1),
        (17, 9, N'Soto Ayam',              13000, 1),
        (18, 9, N'Soto Ayam + Nasi',       16000, 1),
        (19, 10, N'Nasi Uduk Komplit',     15000, 1),
        (20, 10, N'Nasi Uduk Ayam',        17000, 1);
    SET IDENTITY_INSERT dbo.MENU_ITEMS OFF;
    DBCC CHECKIDENT ('dbo.MENU_ITEMS', RESEED, 20) WITH NO_INFOMSGS;
    PRINT 'Seed MENU_ITEMS selesai.';
END
GO

-- ============================================================== REVIEWS
IF NOT EXISTS (SELECT 1 FROM dbo.REVIEWS)
BEGIN
    SET IDENTITY_INSERT dbo.REVIEWS ON;
    INSERT INTO dbo.REVIEWS (id, stall_id, user_id, rating, comment) VALUES
        (1,  1,  12, 5, N'Enak!'),
        (2,  1,  13, 4, N'Oke'),
        (3,  2,  12, 4, N'Lumayan'),
        (4,  3,  12, 5, N'Baksonya mantap'),
        (5,  3,  13, 5, N'Jumbo!'),
        (6,  3,  14, 4, N'Enak'),
        (7,  4,  13, 4, N'Standar'),
        (8,  5,  14, 5, N'Segar'),
        (9,  5,  15, 4, N'Murah'),
        (10, 6,  15, 5, N'Mantap'),
        (11, 7,  12, 5, N'Porsi besar'),
        (12, 7,  14, 4, N'Oke'),
        (13, 8,  13, 4, N'Enak'),
        (14, 9,  12, 5, N'Kuahnya enak'),
        (15, 9,  15, 4, N'Lumayan'),
        (16, 10, 14, 4, N'Oke');
    SET IDENTITY_INSERT dbo.REVIEWS OFF;
    DBCC CHECKIDENT ('dbo.REVIEWS', RESEED, 16) WITH NO_INFOMSGS;
    PRINT 'Seed REVIEWS selesai.';
END
GO

-- =============================================================== LIKES
-- Tidak ada user yang me-like review miliknya sendiri.
IF NOT EXISTS (SELECT 1 FROM dbo.LIKES)
BEGIN
    SET IDENTITY_INSERT dbo.LIKES ON;
    INSERT INTO dbo.LIKES (id, review_id, user_id) VALUES
        (1,  1,  13),
        (2,  1,  14),
        (3,  1,  15),
        (4,  2,  12),
        (5,  4,  13),
        (6,  4,  14),
        (7,  4,  15),
        (8,  5,  12),
        (9,  5,  15),
        (10, 8,  12),
        (11, 10, 13),
        (12, 11, 14),
        (13, 14, 13),
        (14, 14, 15);
    SET IDENTITY_INSERT dbo.LIKES OFF;
    DBCC CHECKIDENT ('dbo.LIKES', RESEED, 14) WITH NO_INFOMSGS;

    -- Sinkronkan REVIEWS.like_count dengan jumlah baris di LIKES
    UPDATE r
    SET r.like_count = (SELECT COUNT(*) FROM dbo.LIKES l WHERE l.review_id = r.id)
    FROM dbo.REVIEWS r;

    PRINT 'Seed LIKES selesai (like_count REVIEWS ikut disinkronkan).';
END
GO

-- =============================================================== FLAGS
-- Pelapor bukan penulis review yang dilaporkan.
IF NOT EXISTS (SELECT 1 FROM dbo.FLAGS)
BEGIN
    SET IDENTITY_INSERT dbo.FLAGS ON;
    INSERT INTO dbo.FLAGS (id, review_id, reported_by, reason, status) VALUES
        (1, 3,  13, N'Komentar kurang informatif, terkesan spam',    N'pending'),
        (2, 7,  12, N'Diduga review palsu',                          N'pending'),
        (3, 12, 13, N'Mengandung kata tidak pantas',                 N'resolved'),
        (4, 13, 14, N'Tidak sesuai dengan kantin yang direview',     N'dismissed'),
        (5, 15, 14, N'Diduga promosi terselubung',                   N'pending'),
        (6, 16, 15, N'Rating tidak sesuai dengan isi komentar',      N'resolved');
    SET IDENTITY_INSERT dbo.FLAGS OFF;
    DBCC CHECKIDENT ('dbo.FLAGS', RESEED, 6) WITH NO_INFOMSGS;
    PRINT 'Seed FLAGS selesai.';
END
GO

-- ========================================================== AUDIT_LOGS
IF NOT EXISTS (SELECT 1 FROM dbo.AUDIT_LOGS)
BEGIN
    SET IDENTITY_INSERT dbo.AUDIT_LOGS ON;
    INSERT INTO dbo.AUDIT_LOGS (id, user_id, action, target_table, target_id, metadata) VALUES
        (1, 1,  N'CREATE_USER',      N'USERS',      15, N'{"role":"customer"}'),
        (2, 1,  N'RESOLVE_FLAG',     N'FLAGS',       3, N'{"old_status":"pending","new_status":"resolved"}'),
        (3, 1,  N'DISMISS_FLAG',     N'FLAGS',       4, N'{"old_status":"pending","new_status":"dismissed"}'),
        (4, 1,  N'RESOLVE_FLAG',     N'FLAGS',       6, N'{"old_status":"pending","new_status":"resolved"}'),
        (5, 2,  N'UPDATE_STALL',     N'STALLS',      1, N'{"field":"description"}'),
        (6, 3,  N'CREATE_MENU_ITEM', N'MENU_ITEMS',  5, N'{"name":"Bakso Urat Jumbo","price":18000}'),
        (7, 12, N'CREATE_REVIEW',    N'REVIEWS',     1, N'{"rating":5}');
    SET IDENTITY_INSERT dbo.AUDIT_LOGS OFF;
    DBCC CHECKIDENT ('dbo.AUDIT_LOGS', RESEED, 7) WITH NO_INFOMSGS;
    PRINT 'Seed AUDIT_LOGS selesai.';
END
GO

PRINT 'Seed selesai.';
GO

SELECT 'USERS' AS tabel, COUNT(*) AS jumlah FROM dbo.USERS
UNION ALL SELECT 'STALLS',     COUNT(*) FROM dbo.STALLS
UNION ALL SELECT 'MENU_ITEMS', COUNT(*) FROM dbo.MENU_ITEMS
UNION ALL SELECT 'REVIEWS',    COUNT(*) FROM dbo.REVIEWS
UNION ALL SELECT 'LIKES',      COUNT(*) FROM dbo.LIKES
UNION ALL SELECT 'FLAGS',      COUNT(*) FROM dbo.FLAGS
UNION ALL SELECT 'AUDIT_LOGS', COUNT(*) FROM dbo.AUDIT_LOGS;
GO