const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const checkUserAuth = require('../Middlewares/checkUserAuth');
const Order = require('../Models/Order');

// Add order to authenticated user
router.post('/', checkUserAuth, (req, res) => {
	const orderItems = req.body.order.map((orderItem) => {
		return {
			_id: mongoose.Types.ObjectId(orderItem._id),
			productName: orderItem.productName,
			quantity: orderItem.quantity,
			pricePerQuantity: orderItem.pricePerQuantity,
			totalPriceOfProduct: orderItem.pricePerQuantity * orderItem.quantity,
		};
	});

	totalPrice = orderItems.reduce((acc, orderItem) => {
		return acc + orderItem.totalPriceOfProduct;
	}, 0);

	const newOrder = new Order({
		user: req.userData.userId,
		order: orderItems,
		deliveryAddress: req.body.deliveryAddress,
		totalPrice: totalPrice,
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

// Get order by orderNumber for authenticated user
router.get('/:orderNumber', checkUserAuth, (req, res) => {
	const userId = req.userData.userId;
	const orderNumber = req.params.orderNumber;

	Order.findOne({ user: userId, orderNumber: orderNumber })
		.exec()
		.then((doc) => {
			if (doc) {
				res.status(200).json(doc);
			} else {
				res.status(404).json({
					message: 'Order not found',
				});
			}
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
				message: 'Something went wrong, please contact administrator!',
			});
		});
});

module.exports = router;
