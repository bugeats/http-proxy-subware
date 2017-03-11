'use strict';

const request = require('supertest');
const connect = require('connect');

const proxy = require('../index.js');
const testTargetServer = require('./test-target-server');

// -----------------------------------------------------------------------------

testTargetServer.test('connect integration baseline control', (assert, hostname, done) => {
    const app = connect();

    app.use('/control', (req, res) => {
        res.end('ok');
    });

    request(app)
        .get('/control')
        .expect(200)
        .end(function (err, res) {
            assert.ok(res, 'has response');
            assert.error(err, 'no error');
            assert.end();
            done();
        });
});

testTargetServer.test('connect integration basic proxy', (assert, targetServer, done) => {
    const app = connect();

    app.use('/', proxy({
        target: `http://localhost:${ targetServer.address().port }/`
    }));

    request(app)
        .get('/alpha.html')
        .expect('Content-Type', /html/)
        .expect(200)
        .expect('<html><body><h1>alpha</h1></body></html>')
        .end((err, res) => {
            assert.ok(res, 'has response');
            assert.error(err, 'no error');
            assert.end();
            done();
        });
});

