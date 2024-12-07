// Helper function to make an object deep freeze.
const deepFreeze = (obj, options, _refs) => {
  // Invalid input.
  if (!obj || typeof obj !== 'object') return obj;

  // Prevent infinite recursion.
  if (_refs) {
    _refs instanceof Set || (_refs = new Set(Array.from(_refs)));
    if (_refs.has(obj)) return obj;
  } else _refs = new Set;
  _refs.add(obj);

  // If input object is an array, deep freeze all the items.
  if (Array.isArray(obj)) {
    for (let i = 0, l = obj.length; i !== l; ++i) deepFreeze(obj[i], options, _refs);
    return Object.freeze(obj);
  }

  // Normalize input options.
  options || (options = { freezeNonEnumerables: true });

  // Freeze enumerables and non-enumerables.
  if (options.freezeNonEnumerables) {
    const keys = Object.getOwnPropertyNames(obj);
    for (let i = 0, l = keys.length; i !== l; ++i) {
      deepFreeze(obj[keys[i]], options, _refs);
    }
  } else {
    // Freeze just enumerables.
    for (const key in obj) {
      deepFreeze(obj[key], options, _refs);
    }
  }

  return Object.freeze(obj);
}

// Export.
module.exports = Object.freeze(Object.defineProperty(deepFreeze, "deepFreeze", {
  value: deepFreeze
}));