USE master;
GO

-- 1) Cek apakah instance masih Windows-only.
--    1 = SQL Authentication mati, 0 = mixed mode aktif.
SELECT
    SERVERPROPERTY('IsIntegratedSecurityOnly') AS windows_only,
    SERVERPROPERTY('InstanceName')             AS instance_name;
GO

-- 2) Aktifkan mixed mode (SQL Server + Windows Authentication).
--    LoginMode: 1 = Windows only, 2 = Mixed.
--    Path registry di bawah berlaku untuk DEFAULT instance (localhost).
--    Untuk named instance (mis. .\SQLEXPRESS), aktifkan lewat SSMS:
--    Server Properties -> Security -> "SQL Server and Windows Authentication mode".
EXEC xp_instance_regwrite
     N'HKEY_LOCAL_MACHINE',
     N'Software\Microsoft\MSSQLServer\MSSQLServer',
     N'LoginMode',
     REG_DWORD,
     2;
GO
