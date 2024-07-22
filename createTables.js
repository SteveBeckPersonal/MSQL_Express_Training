const sql = require('mssql/msnodesqlv8');
const bcrypt = require('bcryptjs');

// SQL Server configuration with Windows Authentication
const config = {
    server: 'localhost', // Update with your SQL Server instance name
    database: 'Training',
    options: {
        trustedConnection: true, // Use Windows Authentication
        trustServerCertificate: true
    },
    driver: "msnodesqlv8", 
};

async function createTables() {
    try {
        const pool = await sql.connect(config);

        const createUsersTableQuery = `
            IF NOT EXISTS (
                SELECT * 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_NAME = 'users'
            )
            CREATE TABLE users (
                id INT IDENTITY(1,1) PRIMARY KEY,
                username NVARCHAR(255) NOT NULL UNIQUE,
                password NVARCHAR(255) NOT NULL
            );
        `;

        const createProductsTableQuery = `
            IF NOT EXISTS (
                SELECT * 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_NAME = 'products'
            )
            CREATE TABLE products (
                id INT IDENTITY(1,1) PRIMARY KEY,
                name NVARCHAR(255) NOT NULL,
                price REAL NOT NULL
            );
        `;

        await pool.request().query(createUsersTableQuery);
        console.log('Users table created or already exists.');

        await pool.request().query(createProductsTableQuery);
        console.log('Products table created or already exists.');

        const adminPassword = 'admin';
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const insertAdminQuery = `
            IF NOT EXISTS (
                SELECT * 
                FROM users 
                WHERE username = 'admin'
            )
            INSERT INTO users (username, password) 
            VALUES ('admin', @password);
        `;

        await pool.request()
            .input('password', sql.NVarChar, hashedPassword)
            .query(insertAdminQuery);

        console.log('Admin user created or already exists.');

        await pool.close();
    } catch (err) {
        console.error('Error creating tables:', err.message);
    }
}

createTables();
