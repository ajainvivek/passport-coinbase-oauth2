# passport-coinbase-oauth20

[![Build](https://img.shields.io/travis/ajainvivek/passport-coinbase-oauth2.svg)](https://travis-ci.org/ajainvivek/passport-coinbase-oauth2)
[![Coverage](https://img.shields.io/coveralls/ajainvivek/passport-coinbase-oauth2.svg)](https://coveralls.io/r/ajainvivek/passport-coinbase-oauth2)
[![Quality](https://img.shields.io/codeclimate/github/ajainvivek/passport-coinbase-oauth2.svg?label=quality)](https://codeclimate.com/github/ajainvivek/passport-coinbase-oauth2)
[![Dependencies](https://img.shields.io/david/ajainvivek/passport-coinbase-oauth2.svg)](https://david-dm.org/ajainvivek/passport-coinbase-oauth2)

[Passport](http://passportjs.org/) strategy for authenticating with [Coinbase](http://www.coinbase.com/)
using the OAuth 2.0 API.

This module lets you authenticate using Google in your Node.js applications.
By plugging into Passport, Google authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install

```bash
$ npm install passport-coinbase-oauth20
```

## Usage

#### Create an Application

Before using `passport-coinbase-oauth20`, you must create an account with
Coinbase. Your application will be issued a client ID and client secret, which need to be
provided to the strategy. You will also need to configure a redirect URI which
matches the route in your application.

#### Configure Strategy

The Coinbase authentication strategy authenticates users using a Coinbase account
and OAuth 2.0 tokens. The client ID and secret obtained when creating an
application are supplied as options when creating the strategy. The strategy
also requires a `verify` callback, which receives the access token and optional
refresh token, as well as `profile` which contains the authenticated user's
Coinbase profile. The `verify` callback must call `cb` providing a user to
complete authentication.

```javascript
var CoinbaseStrategy = require('passport-coinbase-oauth20').Strategy;

passport.use(
	new CoinbaseStrategy(
		{
			clientID: COINBASE_CLIENT_ID,
			clientSecret: COINBASE_CLIENT_SECRET,
			callbackURL: 'http://www.example.com/auth/coinbase/callback',
		},
		function(accessToken, refreshToken, profile, cb) {
			User.findOrCreate({ coinbaseId: profile.id }, function(err, user) {
				return cb(err, user);
			});
		},
	),
);
```

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'google'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

```javascript
app.get('/auth/coinbase', passport.authenticate('coinbase', { scope: ['wallet:user:read', 'wallet:user:email'] }));

app.get('/auth/google/callback', passport.authenticate('coinbase', { failureRedirect: '/login' }), function(req, res) {
	// Successful authentication, redirect home.
	res.redirect('/');
});
```

## Examples

Developers using the popular [Express](http://expressjs.com/) web framework can
refer to an [example](https://github.com/passport/express-4.x-facebook-example)
as a starting point for their own web applications. The example shows how to
authenticate users using Facebook. However, because both Facebook and Google
use OAuth 2.0, the code is similar. Simply replace references to Facebook with
corresponding references to Google.

## Contributing

#### Tests

The test suite is located in the `test/` directory. All new features are
expected to have corresponding test cases. Ensure that the complete test suite
passes by executing:

```bash
$ make test
```

#### Coverage

The test suite covers 100% of the code base. All new feature development is
expected to maintain that level. Coverage reports can be viewed by executing:

```bash
$ make test-cov
$ make view-cov
```

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2018 Ajain Vivek <[http://chaicode.com/](http://chaicode.com/)>
