const mongoose = require('mongoose');
const passport = require('passport');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
var LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
// const expressValidator = require('express-validator');




const User = new mongoose.Schema({
    matric: {
        type: String,
        required: true

    },

    username: {
        type: String,
        required: true

    },

    email: {
        type: String,
        required: true

    },

    password: {
        type: String
            // required: true

    },

    phone: {
        type: Number,
        required: true

    },

    faculty: {
        type: String,
        required: true

    },

    department: {
        type: String,
        required: true

    },

    programme: {
        type: String,
        required: true

    },

    level: {
        type: String,
        required: true

    },

    address: {
        type: String,
        required: true

    },

    photo: {
        type: String,
        required: false,
        default: 'profile.png'

    },


});

User.plugin(passportLocalMongoose);

// User.authenticate = passport.use('local', new LocalStrategy({
//         usernameField: 'email',
//         passwordField: 'password',
//         passReqToCallback: true // allows us to pass back the entire request to the callback
//     },
//     function(username, password, done) {
//         User.findOne({ email: email })
//             .exec(function(err, user) {
//                 if (err) {
//                     return done(err)
//                 } else if (!user) {
//                     var err = new Error('User not found.');
//                     err.status = 401;
//                     return done(err);
//                 }
//                 // bcrypt.compare(password, user.password, function(err, result) {
//                 //     if (result === true) {
//                 //         return done(null, user);
//                 //     } else {
//                 //         return done();
//                 //     }
//                 // })
//             });
//  }
// ));


module.exports = mongoose.model('users', User);


// let User = module.exports = mongoose.model('User', userSchema);