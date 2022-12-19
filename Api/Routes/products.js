const express = require('express');
const router = express.Router();

// Get all products
router.get('/', (req, res) => {
	Product.find((err, products) => {
		try {
			res.json(products);
		} catch (err) {
			res.send(err);
		}
	});
});

// Create a new product
router.post('/', (req, res) => {
	const newProduct = new Product(req.body);
	newProduct.save((err, product) => {
		try {
			res.json(product);
		} catch (err) {
			res.send(err);
		}
	});
});
