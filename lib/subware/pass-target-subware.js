const debug = require('../helpers/debug');

module.exports = function passTarget() {
    return function passTargetSubware(req, res, next, targetReq, targetRes) {
        Object.keys(targetRes.headers).forEach(headerName => {
            res.setHeader(headerName, targetRes.headers[headerName]);
        });

        targetRes.on('data', (chunk) => {
            debug(`pass data write ${ chunk.length } bytes`);
            res.write(chunk);
        });
        targetRes.on('end', (chunk) => {
            debug(`pass data end ${ chunk ? chunk.length : 'null' } bytes`);
            if (chunk) {
                res.write(chunk);
            }
            next();
        });
    };
};
