const { Sequelize, Model, DataTypes } = require("sequelize");
const deepCopy = require("./misc/deepCopy");
const { decamelize } = require("./misc/toKebabCase");
const toSingular = require("./misc/toSingular");

/**
  * A model is of the form:
  * {
  *   name: <string | required>,
  *   attributes: <object | required>,
  *   options: <object | optional>
  * }
  * 
  * Input: an array of models or the indicated input values
  */

const getModel = (name, attributes, options, ...other) => {
  const output = {
    name: ""
  };

  // Normalize input.
  (!name || typeof name === "object") && (
    other.unshift(name, attributes, options)
  ) || (
    typeof name === "string"
    && attributes && typeof attributes === "object"
    && (!options || typeof options === "object")
    && other.unshift({
      name,
      attributes,
      options
    })
  );

  // Concat input.
  let attribute;
  for (let i = 0, l = other.length, m; i !== l; ++i) {
    (m = other[i]) && typeof m === "object" && (
      m.name && typeof m.name === "string" && (output.name += `${output.name && "_" || ""}${m.name}`),
      (attributes = m.attributes || m.fields || m.entries) && typeof attributes === "object" && Object.assign(output.attributes || (output.attributes = {}), attributes),
      m.options && typeof m.options === "object" && Object.assign(output.options || (output.options = {}), m.options)
    );
  }

  // Check for validity.
  if (!output.name) throw Error(`Schema is missing a name\n${JSON.stringify(output, null, 2)}`);
  attributes = output.attributes;
  if (!attributes) throw Error("Schema is missing attributes");

  // Normalize attributes type.
  for (const k in attributes) {
    attribute = attributes[k];
    typeof attribute === "string" && (attribute = attributes[k] =  { type: attribute })
      || (attribute && typeof attribute === "object" && attribute.type && (
        attribute = attributes[k] = { ...attribute })
      );
    let type = attribute.type, num, options;
    // If type is a string describing the type.
    typeof type === "string" && (
      type = type.toUpperCase(),
      options = type.split(".").slice(1),
      num = parseInt(type),
      // Text/String type.
      (type.startsWith("STR") || type.startsWith("VARCHAR")) && (
        type = num && DataTypes.STRING(num) || DataTypes.STRING
      ) || (
        (type === "TXT" || type === "TEXT") && (
          type = DataTypes.TEXT
        )
      ) || (
        (type.includes("TXT") || type.includes("TEXT")) && (
          type = num && DataTypes.STRING(num) || (
            type.includes("TINY") && DataTypes.TEXT("tiny")
            || (type.includes("MEDIUM") && DataTypes.TEXT("medium"))
            || (type.includes("LONG") && DataTypes.TEXT("long"))
          ) || DataTypes.TEXT
        )
      ) || (
        // Char type.
        type.startsWith("CHAR") && (
          type = num && DataTypes.CHAR(num) || DataTypes.CHAR
        )
      ) || (
        // Boolean type.
        (type.startsWith("BOOL") || type.startsWith("BIN")) && (
          type = DataTypes.BOOLEAN
        )
      ) || (
        // Integer type.
        (type === "INT" || type === "INTEGER" || (type.includes("INT") && type.includes("LONG"))) && (
          type = num && DataTypes.INTEGER(num) || DataTypes.INTEGER
        )
      ) || (
        type.includes("INT") && (
          type.includes("TINY") && (num && DataTypes.TINYINT(num) || DataTypes.TINYINT)
          || (type.includes("SMALL") && (num && DataTypes.SMALLINT(num) || DataTypes.SMALLINT))
          || (type.includes("MEDIUM") && (num && DataTypes.MEDIUMINT(num) || DataTypes.MEDIUMINT))
          || (type.includes("MEDIUM") && (num && DataTypes.MEDIUMINT(num) || DataTypes.MEDIUMINT))
          || (type.includes("BIG") && (num && DataTypes.BIGINT(num) || DataTypes.BIGINT))
        )
      ) || (
        // Float / double type.
        (type.startsWith("FLOAT")) && (
          type = num && num > 32 && DataTypes.DOUBLE || DataTypes.FLOAT
        )
      ) || (
        // Date type.
        (type.includes("DATE")) && (
          type = num && DataTypes.DATE(num) || DataTypes.DATE
        )
      ) || (
        // Time type.
        (type.includes("TIME")) && (
          type = num && DataTypes.TIME(num) || DataTypes.TIME
        )
      ) || (
        // Blob type.
        type.includes("BLOB") && (
          type.includes("TINY") && DataTypes.BLOB("tiny")
          || (type.includes("MEDIUM") && DataTypes.BLOB("medium"))
          || (type.includes("LONG") && DataTypes.BLOB("long"))
        ) || DataTypes.BLOB
      ) || (
        // JSON type.
        (type.includes("OBJ")) && (
          type = DataTypes.JSON
        )
      ) || (type = DataTypes[type] && (num && DataTypes[type](num) || DataTypes[type]) || type || DataTypes.TEXT),
      options.length && type && options.forEach(v => type = type[v])
    ) || (
      // Type is a number.
      typeof type === "number" && (type = parseInt(type) === type && DataTypes.INTEGER || DataTypes.FLOAT)
    ) || (
      // Type is a boolean.
      typeof type === "boolean" && (type = DataTypes.BOOLEAN)
    ) || (
      // Type is a date (class).
      (type === Date || type.prototype instanceof Date || type instanceof Date) && (type = DataTypes.DATE)
    ) || (
      // Type is a string (class).
      (type === String || type.prototype instanceof String || type instanceof String) && (type = DataTypes.TEXT)
    ) || (
      // Type is a number (class).
      (type === Number || type.prototype instanceof Number || type instanceof Number) && (type = DataTypes.NUMBER)
    ) || (
       // Type is a boolean (class).
      (type === Boolean || type.prototype instanceof Boolean || type instanceof Boolean) && (type = DataTypes.BOOLEAN)
    );
    type && (attribute.type = type);
  }

  // Add display method, for debugging.
  return Object.defineProperty(output, "toString", {
    value: () => JSON.stringify(output, (key, value) => (
      typeof value === "function" && value.name
      || value
    ), 2),
    configurable: true,
    writable: true,
    enumerable: false
  });
}

