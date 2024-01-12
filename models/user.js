const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

//create a new schema for users
const userSchema = new Schema({
    admin: {
        type: Boolean, 
        default: false
    }
});

//passport-local-mongoose will add username and password fields to the schema
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);