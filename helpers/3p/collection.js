'use strict';

var array = require('./array');
var object = require('./object');
var utils = require('./utils');
var forEach = array.forEach;
var forOwn = object.forOwn;

/**
 * Expose `helpers`
 */

var helpers = module.exports;

/**
 * Block helper that returns a block if the given collection is
 * empty. If the collection is not empty the inverse block is returned
 * (if supplied).
 *
 * @name .isEmpty
 * @param {Object} `collection`
 * @return {String}
 * @block
 * @api public
 */

helpers.isEmpty = function(collection) {
  const options = arguments[arguments.length - 1];
  if (utils.isOptions(collection)) {
    return collection.fn(this);
  }

  if (Array.isArray(collection) && !collection.length) {
    return options.fn(this);
  }

  var keys = Object.keys(collection);
  if (typeof collection === 'object' && !keys.length) {
    return options.fn(this);
  }
  return options.inverse(this);
};

/**
 * Iterate over an array or object,
 *
 * @name .iterate
 * @param {Object|Array} `context` The collection to iterate over
 * @return {String}
 * @block
 * @api public
 */

helpers.iterate = function(context) {
  const options = arguments[arguments.length - 1];
  if (Array.isArray(context)) {
    return forEach.apply(forEach, arguments);
  } else if (utils.isObject(context)) {
    return forOwn.apply(forOwn, arguments);
  }
  return options.inverse(this);
};

/**
 * Returns the length of the given collection. When using a string literal in the
 * template, the string must be value JSON. See the example below. Otherwise pass
 * in an array or object from the context
 *
 * ```handlebars
 * {{length '["a", "b", "c"]'}}
 * //=> 3
 *
 * //=> myArray = ['a', 'b', 'c', 'd', 'e'];
 * {{length myArray}}
 * //=> 5
 *
 * //=> myObject = {'a': 'a', 'b': 'b'};
 * {{length myObject}}
 * //=> 2
 * ```
 * @param  {Array|Object|String} `value`
 * @return {Number} The length of the value.
 * @api public
 */

helpers.length = function(value) {
  if (!value || utils.isUndefined(value)) {return '';}
  if (typeof value === 'string' && /[[]/.test(value)) {
    value = utils.tryParse(value) || [];
  }
  if (utils.isObject(value)) {
    value = Object.keys(value);
  }
  return value.length;
};