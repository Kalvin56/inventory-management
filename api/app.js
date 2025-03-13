const express = require('express');
const cors = require('cors');
const { swaggerUi, specs } = require('./swagger');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./controllers/authController'));
app.use('/api/products', require('./controllers/productController'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

module.exports = app;