const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true,
	},
	restaurants: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Restaurant',
		},
	],

	logo: {
		type: String,
	},
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
