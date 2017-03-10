'use strict';

const http = require('http');
const subware = require('./subware');
const debug = require('./helpers/debug');

// -----------------------------------------------------------------------------

const internalSubware = [
    subware.noop(),
    subware.passTarget(),
    subware.noop()
];

// Proxy middlware generator ---------------------------------------------------

function proxy(proxyOptions) {
    const options = Object.assign({
        targetHost: undefined,
        targetPort: undefined,
        subware: []
    }, proxyOptions);

    const toExec = internalSubware.concat(options.subware).filter(x => !!x);

    return function proxyMiddleware (req, res, next) {
        debug('start proxy middleware');
        const targetReq = makeTargetRequest(req, options);

        targetReq.on('response', (targetRes) => {
            (function execSubware(queue, onDone) {
                const fn = queue[0];
                if (fn) {
                    debug(`exec subware '${fn.name}' (${ toExec.length - (queue.length - 1) } of ${ toExec.length })`);
                    const callback = () => {
                        execSubware(queue.slice(1), onDone);
                    };
                    fn(req, res, callback, targetReq, targetRes);
                } else {
                    onDone();
                }
            })(toExec, () => {
                res.end();
                debug('proxy middleware done');
                next();
            });
        });

        debug('starting target request');
        targetReq.end();
    };
}

// -----------------------------------------------------------------------------

function makeTargetRequest(originalReq, options) {
    return http.request({
        hostname: options.targetHost,
        port: options.targetPort,
        path: originalReq.url,
        method: originalReq.method,
        headers: Object.assign(originalReq.headers, {
            host: options.targetHost
        })
    });
}

// -----------------------------------------------------------------------------

module.exports = proxy;
