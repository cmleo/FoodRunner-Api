const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const checkUserAuth = require('../Middlewares/checkUserAuth');
const Order = require('../Models/Order');

// Add order to authenticated user
router.post('/', checkUserAuth, (req, res) => {
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
		.then((createdOrder) => {
			res.status(201).json({
				message: 'Order created successfully',
				result: createdOrder,
			});
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
				message: 'Something went wrong, please contact administrator!',
			});
		});
});

// Get all orders for authenticated user in descending order
router.get('/', checkUserAuth, (req, res) => {
	const userId = req.userData.userId;

	Order.find({ user: userId })
		.sort({ timestamp: -1 })
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

module.exports = router;
