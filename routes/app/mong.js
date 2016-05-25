var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var RestS   = new Schema({
    address: {building: String, coord: Array, street : String, zipcode : String},
    borough: String,
    cuisine: String, 
    grades: [{date: Date, grade: String, score: Number}],
    name: String,
    restaurant_id: String,
    reservation: [{id: String, title: String, start: Date, end: Date}]
}, {collection : 'food'}); //needed for 

module.exports = mongoose.model('Rest', RestS);


