const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const bcrypt = require('bcrypt');

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
					return res.status(200).json({
						message: 'Auth successful',
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

router.delete('/:userId', (req, res, next) => {
	User.remove({ _id: req.params.userId })
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

module.exports = router;