// Helper functions to get/clean an association type.
const getType = (input, defaultType) => input && typeof input === "object" && (
  input.type
    || input.relation
    || input.assoc
    || input.relationship
    || input.association
    || input.associationType
    || (input.options && getType(input.options))
    || defaultType
);
const removeType = input => input && typeof input === "object" && (
  delete input.type,
  delete input.relation,
  delete input.assoc,
  delete input.relationship,
  delete input.association,
  delete input.associationType,
  removeType(input.options)
);

/**
  * An association is of the form:
  * {
  *   name: <string | optional>,
  *   models: <array | required>,
  *   type: <string: "ONE_TO_ONE", "ONE_TO_MANY", "MANY_TO_MANY" | default: MANY_TO_MANY | optional >,
  *   options: <object | optional>
  * }
  * 
  * Input: an array of models or an array of model names or the indicated input values
  * If the input is an array, the association type will be automatically many to many
  * The default association type is many to many
  * If the number of models is greater than 2, the type is also many to many
  */
const getAssociation = (name, models, options, ...other) => {
  const output = {
    name: ""
  };

  // Normalize input.
  let _models;
  (name && typeof name === "object")
    && Array.isArray(
      _models = name.association || name.associations || name.models
    ) && _models.length && (
    output.models = [_models, ...(models || [])]
      .flat()
      .map(x => x && typeof x === "object" && x.name || x)
      .filter(x => x && typeof x === "string"),
      name.name && (output.name = name.name) || output.models.forEach(name => output.name += `${output.name && "_" || ""}${name}`),
    output.options = {...(name.options || {}), ...(options || {})},
    name.through && !output.options.through && (output.options.through = name.through),
    output.type = getType(output.options) || getType(name, "MANY_TO_MANY")
  ) || (((name && typeof name === "object") || (models && typeof models === "string")) && (
    output.models = [name, models, options, ...other]
      .flat()
      .map(x => x && typeof x === "object" && x.name || x)
      .filter(x => x && typeof x === "string"),
    output.models.forEach(name => output.name += `${output.name && "_" || ""}${name}`),
    output.type = "MANY_TO_MANY"
  )) || (
    models && Array.isArray(models) && models.length > 1
    && (!options || typeof options === "object")
    && (
      output.models = models.map(m => m && (typeof m === "object" && m.name || (typeof m === "string" && m))).filter(x => x),
      name && (output.name = `${name}`) || output.models.forEach(name => output.name += `${output.name && "_" || ""}${name}`),
      options && typeof options === "object" && (output.options = {...options}),
      output.type = getType(output.options, "MANY_TO_MANY")
    )
  );

  // Normalize options.
  output.options && removeType(output.options);
  !(output.options && Object.keys(output.options).length) && delete output.options;

  // Normalise type.
  let type;
  output.type && (
    type = (output.type.toUpperCase().replace("1", "ONE").match(/MANY|ONE|HAS|BELONGS/g) || []),
    !type.length && (output.type = "MANY_TO_MANY") || (
      type.length === 1 && (
        output.type = type[0] === "ONE" && "ONE_TO_ONE"
          || (type[0] === "BELONGS" && "BELONGS_TO")
          || (type[0] === "HAS" && "HAS_MANY")
          || "MANY_TO_MANY"
      ) || (
        type[0] === type[1] && (output.type = type[0] === "ONE" && "ONE_TO_ONE" || "MANY_TO_MANY") 
        || (
          type[0] === "MANY" && (
            output.models.unshift(output.models.pop()),
            output.type = "ONE_TO_MANY"
          ) || (
             type[0] === "ONE" && (output.type = "ONE_TO_MANY")
          ) || (
            type[0] === "HAS" && (output.type = `HAS_${type[1]}`)
          ) || (
            output.type = type[1] === "MANY" && "BELONGS_TO_MANY" || "BELONGS_TO"
          )
        )
      )
    )
  ) || (output.type = "MANY_TO_MANY");
  output.models.length > 2 && (output.type = "MANY_TO_MANY");

  // Normalize through.
  output.type === "MANY_TO_MANY" && (
    !(output.options && output.options.through) && (
      output.options || (output.options = {}),
      output.options.through = output.name
    ) || (
      typeof output.options.through === "object" && (
        !output.options.through.name && (output.options.through.name = output.name)
        || (output.name = output.options.through.name)
      ) 
    ) || (
      output.name = output.options.through
    )
  );

  // Add display method, for debugging.
  return Object.defineProperty(output, "toString", {
    value: () => JSON.stringify(output, (key, value) => (
      typeof value === "function" && value.name
      || value
    ), 2),
    configurable: true,
    writable: true,
    enumerable: false
  });
}

