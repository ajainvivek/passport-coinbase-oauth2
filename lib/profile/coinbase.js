/**
 * Parse profile.
 *
 * Parses user profiles as fetched from Coinbase API.
 *
 * The amount of detail in the profile varies based on the scopes granted by the
 * user.  The following scope values add additional data:
 *
 *     `wallet:user:read wallet:user:email` - default login scope
 *
 * References:
 *   - https://developers.coinbase.com/docs/wallet/permissions
 *
 * @param {object|string} json
 * @return {object}
 * @access public
 */
exports.parse = function(json) {
	if ('string' == typeof json) {
		json = JSON.parse(json);
	}

	var profile = Object.assign(
		{
			displayName: json.name
		},
		json
	);

	return profile;
};
