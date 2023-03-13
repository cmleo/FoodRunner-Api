const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const checkAuth = require('../Middlewares/check-auth');
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
					message: "Email doesn't exist",
				});
			}
			bcrypt.compare(req.body.password, user.password, (err, result) => {
				if (err) {
					console.log(err);
					return res.status(401).json({
						message: 'Password is incorrect',
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

// Logout route for authenticated user
router.post('/logout', checkAuth, (req, res) => {
	try {
		// Remove JWT token from client-side storage
		AsyncStorage.removeItem('jwtToken');
		// Will be using AsyncStorage on the Client-Side for storing the JWT token

		// Send success response
		return res.status(200).json({
			message: 'User logged out successfully',
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server Error' });
	}
});

// Delete the authenticated user
router.delete('/:userId', checkAuth, (req, res, next) => {
	const userId = req.userData.userId;

	User.remove({ _id: userId })
		.exec()
		.then((result) => {
			res.status(204).json({
				message: 'User deleted successfully',
				DeletedUser: result,
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
				UpdatedUser: result,
			});
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
			});
		});
});

// Change password route for authenticated user
router.patch('/change-password', checkAuth, async (req, res) => {
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
		console.error(error);
		res.status(500).json({ message: 'Server Error' });
	}
});

module.exports = router;
