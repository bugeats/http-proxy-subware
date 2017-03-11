'use strict';

const app = require('express')();
const tape = require('tape');

const PORT_RANGE_START = 9000;

// -----------------------------------------------------------------------------

app.get('/alpha.html', (req, res) => {
    res.type('html');
    res.send('<html><body><h1>alpha</h1></body></html>');
});

app.get('/alpha.json', (req, res) => {
    res.json({
        name: 'alpha'
    });
});

// -----------------------------------------------------------------------------

let lastPort = PORT_RANGE_START;

function getHostInfo() {
    const info = {
        port: lastPort,
        hostname: `localhost:${lastPort}`
    };
    lastPort = lastPort + 1;
    return info;
}

function start(callback) {
    const hostInfo = getHostInfo();
    const server = app.listen(hostInfo.port, callback);
    return server;
}

function test(testDesc, testFn) {
    const server = start(() => {
        tape(testDesc, (assert) => {
            testFn(assert, server, () => {
                server.close();
            });
        });
    });
}

// -----------------------------------------------------------------------------

module.exports = {
    start,
    test
};
