google = require('googleapis');

const books = google.books('v1');

const defaultScope = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/books',
];

/*************/
/** HELPERS **/
/*************/

function createConnection(app, options) {
    var env = app.get('env');
    var config = options.providers;
    return new google.auth.OAuth2(
        config.google[env].clientID,
        config.google[env].clientSecret,
        (options.baseUrl || '') + '/auth/google/callback',
    );
}

function getConnectionUrl(auth) {
    return auth.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: defaultScope
    });
}

function getGoogleBooksApi(auth) {
    return google.books({ version: 'v1', auth});
}

/**********/
/** MAIN **/
/**********/

/**
 * Part 1: Create a Google URL and send to the client to log in the user.
 */
export function urlGoogle(options) {
    const auth = createConnection(options);
    const url = getConnectionUrl(auth);
    return url;
}

/**
 * Part 2: Take the "code" parameter which Google gives us once when the user logs in, then get the user's email and id.
 */
async function getShelf(code, options) {
    const data = await auth.getToken(code);
    const tokens = data.tokens;
    const auth = createConnection(options);
    auth.setCredentials(tokens);
    const books = getGoogleBooksApi(auth);
    const shelve = await books.bookshelves.get({shelf: 3});
    console.log(shelve.data);
    // return {
    //     id: userGoogleId,
    //     email: userGoogleEmail,
    //     tokens: tokens,
    // };
}