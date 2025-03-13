const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const mongooseToSwagger = require('mongoose-to-swagger');
const Product = require('./models/Product');
const User = require('./models/User');

const productSchemaSwagger = mongooseToSwagger(Product);
const userSchemaSwagger = mongooseToSwagger(User);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Beezeelinx API',
      version: '1.0.0',
      description: 'API documentation for Beezeelinx Inventory Management',
    },
    servers: [
      {
        url: process.env.SWAGGER_SERVER_URL || 'http://localhost:3000',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Product: productSchemaSwagger,
        User: userSchemaSwagger
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ['./controllers/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };