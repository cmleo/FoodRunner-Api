const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Restaurant = require('../Models/Restaurant');
const checkAuth = require('../Middlewares/check-auth');

// Get all restaurants
router.get('/', (req, res, next) => {
	Restaurant.find()
		.exec()
		.then((docs) => {
			res.status(200).json(docs);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				error: err,
			});
		});
});

// Create a new restaurant
router.post('/', checkAuth, (req, res, next) => {
	const restaurant = new Restaurant({
		restaurantName: req.body.restaurantName,
		location: req.body.location,
		menu: [
			{
				productName: req.body.productName,
				description: req.body.description,
				price: req.body.price,
			},
		],
	});
	restaurant
		.save()
		.then((result) => {
			res.status(201).json({
				message: 'Created restaurant successfully',
				createdRestaurant: result,
			});
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
				console: console.log(req.body),
			});
		});
});

module.exports = router;
