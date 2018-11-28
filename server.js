const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config()

const app = express();

mongoose.connect('mongodb://localhost/crud');

const db = mongoose.connection;
db.on('error', (err) => console.log('connection error', err));
db.once('open', () => console.log('connected'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, X-Auth-Token, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
  next();
});

// app.get('/', function (req, res) {
//   res.send('Hello World');
// });

const User = require('./user');

app.post('/auth', function (req, res) {
  const user = new User(req.body);

  user.save()
    .then(user => {
      res.json('User added successfully');
    })
    .catch(err => {
      res.status(400).send("unable to save to database");
    });
});

app.listen(process.env.CRUD_PORT, function () {
  console.log(`Server is running on port ${process.env.CRUD_PORT}`);
});



