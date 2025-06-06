'use strict';

var utils = require('./utils');

/**
 * Expose `helpers`
 */

var helpers = module.exports;

/**
 * Returns all of the items in an array after the specified index.
 * Opposite of [before](#before).
 *
 * Given the array `['a', 'b', 'c']`:
 *
 * ```handlebars
 * {{after array 1}}
 * //=> '["c"]'
 * ```
 *
 * @param {Array} `array` Collection
 * @param {Number} `n` Starting index (number of items to exclude)
 * @return {Array} Array exluding `n` items.
 * @api public
 */

helpers.after = function(array, n) {
  if (!array || utils.isUndefined(array)) {return '';}
  return array.slice(n);
};

/**
 * Cast the given `value` to an array.
 *
 * ```handlebars
 * {{arrayify "foo"}}
 * //=> '["foo"]'
 * ```
 * @param {any} `value`
 * @return {Array}
 * @api public
 */

helpers.arrayify = function(...args) {
  args.pop(); // remove handlebars options object
  const value = args[0];
  return value ? (Array.isArray(value) ? value : [value]) : [];
};

/**
 * Return all of the items in the collection before the specified
 * count. Opposite of [after](#after).
 *
 * Given the array `['a', 'b', 'c']`:
 *
 * ```handlebars
 * {{before array 2}}
 * //=> '["a", "b"]'
 * ```
 *
 * @param {Array} `array`
 * @param {Number} `n`
 * @return {Array} Array excluding items after the given number.
 * @api public
 */

helpers.before = function(array, n) {
  if (utils.isUndefined(array)) {return '';}
  return array.slice(0, -n);
};

/**
 * ```handlebars
 * {{#eachIndex collection}}
 *   {{item}} is {{index}}
 * {{/eachIndex}}
 * ```
 * @param {Array} `array`
 * @return {String}
 * @block
 * @api public
 */

helpers.eachIndex = function(array) {
  var result = '';
  if (Array.isArray(array)) {
    const options = arguments[arguments.length - 1];
    for (var i = 0; i < array.length; i++) {
      result += options.fn({item: array[i], index: i});
    }
  }
  return result;
};

/**
 * Block helper that filters the given array and renders the block for values that
 * evaluate to `true`, otherwise the inverse block is returned.
 *
 * Given the array `['a', 'b', 'c']`:
 *
 * ```handlebars
 * {{#filter array "foo"}}AAA{{else}}BBB{{/filter}}
 * //=> 'BBB'
 * ```
 *
 * @name .filter
 * @param {Array} `array`
 * @param {any} `value`
 * @return {String}
 * @block
 * @api public
 */

helpers.filter = function(array, value) {
  var content = '';
  var results = [];
  const options = arguments[arguments.length - 1];

  // filter on a specific property
  var prop = options.hash && options.hash.property;
  if (prop) {
    results = utils.filter(array, function(val) {
      return utils.get(val, prop) === value;
    });
  } else {

    // filter on a string value
    results = utils.filter(array, function(v) {
      return value === v;
    });
  }

  if (results && results.length > 0) {
    for (var i = 0; i < results.length; i++) {
      content += options.fn(results[i]);
    }
    return content;
  }
  return options.inverse(this);
};

/**
 * Returns the first item, or first `n` items of an array.
 *
 * Given the array `['a', 'b', 'c', 'd', 'e']`:
 *
 * ```handlebars
 * {{first array 2}}
 * //=> '["a", "b"]'
 * ```
 *
 * @param {Array} `array`
 * @param {Number} `n` Number of items to return, starting at `0`.
 * @return {Array}
 * @api public
 */

helpers.first = function(array, n) {
  if (Array.isArray(array)) {
    return arrayAlt();
  }

  if (utils.isString(array)) {
    const chars = array.split('');
    const result = arrayAlt(chars, n);
    return Array.isArray(result) ? result.join('') : result;
  }

  return [];

  function arrayAlt() {
    if (utils.isUndefined(array)) {return '';}
    if (!utils.isNumber(n)) {
      return array[0];
    }
    return array.slice(0, n);
  }
};

