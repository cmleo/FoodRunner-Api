const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const checkAuth = require('../Middlewares/check-auth');
const User = require('../Models/User');
const { update } = require('../Models/User');

router.post('/signup', (req, res, next) => {
	User.find({ email: req.body.email })
		.exec()
		.then((user) => {
			if (user.length >= 1) {
				return res.status(409).json({
					message: 'User Already Exists',
				});
			} else {
				bcrypt.hash(req.body.password, 10, (err, hash) => {
					if (err) {
						return res.status(500).json({
							error: err,
						});
					} else {
						const user = new User({
							_id: new mongoose.Types.ObjectId(),
							name: req.body.name,
							email: req.body.email,
							password: hash,
							phone: req.body.phone,
						});
						user
							.save()
							.then((result) => {
								res.status(201).json({
									message: 'User created successfuly',
									CreatedUser: result,
								});
							})
							.catch((err) => {
								res.status(500).json({
									error: err,
								});
							});
					}
				});
			}
		});
});

router.post('/login', (req, res, next) => {
	User.findOne({ email: req.body.email })
		.exec()
		.then((user) => {
			if (!user) {
				return res.status(401).json({
					message: 'Auth failed',
				});
			}
			bcrypt.compare(req.body.password, user.password, (err, result) => {
				if (err) {
					console.log(err);
					return res.status(401).json({
						message: 'Auth failed',
					});
				}

				if (result) {
					const token = jwt.sign(
						{
							email: user.email,
							userId: user._id,
						},
						process.env.JWT_KEY,
						{
							expiresIn: '1h',
						}
					);
					return res.status(200).json({
						message: 'Auth successful',
						token: token,
					});
				}

				return res.status(401).json({
					message: 'Auth failed',
				});
			});
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				error: err,
			});
		});
});

// Delete the authenticated user
router.delete('/:userId', checkAuth, (req, res, next) => {
	const userId = req.userData.userId;

	User.remove({ _id: userId })
		.exec()
		.then((result) => {
			res.status(200).json({
				message: 'User deleted',
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

// Get the authenticated user
router.get('/', checkAuth, (req, res, next) => {
	const userId = req.userData.userId;

	User.find({ _id: userId })
		.exec()
		.then((docs) => {
			res.status(200).json(docs);
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
			});
		});
});

// Update user info
router.patch('/', checkAuth, (req, res) => {
	const userId = req.userData.userId;

	User.findOneAndUpdate(
		{ _id: userId },
		{
			$set: {
				name: req.body.name,
				email: req.body.email,
				phone: req.body.phone,
			},
		}
	)
		.exec()
		.then((result) => {
			res.status(200).json({
				message: 'User info updated',
			});
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
			});
		});
});

module.exports = router;
