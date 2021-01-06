const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const userSchema = mongoose.Schema({
	email: String,
	authId: String, 
	tokens: {
		access_token: String, 
		refresh_token: String,
	},
	displayNameName: String, // displayed name 
	created: Date,
	profile: String, 
	firstName: String,
	lastName: String,
	follows: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}], // userId
	friends: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}], // userId
	isAuthor: Boolean, 
	publishments: [String], //volumeId
	shelves: [{type: mongoose.Schema.Types.ObjectId, ref: "Shelf"}], // shelfId
	//password: String,
	
});

// userSchema.methods.getOrders = function(cb){
// 	return Order.find({ customerId: this._id }, cb);
// };

userSchema.plugin(passportLocalMongoose, {
	usernameField: "email"
});
const User = mongoose.model('User', userSchema);
module.exports.User = User;