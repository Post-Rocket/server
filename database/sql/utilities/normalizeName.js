const toSingular = require('./toSingular');

// Helper function to normalize input name.
// Lower case everything and remove special characters.
export const normalizeName = s => {
	(s === null || s === undefined) && (s = '');
	(typeof s !== 'string' && (s = s.toString()));

	let out = '';
	for (let i = 0, l = s.length; i !== l; ++i) {
		const c = s.charCodeAt(i);
		c >= 65 && c <= 90 && (out += String.fromCharCode(c + 32))
		|| ((c >= 48 && (c >= 97 && c <= 122 || c <= 57)) && (out += String.fromCharCode(c)));
	}

	return toSingular(out);
}

// Exports.
module.exports = Object.freeze(Object.defineProperty(normalizeName, 'normalizeName', {
  value: normalizeName
}));