/**
 * Iterates over each item in an array and exposes the current item
 * in the array as context to the inner block. In addition to
 * the current array item, the helper exposes the following variables
 * to the inner block:
 *
 * - `index`
 * - `total`
 * - `isFirst`
 * - `isLast`
 *
 * Also, `@index` is exposed as a private variable, and additional
 * private variables may be defined as hash arguments.
 *
 * ```js
 * var accounts = [
 *   {'name': 'John', 'email': 'john@example.com'},
 *   {'name': 'Malcolm', 'email': 'malcolm@example.com'},
 *   {'name': 'David', 'email': 'david@example.com'}
 * ];
 *
 * // example usage
 * // {{#forEach accounts}}
 * //   <a href="mailto:{{ email }}" title="Send an email to {{ name }}">
 * //     {{ name }}
 * //   </a>{{#unless isLast}}, {{/unless}}
 * // {{/forEach}}
 * ```
 * @source <http://stackoverflow.com/questions/13861007>
 * @param {Array} `array`
 * @return {String}
 * @block
 * @api public
 */

helpers.forEach = function(array) {
  const options = arguments[arguments.length - 1];
  var data = utils.createFrame(options, options.hash);
  if (!array) {
    return '';
  }
  var len = array.length;
  var buffer = '';
  var i = -1;

  while (++i < len) {
    var item = array[i];
    data.index = i;
    item.index = i + 1;
    item.total = len;
    item.isFirst = i === 0;
    item.isLast = i === (len - 1);
    buffer += options.fn(item, {data: data});
  }
  return buffer;
};

/**
 * Block helper that renders the block if an array has the
 * given `value`. Optionally specify an inverse block to render
 * when the array does not have the given value.
 *
 * Given the array `['a', 'b', 'c']`:
 *
 * ```handlebars
 * {{#inArray array "d"}}
 *   foo
 * {{else}}
 *   bar
 * {{/inArray}}
 * //=> 'bar'
 * ```
 *
 * @name .inArray
 * @param {Array} `array`
 * @param {any} `value`
 * @return {String}
 * @block
 * @api public
 */

helpers.inArray = function(array, value) {
  const options = arguments[arguments.length - 1];
  if (utils.indexOf(array, value) > -1) {
    return options.fn(this);
  }
  return options.inverse(this);
};

/**
 * Returns true if `value` is an es5 array.
 *
 * ```handlebars
 * {{isArray "abc"}}
 * //=> 'false'
 * ```
 *
 * @param {any} `value` The value to test.
 * @return {Boolean}
 * @api public
 */

helpers.isArray = function(value) {
  return Array.isArray(value);
};


/**
 * Returns the last item, or last `n` items of an array.
 * Opposite of [first](#first).
 *
 * Given the array `['a', 'b', 'c', 'd', 'e']`:
 *
 * ```handlebars
 * {{last array 2}}
 * //=> '["d", "e"]'
 * ```
 * @param {Array} `array`
 * @param {Number} `n` Number of items to return, starting with the last item.
 * @return {Array}
 * @api public
 */

helpers.last = function(array, n) {

  function arrayAlt(array, n) {
    if (!utils.isNumber(n)) {
      return array[array.length - 1];
    }
    return array.slice(-n);
  }

  function stringAlt(str, n) {
    const chars = str.split('');
    const result = arrayAlt(chars, n);
    return Array.isArray(result) ? result.join('') : result;
  }

  if (Array.isArray(array)) {
    return arrayAlt(array, n);
  }

  if (utils.isString(array)) {
    return stringAlt(array, n);
  }

  return [];
};

/**
 * Block helper that compares the length of the given array to
 * the number passed as the second argument. If the array length
 * is equal to the given `length`, the block is returned,
 * otherwise an inverse block may optionally be returned.
 *
 * Given the array `['a', 'b', 'c', 'd', 'e']`:
 *
 * ```handlebars
 * {{#lengthEqual array 10}}AAA{{else}}BBB{{/lengthEqual}}
 * //=> 'BBB'
 * ```
 *
 * @name .lengthEqual
 * @param {Array} `array`
 * @param {Number} `length`
 * @return {String}
 * @block
 * @api public
 */

helpers.lengthEqual = function(array, length) {
  const options = arguments[arguments.length - 1];
  if (array.length === length) {
    return options.fn(this);
  }
  return options.inverse(this);
};

