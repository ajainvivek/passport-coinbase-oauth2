const express = require('express');
const app = express();
const passport = require('passport');
const CoinbaseStrategy = require('./../lib/index').Strategy;
const crypto = require('crypto');
const moment = require('moment');

const secret = 'abcdefg';
const hash = crypto
	.createHmac('sha256', secret)
	.update('I love cupcakes')
	.digest('hex');

passport.use(
	new CoinbaseStrategy(
		{
			clientID: '--client-id-here--',
			clientSecret: '--client-secret-here--',
			callbackURL: '/login/coinbase/return',
			authorizationURL: 'https://coinbase.com/oauth/authorize',
			tokenURL: 'https://api.coinbase.com/oauth/token',
			userProfileURL: 'https://api.coinbase.com/v2/user',
			scope: ['wallet:user:email'],
			customHeaders: {
				'CB-ACCESS-SIGN': hash,
				'CB-ACCESS-TIMESTAMP': moment().unix(),
				'CB-ACCESS-KEY': '--client-id-here--',
				'CB-VERSION': '2018-01-31'
			}
		},
		function(accessToken, refreshToken, profile, done) {
			// placeholder for translating profile into your own custom user object.
			// for now we will just use the profile object returned by Coinbase
			return done(null, profile);
		}
	)
);

// Express and Passport Session
var session = require('express-session');
app.use(session({ secret: 'enter custom sessions secret here' }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
	// placeholder for custom user serialization
	// null is for errors
	done(null, user);
});

passport.deserializeUser(function(user, done) {
	// placeholder for custom user deserialization.
	// maybe you are getoing to get the user from mongo by id?
	// null is for errors
	done(null, user);
});

// we will call this to start the Coinbase Login process
app.get('/auth/coinbase', passport.authenticate('coinbase'));

// Coinbase will call this URL
app.get('/login/coinbase/return', (req, res, next) => {
	return passport.authenticate('coinbase', { failureRedirect: '/' }, (err, user, info) => {
		if (err) {
			res.redirect('/error');
		} else {
			req.session.save(() => {
				res.redirect('/');
			});
		}
		next();
	})(req, res, next);
});

app.get('/error', function(req, res) {
	var html = "<ul>\
	<li><a href='/auth/coinbase'>Try again!</a></li>\
	</ul>";

	html += '<p>authenticated failed</p>';

	res.send(html);
});

app.get('/', function(req, res) {
	var html = "<ul>\
    <li><a href='/auth/coinbase'>Coinbase</a></li>\
    <li><a href='/logout'>logout</a></li>\
  </ul>";

	// dump the user for debugging
	if (req.isAuthenticated()) {
		html += '<p>authenticated as user:</p>';
		html += '<pre>' + JSON.stringify(req.user, null, 4) + '</pre>';
	}

	res.send(html);
});

app.get('/logout', function(req, res) {
	console.log('logging out');
	req.logout();
	res.redirect('/');
});

// Simple route middleware to ensure user is authenticated.
//  Use this route middleware on any resource that needs to be protected.  If
//  the request is authenticated (typically via a persistent login session),
//  the request will proceed.  Otherwise, the user will be redirected to the
//  login page.
function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/');
}

app.get('/protected', ensureAuthenticated, function(req, res) {
	res.send('acess granted');
});

var server = app.listen(8080, function() {
	console.log('Example app listening at http://%s:%s', server.address().address, server.address().port);
});
