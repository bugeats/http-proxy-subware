'use strict';

const url = require('url');
const http = require('http');
const subware = require('./subware');
const debug = require('./helpers/debug');
const compose = require('./helpers/compose');

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

// Proxy Options ---------------------------------------------------------------

function reconcileProxyOptions(proxyOptions) {
    return compose(
        parseTargetOptions,
        validateOptions
    )(Object.assign({
        // defaults
        targetHost: 'localhost',
        targetPort: 80,
        targetProtocol: 'http',
        subware: []
    }, proxyOptions));
}

function parseTargetOptions(proxyOptions) {
    if (proxyOptions.target) {
        const parsed = url.parse(proxyOptions.target);
        const targetProtocol = parsed.protocol ? parsed.protocol.replace(/:$/, '') : proxyOptions.targetProtocol;
        return Object.assign(proxyOptions, {
            targetHost: parsed.hostname,
            targetPort: parsed.port || 80,
            targetProtocol
        });
    }
    return proxyOptions;
}

function validateOptions(proxyOptions) {
    if (proxyOptions.targetProtocol !== 'http' || proxyOptions.targetProtocol !== 'http') {
        throw new TypeError(`proxy targetProtocol is invalid: "${ proxyOptions.targetProtocol }"`);
    }
    return proxyOptions;
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
