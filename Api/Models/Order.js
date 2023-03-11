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

// Hook to generate unique orderNumber before saving new order
orderSchema.pre('save', function (next) {
	const order = this;

	// Generate 6-digit random order number
	const orderNumber = Math.floor(100000 + Math.random() * 900000).toString();

	order.orderNumber = orderNumber;
	next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
