var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

app.use(function (req, res) {
  res.setHeader('Content-Type', 'text/plain')
  res.write('you posted:\n')
  res.end(JSON.stringify(req.body, null, 2))
})


app.get('/', function (req, res) {
  console.log('get');
  res.send('Hello');
});

app.post('/incoming', function (req, res) {
  console.log('post');
  res.send('World!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});