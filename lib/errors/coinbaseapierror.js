/**
 * `CoinbaseAPIError` error.

 * @constructor
 * @param {string} [message]
 * @param {number} [code]
 * @access public
 */
function CoinbaseAPIError(message, code) {
	Error.call(this);
	Error.captureStackTrace(this, arguments.callee);
	this.name = 'CoinbaseAPIError';
	this.message = message;
	this.code = code;
}

// Inherit from `Error`.
CoinbaseAPIError.prototype.__proto__ = Error.prototype;

// Expose constructor.
module.exports = CoinbaseAPIError;
