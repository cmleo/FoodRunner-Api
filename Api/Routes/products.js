const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Product = require('../Models/Product');
const checkAuth = require('../Middlewares/check-auth');

// Get all products
router.get('/', (req, res, next) => {
	Product.find()
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

// Create a new product
router.post('/', checkAuth, (req, res, next) => {
	const product = new Product({
		_id: new mongoose.Types.ObjectId(),
		name: req.body.name,
		description: req.body.description,
		price: req.body.price,
	});
	product
		.save()
		.then((result) => {
			res.status(201).json({
				message: 'Created product successfully',
				createdProduct: result,
			});
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
			});
		});
});

module.exports = router;
