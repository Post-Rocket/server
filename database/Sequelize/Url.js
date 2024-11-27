// Helper function to convert a query string into search parameters.
const toSearchParams = query => {
	const params = (query || '').split(/\&/g).filter(x => x);
	const output = params.length && {} || undefined;
	for (let i = 0, l = params.length; i !== l; ++i) {
		const [key, val] = params[i].split('=');
		val !== undefined && (output[key] = val);
	}
	return output;
}

// Helper function to convert search parameters into a query string.
const fromSearchParams = params => (
	Object.entries(params || {}).map(([key, val]) => `${key}=${val}`).join('&') || undefined
);

// Helper function to get url parameters from a url string.
const fromStr = str => {
  const [protocol, s1 = ''] = (str || '').split('://');
  let [auth, s2] = s1.split('@');
  const [username, password] = s2 && auth.split(':') || [];
  s2 || (s2 = auth || '');
  const [host = '', s3 = ''] = s2.split('/');
  const [hostname, port] = host.split(':');
  const [pathname, s4 = ''] = s3.split('?');
  const [query, hash] = s4.split('#');
	return {
		protocol,
		username,
		password,
		hostname,
		port,
		pathname,
		searchParams: toSearchParams(query),
		hash,
		get auth() { return username && password && `${username}:${password}` || undefined}
	};
}

// Helper function to normalize input object.
const normalizeObj = obj => {
	const {
		connection,
		string = connection && typeof connection === 'object' && toStr(connection) || connection,
		connectionString = string,
		href = connectionString,
		_obj = fromStr(href),
		hostName = _obj.hostname,
		hostname = hostName,
		auth = _obj.auth,
		_auth = (auth || '').split(':'),
		user = _auth[0] || _obj.username,
		userName = user,
		username = userName,
		pwd = _auth[1] || _obj.password,
		secret = pwd,
		password = secret,
		path = _obj.pathname,
		pathName = path,
		database = pathName,
		db = database,
		pathname = db,
		dialect = _obj.protocol,
		protocol = dialect,
		port = _obj.port,
		host = port !== undefined && hostname && `${hostname}:${port}` || hostname,
		_host = (host || '').split(':'),
		_hostname = _host[0],
		_port = _host[1],
		search,
		query = search,
		searchParams = _obj.searchParams || toSearchParams(query),
		hash = _obj.hash
	} = obj || {};
	return {
		protocol,
		username,
		password,
		hostname: _hostname,
		port: _port,
		pathname,
		searchParams,
		hash
	}
}

// Helper function to get url string from url parameters.
const toStr = obj => {
	const {
		protocol,
		username,
		password,
		hostname,
		port,
		pathname,
		searchParams,
		hash,
		query = fromSearchParams(searchParams),
		auth = username && password && `${username}:${password}`,
		host = port !== undefined && hostname && `${hostname}:${port}` || hostname
	} = normalizeObj(obj);

	let output =  protocol && `${protocol}://` || '';
	auth && (output += auth + '@');
	host && (output += host);
	pathname && (output += '/' + pathname);
	query && (output += '?' + query);
	hash && (output += '#' + hash);
	return output;
}

/* Url class
 * ---------
 * Constructor takes an object of url properties or the url string itself.
 */
class Url {
	constructor(...args) {
		const strs = [], objs = [];
		for (let i = 0, l = args.length; i !== l; ++i) {
			const arg = args[i], type = typeof arg;
			type === 'string' && strs.push(arg)
			  || (arg && type === 'object' && !Array.isArray(arg) && objs.push(arg));
		}

		const obj = {};
		for (let i = 0, l = strs.length; i !== l; ++i) {
			Object.assign(obj, fromStr(strs[i]));
		}

		for (let i = 0, l = objs.length; i !== l; ++i) {
			Object.assign(obj, normalizeObj(objs[i]));
		}
		delete obj.auth;
		for (const k in obj) {
			obj[k] !== undefined && obj[k] !== null && (this[k] = obj[k]);
		}
	}

	// Method to convert the object to string.
	toString() {
		return toStr({
			protocol: this.protocol,
			username: this.username,
			password: this.password,
			hostname: this.hostname,
			port: this.port,
			pathname: this.pathname,
			searchParams: this.searchParams,
			hash: this.hash
		});
	}

	// Method to convert the object to a stringified json.
	toJSON(indent) {
		return indent && JSON.stringify(this, null, 2) || JSON.stringify(this);
	}

	// Getter/Seeter to get/set the url string.
	get href() {
		return this.toString();
	}
	set href(val) {
		const obj = fromStr(val);
		for (const k in obj) {
			obj[k] !== undefined && (this[k] = obj[k]);
		}
		return val;
	}

	// Getter/Seeter to get/set the auth.
	get auth() { return this.username && this.password && `${this.username}:${this.password}` || undefined }
	set auth(val) {
		const [username, password] = (val || '').split(':');
		username && password && (this.username = username) && (this.password = password)
		|| ((delete this.username) && (delete this.username));
		return val;
	}

	// Getter/Seeter to get/set the host.
	get host() {
		return this.port !== undefined && this.hostname && `${this.hostname}:${this.port}` || this.hostname;
	}
	set host(val) {
		const [hostname, port] = (val || '').split(':');
		hostname && (this.hostname = hostname) || (delete this.hostname);
		port && (this.port = port) || (delete this.port);
		return val;
	}

	// Getter/Seeter to get/set the search query.
	get query() {
		return fromSearchParams(this.searchParams);
	}
	set query(val) {
		const obj = toSearchParams(val);
		obj && (this.searchParams = obj) || (delete this.searchParams);
		return val;
	}

	// Getter/Seeter to get/set the dialect.
	get dialect() {
		return this.protocol;
	}
	set dialect(val) {
		val && (this.protocol = val) || (delete this.protocol);
		return val;
	}
}

// Exports.
Url.parse = Url.from = (...args) => new Url(...args);
Url.URL = Url;
module.exports = Object.freeze(Object.defineProperty(Url, 'Url', {
  value: Url
}));