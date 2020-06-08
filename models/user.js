var mongoose = require('mongoose');
var userSchema = mongoose.Schema({
	authId: String,
	name: String,
	email: String,
	created: Date,
	token: String,
});

// userSchema.methods.getOrders = function(cb){
// 	return Order.find({ customerId: this._id }, cb);
// };

var User = mongoose.model('User', userSchema);
module.exports = User;