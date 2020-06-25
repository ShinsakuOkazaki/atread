const http = require('http');
const express = require('express');
const fs = require('fs');
const session = require('express-session');
const User = require('./models/user.js');
// const expressValidator = require('express-validator');


app = express();
const credentials = require('./credentials.js');
// set up handlebars view engine
const handlebars = require('express3-handlebars')
	.create({ defaultLayout:'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 3000);
// use domains for better error handling
app.use(function(req, res, next){
    // create a domain for this request
    const domain = require('domain').create();
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
            const worker = require('cluster').worker;
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

const MongoSessionStore = require('connect-mongo')(session);
const sessionStore = new MongoSessionStore({url: credentials.mongo[app.get('env')].connectionString});

// static middleware: it is equivarent to creating a route for each static file you want to 
// deliver that renders a file and returns it to the client.
app.use(express.static(__dirname + '/public'));
app.use(require('body-parser')());
app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(session({
	resave: false,
	saveUninitialized: false,
	secret: credentials.cookieSecret,
	store: sessionStore,
}));


const mongoose = require('mongoose');
const opts = {
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

mongoose.Promise = global.Promise;


// app.use(expressValidator());

require('./routes.js')(app);

// const rest = require('connect-rest');

// API configuration
// const apiOptions = {
//     context: '/api',
//     domain: require('domain').create(),
// };

// apiOptions.domain.on('error', function(err){
//     console.log('API domain error.\n', err.stack);
//     setTimeout(function(){
//         console.log('Server shutting down after API domain error.');
//         process.exit(1);
//     }, 5000);
//     server.close();
//     const worker = require('cluster').worker;
//     if(worker) worker.disconnect();
// });





// add support for auto views
const autoViews = {};

app.use(function(req,res,next){
    const path = req.path.toLowerCase();  
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


const server = http.createServer(app).listen(app.get('port'), function () {
    console.log('Express started in ' + app.get('env') +
        'mode on http://me.mydomain.com:' + app.get('port') + ' using HTTP' +
        '; press Ctrl-C to terminate.');
});