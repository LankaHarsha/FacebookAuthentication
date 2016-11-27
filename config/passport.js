// load all the things we need
var FacebookStrategy = require('passport-facebook').Strategy;
var localStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// load up the user model
var User = require('../app/models/user');

// load the auth variables
var configAuth = require('./auth');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {

        console.log("Serializing User");
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        console.log("Deserializing User");
        User.findById(id, function(err, user) {
            console.log(user);
            done(err, {
                email: user.email,
                displayName: user.displayName,
                token: user.token
            });
        });
    });

    passport.use(new FacebookStrategy({

            // pull in our app id and secret from our auth.js file
            clientID: configAuth.facebookAuth.clientID,
            clientSecret: configAuth.facebookAuth.clientSecret,
            callbackURL: configAuth.facebookAuth.callbackURL,
            enableProof: true,
            profileFields: ['id', 'emails', 'gender', 'name', 'timezone', 'displayName']
        },

        // facebook will send back the token and profile
        function(token, refreshToken, profile, done) {

            // asynchronous
            console.log("Printing Profile");
            console.log(profile);
            // find the user in the database based on their facebook id
            User.findOne({ 'email': profile._json.email }, function(err, user) {

                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {
                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user found with that facebook id, create them
                    var newUser = new User();

                    // set all of the facebook information in our user model
                    newUser.email = profile._json.email; // set the users facebook id                   
                    newUser.displayName = profile._json.name;
                    newUser.provider = 'FACEBOOK',
                        newUser.token = token,
                        newUser.firstName = profile._json.first_name,
                        newUser.lastName = profile._json.last_name

                    // save our user to the database
                    newUser.save(function(err) {
                        if (err)
                            throw err;

                        // if successful, return the new user
                        return done(null, newUser);
                    });
                }

            });

        }));



    passport.use(new GoogleStrategy({

            clientID: configAuth.googleAuth.clientID,
            clientSecret: configAuth.googleAuth.clientSecret,
            callbackURL: configAuth.googleAuth.callbackURL,

        },
        function(token, refreshToken, profile, done) {

            console.log(profile);
            // try to find the user based on their google id
            User.findOne({ 'email': profile._json.email }, function(err, user) {
                if (err)
                    return done(err);

                if (user) {

                    // if a user is found, log them in
                    return done(null, user);
                } else {
                    // if the user isnt in our database, create a new user
                    var newUser = new User();

                    // set all of the relevant information
                    newUser.email = profile._json.email; // set the users facebook id                   
                    newUser.displayName = profile._json.name;
                    newUser.provider = 'GOOGLE',
                        newUser.token = token,
                        newUser.firstName = profile._json.given_name,
                        newUser.lastName = profile._json.family_name

                    // save the user
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });
        }));

    passport.use('local-login', new localStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) { // callback with email and password from our form

            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            User.findOne({ 'email': email }, function(err, user) {
                // if there are any errors, return the error before anything else
                if (err) {

                    return done(err);
                }

                // if no user is found, return the message
                else if (!user) {

                    return done(null, false, req.flash('errorMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
                }

                // if the user is found but the password is wrong
                else if (user && user.provider !== 'LOCAL') {

                    var errorMessage = 'You have already registerd with provider:' + user.provider + ' So, Please use the same to login again!';
                    return done(null, false, req.flash('errorMessage', errorMessage)); // create the loginMessage and save it to session as flashdata
                } else if (!user.validPassword(password)) {

                    var errorMessage = 'Invalid Password';
                    return done(null, false, req.flash('errorMessage'))
                } else {
                    
                    return done(null, user);
                }
                // all is well, return successful user
                // return done(null, user);
            });

        }));

    
    passport.use('local-signup', new localStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) { // callback with email and password from our form

            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            User.findOne({ 'email': email }, function(err, user) {
                // if there are any errors, return the error before anything else
                if (err) {

                    return done(err);
                }

                // if  user is found, return the message
                else if (user) {

                    return done(null, false, req.flash('errorMessage', 'Email already registered!')); // req.flash is the way to set flashdata using connect-flash
                }

                // if the no user is found 
                else {

                    var newUser = new User();
                    console.log(newUser);
                    newUser.email = email;
                    newUser.password = newUser.hashPassword(password);
                    newUser.firstName = req.body.firstName;
                    newUser.lastName = req.body.lastName;
                    newUser.displayName = req.body.firstName + '' + req.body.lastName;
                    newUser.provider = 'LOCAL';
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });

        }));

        
};
