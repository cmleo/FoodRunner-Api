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
		.then((createdRestaurant) => {
			res.status(201).json({
				message: 'Created restaurant successfully',
				result: createdRestaurant,
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
		.then(() => res.status(204).json({ message: 'Restaurant deleted' }))
		.catch((err) => {
			res.status(500).json({
				error: err,
			});
		});
});

// Delete a product by its id
router.delete('/:restaurantId/:productId', checkAuth, (req, res, next) => {
	const { restaurantId, productId } = req.params;

	Restaurant.updateOne({ _id: restaurantId }, { $pull: { menu: { _id: productId } } })
		.exec()
		.then(() => res.status(204).json({ message: 'Product deleted' }))
		.catch((err) => {
			res.status(500).json({
				error: err,
			});
		});
});

// Update a restaurant by IDs
router.patch('/:restaurantId/:productId?', checkAuth, (req, res) => {
	const { restaurantId, productId } = req.params;
	const updateObj = {};

	Object.keys(req.body).forEach((key) => {
		if (key === 'restaurantName' || key === 'location') {
			updateObj[key] = req.body[key];
		} else if (key === 'productName' || key === 'description' || key === 'price') {
			updateObj[`menu.$.${key}`] = req.body[key];
		}
	});

	const filter = { _id: restaurantId };
	if (productId) {
		filter['menu._id'] = productId;
	}

	Restaurant.findOneAndUpdate(filter, updateObj, { new: true })
		.then((updatedRestaurant) => {
			if (!updatedRestaurant) {
				return res.status(404).json({ message: 'Restaurant or product not found' });
			}

			return res.json({
				message: 'Restaurant updated successfully',
				result: updatedRestaurant,
			});
		})
		.catch((error) => {
			console.error(error);
			res.status(500).json({ message: 'Server Error' });
		});
});

module.exports = router;
