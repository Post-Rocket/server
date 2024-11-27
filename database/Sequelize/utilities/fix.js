// For filtering array with empty data.
const exists = x => x;

const Fix = {};

// Helper function to fix attributes.
const fixAttributes = Fix.fixAttributes = (attributes, model, addPrimaryKeys) => {
	if (attributes 
		&& typeof attributes === 'object'
		&& !Array.isArray(attributes)
		&& attributes.exclude
	) {
		attributes.exclude = fixAttributes(attributes.exclude, model);
		return attributes;
	}

	// Normalize attributes.
	attributes = Array.isArray(attributes) && attributes.filter(exists)
	  || (attributes && [attributes])
		|| (model && Object.keys(model.rawAttributes))
		|| [];

	// Add primary keys.
  addPrimaryKeys && attributes.push(...model.primaryKeyAttributes);

	for (let i = 0, l = attributes.length; i !== l; ++i) {
		const attr = attributes[i];
		Array.isArray(attr) && attr.length && (attr[0] = Sql.literal(`(${attr[0]})`))
	}

	// Make attribute list unique as well.
	return attributes.length && Array.from(new Set(attributes)) || undefined;
}

// Helper function to fix where.
const fixWhere = Fix.fixWhere = where => {
	for (let k in (where || {})) {
		const v = where[k];
		const op = Op.get(k);
		if (op && op !== k) {
			where[op] = v;
			delete where[k];
		} else if (k.toLowerCase().includes('sql')) {
			where[k] = Sql.literal(d);
		} else if (v && typeof v === 'object' && !Array.isArray(v)) {
			where[k] = fixWhere(v);
		}
	}

	return where;
}

// Helper functions to fix orders.
const fixOrderArr = ['asc', 'desc'],
	fixOrderF3 = q => fixOrderArr.includes(q.toLowerCase()),
	fixOrderF2 = q => `\`${q.decamelize()}\``,
	fixOrderF1 = q => !fixOrderF1(q),
  fixOrder = Fix.fixOrder = order => (
	Array.isArray(order) && order.map(v => (
		Array.isArray(v) && Sql.literal(
			v.filter(fixOrderF1).map(fixOrderF2).join('.')
			  + ' '
				+ v.filter(fixOrderF3).join(' ')
		) || v
	)) || order
);

// Helper function to fix include.
const fixInclude = Fix.fixInclude = (include, model, db, addPrimaryKeys) => {
	include = Array.isArray(include) && include.filter(exists)
	|| (include && [include])
	|| [];

	const associations = (model || {}).associations || {};

	for (let i = 0, l = include.length ; i !== l; ++i) {
		// Get and normalize current include.
		let v = include[i];
		v && typeof v !== 'object'
		  && (v = associations[db.getModelName(v) || ''] || {});

		if (v instanceof Model || v instanceof Association) {
			include[i] = v;
			continue;
		}

		// Get association.
		const a = v.association === 'string'
		  && (v.association = associations[db.getModelName(v.association) || ''])
		  || (v.association instanceof Model && v);

		// Delete association key if needed.
		a || (delete v.association);

		// Link through models.
		if (a && a.throughModel) {
			const through = v.through;
			let attrs;
			through
			  && (through.as || (through.as = 'through'))
				&& ((attrs = through.attributes)
				  || (attrs = through.attributes = Object.keys(a.throughModel.rawAttributes)))
				|| (v.through = {
					as: 'through',
					attributes: attrs = Object.keys(a.throughModel.rawAttributes)
				});
			through.attributes = fixAttributes(
				addPrimaryKeys && attrs
				  || attrs.filter(q => !a.throughModel.primaryKeyAttributes.includes(q))
			);
		}

		// Recusrsive call.
		v.include = fixInclude(v.include, a && a.target || model, db, addPrimaryKeys);
	}

	return include.length && Array.from(new Set(include)) || undefined;
}

// Helper function to fix object property keys,
// especially when a key belongs to an association table.
const fixAssociationPropertyKeys = Fix.fixAssociationPropertyKeys = (obj, model, db) => {
	if (model) {
		const tableAttributes = model.tableAttributes, associations = model.associations;
		for (const k in (tableAttributes && obj || {})) {
			const name = tableAttributes[k] === undefined && db.getModelName(k);
			const association = name && associations[name];
			if (!association) continue;
	
			const p = obj[name] = obj[k];
			delete obj[k];
			if (typeof p === 'object') obj[name] = fixAssociationPropertyKeys(p, association, db);
		}
	}

	return obj;
}

// Exports.
module.exports = Object.freeze(Object.defineProperty(Fix, 'Fix', {
  value: Fix
}));