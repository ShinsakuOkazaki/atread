const http = require('http');
const express = require('express');
const session = require('express-session');
const fs = require('fs');
const url = require('url');

	    
app = express();
var credentials = require('./credentials.js');
// set up handlebars view engine
var handlebars = require('express3-handlebars')
	.create({ defaultLayout:'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

// use domains for better error handling
app.use(function(req, res, next){
    // create a domain for this request
    var domain = require('domain').create();
    // handle errors on this domain
    domain.on('error', function(err){
        console.error('DOMAIN ERROR CAUGHT\n', err.stack);
        try {
            // failsafe shutdown in 5 seconds
            setTimeout(function(){
                console.error('Failsafe shutdown.');
                process.exit(1);
            }, 5000);

            // disconnect from the cluster
            var worker = require('cluster').worker;
            if(worker) worker.disconnect();

            // stop taking new requests
            server.close();

            try {
                // attempt to use Express error route
                next(err);
            } catch(error){
                // if Express error route failed, try
                // plain Node response
                console.error('Express error mechanism failed.\n', error.stack);
                res.statusCode = 500;
                res.setHeader('content-type', 'text/plain');
                res.end('Server error.');
            }
        } catch(error){
            console.error('Unable to send 500 response.\n', error.stack);
        }
    });

    // add the request and response objects to the domain
    domain.add(req);
    domain.add(res);

    // execute the rest of the request chain in the domain
    domain.run(next);
});

// logging
switch(app.get('env')){
    case 'development':
    	// compact, colorful dev logging
    	app.use(require('morgan')('dev'));
        break;
    case 'production':
        // module 'express-logger' supports daily log rotation
        app.use(require('express-logger')({ path: __dirname + '/log/requests.log'}));
        break;
}

var MongoSessionStore = require('connect-mongo')(session);
var sessionStore = new MongoSessionStore({url: credentials.mongo[app.get('env')].connectionString});


app.use(require('body-parser')());
app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')({
    resave: false,
    saveUninitialized: false,
    secret: credentials.cookieSecret,
	store: sessionStore,
}));

app.use(express.static(__dirname + '/public'));


var mongoose = require('mongoose');
var opts = {
	server: {
		socketOptions: {keepAlive: 1}
	}
};

switch(app.get('env')) {
	case 'development':
		mongoose.connect(credentials.mongo.development.connectionString, opts);
		break;
	case 'production':
		mongoose.connect(credentials.mongo.production.connectionString, opts);
		break;
	default:
		throw new Error('Unknown execution environment: ' + app.get('env'));
}


app.get('/', function(req, res) {
	res.render('home');
});


///////////////////////////////
const {google} = require('googleapis');
const books = google.books('v1');

const env = app.get('env');
const config = credentials.authProviders;


const oauth2Client =  new google.auth.OAuth2(
    config.google[env].clientID,
    config.google[env].clientSecret,
    'http://me.mydomain.com:3000/auth/google/callback',
);


google.options({auth: oauth2Client});

const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/books',
];



const authorizeUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
});



app.get('/library', function(req, res) {
    res.redirect(303, authorizeUrl);
});



///////

var rest = require('connect-rest');

// API configuration
var apiOptions = {
    context: '/api',
    domain: require('domain').create(),
};

apiOptions.domain.on('error', function(err){
    console.log('API domain error.\n', err.stack);
    setTimeout(function(){
        console.log('Server shutting down after API domain error.');
        process.exit(1);
    }, 5000);
    server.close();
    var worker = require('cluster').worker;
    if(worker) worker.disconnect();
});



// // authentication
// var auth = require('./lib/auth.js')(app, {
// 	baseUrl: process.env.BASE_URL,
// 	providers: credentials.authProviders,
// 	successRedirect: '/account',
// 	failureRedirect: '/unauthorized',
// });
// // auth.init() links in Passport middleware:
// auth.init();

// // now we can specify our auth routes:
// auth.registerRoutes();
async function getVolumeOfShelf() {
    console.log('Got authenticated client');
    const volumes = await books.mylibrary.bookshelves.volumes.list({
        maxResults: 5, 
        shelf: 3,
    });
    return volumes;
}

app.get('/auth/google/callback', async function (req, res) {
        // we only get here on successful authentication
        const qs = new url.URL(req.url, 'http://localhost:3000')
              .searchParams;
        const {tokens} = await oauth2Client.getToken(qs.get('code'));
        oauth2Client.credentials = tokens;
        res.redirect(303, '/account');
    }
);

app.get('/unauthorized', function(req, res) {
	res.status(403).render('unauthorized');
});

app.get('/account', async function(req, res){
    const volumes = await getVolumeOfShelf();
    //console.log("Volumes: " + JSON.stringify(volumes));
	res.render('account');
});


// a
// add support for auto views
var autoViews = {};

app.use(function(req,res,next){
    var path = req.path.toLowerCase();  
    // check cache; if it's there, render the view
    if(autoViews[path]) return res.render(autoViews[path]);
    // if it's not in the cache, see if there's
    // a .handlebars file that matches
    if(fs.existsSync(__dirname + '/views' + path + '.handlebars')){
        autoViews[path] = path.replace(/^\//, '');
        return res.render(autoViews[path]);
    }
    // no view found; pass on to 404 handler
    next();
});

// 404 catch-all handler (middleware)
app.use(function(req, res, next){
	res.status(404);
	res.render('404');
});

// 500 error handler (middleware)
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500);
	res.render('500');
});


var server = http.createServer(app).listen(app.get('port'), function () {
    console.log('Express started in ' + app.get('env') +
        'mode on http://me.mydomain.com:' + app.get('port') + ' using HTTP' +
        '; press Ctrl-C to terminate.');
});