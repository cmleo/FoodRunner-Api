const mongoose = require('mongoose');

// Define schema and model for restaurants
const restaurantSchema = new mongoose.Schema({
	restaurantName: { type: String, required: true },
	location: { type: String, required: true },
	menu: [
		{
			productName: { type: String, unique: true },
			description: { type: String, unique: true },
			price: { type: Number },
		},
	],
});
const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
