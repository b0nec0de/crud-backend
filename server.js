const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

dotenv.config();

const jwt = require('jsonwebtoken');
const config = require('./config');

const app = express();

const port = process.env.CRUD_PORT;

const User = require('./models/user');

mongoose.connect(
	config.database,
	{ useNewUrlParser: true }
);

const db = mongoose.connection;
db.on('error', err => console.log('connection error', err));
db.once('open', () => console.log('connected'));

app.set('superSecret', config.secret);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(morgan('dev'));

// app.use(cors());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.options('*', cors());

// use cookie parser
app.use(cookieParser());

app.get('/', (req, res) => res.send('Hello World!'));

// Routes //

const apiRoutes = express.Router();

// route to delete existing user
// http://localhost:3001/delete
apiRoutes.delete('/delete', function (req, res) {

	User.deleteOne({
		email: req.body.email
	}, function (err, user) {

		if (err) throw err;

		if (!user) {
			res.json({ message: 'User not found' });

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
			res.json({ message: 'User not found' });

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
				res.json({ message: 'User added successfully' });
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
					const token = jwt.sign(payload, app.get('superSecret'), {
						expiresIn: '1d'
					});
					res.cookie('token', token, { maxAge: 900000, httpOnly: true });

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

// route middleware to verify a token
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
		jwt.verify(token, app.get('superSecret'), function (err, decoded) {
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

apiRoutes.get('/checkToken', function (req, res) {
	res.sendStatus(200);
});

// route to show a random message (GET http://localhost:8080/api/)
apiRoutes.get('/home', function (req, res) {
	User.find({}, function (err, users) {
		res.json(users);
	});
});


app.use('/', apiRoutes);

app.listen(3001);
console.log('Magic happens at http://localhost:' + port);
