const express = require('express');
const app = express();
const mongoose = require('mongoose');

const productRoutes = require('../Api/Routes/products');

//Middlewares
app.use(express.json());
app.use(express.urlencoded());

app.use('/products', productRoutes);

mongoose.connect('mongodb+srv://cmleo:cmleo123@cluster0.fmaydcc.mongodb.net/?retryWrites=true&w=majority', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

module.exports = app;
