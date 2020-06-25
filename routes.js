//const main = require('.handlers/main.js');
const usersController = require('./controllers/usersController.js');

const { acquireShelves, getAllVolumeByShelfIds } = require('./lib/books.js');
module.exports = function(app) {
    app.get('/', function (req, res) {
        res.render('home');
    });
    // Users route
    app.get('/users', usersController.index, usersController.indexView);
    app.get('users/new', usersController.new);
    //app.post('users/create', usersController.create, usersController.redirectView);
    //app.get('/users/login', usersController.login);
   // app.post('/users/login', usersController.authenticate, usersController.redirectView);
    const auth = require('./lib/auth.js')(app);
    auth.init();
    app.get('/auth/google', auth.login);
    app.get('/auth/google/callback', auth.authenticate, auth.redirect);

    const books = require('./lib/books.js')(app);
    books.init();
    app.get('/integrate', books.setTokensOfUser, books.acquireShelves, books.getAllVolumeByShelfIds, (req, res) => {
        res.render('account');
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