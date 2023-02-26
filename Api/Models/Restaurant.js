const mongoose = require('mongoose');

// Define schema and model for restaurants
const restaurantSchema = new mongoose.Schema({
	restaurantName: {
		type: String,
		required: true,
		unique: true,
	},
	location: {
		type: String,
		required: true,
	},
	menu: [
		{
			productName: {
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
		},
	],
});
const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
