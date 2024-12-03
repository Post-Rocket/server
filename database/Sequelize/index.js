const { Sequelize: _Sequelize } = require('sequelize');
const DataTypes = require('./DataTypes');
const Op = require('./Op');
const DatabaseSchema = require('./DatabaseSchema');
const Url = require('./Url');
const { formatLogMsg, errMsg, successMsg } = require('./utilities/formatLogMsg');
const normalizeName = require('./utilities/normalizeName');
const {
  fixAttributes,
  fixWhere,
  fixOrder,
  fixInclude,
  fixAssociationPropertyKeys
} = require('./utilities/fix');
const deepFreeze = require('./utilities/deepFreeze');

// Logging message.
const _msg = (where, text) => formatLogMsg(where, text, '📀 SQL:', 'white'),
  _log = (...args) => console.log(_msg('', args.join(' ')));

// Default config.
const DEFAULT_CONFIG = deepFreeze({
	connectionString: '',
	models: {},
	pool: {
		max: 10, // maximum number of 'opened' connections to be scaled to
		min: 1, // minimum number of 'opened' connections, can be 0
		acquire: 1000, // connect timeout in ms
		idle: 10000, // how long we keep open connections before scaling down, in ms
	},
	logging: false, // turn logging on | off, can be a logging function or true or false or null or undefined
	dialectOptions: {
		connectTimeout: 1000, // connection timeout in ms, similar to the pool.aquire option
		multipleStatements: true // for running raw queries with semicolons, to support mutiple statement per query
	},
	define: {
		freezeTableName: true, // turn off pluralization on model names and getters
		underscored: true, // model name from camel case to underscore notation
		charset: 'utf8mb4', // character encoding
		collate: 'utf8mb4_general_ci' // character encoding
	},
  heartbeatPingFrequency: 120000 // in ms - ping/pong sent to keep the MariaDB connection alive.
});

