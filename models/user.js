const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String },
  age: { type: Number },
  occupation: { type: String },
  city: { type: String },
  admin: { type: Boolean }
}, {
    collection: 'users'
  });

const User = mongoose.model('User', userSchema);

module.exports = User;
