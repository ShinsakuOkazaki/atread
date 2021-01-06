const {google} = require('googleapis');
const books = google.books('v1');
const {Shelf} = require('../models/user');
const {Volume} = require('../models/volume');
const credentials = require('../credentials.js');
const { query } = require('express-validator');
// const {ImageLinks} = require('../models/imageLinks');

let oauth2Client;

module.exports = (app) => {
    return {

        init: () => {
            const env = app.get('env');
            const authProvider = credentials.authProviders.google;
            oauth2Client =  new google.auth.OAuth2(
                authProvider[env].clientID,
                authProvider[env].clientSecret,
                'http://me.mydomain.com:3000' + '/auth/google/callback',
            );
            google.options({auth: oauth2Client});
        }, 
        setTokensOfUser: (req, res, next) => {
            let user = res.locals.currentUser;
            console.log("Tokens: " + user.tokens);
            oauth2Client.setCredentials(user.tokens);
            next();
        }, 
        
        acquireShelves: async (req, res, next) => {
            console.log("Start aquireShelves");
            const query = await books.mylibrary.bookshelves.list();
            const shelves = query.data.items;
            res.locals.shelves = shelves;
            console.log("End aquireShelves");
            next();
        }, 
        getAllVolumeByShelfIds: async (req, res, next) => {
            console.log("Start getAllVolumeByShelfIds");
            const shelfIds = res.locals.shelves.map(shelf => shelf.id); 
            console.log("ShelfIds: %o", shelfIds);
            
            const queries = [];
            for (let i = 0; i < shelfIds.length; i++) {
                queries[i] = await books.mylibrary.bookshelves.volumes.list({
                    shelf: shelfIds[i],
                });
            }
            // shelfIds.map(async shelfId => {
            //     const query = await b
            //     return query;
            // });
            //const queries = await Promise.all(queryPromises);
            const volumes = queries.map(query => query.data.items);
            res.locals.volumes = volumes;
            console.log("End getAllVolumeByShelfIds");
            next();
        },
        createShelvesFromGoogle: async (req, res, next) => {
            // use user._id to select shelves 
            // and select specific shelf by googleBooksId in shelf
            const userId = res.locals.user._id;
            const shelves = res.locals.shelves;
            const shelfIds = shelves.map(shelf => shelf.id);
            const newShelves = [];
            for(let i = 0; i < shelfIds.length; i++) {
                newShelves[i] = await Shelf.find({owner: userId, googleShelfId: shelfIds[i]})
                                    .exec()
                                    .then(results => {
                                        if(results) return results[0];
                                        // need to add concdition for create 
                                        else return Shelf.create();
                                    })
                                    .then(result => {
                                        console.log(result);
                                        return result;
                                    });
            }
            next();
        }, 
        
        mapVolumeGoogleApiToProperty: (req, res, next) => {
            const volumes = res.locals.volumes;
            const properties = volumes.map(volume => {
                return {
                    googleVolumeId: volume.id,
                    title: volume.volumeInfo.title,
                    subtitle: volume.volumeInfo.subtitle, 
                    // need authorIds later
                    authors: volume.volumeInfo.authors,
                    publisher: volume.publisher,
                    publishedDate: volume.publishedDate, 
                    categories: volume.categories, 
                    imageLinks: {
                        smallThumbnail: volume.volumeInfo.imageLinks.smallThumbnail ? volume.volumeInfo.imageLinks.smallThumbnail : "",
                        thumbnail: volume.volumeInfo.imageLinks.thumbnail ? volume.volumeInfo.imageLinks.thumbnail : "",
                        small: volume.volumeInfo.imageLinks.small ? volume.volumeInfo.imageLinks.small : "",
                        medium: volume.volumeInfo.imageLinks.medium ? volume.volumeInfo.imageLinks.medium : "",
                        large: volume.volumeInfo.imageLinks.large ? volume.volumeInfo.imageLinks.large : "",
                        extraLarge: volume.volumeInfo.imageLinks.extraLarge ? volume.volumeInfo.imageLinks.extraLarge : "", 
                    },
                    language: volume.volumeInfo.language, 
                }
            });
            res.locals.volumeProperties = properties;
            next();
        },

        createVolumesFromGoogle: async (req, res, next) => {
            const properties = res.locals.volumeProperties;
            const volumeIds = properties.map(volume => volume.googleVolumeId);
            const newVolumes = [];
            for(let i = 0; i < shelfIds.length; i++) {
                newVolumes[i] = await Volume.find({googleId: volumeIds[i]})
                                    .exec()
                                    .then(results => {
                                        if(results) return results[0];
                                        // need to add concdition for create 
                                        else return Volume.create(properties[i]);
                                    })
                                    .then(result => {
                                        return result;
                                    })
            }
            next();
        }
    }
}

