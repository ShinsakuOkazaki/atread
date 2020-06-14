
const mongoose = require('mongoose');
const shelfSchema = mongoose.Schema({
    googleBooksId: Number, 
    title: String, 
    description: String,
    isPublic: Boolean, 
    updated: Date, 
    created: Date, 
    volumeCount: Number, 
    volumes: [String], // volumeId
});

const Shelf = mongoose.model('Shelf', shelfSchema);
module.exports = Shelf;