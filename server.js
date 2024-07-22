const express = require('express');
const sql = require('mssql/msnodesqlv8');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Product = require('./models/product');
const { swaggerUi, specs } = require('./swagger');

const app = express();
const port = process.env.PORT || 3002;
const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_key';

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

// Middleware
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Middleware to authenticate requests
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).send('Access Denied');

    try {
        const verified = jwt.verify(token, jwtSecret);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).send('Invalid Token');
    }
};

// Routes

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: User login
 *     description: Login a user and return a JWT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully logged in
 *       400:
 *         description: Invalid credentials
 */
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT * FROM users WHERE username = @username');

        if (result.recordset.length === 0) {
            return res.status(400).send('Invalid credentials');
        }

        const user = result.recordset[0];
        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) {
            return res.status(400).send('Invalid credentials');
        }

        const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Internal Server Error');
    }
});

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     description: Retrieve a list of all products.
 *     responses:
 *       200:
 *         description: A list of products.
 *   post:
 *     summary: Create a new product
 *     description: Create a new product with the provided name and price.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Successfully created
 */
app.get('/api/products', authenticateToken, async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT * FROM products');
        res.json(result.recordset);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/api/products', authenticateToken, async (req, res) => {
    const { name, price } = req.body;
    const product = new Product(null, name, price);
    try {
        const pool = await sql.connect(config);
        await pool.request()
            .input('name', sql.NVarChar, product.name)
            .input('price', sql.Real, product.price)
            .query('INSERT INTO products (name, price) VALUES (@name, @price)');
        res.json({ id: product.id, ...product });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Internal Server Error');
    }
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     description: Retrieve a single product by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the product to retrieve.
 *     responses:
 *       200:
 *         description: A single product.
 *       404:
 *         description: Product not found.
 */
app.get('/api/products/:id', authenticateToken, async (req, res) => {
    const productId = req.params.id;
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('id', sql.Int, productId)
            .query('SELECT * FROM products WHERE id = @id');
        if (result.recordset.length === 0) {
            res.status(404).send('Product not found');
        } else {
            res.json(result.recordset[0]);
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Internal Server Error');
    }
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete product by ID
 *     description: Delete a single product by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the product to delete.
 *     responses:
 *       204:
 *         description: Product deleted successfully.
 *       404:
 *         description: Product not found.
 */
app.delete('/api/products/:id', authenticateToken, async (req, res) => {
    const productId = req.params.id;
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('id', sql.Int, productId)
            .query('DELETE FROM products WHERE id = @id');
        if (result.rowsAffected[0] === 0) {
            res.status(404).send('Product not found');
        } else {
            res.status(204).send();
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