// Extended sequelize class.
class Sequelize extends _Sequelize {
  // Constructor definition: init the parameters and connect to the db.
  constructor(connectionString, config, ...args) {
    // Add default config params.
    typeof connectionString === 'object' && (
      config = {...DEFAULT_CONFIG, ...(connectionString || {}), ...(config || {})},
      connectionString = config.connectionString
    ) || (
      config = {...DEFAULT_CONFIG, ...(config || {})},
      connectionString || (connectionString = config.connectionString)
    );

    // Normalize config.
    config.connectionString = connectionString;
    config.logging === true && typeof config.logging !== 'function' && (config.logging = config.log || _log);
    typeof config.logging === 'function' || (delete config.logging);
    delete config.log;

    // Construct object.
    super(connectionString, config, ...args);

    // Make sure we can connect.
		this.authenticate();

    // Thats a heartbeat ping/pong gets sent every 2 minutes to keep the db connection alive.
    // The connection might die after 1 day if no heartbeat is sent.
		// Also specialize close function to drop the heartbeat once the connection is closed.
		const heartbeat = config.heartbeatPingFrequency || config.heartbeat;
		if (heartbeat > 0) {
			const setIntervalId = setInterval(
				async () => await this.query('select 1', { type: "SELECT" }),
				heartbeat
			);

			Object.defineProperty(this, 'close', {
				enumerable: true,
				configurable: true,
				writable: true,
				value: function(...args) {
					clearInterval(setIntervalId);
					return super.close(...args);
				}
			});
    }

    // Define database schema.
    const databaseSchema = this.defineDatabaseSchema(
      config.models || config.model
      || config.schema || config.schemas
      || config.databaseSchema || config.databaseSchemas
    );
    if (databaseSchema) {
      config.databaseSchema = databaseSchema;

      // Add models name mapping to the database schema.
      const mapping = new Map;
      for (const modelName in this.models) {
        mapping.set(normalizeName(modelName), modelName);
        const associations = this.models[modelName].associations;
        for (const associationName in associations) {
          mapping.set(normalizeName(associationName), associationName);
        }
      }

      // To get a model name.
      Object.defineProperty(databaseSchema, 'getModelName', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function(name) {
          return mapping.get(name = normalizeName(name))
            || mapping.get(name.slice(0, name.length - 1));
        }
      });
  
      // To get a model.
      Object.defineProperty(databaseSchema, 'getModel', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function(name) {
          const s = normalizeName(name);
          return this.models[mapping.get(s) || mapping.get(s.slice(0, s.length - 1)) || name || ''];
        }
      });
    }

    // To get a model name.
    Object.defineProperty(this, 'getModelName', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: function(name) {
        if (databaseSchema) return databaseSchema.getModelName(name);
        let s;
        return this.models[name] && name || (
          this.models[s = normalizeName(name)] && s
        ) || (
          this.models[s = s.slice(0, s.length - 1)] && s
        );
      }
    });

    // To get a model.
    Object.defineProperty(this, 'getModel', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: function(name) {
        if (databaseSchema) return databaseSchema.getModel(name);
        let s;
        return this.models[name] && name || (
          this.models[s = normalizeName(name)]
        ) || (
          this.models[s.slice(0, s.length - 1)]
        );
      }
    });
      
    // Override config getter, if possible.
    config = deepFreeze({...config, ...this.config}); // Prevent to change config in the middle of a process.
    try {
      Object.defineProperty(this, 'config', {
        get() { return config; },
        enumerable: true
      });
    } catch {}
  }

  // Define a database schema.
  defineDatabaseSchema(databaseSchema) {
    databaseSchema && typeof databaseSchema === 'object'
      && !(databaseSchema instanceof DatabaseSchema)
      && (databaseSchema = new DatabaseSchema(databaseSchema));
    if (!(databaseSchema instanceof DatabaseSchema)) return null;

    const {
      tables,
      models = tables,
      oneToOneAssociations,
      oneToManyAssociations,
      manyToManyAssociations
    } = databaseSchema;

    // Add models.
    for (let i = 0, l = models.length; i !== l; ++i) {
      // Get model attributes.
      const [modelName, model, params] = models[i];

      // Create model, i.e. assign the new Model instance to the Sequelize instance.
      super.define(modelName, model, params);
    }

    // Add one to one association models.
    for (let i = 0, l = oneToOneAssociations.length; i !== l; ++i) {
      // Get association model attributes.
      const [
        associationModelName,
        modelName1,
        modelName2,
        foreignKey
      ] = oneToOneAssociations[i];
      const t1 = this.models[modelName1], t2 = this.models[modelName2];
      t1.hasOne(t2, {
        foreignKey,
        as: associationModelName
      });
      t2.belongsTo(t1);
    }

    // Add one to many association models.
    for (let i = 0, l = oneToManyAssociations.length; i !== l; ++i) {
      // Get association model attributes.
      const [
        associationModelName,
        modelName1,
        modelName2,
				foreignKey
      ] = oneToManyAssociations[i];
			const t1 = this.models[modelName1], t2 = this.models[modelName2];
			t1.hasMany(t2, {
				foreignKey,
				as: associationModelName
			});
			t2.belongsTo(t1);
    }

    // Add many to many association models.
    for (let i = 0, l = manyToManyAssociations.length; i !== l; ++i) {
      // Get association model attributes.
      const [
        associationModelName,
        modelName1,
        modelName2
      ] = manyToManyAssociations[i], throughModel = this.models[associationModelName];
			const t1 = this.models[modelName1], t2 = this.models[modelName2];
			t1.belongsToMany(t2, {
				through: throughModel
			});
			t2.belongsToMany(t1, {
				through: throughModel
			});
    }

    return databaseSchema;
  }

  // Overload define to handle database schema.
  define(modelName, attributes, options, ...args) {
    return this.defineDatabaseSchema(modelName) || super.define(modelName, attributes, options, ...args);
  }

  // Overload drop in order to drop models and all cascading ones.
  async drop(...args) {
		args = args.flat(Infinity);
		!args.length && args.push(true);
		args.length && !args[0] && args.pop();
		if (args.length === 1 && args[0] === true) {
			return await super.drop();
		}
    const res = [];
		for (let i = 0, l = args.length; i !== l; ++i) {
			if (this.models[args[i]]) res.push(await this.models[args[i]].drop());
			else res.push(await this.query(`DROP TABLE IF EXISTS ${args[i]} CASCADE`));
		}
    return res;
	}

  // Reset model entries and primary key auto increment on the model.
	async reset(...modelNames) {
		modelNames = modelNames.flat(Infinity);
		modelNames.length || (modelNames = Object.keys(this.models));
		return Promise.all(modelNames.map(modelName => this.query(
			`delete from ${modelName}; 
			set FOREIGN_KEY_CHECKS = 0; 
			truncate ${modelName};
			set FOREIGN_KEY_CHECKS = 1;`
		)));
  }

	// Helper function to migrate a database.
	async migrate(config) {
		// Synchronize the database.
		const { alter = true, force = false, drop, match } = {...this.config, ...(config || {})};
		try {
			drop && await this.drop(drop);
		} catch (e) {
			return Promise.reject(e);
		}
	
		// Synchornize and closing connection.
		return this.sync({ alter, force, match }).then(() => {
			(this.config.logging || console.log)(successMsg('', 'database migrated and synchronized'));
		}).then(() => this.close());
	}

	static async migrate(config) {
		// Create database instance.
		// config should contain the connection paramters and the models.
		const db = new Sequelize(config);
		return db.migrate(config);
	}
	
  // Helper function to get a row with certain attributes from a model.
	async get(modelName, params) {
		// Get params.
		typeof modelName === 'object'
		  && modelName
			&& !params
			&& (params = modelName)
			&& (modelName = params.modelName || params.tableName || params.name || params.model || params.table);
		let {
			where,
			attribute,
			attributes = attribute,
			include,
			limit,
			plain = true,
			order,
			create,
			countAll,
			addPrimaryKeys,
			...other
		} = params;

		// Check if model exists.
		const model = this.models[modelName] || this.getModel(modelName);
		if (!model) {
			const e = errMsg('get', `missing model ${modelName}`);
			this.config.logError && this.config.logError(e);
			throw e;
		}

		// Get data.
		let data = await model[
			create && 'findOrCreate'
			  || (countAll && 'findAndCountAll')
			  || (limit > 0 && 'findAll')
				|| 'findOne'
		]({
			where: fixWhere(where),
			attributes: attributes = fixAttributes(attributes, model, addPrimaryKeys),
			include: fixInclude(include, model, this, addPrimaryKeys),
			order: fixOrder(order),
			limit,
			plain,
			...other
		});

		// In case data was called with create = true.
		if (create) {
			const created = data[1];
			data = data[0];
			let values, previousValues = data._previousDataValues;
			if (plain) {
				values = data;
				data.created = created;
			} else (values = data.dataValues).created = created;

			// Normalize undefined values with null if created, to be consistent
			// with a normal GET request.
			if (created) {
				for (let i = 0, l = (attributes || []).length; i !== l; ++i) {
					const attribute = attributes[i];
					previousValues.hasOwnProperty(attribute)
					  && values[attribute] === undefined
						&& (values[attribute] = null);
				}
			}
			return data;
		}
	
		return data;
	}

	// Helper function to destroy a model row.
	async destroy(modelName, params) {
		// Get params.
		typeof modelName === 'object'
		  && modelName
			&& !params
			&& (params = modelName)
			&& (modelName = params.modelName || params.tableName || params.name || params.model || params.table);
		let {
			where,
			...other
		} = params;

		// Check if model exists.
		const model = this.models[modelName] || this.getModel(modelName);
		if (!model) {
			const e = errMsg('destroy', `missing model ${modelName}`);
			this.config.logError && this.config.logError(e);
			throw e;
		}

		// Destroy row.
		return where && await model.destroy({
			where: fixWhere(where),
			...other
		}) || await model.destroy(other);
	}

	// Helper function to update a row.
	async update(modelName, item, params) {
		// Get params.
		typeof modelName === 'object'
		  && modelName
			&& !item
			&& (item = modelName)
			&& (modelName = params.modelName || params.tableName || params.name || params.model || params.table);

		typeof item === 'object'
		  && item
			&& params === undefined
			&& (params = { attributes: item.attributes, where: item.where, include: item.include })
			&& (delete item.attributes)
			&& (delete item.where)
			&& (delete item.include);

		// Check if model exists.
		const model = this.models[modelName] || this.getModel(modelName);
		if (!model) {
			const e = errMsg('update', `missing model ${modelName}`);
			this.config.logError && this.config.logError(e);
			throw e;
		}

		// In case the third argument is directly the id to update.
		(params === undefined || params === null) && (params = {});
		typeof params === 'object' || (params = {
			where: { id: params }
		});

		// In case the id was passed in the object itself and there's no 'where'.
		item.id === undefined
		  || item.id === null
			|| !params.where
			|| ((params.where = { id: item.id }) && (delete item.id));

		// Update params.
		params.attributes && (params.attributes = fixAttributes(params.attributes, model));
		params.where && (params.where = fixWhere(params.where));
		params.include && (params.include = fixInclude(params.include, model, this));

		// In case we want to create the object at a specific id if it does not exists.
		if (params.create) {
			delete params.create;
			(item.id === undefined || item.id === null)
			  && params.where
				&& params.where.id !== undefined
				&& (item.id = params.where.id);

			return await model.upsert(item, params);
		}
		return await model.update(item, params);
	}

	// Helper function to create a row or multiple rows.
	async create(...args) {
		args = args.flat(Infinity);
		const toCreate = {};
		let currentInclude = [], currentModel;

		// Get all the data to create.
		for (let i = 0, l = args.length; i !== l; ++i) {
			const arg = args[i];
			if (arg) {
				if (typeof arg === 'string') { // if we specify the next model name to target.
					(currentModel = toCreate[arg]) || (currentModel = toCreate[arg] = []);
					currentInclude = [];
				} else if (typeof arg === 'object') {
					let {
						table,
            model = table,
						tableName = model,
						modelName = tableName,
						include,
						__include__ = include,
						association,
						...other
					} = arg;
					include && __include__ && include !== __include__ && (other.include = include);
					if (__include__) {
						!Array.isArray(__include__) && (__include__ = [__include__]);
						if (association) {
							for (let i = 0, l = __include__.length; i !== l; ++i) {
								const incl = __include__[i];
								typeof incl === 'object' && (incl.association = association)
								|| (__include__[i] = { include: incl, association });
							}
						}
					} else if (association) __include__ = [{ association }];

					if (modelName) { // new model targeted
						(currentModel = toCreate[modelName]) || (currentModel = toCreate[modelName] = []);
						(__include__ && Object.keys(arg).length === 2) // Just the model (and include) is mentioned
						  && (currentInclude = __include__)
							&& (!currentModel.length || (currentModel.__iterate__ = true))
						  || (currentModel.push([other, __include__]) // model + object is mentioned
							  && __include__ && (currentModel.__iterate__ = true)
							);
					} else { // new object or include, current model
						if (__include__ && Object.keys(arg).length === 1) { // new include
							currentInclude = __include__;
							currentModel.length && (currentModel.__iterate__ = true);
						} else { // new object
							const combinedInclude = currentInclude && __include__ && [...currentInclude, ...__include__]
							 || (currentInclude && [...currentInclude])
							 || __include__;
							currentModel
							  && (!currentModel.length || !__include__ || (currentModel.__iterate__ = true))
							  && currentModel.push([other, combinedInclude]);
						}
					}
				}
			}
		}
		
		// Create data for each model.
		for (let modelName in toCreate) {
			const data = toCreate[modelName], model = this.models[modelName];
			if (!model) {
				const e = errMsg('create', `missing model ${modelName}`);
				this.config.logError && this.config.logError(e);
				throw e;
			}
			if (data.__iterate__) { // Iterative creation
				for (let i = 0, l = data.length; i !== l; ++i) {
					let [obj, include] = data[i];
					obj = fixAssociationPropertyKeys(obj, model, this);
					include && include.length && await model.create(obj, { include: fixInclude(include, model, this) })
				    || await model.create(obj);
				}
			} else if (data.length) { // Bulk creation
				const include = data[0][1];
				for (let i = 0, l = data.length; i !== l; ++i) data[i] = fixAssociationPropertyKeys(data[i][0], model, this);
				include && include.length && await model.bulkCreate(data, { include: fixInclude(include, model, this) })
				  || await model.bulkCreate(data);
			}
		}
	}
}

// Exports.
Sequelize.DEFAULT_CONFIG = DEFAULT_CONFIG;
Sequelize.log = _log;
Sequelize.DataTypes = DataTypes;
Sequelize.Op = Op;
Sequelize.DatabaseSchema = DatabaseSchema;
Sequelize.Url = Url;
module.exports = Object.freeze(Object.defineProperty(Sequelize, 'Sequelize', {
  value: Sequelize
}));