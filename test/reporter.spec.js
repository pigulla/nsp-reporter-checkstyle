const fs = require('fs');
const path = require('path');
const rewire = require('rewire');

const source_dir = process.env.SOURCE_DIR || path.join('..', 'src'); // eslint-disable-line no-process-env

const expect = require('chai').expect;
const reporter = rewire(path.join(source_dir, 'reporter'));

const findings = require('./fixtures/findings.json');
const no_findings = require('./fixtures/findings.json');

const console_mock = {
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
        console_mock.stdout = '';
        console_mock.stderr = '';
        revert = reporter.__set__('console', console_mock);
    });

    afterEach(function () {
        revert();
    });

    describe('creates correct XML', function () {
        it('when issues are found', function () {
            const file = path.join(__dirname, 'fixtures', 'findings.xml');
            const expected = fs.readFileSync(file).toString();

            reporter.check.success(findings, { path: '/some/absolute/path' });

            expect(console_mock.stdout).to.equal(expected);
        });

        it('when no issues were found', function () {
            const file = path.join(__dirname, 'fixtures', 'findings.empty.xml');
            const expected = fs.readFileSync(file).toString();

            reporter.check.success(no_findings, { path: '/some/absolute/path' });

            expect(console_mock.stdout).to.equal(expected);
        });
    });

    it('prints debug output on error', function () {
        reporter.error(new Error('Some nasty error'));

        expect(console_mock.stderr).to.equal('Error: Some nasty error');
    });
});
