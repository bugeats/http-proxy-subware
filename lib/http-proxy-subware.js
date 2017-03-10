'use strict';

const url = require('url');
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
    const options = reconcileProxyOptions(proxyOptions);
    const toExec = internalSubware.concat(options.subware).filter(x => !!x);

    debug(`options: ${ JSON.stringify(options, null, 2) }`);

    return function proxyMiddleware(req, res, next) {
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

function reconcileProxyOptions(proxyOptions) {
    return Object.assign({
        targetHost: undefined,
        targetPort: undefined,
        subware: []
    }, parseTargetOptions(proxyOptions));
}

function parseTargetOptions(proxyOptions) {
    if (proxyOptions.target) {
        const parsed = url.parse(proxyOptions.target);
        return Object.assign(proxyOptions, {
            targetHost: parsed.hostname,
            targetProtocol: parsed.protocol,
            targetPort: parsed.port || 80
        });
    }
    return proxyOptions;
}

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
