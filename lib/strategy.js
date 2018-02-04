// Load modules.
const OAuth2Strategy = require('passport-oauth2'),
	util = require('util'),
	uri = require('url'),
	CoinbaseProfile = require('./profile/coinbase'),
	InternalOAuthError = require('passport-oauth2').InternalOAuthError,
	CoinbaseAPIError = require('./errors/coinbaseapierror');

/**
 * `Strategy` constructor.
 *
 * The Coinbase authentication strategy authenticates requests by delegating to
 * Coinbase using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `cb`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your Google application's client id
 *   - `clientSecret`  your Google application's client secret
 *   - `callbackURL`   URL to which Google will redirect the user after granting authorization
 *
 * Examples:
 *
 *     passport.use(new CoinbaseStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/coinbase/callback'
 *       },
 *       function(accessToken, refreshToken, profile, cb) {
 *         User.findOrCreate(..., function (err, user) {
 *           cb(err, user);
 *         });
 *       }
 *     ));
 *
 * @constructor
 * @param {object} options
 * @param {function} verify
 * @access public
 */
function Strategy(options, verify) {
	options = options || {};
	options.authorizationURL = options.authorizationURL || 'https://www.coinbase.com/oauth/authorize';
	options.tokenURL = options.tokenURL || 'http://www.coinbase.com/oauth/token';
	options.scope = constructScope(options.scope);
	OAuth2Strategy.call(this, options, verify);
	this.name = 'coinbase';
	this._userProfileURL = options.userProfileURL || 'https://api.coinbase.com/v2/user';
	this._customHeaders = options.customHeaders || {};
}

/**
 * Build the coinbase permission scope from array of comma seperated items
 *
 * @param
 */
function constructScope(items = []) {
	let permissions = ['wallet:user:read', 'wallet:user:email'];
	permissions.concat(items);

	let scope = [...new Set(permissions)].join(' ');
	return scope;
}

// Inherit from `OAuth2Strategy`.
util.inherits(Strategy, OAuth2Strategy);

/**
 * Retrieve user profile from Coinbase.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `coinbase`
 *   - `id`
 *   - `username`
 *   - `displayName`
 *
 * @param {string} accessToken
 * @param {function} done
 * @access protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {
	let self = this;
	this._oauth2._customHeaders = Object.assign({}, this._customHeaders);
	this._oauth2.get(this._userProfileURL, accessToken, function(err, body, res) {
		let json;

		if (err) {
			if (err) {
				try {
					json = JSON.parse(err.data);
				} catch (_) {}
			}

			if (json && json.errors) {
				return done(new CoinbaseAPIError(json.errors, err.statusCode));
			}
			return done(new InternalOAuthError('Failed to fetch user profile', err));
		}

		try {
			json = JSON.parse(body);
		} catch (ex) {
			return done(new Error('Failed to parse user profile'));
		}

		var profile = CoinbaseProfile.parse(json.data);

		profile.provider = 'coinbase';
		profile._raw = body;
		profile._json = json;

		done(null, profile);
	});
};

/**
 * Return extra Coinbase-specific parameters to be included in the authorization
 * request.
 *
 * @param {object} options
 * @return {object}
 * @access protected
 */
Strategy.prototype.authorizationParams = function(options) {
	var params = {};

	// https://developers.coinbase.com/docs/wallet/coinbase-connect/reference
	// For logged out users, login view is shown by default.
	if (options.layout) {
		params['layout'] = options.layout;
	}

	// Earn a referral bonus from new users who sign up via OAuth
	if (options.referral) {
		params['referral'] = options.referral;
	}
	// 'select' (default) Allow user to pick the wallet associated with the application
	// 'new' Application will create a new wallet (named after the application)
	// 'all' Application will get access to all of user’s wallets
	if (options.account) {
		params['account'] = options.account;
	}

	// Name for this session (not a name for your application.)
	// This will appear in the user’s account settings underneath your application’s name.
	// Use it to provide identifying information if your app is often authorized multiple times
	if (options.sessionName) {
		params['meta[name]'] = options.sessionName;
	}

	// Limit for the amount of money your application can send from the user’s account.
	// This will be displayed on the authorize screen
	if (options.sendLimitAmount) {
		params['meta[send_limit_amount]'] = options.sendLimitAmount;
	}

	// Currency of send_limit_amount in ISO format, ex. BTC, USD
	if (options.sendLimitCurrency) {
		params['meta[send_limit_currency]'] = options.sendLimitCurrency;
	}

	// How often the send money limit expires. Default is month - allowed values are day, month and year
	if (options.sendLimitPeriod) {
		params['meta[send_limit_period]'] = options.sendLimitPeriod;
	}

	return params;
};

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
