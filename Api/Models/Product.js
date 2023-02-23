const mongoose = require('mongoose');

// Define schema and model for products
const productSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	restaurant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
	name: {
		type: String,
		required: true,
		unique: true,
	},
	description: {
		type: String,
		required: true,
		unique: true,
	},
	price: {
		type: Number,
		required: true,
	},
});
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
