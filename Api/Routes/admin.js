const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const checkAdminAuth = require('../Middlewares/checkAdminAuth');
const User = require('../Models/User');

router.post('/signup', (req, res, next) => {
	User.find({ email: req.body.email })
		.exec()
		.then((admin) => {
			if (admin.length >= 1) {
				return res.status(409).json({
					message: 'Admin Already Exists',
				});
			} else {
				bcrypt.hash(req.body.password, 10, (err, hash) => {
					if (err) {
						return res.status(500).json({
							error: err,
						});
					} else {
						const admin = new User({
							_id: new mongoose.Types.ObjectId(),
							name: req.body.name,
							email: req.body.email,
							password: hash,
							phone: req.body.phone,
							role: 'admin',
						});
						admin
							.save()
							.then((createdAdmin) => {
								res.status(201).json({
									message: 'Admin created successfuly',
									result: createdAdmin,
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
	User.findOne({ email: req.body.email, role: 'admin' })
		.exec()
		.then((admin) => {
			if (!admin) {
				return res.status(400).json({
					message: 'Email is incorrect',
				});
			}
			bcrypt.compare(req.body.password, admin.password, (err, result) => {
				if (err) {
					return res.status(400).json({
						error: err,
						message: 'Password is incorrect',
					});
				}

				if (result) {
					const token = jwt.sign(
						{
							email: admin.email,
							adminId: admin._id,
							role: 'admin',
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
			});
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
				message: 'Something went wrong, please contact administrator!',
			});
		});
});

// Logout route for authenticated admin
router.post('/logout', checkAdminAuth, (req, res) => {
	try {
		// Remove JWT token from client-side storage
		AsyncStorage.removeItem('jwtToken');
		// Will be using AsyncStorage on the Client-Side for storing the JWT token

		// Send success response
		return res.status(200).json({
			message: 'Admin logged out successfully',
		});
	} catch (error) {
		res.status(500).json({
			error: err,
			message: 'Something went wrong, please contact administrator!',
		});
	}
});

// Delete the authenticated admin
router.delete('/:adminId', checkAdminAuth, (req, res, next) => {
	const adminId = req.adminData.adminId;

	User.remove({ _id: adminId })
		.exec()
		.then(() => {
			res.status(204).json({
				message: 'Admin deleted successfully',
			});
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
				message: 'Something went wrong, please contact administrator!',
			});
		});
});

// Get the authenticated admin
router.get('/', checkAdminAuth, (req, res, next) => {
	const adminId = req.adminData.adminId;

	User.find({ _id: adminId })
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

// Update admin info
router.patch('/', checkAdminAuth, (req, res) => {
	const adminId = req.adminData.adminId;

	User.findOneAndUpdate(
		{ _id: adminId },
		{
			$set: {
				name: req.body.name,
				email: req.body.email,
				phone: req.body.phone,
			},
		}
	)
		.exec()
		.then((updatedAdmin) => {
			res.status(200).json({
				message: 'Admin info updated',
				result: updatedAdmin,
			});
		})
		.catch((err) => {
			res.status(500).json({
				error: err,
				message: 'Something went wrong, please contact administrator!',
			});
		});
});

// Change password route for authenticated admin
router.patch('/change-password', checkAdminAuth, async (req, res) => {
	try {
		const { adminId } = req.adminData;
		const { currentPassword, newPassword } = req.body;

		// Find admin by ID
		const admin = await User.findById(adminId);

		// Check if current password matches the one in the database
		const isMatch = await bcrypt.compare(currentPassword, admin.password);
		if (!isMatch) {
			return res.status(400).json({
				message: 'Current password is incorrect',
			});
		}

		// Generate new password hash
		const newPasswordHash = await bcrypt.hash(newPassword, 10);

		// Update admin's password in the database
		const updatedAdmin = await User.findByIdAndUpdate(adminId, { password: newPasswordHash }, { new: true });

		// Generate new JWT token for the admin
		const token = jwt.sign(
			{
				adminId: updatedAdmin._id,
				email: updatedAdmin.email,
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
