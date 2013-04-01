
/**
 * Module dependencies.
 */

var Emitter = require('emitter-component')
  , context
  , type
  , setting
  , attr
  , database
  , resource
  , index;

/**
 * Expose `adapter`.
 */

module.exports = adapter;

/**
 * Expose `Adapter` constructor.
 */

module.exports.Adapter = Adapter;

/**
 * Lazily get an adapter instance by `name`.
 */

function adapter(name) {
  return adapters[name] || (adapters[name] = new Adapter(name));
}

/**
 * All adapters.
 */

var adapters = adapter.instances = {};

/**
 * Instantiate a new `Adapter`.
 */

function Adapter(name) {
  this.name = name;
  this.context = this;
  this.databases = {};
  this.types = {};
  this.settings = {};
  this.resources = {};
  this.connections = {};
}

/**
 * Mixin `Emitter`.
 */

Emitter(Adapter.prototype);

/**
 * Define connection settings.
 *
 * @api public
 */

Adapter.prototype.connection = function(name, options){
  if (arguments.length == 1 && 'string' == typeof name) {
    setting = context = settings[name]
    return this;
  }

  if ('object' == typeof name) options = name;
  options || (options = {});
  options.name || (options.name = name);
  setting = context = settings[options.name] = options;

  return this;
}

/**
 * Datatype serialization.
 *
 * @param {String} name
 * @param {Function} [to]
 * @param {Function} [from]
 * @api public
 */

Adapter.prototype.type = function(name, to, from){
  type = context = this.types[name]
    = this.types[name] || { deserialize: to, serialize: from };

  return this;
}

Adapter.prototype.database = function(name){
  database = context = this.databases[name] = this.databases[name] || { name: name };
  return this;
}

Adapter.prototype.resource = function(name, options){
  resource = context = this.resources[name]
    = this.resources[name] || { name: name, database: database };

  if (options) {
    for (var key in options) resource[key] = options[key];
  }

  return this;
}

/**
 * You can specify how a property on the model gets
 * serialized to/from MySQL.
 *
 * You can specify `to`, `from`, and `name` (the column name).
 *
 * Must be defined within the context of a `resource`.
 */

Adapter.prototype.attr = function(name, options) {
  attr = context = context[name]
    = context[name] || { name: name };

  return this;
}

/**
 * Convert a record into something for the database.
 *
 * You'd only want to use this if your model and your database
 * are totally different from each other, such as when you're migrating
 * a legacy database to a better schema.
 */

Adapter.prototype.serialize = function(fn){
  if (1 == arguments.length) {
    context.serialize = fn;
    return this;
  }

  return this.types[arguments[0]].serialize(arguments[1]);
}

/**
 * Convert a record into a proper model from the database.
 */

Adapter.prototype.deserialize = function(fn){
  if (1 == arguments.length) {
    context.deserialize = fn;
    return this;
  }

  return this.types[arguments[0]].deserialize(arguments[1]);
}

Adapter.prototype.execute = function() {
  throw new Error('Adapter#execute not implemented.');
}

/**
 * Reset the context to this.
 */

Adapter.prototype.self = function(){
  resource = type = setting = attr = undefined;
  return context = this;
}

/**
 * Find a keyspace/column family/column/index.
 *
 * Example:
 *
 *    adapter('cassandra').database('main').find()
 *    adapter('cassandra').collection('users').find()
 *    adapter('cassandra').collection('users').attr('email').find()
 *    adapter('cassandra').collection('users').index('email').find()
 */

Adapter.prototype.find = Adapter.prototype.execute;

/**
 * Find a column family.
 *
 * Example:
 *
 *    adapter('mysql').table('users').create(function(err, ks) {});
 */

Adapter.prototype.create = Adapter.prototype.execute;

/**
 * Update a column family or column via `ALTER`.
 */

Adapter.prototype.update = Adapter.prototype.execute;

/**
 * Drop a keyspace or column.
 */

Adapter.prototype.remove = Adapter.prototype.execute;

// alternative apis
Adapter.prototype.keystore
  = Adapter.prototype.database;

Adapter.prototype.table
  = Adapter.prototype.columnFamily
  = Adapter.prototype.collection
  = Adapter.prototype.resource;

Adapter.prototype.to
  = Adapter.prototype.deserialize;

Adapter.prototype.from
  = Adapter.prototype.serialize;