const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
// const cookieParser = require('cookie-parser');
// const cookiesMiddleware = require('universal-cookie-express');
const mongoose = require('mongoose');

dotenv.config()

const jwt = require('jsonwebtoken');
const config = require('./config');

const app = express();

const port = process.env.CRUD_PORT;

const User = require('./user');

mongoose.connect(config.database, { useNewUrlParser: true });

const db = mongoose.connection;
db.on('error', (err) => console.log('connection error', err));
db.once('open', () => console.log('connected'));

app.set('superSecret', config.secret);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(morgan('dev'));

app.use(cors());

// app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
// app.use(cookieParser);

// getting access to cookies //
// app
//   .use(cookiesMiddleware())
//   .use(function (req, res) {
//     req.universalCookies.get(req.body.token)
//     res.json(req.body.token)
//   });

// Routes //

// basic route (http://localhost:3001)
app.get('/', function (req, res) {
  res.send('Hello! The API is at http://localhost:' + port);
});

// API ROUTES //

const apiRoutes = express.Router();

// route to sign up a new user and add a record to the database
// http://localhost:3001/sign
apiRoutes.post('/sign', function (req, res) {

  User.findOne({
    email: req.body.email
  }, function (err, user) {

    if (err) throw err;

    if (user) {
      res.json('User exist already');

    } else {
      (new User(req.body)).save(function (err) {
        if (err) throw err;
        res.json({ caution: 'User added successfully' });
      })
    }
  })
})

// route to authenticate a user
// http://localhost:3001/auth
apiRoutes.post('/auth', function (req, res) {
  // find the user
  User.findOne({
    email: req.body.email
  }, function (err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });

    } else if (user) {

      // check if password matches
      if (user.password !== req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {

        // if user is found and password is right
        // create a token
        const payload = {
          admin: user.admin
        }
        const token = jwt.sign(payload, app.get('superSecret'), {
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
  console.log(req.body);
  // check header or url parameters or post parameters for token
  const token = req.body.token || req.query.token || req.headers['x-access-token'];

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
apiRoutes.get('/app', function (req, res) {
  res.json({ message: 'Welcome to the cooolest app on earth!' });
});

// route to return all users (GET http://localhost:8080/api/users)
apiRoutes.get('/users', function (req, res) {
  User.find({}, function (err, users) {
    res.json(users);
  });
});

app.use('/', apiRoutes);

app.listen(port);
console.log('Magic happens at http://localhost:' + port);

// app.listen(process.env.CRUD_PORT, function () {
//   console.log(`Server is running on port ${process.env.CRUD_PORT}`);
// });



