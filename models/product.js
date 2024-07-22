// models/product.js

/**
 * @swagger
 *  components:
 *    schemas:
 *      Product:
 *        type: object
 *        required:
 *          - name
 *          - price
 *        properties:
 *          id:
 *            type: integer
 *          name:
 *            type: string
 *          price:
 *            type: number
 */

class Product {
    constructor(id, name, price) {
        this.id = id;
        this.name = name;
        this.price = price;
    }
}

module.exports = Product;
