const mongoose = require('mongoose');

// Define schema and model for products
const productSchema = new mongoose.Schema({
	name: String,
	description: String,
	price: Number,
});
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
