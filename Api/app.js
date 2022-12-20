const express = require('express');
const app = express();
const mongoose = require('mongoose');

const productRoutes = require('./Routes/products');
const userRoutes = require('./Routes/users');

// ExpressMiddlewares
app.use(express.json());
app.use(express.urlencoded());

// AppMiddlewares
app.use('/products', productRoutes);
app.use('/user', userRoutes);

mongoose.connect('mongodb+srv://cmleo:cmleo123@cluster0.fmaydcc.mongodb.net/?retryWrites=true&w=majority', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

module.exports = app;
