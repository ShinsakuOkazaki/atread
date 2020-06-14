//const main = require('.handlers/main.js');
const usersController = require('./controllers/usersController.js');

module.exports = function(app) {
    const auth = require('./lib/auth.js')(app);
    app.get('/', function (req, res) {
        res.render('home');
    });
    // Users route
    app.get('/users', usersController.index, usersController.indexView);
    app.get('users/new', usersController.new);
    app.post('users/create', usersController.create, usersController.redirectView);
    //app.get('/users/login', usersController.login);
   // app.post('/users/login', usersController.authenticate, usersController.redirectView);
    app.get('/auth/google', auth.login);
    app.get('/auth/google/callback', auth.authenticate, auth.redirect);

    app.get('/integrate', function (req, res) {
        res.redirect(303, authorizeUrl);
    });

    app.get('/unauthorized', function (req, res) {
        res.status(403).render('unauthorized');
    });

    app.get('/account', function (req, res) {
        //const volumes = await getVolumeOfShelf();
        //console.log("Volumes: " + JSON.stringify(volumes));
        res.render('account');
    });

    app.get('/library', function (req, res) {
        res.render('library');
    });
}