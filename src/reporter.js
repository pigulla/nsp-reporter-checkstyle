/* eslint-disable no-console */

const path = require('path');
const { format } = require('util');
const checkstyle = require('checkstyle-formatter');

function cvssScoreToSeverity(score) {
    if (score < 4.0) {
        return 'info';
    } else if (score >= 4.0 && score < 7.0) {
        return 'warning';
    } else if (score >= 7.0) {
        return 'error';
    }
    return 'ignore';
}

module.exports.error = function (error, args) {
    console.error(error.toString());
};

module.exports.success = function (result, args) {
    console.log(result);
};

module.exports.check = {
    success(result, args) {
        const messages = result.data.map(function (item) {
            const { module, title, vulnerable_versions, patched_versions, version, advisory, cvss_score } = item;

            return {
                line: 0,
                column: 0,
                severity: cvssScoreToSeverity(cvss_score),
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
