const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');


const userSchema = new mongoose.Schema(
	{
		email: { type: String, lowercase: true, unique: true, required: [true, "can't be blank"], index: true },
		password: { type: String, lowercase: true, required: [true, "can't be blank"], index: true },
		name: { type: String, lowercase: true, required: [true, "can't be blank"], index: true },
		age: { type: String, lowercase: true, required: [true, "can't be blank"], index: true },
		occupation: { type: String, lowercase: true, required: [true, "can't be blank"], index: true },
		city: { type: String, required: [true, "can't be blank"], index: true },
		admin: { type: Boolean }
	},
	{
		collection: 'users'
	},
	{
		timestamps: true
	}
);
userSchema.plugin(uniqueValidator, { message: 'is already taken.' });

const User = mongoose.model('User', userSchema);

module.exports = User;
