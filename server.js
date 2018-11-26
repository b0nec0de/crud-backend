const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv')

const app = express();
dotenv.config()

app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', function (req, res) {
  res.send('Hello World');
});

app.post('/auth', function (req, res) {
  res.send(`Hello ${req.body.email}`);
});

app.listen(process.env.CRUD_PORT, function () {
  console.log(`Example app listening on port ${process.env.CRUD_PORT}!`);
});