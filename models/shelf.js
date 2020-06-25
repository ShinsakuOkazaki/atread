
const mongoose = require('mongoose');
const shelfSchema = mongoos.Schema({
    googleShelfId: Integer,
    title: String, 
    description: String,
    isPublic: Boolean, 
    updated: Date, 
    created: Date, 
    volumeCount: Number, 
    volumes: [{type: mongoose.Schema.Types.ObjectId, ref: "Volume"}],
    owner: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
});

const Shelf = mongoose.model('Shelf', shelfSchema);
shelfSchema.static.findShelfOrCreate = function() {
    return this.model("Shelf")
     .
}
module.exports.Shelf = Shelf;