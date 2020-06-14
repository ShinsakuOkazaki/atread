const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const credentials = require('../credentials.js');
const User = require('../models/user.js');

const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/books',
];
const options = {
	 baseUrl: 'http://me.mydomain.com:3000',
	providers: credentials.authProviders,
	successRedirect: '/account',
	failureRedirect: '/unauthorized',
}

passport.serializeUser(function(user, done){
    done(null, user._id);
});

passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
        if(err || !user) return done(err, null);
        done(null, user);
    });
});

module.exports = function(app) {
	
	return {
		init: function() {
			const env = app.get('env');
			const config = options.providers;

			passport.use(new GoogleStrategy({
                clientID: config.google[env].clientID,
				clientSecret: config.google[env].clientSecret,
				callbackURL: options.baseUrl + '/auth/google/callback',
            }, function(accessToken, refreshToken, profile, done){
                User.findOne({authId: profile.id }, function(err, user){
                    if(err) return done(err, null);
                    if(user) {
						if(!user.token == accessToken) {
							user.token = accessToken;
							user.save();
						}
						return done(null, user);
					}
                    user = new User({
                        authId: profile.id,
						accountName: profile.displayName, 
						email: profile.email,
                        created: Date.now(),
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

		login: (req, res, next) => {
			if(req.query.redirect) req.session.authRedirect = req.query.redirect;
			passport.authenticate('google', { scope: scopes })(req, res, next);
		},

		authenticate: passport.authenticate('google', { 
			failureRedirect: options.failureRedirect 
		}),

		redirect:  (req, res) => {
			const redirect = req.session.authRedirect;
			if (redirect) delete req.session.authRedirect;
			res.redirect(303, redirect || options.successRedirect);
		}
	}
}



// const url = require('url');
// const {google} = require('googleapis');
// const scopes = [
//     'https://www.googleapis.com/auth/userinfo.email',
//     'https://www.googleapis.com/auth/userinfo.profile',
//     'https://www.googleapis.com/auth/books',
// ];

// module.exports = function(app, options) {
// 	const env = app.get('env');
// 	const config = options.providers;
	
// 	const authorizeUrl; 
// 	const oauth2Client; 
// 	return {
// 		authorizeUrl: null, 
// 		oauth2Client: null,  
// 		init: function() {
// 			oauth2Client =  new google.auth.OAuth2(
// 				config.google[env].clientID,
// 				config.google[env].clientSecret,
// 				config.env.BASE_URL + '/auth/google/callback',
// 			);
// 			google.options({auth: oauth2Client});
// 			authorizeUrl = oauth2Client.generateAuthUrl({
// 				access_type: 'offline',
// 				scope: scopes,
// 			});
// 		},

// 		registerRoutes: function() {
// 			app.get('/auth/google', function(req, res){
// 				res.redirect(authorizeUrl);
// 			});

// 			app.get('/auth/google/callback', async function (req, res) {
// 				// we only get here on successful authentication
// 				const qs = new url.URL(req.url, config.env.BASE_URL)
// 					  .searchParams;
// 				const {tokens} = await oauth2Client.getToken(qs.get('code'));
		
// 				oauth2Client.credentials = tokens;
// 				res.redirect(303, '/account');
// 			});
// 		}
// 	}
// }

