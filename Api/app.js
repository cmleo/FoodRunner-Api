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

mongoose.connect(process.env.MONGODB_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

module.exports = app;
