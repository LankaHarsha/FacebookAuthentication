// app/routes.js
module.exports = function(app, passport) {

    app.get('/', function(req, res) {

        var message = req.flash('failureMessage')[0];
        if (!req.isAuthenticated()) {
            res.render('index.ejs', {
                message: message
            });
        } else {
            res.redirect('/profile')
        }
    });

    // app.get('/login', function(req, res) {

    // 	// render the page and pass in any flash data if it exists
    // 	res.render('login.ejs', { message: req.flash('loginMessage') });
    // });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/loginfailure', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        var message = req.flash('failureMessage')[0];
        if (!req.isAuthenticated()) {
            res.render('signup.ejs', {
                message: message
            });
        } else {
            res.redirect('/profile')
        }
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/signupfailure', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user: req.user,
            status: 'S' // get the user out of session and pass to template
        });
    });

    app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));
    app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    app.get('/loginfailure', function(req, res) {

        console.log("Failure Login Redirection");
        failureLocal(req, res);
    });

    app.get('/signupfailure', function(req, res) {

        console.log("Failure Signup Redirection");
        signupFailure(req, res);
    });
};

// route middleware to make sure
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();
    // if they aren't redirect them to the home page
    res.redirect('/');
}

function failureLocal(req, res, next) {

    var failureMessage = req.flash('errorMessage');
    if (req.flash('errorMessage')) {

        req.flash('failureMessage', failureMessage);
        res.redirect('/');
    } else if(req.isAuthenticated()) {

        res.redirect('/profile');
    } else {

        res.redirect('/');
    }
}

function signupFailure(req, res, next) {

    var failureMessage = req.flash('errorMessage');
    if (req.flash('errorMessage')) {

        req.flash('failureMessage', failureMessage);
        res.redirect('/signup');
    } else if(req.isAuthenticated()) {

        res.redirect('/profile', {
            user: req.user
        });
    } else {
        res.redirect('/');
    }
}