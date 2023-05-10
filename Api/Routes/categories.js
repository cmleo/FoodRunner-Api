const express = require('express');
const router = express.Router();
const Restaurant = require('../Models/Restaurant');
const Category = require('../Models/Category');
const checkAdminAuth = require('../Middlewares/checkAdminAuth');

// Get all categories
router.get('/', (req, res, next) => {
	Category.find()
		.exec()
		.then((categories) => {
			res.status(200).json(categories);
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
				message: 'Something went wrong, please contact the administrator!',
			});
		});
});

// Create a new category
router.post('/', checkAdminAuth, async (req, res, next) => {
	const { name, logo } = req.body;

	try {
		const category = await Category.create({
			name,
			logo,
		});

		res.status(201).json({
			message: 'Category created successfully',
			category,
		});
	} catch (err) {
		res.status(500).json({
			error: err,
			message: 'Something went wrong, please contact the administrator!',
		});
	}
});

// Get all restaurants in a category
router.get('/:categoryId/restaurants', (req, res, next) => {
	const categoryId = req.params.categoryId;

	Category.findById(categoryId)
		.populate('restaurants')
		.exec()
		.then((category) => {
			if (category) {
				res.status(200).json(category.restaurants);
			} else {
				res.status(404).json({
					message: 'Category not found',
				});
			}
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
				message: 'Something went wrong, please contact the administrator!',
			});
		});
});

// Add a restaurant to a category
router.post('/restaurant/:categoryId', checkAdminAuth, async (req, res, next) => {
	const categoryId = req.params.categoryId;
	const { restaurantId } = req.body;

	try {
		const category = await Category.findById(categoryId);

		if (!category) {
			return res.status(404).json({
				message: 'Category not found',
			});
		}

		const restaurant = await Restaurant.findById(restaurantId);

		if (!restaurant) {
			return res.status(404).json({
				message: 'Restaurant not found',
			});
		}

		if (category.restaurants.includes(restaurantId)) {
			return res.status(400).json({
				message: 'Restaurant already assigned to the category',
			});
		}

		category.restaurants.push(restaurantId);
		await category.save();

		res.status(200).json({
			message: 'Restaurant added to category successfully',
		});
	} catch (err) {
		res.status(500).json({
			error: err,
			message: 'Something went wrong, please contact the administrator!',
		});
	}
});

// Update a category for a specific restaurant
router.put('/:restaurantId', checkAdminAuth, async (req, res, next) => {
	const restaurantId = req.params.restaurantId;
	const { categoryId } = req.body;

	try {
		const restaurant = await Restaurant.findById(restaurantId);

		if (!restaurant) {
			return res.status(404).json({
				message: 'Restaurant not found',
			});
		}

		const category = await Category.findById(categoryId);

		if (!category) {
			return res.status(404).json({
				message: 'Category not found',
			});
		}

		if (category.restaurants.includes(restaurantId)) {
			return res.status(400).json({
				message: 'Restaurant already assigned to the category',
			});
		}

		const oldCategory = await Category.findOne({ restaurants: restaurantId });

		if (oldCategory) {
			oldCategory.restaurants.pull(restaurantId);
			await oldCategory.save();
		}

		category.restaurants.push(restaurantId);
		await category.save();

		res.status(200).json({
			message: 'Category updated for restaurant successfully',
		});
	} catch (err) {
		res.status(500).json({
			error: err,
			message: 'Something went wrong, please contact the administrator!',
		});
	}
});

module.exports = router;
