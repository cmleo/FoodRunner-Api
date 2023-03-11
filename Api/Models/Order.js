const mongoose = require('mongoose');

// Define schema and model for orders
const orderSchema = new mongoose.Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	orderNumber: { type: String, unique: true, maxLength: 6 },
	order: [
		{
			productName: { type: String, required: true },
			quantity: { type: Number, default: 1 },
			price: { type: Number, required: true },
		},
	],
	deliveryAddress: { type: String, required: true },
	totalPrice: { type: Number, required: true },
	timestamp: { type: Date, default: Date.now },
});
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
