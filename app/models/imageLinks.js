const mongoose = require('mongoose');
const imageLinksSchema = mongoose.mongo.Schema({
   smallThumbnail: String,
   thumbnail: String,
   small: String,
   medium: String,
   large: String,
   extraLarge: String,
});
const ImageLinks = mongoose.model('imageLinks', imageLinksSchema);
module.exports.ImageLinks = ImageLinks;
module.exports.imageLinksSchema = imageLinksSchema;