'use strict';

const test = require('tape');
const proxy = require('./proxy');

test('proxy module ok', function (assert) {
    assert.ok(proxy, 'module ok');
    assert.end();
});
