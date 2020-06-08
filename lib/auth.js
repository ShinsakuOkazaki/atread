var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('../models/user.js');
const url = require('url');
// Store user id in session.
passport.serializeUser(function(user, done){
	done(null, user._id);
});

passport.deserializeUser(function(id, done){
	User.findById(id, function(err, user){
		if(err || !user) return done(err, null);
		done(null, user);
	});
});

module.exports = function(app, options){

	// if success and failure redirects aren't specified,
	// set some reasonable defaults
	if(!options.successRedirect)
		options.successRedirect = '/account';
	if(!options.failureRedirect)
		options.failureRedirect = '/login';

	return {

		init: function() {
			var env = app.get('env');
			var config = options.providers;

			passport.use(new GoogleStrategy({
				clientID: config.google[env].clientID,
				clientSecret: config.google[env].clientSecret,
				callbackURL: (options.baseUrl || '') + '/auth/google/callback',
			}, function(token, tokenSecret, profile, done){
				var authId = 'google:' + profile.id;
				User.findOne({ authId: authId }, function(err, user){
					if(err) return done(err, null);
					if(user) {
            	user.token = token;
            	return done(null, user);
         	}
				user = new User({
   			        authId: authId,
   			        email: profile.email,
					name: profile.displayName,
  			        created: Date.now(),
           			token: token,
          		});
					user.save(function(err){
						if(err) return done(err, null);
						done(null, user);
					});
				});
			}));

			app.use(passport.initialize());
			app.use(passport.session());
		},

		registerRoutes: function(){
			
			// register Google routes
			app.get('/auth/google', function(req, res, next){
				if(req.query.redirect) req.session.authRedirect = req.query.redirect;
				passport.authenticate('google', { scope: ['profile', 'https://www.googleapis.com/auth/books']})(req, res, next);
			});
			app.get('/auth/google/callback', passport.authenticate('google', 
				{ failureRedirect: options.failureRedirect }),
				function(req, res){
					// we only get here on successful authentication
					var redirect = req.session.authRedirect;
					if(redirect) delete req.session.authRedirect;
					res.redirect(303, req.query.redirect || options.successRedirect);
				}
			);
		},

	};
};