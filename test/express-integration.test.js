'use strict';

const test = require('tape');
const request = require('supertest');

const app = require('express')();
const proxy = require('../index.js');

// -----------------------------------------------------------------------------

app.use('/', proxy());

app.get('/control', (req, res) => {
    res.send('ok');
});

// -----------------------------------------------------------------------------

test('express integration baseline control', function (assert) {
    request(app)
        .get('/control')
        .expect(200)
        .end(function (err, res) {
            assert.ok(res, 'has response');
            assert.error(err, 'no error');
            assert.end();
        });
});

