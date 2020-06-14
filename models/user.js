const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const userSchema = mongoose.Schema({
	email: String,
	authId: String, 
	token: String,
	accountName: String, // displayed name 
	created: Date,
	profile: String,
	firstName: String,
	lastName: String,
	follows: [String], // userId
	friends: [String], // userId
	isAuthor: Boolean, 
	publishments: [String], //volumeId
	shelves: [String], // shelfId
	//password: String,
	
});

// userSchema.methods.getOrders = function(cb){
// 	return Order.find({ customerId: this._id }, cb);
// };

userSchema.plugin(passportLocalMongoose, {
	usernameField: "email"
});
const User = mongoose.model('User', userSchema);
module.exports = User;