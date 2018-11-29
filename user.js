const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  admin: Boolean
}, {
    collection: 'users'
  });

const User = mongoose.model('User', userSchema);

module.exports = User;