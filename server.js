const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const morgan = require('morgan');
const mongoose = require('mongoose');

dotenv.config()

const jwt = require('jsonwebtoken');
const config = require('./config');

const app = express();

const port = process.env.PORT || 8080;

const User = require('./user');

mongoose.connect('mongodb://localhost/crud', { useNewUrlParser: true });

const db = mongoose.connection;
db.on('error', (err) => console.log('connection error', err));
db.once('open', () => console.log('connected'));

app.set('superSecret', config.secret);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(morgan('dev'));

// routes //

app.get('/setup', function (req, res) {
  let nick = new User({
    name: 'Nick',
    password: '123',
    admin: true
  });

  nick.save(function (err) {
    if (err) throw err;

    console.log('User saved successfully');
    res.json({ success: true });
  });
});

// basic route (http://localhost:8080)
app.get('/', function (req, res) {
  res.send('Hello! The API is at http://localhost:' + port + '/api');
});

// API ROUTES //

const apiRoutes = express.Router();

// route to authenticate a user
// http://localhost:8080/api/authenticate
apiRoutes.post('/authenticate', function (req, res) {

  // find the user
  User.findOne({
    name: req.body.name
  }, function (err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {

      // check if password matches
      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {

        // if user is found and password is right
        // create a token
        var payload = {
          admin: user.admin
        }
        var token = jwt.sign(payload, app.get('superSecret'), {
          expiresIn: 86400 // expires in 24 hours
        });

        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token
        });
      }

    }

  });
});

// route middleware to verify a token
apiRoutes.use(function (req, res, next) {

  // check header or url parameters or post parameters for token
  let token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function (err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
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

// route to show a random message (GET http://localhost:8080/api/)
apiRoutes.get('/', function (req, res) {
  res.json({ message: 'Welcome to the cooolest API on earth!' });
});

// route to return all users (GET http://localhost:8080/api/users)
apiRoutes.get('/users', function (req, res) {
  User.find({}, function (err, users) {
    res.json(users);
  });
});

app.use('/api', apiRoutes);


// app.get('/', function (req, res) {
//   res.send('Hello World');
// });

// const User = require('./user');

// app.post('/auth', function (req, res) {
//   const user = new User(req.body);

//   user.save()
//     .then(user => {
//       res.json('User added successfully');
//     })
//     .catch(err => {
//       res.status(400).send("unable to save to database");
//     });
// });

// app.listen(process.env.CRUD_PORT, function () {
//   console.log(`Server is running on port ${process.env.CRUD_PORT}`);
// });

app.listen(port);
console.log('Magic happens at http://localhost:' + port);



