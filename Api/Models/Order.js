const mongoose = require('mongoose');

// Define schema and model for orders
const orderSchema = new mongoose.Schema({
	user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	restaurant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
	items: [
		{
			product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
			name: { type: String, required: true },
			price: { type: Number, required: true },
			quantity: { type: Number, default: 1 },
		},
	],
	delivery_address: { type: String, required: true },
	total_price: { type: Number, required: true },
});
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
