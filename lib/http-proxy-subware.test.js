'use strict';

const test = require('tape');
const httpProxySubware = require('./http-proxy-subware');

test('http-proxy-subware module ok', function (assert) {
    assert.ok(httpProxySubware, 'module ok');
    assert.end();
});
