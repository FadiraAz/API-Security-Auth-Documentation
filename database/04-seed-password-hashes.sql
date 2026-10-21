USE review_kantin;
GO

-- =====================================================================
-- Tugas 3: ganti password seed dengan hash bcrypt ASLI.
--
-- 03-seed.sql mengisi password_hash dengan placeholder (N'hash_admin', dst.)
-- yang BUKAN hash bcrypt, sehingga POST /auth/login selalu gagal.
-- Skrip ini mengganti semuanya. Semua akun seed memakai password: rahasia123
--
-- Jalankan SETELAH 03-seed.sql. Aman diulang (idempotent, hanya UPDATE).
--   admin    : admin@kantin.test
--   owner    : tini@kantin.test (pemilik Warung Bu Tini, stall id 1), slamet@kantin.test (stall id 3), dst.
--   customer : bagas@student.test, sinta@student.test, yoga@student.test, dewi@student.test
-- =====================================================================
IF EXISTS (SELECT 1 FROM dbo.USERS)
BEGIN
    UPDATE dbo.USERS SET password_hash = N'$2b$10$wMWlQrlYbIi6EblM4gHdjuYoUFuAy7MSIZzoMzF8x7ZKAbA7Cgqcq' WHERE email = N'admin@kantin.test'; -- admin
    UPDATE dbo.USERS SET password_hash = N'$2b$10$VRaCOHOO9MDGLgI7d/KweeuI8xKiWD5Q.Xq5YYEeMedgersOAi09m' WHERE email = N'tini@kantin.test'; -- owner
    UPDATE dbo.USERS SET password_hash = N'$2b$10$osFGAJJXI8JE6OQtBPtD1u1lnJ3nqVjDlPG943DPCgLSOBSZwRt4.' WHERE email = N'slamet@kantin.test'; -- owner
    UPDATE dbo.USERS SET password_hash = N'$2b$10$li0rZI1b4A638UVOC9sJCORX61RkXmT9Lr0N8PKwp6.7lGksbiuVG' WHERE email = N'makmur@kantin.test'; -- owner
    UPDATE dbo.USERS SET password_hash = N'$2b$10$UjP/LOYsF/ukkw05D1HJpOSspqXfmpPdduVdF/ICifpNvlZdFC4/2' WHERE email = N'caknur@kantin.test'; -- owner
    UPDATE dbo.USERS SET password_hash = N'$2b$10$fvDKcFg3n0EDtmlxEdlfTuYDLU5ze6Lue3KnO9ssO35rDcb2CDA0e' WHERE email = N'wati@kantin.test'; -- owner
    UPDATE dbo.USERS SET password_hash = N'$2b$10$YF1nkQLaUh78jeb9yW9nWutpTgAcobu8hLFIBRWeMxBFFdVHuYPnO' WHERE email = N'bayu@kantin.test'; -- owner
    UPDATE dbo.USERS SET password_hash = N'$2b$10$Z0gqEFw2qzSA8YPcPCRu8ehIvWfSwpIxaoSiR3.sF1a6zVnCa.6K.' WHERE email = N'andre@kantin.test'; -- owner
    UPDATE dbo.USERS SET password_hash = N'$2b$10$guaD1mWyll1aheVQM6rgiuRKzdiyz/sGGhJHHnoJE8D9WRVZAYn8a' WHERE email = N'inah@kantin.test'; -- owner
    UPDATE dbo.USERS SET password_hash = N'$2b$10$83EghAK8zmX68q.EEwWCoeUvtF07mpHF8Y/Q/Fp3dD3ug3Hs64Cmm' WHERE email = N'sari@kantin.test'; -- owner
    UPDATE dbo.USERS SET password_hash = N'$2b$10$na4bluRGnL95rmQ6mcmaueyOLo/8Fp9wPBnrzVlYdQsf/DmtcOQNa' WHERE email = N'hasan@kantin.test'; -- owner
    UPDATE dbo.USERS SET password_hash = N'$2b$10$yblh/M9Paci8Ho6XZwvw9OD4ATrN.7hL4FYHiJx1yUZQBUuS.ahN.' WHERE email = N'bagas@student.test'; -- customer
    UPDATE dbo.USERS SET password_hash = N'$2b$10$vSDHMn7VZd0Nb32qmKQo0ONAum9JKUmSLe3O3V/8FABS0Q8cVLA.W' WHERE email = N'sinta@student.test'; -- customer
    UPDATE dbo.USERS SET password_hash = N'$2b$10$kRWRUC.6CUnbfP17a8bzjOxsM9W.WxxpFCSRaCd5SyIPZ9rT8X9V6' WHERE email = N'yoga@student.test'; -- customer
    UPDATE dbo.USERS SET password_hash = N'$2b$10$5D66CfaJEAINgZ8toQEhzun9Qhs3kOjPrlHDXBHo2KKVNJVTmp5tS' WHERE email = N'dewi@student.test'; -- customer

    -- Verifikasi: semua kolom password_hash HARUS diawali '$2b$10$' (bukan 'hash_...').
    SELECT id, email, role, LEFT(password_hash, 7) AS hash_prefix FROM dbo.USERS ORDER BY id;
END
ELSE
BEGIN
    PRINT 'Tabel dbo.USERS kosong. Jalankan 02-schema.sql dan 03-seed.sql lebih dulu.';
END
GO
