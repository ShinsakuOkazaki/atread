const mongoose = require('mongoose');

const volumeSchema = mongoose.Schema({
   googleVolumeId: {
      type: String,
      unique: true, 
   },
   title: {
      type: String, 
      unique: true,
   },
   subtitle: String, 
   authorIds: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}], // authorId in platform
   authors: [String], // names of author member
   publisher: String,
   publishedDate: Date, 
   categories: String, 
   imageLinks: {
      smallThumbnail: String,
      thumbnail: String,
      small: String,
      medium: String,
      large: String,
      extraLarge: String,
   }, // google api image links or url of author specified image.
   language: String, 
});

const Volume = mongoose.model('volume', volumeSchema);
module.exports.Volume = Volume;
module.exports.volumeSchema = volumeSchema;