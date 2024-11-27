// Helper function to singularize a string. It only works for lowercase words.
const pluraltoSingularExceptions = {
  geese: 'goose',
  mice: 'mouse',
  feet: 'foot',
  teeth: 'tooth',
  oxen: 'ox',
  cacti: 'cactus',
  cactus: 'cactus',
  couscous: 'couscous',
  octopus: 'octopus'
};

export const toSingular = s => {
  if (s.length < 4) return s;
  const exception = pluraltoSingularExceptions[s];
  if (exception) return exception;

  const l1 = s.length - 1, c1 = s.charAt(l1);
  const l2 = l1 - 1, c2 = s.charAt(l2);
  const l3 = l2 - 1, c3 = s.charAt(l3);

  if (c1 === 's' && c2 !== 's') {
    if (c2 === 'e') {
      if (c3 === 'i') {
        return s.slice(0, l3) + 'y';
      }
      if (c3 === 'v') {
        return s.slice(0, l3) + 'f';
      }
      if (c3 === 'a' || c3 === 'o' || c3 === 'u') {
        return s.slice(0, l2);
      }
      return s.slice(0, l1);
    }
    return s.slice(0, l1);
  }
  
  return s;
}

// Exports.
module.exports = Object.freeze(Object.defineProperty(toSingular, 'toSingular', {
  value: toSingular
}));