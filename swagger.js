// swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Products API',
            version: '1.0.0',
            description: 'A simple API for managing products',
        },
    },
    apis: ['server.js'],
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
