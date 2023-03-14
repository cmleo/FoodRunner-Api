const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Restaurant = require('../Models/Restaurant');
const checkAdminAuth = require('../Middlewares/checkAdminAuth');

// Get all restaurants
router.get('/', (req, res, next) => {
	Restaurant.find()
		.exec()
		.then((docs) => {
			res.status(200).json(docs);
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
				message: 'Something went wrong, please contact administrator!',
			});
		});
});

// GET all restaurants created by a specific admin
router.get('/admin', checkAdminAuth, async (req, res, next) => {
	try {
		const restaurants = await Restaurant.find({ createdBy: req.adminData.userId });
		res.status(200).json(restaurants);
	} catch (err) {
		res.status(500).json({
			error: err,
			message: 'Something went wrong, please contact administrator!',
		});
	}
});

// Get a specific restaurant by id
router.get('/:restaurantId', (req, res, next) => {
	const { restaurantId } = req.params;

	Restaurant.findById(restaurantId)
		.exec()
		.then((restaurant) => {
			if (restaurant) {
				res.status(200).json({ restaurant });
			} else {
				res.status(404).json({ message: 'Restaurant not found' });
			}
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				error: err,
				message: 'Something went wrong, please contact administrator!',
			});
		});
});

// Create a new restaurant
router.post('/', checkAdminAuth, (req, res, next) => {
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
		createdBy: req.adminData.userId,
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
				message: 'Something went wrong, please contact administrator!',
			});
		});
});

// Delete restaurant by id
router.delete('/:restaurantId', checkAdminAuth, (req, res, next) => {
	Restaurant.remove({ _id: req.params.restaurantId })
		.exec()
		.then(() => res.status(204).json({ message: 'Restaurant deleted' }))
		.catch((err) => {
			res.status(500).json({
				error: err,
				message: 'Something went wrong, please contact administrator!',
			});
		});
});

// Delete a product by its id
router.delete('/:restaurantId/:productId', checkAdminAuth, (req, res, next) => {
	const { restaurantId, productId } = req.params;

	Restaurant.updateOne({ _id: restaurantId }, { $pull: { menu: { _id: productId } } })
		.exec()
		.then(() => res.status(204).json({ message: 'Product deleted' }))
		.catch((err) => {
			res.status(500).json({
				error: err,
				message: 'Something went wrong, please contact administrator!',
			});
		});
});

// Update a restaurant by IDs
router.patch('/:restaurantId/:productId?', checkAdminAuth, (req, res) => {
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
		.catch((err) => {
			res.status(500).json({
				error: err,
				message: 'Something went wrong, please contact administrator!',
			});
		});
});

module.exports = router;
