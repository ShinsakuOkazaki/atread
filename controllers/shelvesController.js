const {Shelf} = require('../models/user');

module.exports = {
    create: (req, res, next) => {
        let newShelf = new Shelf();
    },

    getShelfFromGoogle: () => {
        
    }
}