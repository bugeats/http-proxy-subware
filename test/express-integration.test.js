'use strict';

const request = require('supertest');
const express = require('express');

const proxy = require('../index.js');
const testTargetServer = require('./test-target-server');

// -----------------------------------------------------------------------------

testTargetServer.test('express integration baseline control', (assert, hostname, done) => {
    const app = express();

    app.get('/control', (req, res) => {
        res.send('ok');
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

testTargetServer.test('express integration basic proxy', (assert, targetServer, done) => {
    const app = express();

    app.use('/', proxy({
        targetHost: 'localhost',
        targetPort: targetServer.address().port
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

testTargetServer.test('express integration parses target url', (assert, targetServer, done) => {
    const app = express();

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
