const mongoose = require('mongoose');

// Define schema and model for restaurants
const restaurantSchema = new mongoose.Schema({
	name: { type: String, required: true },
	location: { type: String, required: true },
	menu: [
		{
			product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
			name: { type: String, required: true },
			description: { type: String, required: true },
			price: { type: Number, required: true },
		},
	],
});
const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
