// server.js

// set up ======================================================================
// get all the tools we need
var express = require('express');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var app = express();
var port = process.env.PORT || 9000;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var client = require('redis').createClient('6379', '192.168.99.100');

var configDB = require('./config/database.js');

mongoose.connect(configDB.url, function(err) {
    if (err) {
        console.log('Error ' + err);
    } else {
        console.log("Mongo Server started!");
    }
});

require('./config/passport')(passport); // pass passport for configuration

app.configure(function() {

    // set up our express application
    app.use(express.logger('dev')); // log every request to the console
    app.use(express.cookieParser()); // read cookies (needed for auth)
    app.use(express.bodyParser()); // get information from html forms 

    app.set('view engine', 'ejs'); // set up ejs for templating

    // required for passport
    app.use(session({
        secret: 'MY SCRET KEY',
        store: new RedisStore({ client: client }),
        resave: true,
    	saveUninitialized: true
    })); // session secret
    app.use(passport.initialize());
    app.use(passport.session()); // persistent login sessions
    app.use(flash()); // use connect-flash for flash messages stored in session
    app.use(function(req, res, next) {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        next();
    });

});

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