/**
 * Returns a new array, created by calling `function`
 * on each element of the given `array`.
 *
 * Given an array `['a', 'b', 'c']`:
 *
 * ```js
 * // register `double` as a helper
 * function double(str) {
 *   return str + str;
 * }
 * // then used like this:
 * // {{map array double}}
 * //=> '["aa", "bb", "cc"]'
 * ```
 *
 * @param {Array} `array`
 * @param {Function} `fn`
 * @return {String}
 * @api public
 */

helpers.map = function(array, fn) {
  if (utils.isUndefined(array)) {return '';}
  if (typeof array === 'string' && /[[]/.test(array)) {
    array = utils.tryParse(array) || [];
  }
  var len = array.length;
  var res = new Array(len);
  var i = -1;

  while (++i < len) {
    res[i] = fn(array[i], i, array);
  }
  return res;
};

/**
 * Block helper that returns the block if the callback returns true
 * for some value in the given array.
 *
 * Given the array `[1, 'b', 3]`:
 *
 * ```handlebars
 * {{#some array isString}}
 *   Render me if the array has a string.
 * {{else}}
 *   Render me if it doesn't.
 * {{/some}}
 * //=> 'Render me if the array has a string.'
 * ```
 * @name .some
 * @param {Array} `array`
 * @param {Function} `cb` callback function
 * @return {Array}
 * @block
 * @api public
 */

helpers.some = function(arr, cb) {
  const options = arguments[arguments.length - 1];
  cb = utils.iterator(cb, this);
  if (!arr) {
    return options.inverse(this);
  }
  var len = arr.length, i = -1;
  while (++i < len) {
    if (cb(arr[i], i, arr)) {
      return options.fn(this);
    }
  }
  return options.inverse(this);
};

/**
 * Sort the given `array`. If an array of objects is passed,
 * you may optionally pass a `key` to sort on as the second
 * argument. You may alternatively pass a sorting function as
 * the second argument.
 *
 * Given an array `['b', 'a', 'c']`:
 *
 * ```handlebars
 * {{sort array}}
 * //=> '["a", "b", "c"]'
 * ```
 *
 * @param {Array} `array` the array to sort.
 * @param {String|Function} `key` The object key to sort by, or sorting function.
 * @api public
 */

helpers.sort = function(arr, options) {
  if (utils.isUndefined(arr)) {return '';}
  if (utils.get(options, 'hash.reverse')) {
    return arr.sort().reverse();
  }
  return arr.sort();
};

/**
 * Sort an `array`. If an array of objects is passed,
 * you may optionally pass a `key` to sort on as the second
 * argument. You may alternatively pass a sorting function as
 * the second argument.
 *
 * Given an array `[{a: 'zzz'}, {a: 'aaa'}]`:
 *
 * ```handlebars
 * {{sortBy array "a"}}
 * //=> '[{"a":"aaa"}, {"a":"zzz"}]'
 * ```
 *
 * @param {Array} `array` the array to sort.
 * @param {String|Function} `props` One or more properties to sort by, or sorting functions to use.
 * @api public
 */

helpers.sortBy = function(arr/*, prop*/) {
  if (utils.isUndefined(arr)) {return '';}
  var args = [].slice.call(arguments);
  args.pop(); // remove hbs options object

  if (typeof args[0] === 'string' && /[[]/.test(args[0])) {
    args[0] = utils.tryParse(args[0]) || [];
  }
  if (utils.isUndefined(args[1])) {
    return args[0].sort();
  }
  return utils.sortBy.apply(null, args);
};

/**
 * Use the items in the array _after_ the specified index
 * as context inside a block. Opposite of [withBefore](#withBefore).
 *
 * Given the array `['a', 'b', 'c', 'd', 'e']`:
 *
 * ```handlebars
 * {{#withAfter array 3}}
 *   {{this}}
 * {{/withAfter}}
 * //=> "de"
 * ```
 * @param {Array} `array`
 * @param {Number} `idx`
 * @return {Array}
 * @block
 * @api public
 */

helpers.withAfter = function(array, idx) {
  const options = arguments[arguments.length - 1];
  array = array.slice(idx);
  var result = '';

  var len = array.length, i = -1;
  while (++i < len) {
    result += options.fn(array[i]);
  }
  return result;
};

/**
 * Use the items in the array _before_ the specified index
 * as context inside a block. Opposite of [withAfter](#withAfter).
 *
 * Given the array `['a', 'b', 'c', 'd', 'e']`:
 *
 * ```handlebars
 * {{#withBefore array 3}}
 *   {{this}}
 * {{/withBefore}}
 * //=> 'ab'
 * ```
 * @param {Array} `array`
 * @param {Number} `idx`
 * @return {Array}
 * @block
 * @api public
 */

helpers.withBefore = function(array, idx) {
  const options = arguments[arguments.length - 1];
  array = array.slice(0, -idx);
  var result = '';

  var len = array.length, i = -1;
  while (++i < len) {
    result += options.fn(array[i]);
  }
  return result;
};

/**
 * Use the first item in a collection inside a handlebars
 * block expression. Opposite of [withLast](#withLast).
 *
 * Given the array `['a', 'b', 'c']`:
 *
 * ```handlebars
 * {{#withFirst array}}
 *   {{this}}
 * {{/withFirst}}
 * //=> 'a'
 * ```
 * @param {Array} `array`
 * @param {Number} `idx`
 * @return {String}
 * @block
 * @api public
 */

helpers.withFirst = function(arr, idx) {
  const options = arguments[arguments.length - 1];
  if (utils.isEmpty(arr) || utils.isUndefined(arr)) {
    return '';
  }
  arr = utils.result(arr);

  if (!utils.isUndefined(idx)) {
    idx = parseFloat(utils.result(idx));
  }

  if (utils.isUndefined(idx)) {
    return options.fn(arr[0]);
  }

  arr = arr.slice(0, idx);
  var len = arr.length, i = -1;
  var result = '';
  while (++i < len) {
    result += options.fn(arr[i]);
  }
  return result;
};

/**
 * Use the last item or `n` items in an array as context inside a block.
 * Opposite of [withFirst](#withFirst).
 *
 * Given the array `['a', 'b', 'c']`:
 *
 * ```handlebars
 * {{#withLast array}}
 *   {{this}}
 * {{/withLast}}
 * //=> 'c'
 * ```
 * @param {Array} `array`
 * @param {Number} `idx` The starting index.
 * @return {String}
 * @block
 * @api public
 */

helpers.withLast = function(array, idx) {
  if (utils.isUndefined(array)) {return '';}
  const options = arguments[arguments.length - 1];
  array = utils.result(array);

  if (!utils.isUndefined(idx)) {
    idx = parseFloat(utils.result(idx));
  }

  if (utils.isUndefined(idx)) {
    return options.fn(array[array.length - 1]);
  }

  array = array.slice(-idx);
  var len = array.length, i = -1;
  var result = '';
  while (++i < len) {
    result += options.fn(array[i]);
  }
  return result;
};

/**
 * Block helper that sorts a collection and exposes the sorted
 * collection as context inside the block.
 *
 * Given the array `['b', 'a', 'c']`:
 *
 * ```handlebars
 * {{#withSort array}}{{this}}{{/withSort}}
 * //=> 'abc'
 * ```
 * @name .withSort
 * @param {Array} `array`
 * @param {String} `prop`
 * @return {String}
 * @block
 * @api public
 */

helpers.withSort = function(array, prop) {
  if (utils.isUndefined(array)) {return '';}
  const options = arguments[arguments.length - 1];
  var result = '';

  if (utils.isUndefined(prop)) {
    array = array.sort();
    if (utils.get(options, 'hash.reverse')) {
      array = array.reverse();
    }

    for (var i = 0, len = array.length; i < len; i++) {
      result += options.fn(array[i]);
    }
    return result;
  }

  array.sort(function(a, b) {
    a = utils.get(a, prop);
    b = utils.get(b, prop);
    return a > b ? 1 : (a < b ? -1 : 0);
  });

  if (utils.get(options, 'hash.reverse')) {
    array = array.reverse();
  }

  var alen = array.length, j = -1;
  while (++j < alen) {
    result += options.fn(array[j]);
  }
  return result;
};