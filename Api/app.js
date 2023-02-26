const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const productRoutes = require('./Routes/products');
const restaurantRoutes = require('./Routes/restaurants');
const userRoutes = require('./Routes/users');

mongoose.connect(process.env.MONGODB_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

// ExpressMiddlewares
app.use(express.json());
app.use(express.urlencoded());

// AppMiddlewares
app.use('/products', productRoutes);
app.use('/restaurants', restaurantRoutes);
app.use('/user', userRoutes);

module.exports = app;
