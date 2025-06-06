'use strict';
const utils = require('./3p/utils');
const { ValidationError } = require('../lib/errors');

const max_keys = 50;

const factory = globals => {
    return function (key) {
        if (!utils.isString(key)) {
            throw new ValidationError("incrementVar helper key must be a string");
        }

        // Setup storage
        if (typeof globals.storage.variables === 'undefined') {
            globals.storage.variables = Object.create(null);
        }

        if (Object.hasOwnProperty.call(globals.storage.variables, key) && Number.isInteger(globals.storage.variables[key])) {
            // Increment value if it already exists
            globals.storage.variables[key] += 1;
        } else {
            // Make sure the number of total keys is within the limit
            if (Object.keys(globals.storage.variables).length >= max_keys) {
                throw new ValidationError(`Unique keys in variable storage may not exceed ${max_keys} in total`);
            }
            // Initialize or re-initialize value
            globals.storage.variables[key] = 0;
        }

        // Return current value
        return Object.hasOwnProperty.call(globals.storage.variables, key) ? globals.storage.variables[key] : undefined;
    };
};

module.exports = [{
    name: 'incrementVar',
    factory: factory,
}];
