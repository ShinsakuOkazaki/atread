const mongoose = require('mongoose');
const volumeSchema = mongoose.Schema({
   title: String, 
   subtitle: String, 
   authorIds: [String], // authorId in platform
   authors: [String], // names of author member
   publisher: String,
   publishDate: Date, 
   categories: String, 
   imageLinks: [String], // google api image links or url of author specified image.
   language: String, 
   bookmarks: Number, 
});

const Volume = mongoose.model('volume', volumeSchema);
module.exports = Volume;