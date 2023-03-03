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
	const menuItems = req.body.menu.map((menuItem) => {
		return {
			productName: menuItem.productName,
			description: menuItem.description,
			price: menuItem.price,
		};
	});

	const restaurant = new Restaurant({
		restaurantName: req.body.restaurantName,
		location: req.body.location,
		menu: menuItems,
	});

	restaurant
		.save()
		.then((savedRestaurant) => {
			res.status(201).json({
				message: 'Created restaurant successfully',
				createdRestaurant: savedRestaurant,
			});
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
			});
		});
});

// Delete restaurant by id
router.delete('/:restaurantId', checkAuth, (req, res, next) => {
	Restaurant.remove({ _id: req.params.restaurantId })
		.exec()
		.then((result) => {
			res.status(200).json({
				message: 'Restaurant deleted',
				result: result,
			});
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				error: err,
			});
		});
});

// Update a restaurant by id
router.patch('/:restaurantId', (req, res) => {
	const restaurantId = req.params.restaurantId;

	const menuItems = req.body.menu.map((menuItem) => {
		return {
			productName: menuItem.productName,
			description: menuItem.description,
			price: menuItem.price,
		};
	});

	Restaurant.updateOne(
		{ _id: restaurantId },
		{
			$set: {
				restaurantName: req.body.restaurantName,
				location: req.body.location,
				menu: menuItems,
			},
		}
	)
		.exec()
		.then((updatedRestaurant) => {
			res.status(200).json({
				message: 'Updated restaurant successfully',
				updatedRestaurant: updatedRestaurant,
			});
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
			});
		});
});

module.exports = router;