const createShortcut = type => (name, model1, model2, options) => getAssociation(
  name || "",
  [model1, model2],
  {...(options || {}), type }
),
oneToOne = createShortcut("ONE_TO_ONE"),
oneToMany = createShortcut("ONE_TO_MANY"),
manyToMany = createShortcut("MANY_TO_MANY"),
manyToOne = createShortcut("MANY_TO_ONE"),
hasOne = createShortcut("HAS_ONE"),
hasMany = createShortcut("HAS_MANY"),
belongsTo = createShortcut("BELONGS_TO"),
belongsToMany = createShortcut("BELONGS_TO_MANY");

// Helper function to get the schema from a sequelized database.
const normalizeModelName = name => toSingular(name.toLowerCase().replace(/[^a-zA-Z0-9]+/g, ""));
const getDatabaseSchemaFromSequelize = sequelize => {
  sequelize instanceof Model && (sequelize = sequelize.sequelize);

  // Check the input database is sequelized.
  if (!(sequelize instanceof Sequelize))
    throw Error(`Invalid database input, should be an instance of Sequelize`);

  // to remove default valued attributes and options.
  const dummyDb = new Sequelize(sequelize.options || sequelize.config),
    dummyModel = dummyDb.define("Dummy", { dummyAttribute: DataTypes.INTEGER }),
    { attributes: dummyAttributes, options: dummyOptions } = dummyModel.modelDefinition || { 
      attributes: dummyModel.attributes || dummyModel.rawAttributes,
      options: dummyModel.options
    };

  // Get models.
  const models = [], modelMap = new Map, associations = [];
  for (const k in (sequelize.models || {})) {
    let m = sequelize.models[k], {attributes, options} = m.modelDefinition || { 
      attributes: m.attributes || m.rawAttributes,
      options: m.options
    }, name = m.modelName || m.name || k, _attributes = attributes, plural, singular;
    attributes = deepCopy(attributes, {copySelf: false}, null, [sequelize]);
    options = deepCopy(options, {copySelf: false}, null, [sequelize]);
    let attr;

    // Normalize attributes.
    for (const a in attributes) {
      // Remove default attributes, like updated_at.
      if (a !== "dummyAttribute" && dummyAttributes[a]) {
        delete attributes[a];
        continue;
      }

      // Remove private and redundant attributes.
      typeof (attr = _attributes[a]).type.toSql === "function" && (attributes[a].type = attr.type.toSql());
      attr = attributes[a];
      (attr.Model === m || attr.Model === name) && delete attr.Model;
      attr.fieldName === a && (delete attr.fieldName);
      attr.field === decamelize(a) && (delete attr.field);
      for (const n in attr) {
        (n !== "type" && attr[n] === dummyAttributes.dummyAttribute[n]
          || n.startsWith("_")
          || (Array.isArray(attr[n]) && !attr[n].length)
          || (typeof attr[n] === "object" && !Array.isArray(attr[n]) && !Object.keys(attr[n]).length)
        ) && delete attr[n];
      }
    }

    // Normalize options.
    for (const o in options) {
      // Remove default and private options.
      (options[o] === dummyOptions[o]
        || o.startsWith("_")
        || (Array.isArray(options[o]) && !options[o].length)
        || (typeof options[o] === "object" && !Array.isArray(options[o]) && !Object.keys(options[o]).length)
      ) && delete options[o];
    }

    singular = options.name.singular;
    plural = options.name.plural;
    (name === singular || name === plural) && delete options.name;
    Object.keys(options).length || (options = undefined);

    // Push model.
    const model= getModel({
      name,
      attributes,
      options
    });
    model.associations = m.associations;
    models.push(model);
    modelMap.set(normalizeModelName(name), model);
    modelMap.set(normalizeModelName(singular), model);
    modelMap.set(normalizeModelName(plural), model);
  }

  // Get associations.
  for (let i = 0, l = models.length, model; i !== l; ++i) {
    const _associations = (model = models[i]).associations, name = model.name;
    for (const a in _associations) {
      const association = _associations[a],
        type = association.associationType,
        options = deepCopy(association.options || {}, {copySelf: false}, null, [sequelize]),
        associated = modelMap.get(normalizeModelName(a));
      if (!associated) throw Error(`Could not find associated model ${a}`);

      // Normalize options.
      for (const o in options) {
        // Remove default and private options.
        (options[o] === dummyOptions[o]
          || o.startsWith("_")
          || (Array.isArray(options[o]) && !options[o].length)
          || (typeof options[o] === "object" && !Array.isArray(options[o]) && !Object.keys(options[o]).length)
        ) && delete options[o];
      }
      (associated.name === options.name.singular || associated.name === options.name.plural) && delete options.name;
      options.useHooks || (
        delete options.useHooks,
        delete options.hooks
      );
      options.through && typeof options.through === "string" && (
        options.through = { model: options.through }
      );
      options.through && typeof options.through.model === "object" && (
        options.through.model = (modelMap.get(normalizeModelName(
          options.through.model.name || options.through.model.modelName
        )) || {}).name
      );

      if (options.through && !(options.through.model || (options.through.model = options.tableName)))
        throw Error("Could not find through model");

      associations.push(getAssociation({
        models: [name, associated.name],
        type,
        options,
        name: (options.through || {}).model || options.tableName
      }));
      delete options.tableName;
    }
    delete model.associations;
  }

  // Output database schema.
  const output = {
    models,
    associations
  };

  return Object.defineProperty(output, "toString", {
    value: () => JSON.stringify(output, (key, value) => (
      typeof value === "function" && value.name
      || value
    ), 2),
    configurable: true,
    writable: true,
    enumerable: false
  });
}

