// Helper function to make an object deep copy.
const deepCopy = (obj, options, output, _refs) => {
  // Invalid input.
  if (!obj || typeof obj !== 'object') return obj;

  // Prevent infinite recursion.
  if (_refs) {
    _refs instanceof Map || (
      _refs = new Map(Array.from(_refs).map(ref => Array.isArray(ref) && (
        ref.length > 1 && ref.slice(0, 2)
        || [ref[0] || obj, obj]
      ) || [ref || obj, ref || obj]))
    );
    const v = _refs.get(obj);
    if (v) return v;
  } else _refs = new Map;

  // If input object is an array, deep copy all the items.
  if (Array.isArray(obj)) {
    !Array.isArray(output) && (output = new Array(obj.length));
    let i = 0, l = output.length;
    _refs.set(obj, output);
    for (; i !== l; ++i) output[i] = deepCopy(obj[i], options, null, _refs);
    for (l = obj.length; i !== l; ++i) output.push(deepCopy(obj[i], options, null, _refs));
    output.length = obj.length;
    return output;
  }

  // Normalize input options.
  options || (options = {});
  const copySelf = options.copySelf || options.copySelf === undefined;

  // Init output and copy proptype keys if needed.
  output || (output = {});
  options.copyProptype && !(output instanceof obj.constructor) && (output = new obj.constructor);
  _refs.set(obj, output);
  
  // Copy attributes.
  if (options.copyNonEnumerables) {
    // Copy enumerables and non-enumerables.
    const keys = Object.getOwnPropertyNames(obj);
    for (let i = 0, l = keys.length; i !== l; ++i) {
      let v = obj[key], vv = !copySelf && typeof v === "object" && _refs.get(v), key;
      if (vv) continue;
      key = keys[i];
      v = deepCopy(v, options, null, _refs);
      (copySelf || typeof v !== "object" || !_refs.get(v)) && (output[key] = v);
    }
  } else {
    // Copy just enumerables.
    for (const key in obj) {
      let v = obj[key], vv = !copySelf && typeof v === "object" && _refs.get(v);
      if (vv) continue;
      v = deepCopy(v, options, null, _refs);
      (copySelf || typeof v !== "object" || !_refs.get(v)) && (output[key] = v);
    }
  }

  return output;
}

// Export.
module.exports = Object.freeze(Object.defineProperty(deepCopy, "deepCopy", {
  value: deepCopy
}));