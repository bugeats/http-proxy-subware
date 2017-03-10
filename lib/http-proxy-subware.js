'use strict';

const http = require('http');
const subware = require('./subware');
const debug = require('./helpers/debug');

// -----------------------------------------------------------------------------

function proxy(options) {
    const opts = Object.assign({
        targetHost: undefined,
        targetPort: undefined,
        subware: [
            subware.noop(),
            subware.passTarget(),
            subware.noop()
        ]
    }, options);

    return function generatedProxy(req, res, next) {
        debug('start proxy middleware');
        const targetReq = makeTargetRequest(req, opts);

        targetReq.on('response', (targetRes) => {
            (function execSubware(queue, onDone) {
                const fn = queue[0];
                if (fn) {
                    debug(`exec subware '${fn.name}' (${ opts.subware.length - (queue.length - 1) } of ${ opts.subware.length })`);
                    const callback = () => {
                        execSubware(queue.slice(1), onDone);
                    };
                    fn(req, res, callback, targetReq, targetRes);
                } else {
                    onDone();
                }
            })(opts.subware, () => {
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

function makeTargetRequest(originalReq, opts) {
    return http.request({
        hostname: opts.targetHost,
        port: opts.targetPort,
        path: originalReq.url,
        method: originalReq.method,
        headers: Object.assign(originalReq.headers, {
            host: opts.targetHost
        })
    });
}

// -----------------------------------------------------------------------------

module.exports = proxy;
