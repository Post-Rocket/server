// Keep object reference if possible.
const extendObject = obj => obj && (Object.isSealed(obj) || Object.isFrozen(obj)) && {...obj} || obj;

// Export.
module.exports = Object.freeze(Object.defineProperty(extendObject, 'extendObject', {
  value: extendObject
}));