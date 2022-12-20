const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const bcrypt = require('bcrypt');

const User = require('../Models/User');

router.post('/signup', (req, res, next) => {
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
						message: 'User created succesfully',
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
});

module.exports = router;