/**
  * A database schema is of the form:
  * {
  *   models: <array | required>,
  *   associations: <array | optional>
  * }
  * 
  * Input: an array of models and associations
  */
const getDatabaseSchema = (...input) => {
  // Get schema from sequelized database.
  if (input[0] instanceof Sequelize) return getDatabaseSchemaFromSequelize(input[0]);

  // If input is already a database schema.
  if (input.length === 1 
    && input[0]
    && typeof input[0] === "object"
    && Array.isArray(input[0].models)
    && !(input[0].type || input[0].through)) {
    return input[0];
  }

  // Get schema from models and associations.
  const modelMap = new Map, associations = [];
  input.length === 1 && Array.isArray(input[0]) && (input = input[0]);
  for (let i = 0, l = input.length, m; i !== l; ++i) {
    m = input[i];
    // Push associations and models.
    (Array.isArray(m) || m.associations || m.association || m.models) && (
      associations.push(getAssociation(m))
    ) || (
      modelMap.set(m.name, getModel(m))
    )
  }

  // Normalize through models.
  const id = {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  };
  for (let i = 0, l = associations.length, a, m, t; i !== l; ++i) {
    a = associations[i];
    a.type === "MANY_TO_MANY" && (
      typeof (m = a.options.through) === "object" && (
        a.options.through = m.name || (m.name = a.name),
        m.attributes || (m.attributes = {}),
        m.attributes.id = id,
        modelMap.set(m.name, getModel(m))
      ) || (m = modelMap.get(m) && (
        m.attributes || (m.attributes = {}),
        m.attributes.id = id
      )) || (
        modelMap.set(m || (m = a.name), getModel({
          name: m,
          attributes: {
            id: {
              type: DataTypes.INTEGER,
              primaryKey: true,
              autoIncrement: true,
              allowNull: false,
            }
          }
        }))
      )
    );
  }

  // Output database schema.
  const output = {
    models: Array.from(modelMap.values()),
    associations
  };

  return Object.defineProperty(output, "toString", {
    value: () => JSON.stringify(output, (key, value) => (
      typeof value === "function" && value.name
      || value
    ), 2),
    configurable: true,
    writable: true,
    enumerable: false
  });
}

// Exports.
getDatabaseSchema.getModel = getModel;
getDatabaseSchema.getAssociation = getAssociation;
getDatabaseSchema.oneToOne = oneToOne;
getDatabaseSchema.oneToMany = oneToMany;
getDatabaseSchema.manyToOne = manyToOne;
getDatabaseSchema.manyToMany = manyToMany;
getDatabaseSchema.hasOne = hasOne;
getDatabaseSchema.hasMany = hasMany;
getDatabaseSchema.belongsTo = belongsTo;
getDatabaseSchema.belongsToMany = belongsToMany;
getDatabaseSchema.fromSequelize = getDatabaseSchema.getDatabaseSchemaFromSequelize = getDatabaseSchemaFromSequelize;
module.exports = Object.freeze(Object.defineProperty(getDatabaseSchema, "getDatabaseSchema", {
  value: getDatabaseSchema
}));