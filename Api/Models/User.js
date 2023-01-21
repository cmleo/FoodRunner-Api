const mongoose = require('mongoose');

// Define schema and model for users
const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
		match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
	},
	password: {
		type: String,
		required: true,
	},
	phone: {
		type: String,
		required: true,
		unique: true,
	},
	orders: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Order',
		},
	],
});
const User = mongoose.model('User', userSchema);

module.exports = User;
