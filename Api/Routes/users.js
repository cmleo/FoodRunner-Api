const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const checkUserAuth = require('../Middlewares/checkUserAuth');
const User = require('../Models/User');

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
									message: 'Something went wrong, please contact administrator!',
								});
							});
					}
				});
			}
		});
});

router.post('/login', (req, res, next) => {
	User.findOne({ email: req.body.email, role: 'user' })
		.exec()
		.then((user) => {
			if (!user) {
				return res.status(400).json({
					message: 'Email is incorrect',
				});
			}
			bcrypt.compare(req.body.password, user.password, (err, result) => {
				if (result) {
					const token = jwt.sign(
						{
							email: user.email,
							userId: user._id,
							role: user.role,
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
				} else {
					return res.status(400).json({
						error: err,
						message: 'Password is incorrect',
					});
				}
			});
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
				message: 'Something went wrong, please contact administrator!',
			});
		});
});

// Delete the authenticated user
router.delete('/', checkUserAuth, (req, res, next) => {
	const userId = req.userData.userId;

	User.remove({ _id: userId })
		.exec()
		.then(() => {
			res.status(204).json({
				message: 'User deleted successfully',
			});
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
				message: 'Something went wrong, please contact administrator!',
			});
		});
});

// Get the authenticated user
router.get('/', checkUserAuth, (req, res, next) => {
	const userId = req.userData.userId;

	User.find({ _id: userId })
		.exec()
		.then((result) => {
			res.status(200).json(result);
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
				message: 'Something went wrong, please contact administrator!',
			});
		});
});

// Update user info
router.patch('/', checkUserAuth, (req, res) => {
	const userId = req.userData.userId;

	User.findOneAndUpdate(
		{ _id: userId },
		{
			$set: {
				name: req.body.name,
				email: req.body.email,
				phone: req.body.phone,
			},
		},
		{ new: true }
	)
		.exec()
		.then((updatedUser) => {
			res.status(200).json({
				message: 'User info updated',
				result: updatedUser,
			});
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
				message: 'Something went wrong, please contact administrator!',
			});
		});
});

// Change password route for authenticated user
router.patch('/change-password', checkUserAuth, async (req, res) => {
	try {
		const { userId } = req.userData;
		const { currentPassword, newPassword } = req.body;

		// Find user by ID
		const user = await User.findById(userId);

		// Check if current password matches the one in the database
		const isMatch = await bcrypt.compare(currentPassword, user.password);
		if (!isMatch) {
			return res.status(401).json({
				message: 'Current password is incorrect',
			});
		}

		// Generate new password hash
		const newPasswordHash = await bcrypt.hash(newPassword, 10);

		// Update user's password in the database
		const updatedUser = await User.findByIdAndUpdate(userId, { password: newPasswordHash }, { new: true });

		// Generate new JWT token for the user
		const token = jwt.sign(
			{
				userId: updatedUser._id,
				email: updatedUser.email,
			},
			process.env.JWT_KEY,
			{ expiresIn: '1h' }
		);

		// Return success message and new JWT token
		return res.json({
			message: 'Password updated successfully',
			token,
		});
	} catch (error) {
		res.status(500).json({
			error: err,
			message: 'Something went wrong, please contact administrator!',
		});
	}
});

module.exports = router;
