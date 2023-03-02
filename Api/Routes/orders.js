const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const checkAuth = require('../Middlewares/check-auth');
const Order = require('../Models/Order');

// POST route to add order to authenticated user
router.post('/', checkAuth, (req, res) => {
	const orderItems = req.body.order.map((orderItem) => {
		return {
			productName: orderItem.productName,
			quantity: orderItem.quantity,
			price: orderItem.price,
		};
	});

	const newOrder = new Order({
		user: req.userData.userId,
		order: orderItems,
		deliveryAddress: req.body.deliveryAddress,
		totalPrice: req.body.totalPrice,
	});

	newOrder
		.save()
		.then((savedOrder) => {
			res.status(201).json(savedOrder);
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
			});
		});
});

module.exports = router;
