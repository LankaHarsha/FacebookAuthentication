// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

	'facebookAuth' : {
		'clientID' 		: '195589520897090', // your App ID
		'clientSecret' 	: '01b466a7c482955e6bcde53bd5c4e2de', // your App Secret
		'callbackURL' 	: 'http://localhost:8080/auth/facebook/callback'
	}

};