const mongoose = require('mongoose');

// Define schema and model for products
const productSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	price: {
		type: Number,
		required: true,
	},
});
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
