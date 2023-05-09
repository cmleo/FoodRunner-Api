const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

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
			image: {
				type: String,
			},
		},
	],
	logo: {
		type: String,
	},
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},

	created_at: {
		type: Date,
		default: Date.now,
	},
});

restaurantSchema.plugin(mongoosePaginate);

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
