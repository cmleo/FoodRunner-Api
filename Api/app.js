const express = require('express');
const app = express();

const productRoutes = require('../Api/Routes/products');

app.use('/products', productRoutes);

module.exports = app;
