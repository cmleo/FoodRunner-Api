const express = require('express');
const app = express();
const mongoose = require('mongoose');

const productRoutes = require('../Api/Routes/products');

app.use('/products', productRoutes);

mongoose.connect('mongodb+srv://cmleo:cmleo123@cluster0.fmaydcc.mongodb.net/?retryWrites=true&w=majority', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

module.exports = app;
