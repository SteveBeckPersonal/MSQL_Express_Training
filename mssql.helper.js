const sql = require('mssql/msnodesqlv8');

export class MSSQLDatabase {
  constructor(config) {
    this.config = config;
    this.pool = null;
  }

  async connect() {
    if (!this.pool) {
      try {
        this.pool = await sql.connect(this.config);
        console.log('Connected to database');
      } catch (err) {
        console.error('Could not connect to database', err);
      }
    }
  }

  async close() {
    if (this.pool) {
      try {
        await this.pool.close();
        this.pool = null;
        console.log('Database connection closed');
      } catch (err) {
        console.error('Error closing the database connection', err);
      }
    }
  }

  async runQuery(query, params = {}) {
    await this.connect();
    try {
      const request = this.pool.request();
      for (const param in params) {
        request.input(param, params[param]);
      }
      const result = await request.query(query);
      return result.recordset;
    } catch (err) {
      console.error('Error running query', err);
      throw err;
    }
  }

  async runQueryNonSelect(query, params = {}) {
    await this.connect();
    try {
      const request = this.pool.request();
      for (const param in params) {
        request.input(param, params[param]);
      }
      const result = await request.query(query);
      return result.rowsAffected;
    } catch (err) {
      console.error('Error running query', err);
      throw err;
    }
  }
}

// const config = {
//   server: 'localhost', // Update with your SQL Server instance name
//   database: 'Training',
//   options: {
//       trustedConnection: true, // Use Windows Authentication
//       trustServerCertificate: true
//   },
//   driver: "msnodesqlv8", 
// };
// const msDB = new MSSQLDatabase(config);
// const productData = await msDB.runQuery(`select * from products;`);


// const config = {
//   user: 'your_username',
//   password: 'your_password',
//   server: 'your_server', // e.g., 'localhost' or '192.168.1.1'
//   database: 'your_database_name',
//   options: {
//     encrypt: true, // Use encryption if needed (for Azure SQL Database, for example)
//     trustServerCertificate: true // Change to false if not using a self-signed certificate
//   }
// };