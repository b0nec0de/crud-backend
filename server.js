const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const routes = require('./routes/routes');

dotenv.config();

const config = require('./config');

const app = express();

const port = process.env.PORT || 3001;

mongoose.connect(
	config.database,
	{ useNewUrlParser: true }
);
mongoose.set('useCreateIndex', true);

const db = mongoose.connection;
db.on('error', err => console.log('connection error', err));
db.once('open', () => console.log('connected'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(morgan('dev'));

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.options('*', cors());

app.use(cookieParser());

app.use('/', routes);

app.listen(port, () => console.log(`App listening on port ${port}!`))

