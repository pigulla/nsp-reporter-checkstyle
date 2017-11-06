/* eslint-disable no-console */

const path = require('path');
const { format } = require('util');
const checkstyle = require('checkstyle-formatter');

module.exports.error = function (error, args) {
    console.error(error.toString());
};

module.exports.success = function (result, args) {
    console.log(result);
};

module.exports.check = {
    success(result, args) {
        const messages = result.data.map(function (item) {
            const { module, title, vulnerable_versions, patched_versions, version, advisory } = item;

            return {
                line: 0,
                column: 0,
                severity: 'error',
                message: format(
                    'Module %s has a known vulnerability: "%s" (vulnerable: %s, patched: %s, yours: %s), see %s',
                    module, title, vulnerable_versions, patched_versions, version, advisory
                )
            };
        });

        const xml = checkstyle([
            {
                filename: path.join(args.path, 'package.json'),
                messages
            }
        ]);

        console.log(xml);
    }
};
