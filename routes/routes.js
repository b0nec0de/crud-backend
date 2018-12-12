const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const route = express();
const config = require('../config');

const User = require('../models/user');

route.set('superSecret', config.secret);

const apiRoutes = express.Router();

// route to delete existing user
// http://localhost:3001/delete
apiRoutes.delete('/delete', function (req, res) {

	User.deleteOne({
		email: req.body.email
	}, function (err, user) {

		if (err) throw err;

		if (!user) {
			res.json({ success: false, message: 'User not found' });

		} else {
			res.json({ success: true, message: 'User data edited' });
		}
	})
})

// route to edit existing user
// http://localhost:3001/edit
apiRoutes.put('/edit', function (req, res) {

	User.updateOne({
		email: req.body.email
	}, { $set: req.body }, function (err, user) {

		if (err) throw err;

		if (!user) {
			res.json({ success: false, message: 'User not found' });

		} else {
			res.json({ success: true, message: 'User data edited' });
		}
	})
})

// route to register a new user and add a record to the database
// http://localhost:3001/sign
apiRoutes.post('/sign', function (req, res) {

	User.findOne({
		email: req.body.email
	}, function (err, user) {

		if (err) throw err;

		if (user) {
			res.json({ success: false, message: 'User exist already' });

		} else {
			(new User(req.body)).save(function (err) {
				if (err) throw err;
				res.json({ success: true, message: 'User added successfully' });
			})
		}
	})
})

// route to authenticate a user
// http://localhost:3001/auth
apiRoutes.post('/auth', function (req, res) {
	// find the user
	User.findOne(
		{
			email: req.body.email
		},
		function (err, user) {
			if (err) throw err;

			if (!user) {
				res.json({
					success: false,
					message: 'Authentication failed. User not found.'
				});
			} else if (user) {
				// check if password matches
				if (user.password !== req.body.password) {
					res.json({
						success: false,
						message: 'Authentication failed. Wrong password.'
					});
				} else {
					// if user is found and password is right
					// create a token
					const payload = {
						admin: user.admin
					};
					const token = jwt.sign(payload, route.get('superSecret'), {
						expiresIn: '1d'
					});
					res.cookie('token', token, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });

					res.json({
						success: true,
						message: 'Enjoy your token!',
						token: token
					});
				}
			}
		}
	);
});

// routes middleware to verify a token
apiRoutes.use(function (req, res, next) {
	// check header or url parameters or post parameters for token
	const token =
		req.body.token ||
		req.query.token ||
		req.headers['x-access-token'] ||
		req.cookies.token;

	// decode token
	if (token) {
		// verifies secret and checks exp
		jwt.verify(token, route.get('superSecret'), function (err, decoded) {
			if (err) {
				return res.json({
					success: false,
					message: 'Failed to authenticate token.'
				});
			} else {
				// if everything is good, save to request for use in other routes
				req.decoded = decoded;
				next();
			}
		});
	} else {
		// if there is no token
		// return an error
		return res.status(403).send({
			success: false,
			message: 'No token provided.'
		});
	}
});

// route to verify token relevance
// http://localhost:3001/checkToken
apiRoutes.get('/checkToken', function (req, res) {
	res.sendStatus(200);
});

// route to show a list of users and menu to edit it
// http://localhost:3001/home)
apiRoutes.get('/home', function (req, res) {
	User.find({}, function (err, users) {
		res.json(users);
	});
});


module.exports = apiRoutes;