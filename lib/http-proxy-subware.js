function httpProxySubware() {
    return function generatedProxy(req, res, next) {
        next();
    };
}

// -----------------------------------------------------------------------------

module.exports = httpProxySubware;
