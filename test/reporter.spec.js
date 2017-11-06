const fs = require('fs');
const path = require('path');
const rewire = require('rewire');

const source_dir = process.env.SOURCE_DIR || path.join('..', 'src'); // eslint-disable-line no-process-env

const expect = require('chai').expect;
const reporter = rewire(path.join(source_dir, 'reporter'));

const findings = require('./fixtures/findings.json');

const consoleMock = {
    stdout: '',
    stderr: '',
    error(msg) {
        this.stderr += msg;
    },
    log(msg) {
        this.stdout += msg;
    }
};

describe('reporter', function () {
    let revert;

    beforeEach(function () {
        consoleMock.stdout = '';
        consoleMock.stderr = '';
        revert = reporter.__set__('console', consoleMock);
    });

    afterEach(function () {
        revert();
    });

    it('creates correct XML', function () {
        const file = path.join(__dirname, 'fixtures', 'findings.xml');
        const expected = fs.readFileSync(file).toString();

        reporter.check.success(findings, { path: 'package.json' });

        expect(consoleMock.stdout).to.equal(expected);
    });

    it('prints debug output on error', function () {
        reporter.error(new Error('Some nasty error'));

        expect(consoleMock.stderr).to.equal('Error: Some nasty error');
    });
});
