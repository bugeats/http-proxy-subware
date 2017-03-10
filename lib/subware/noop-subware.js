module.exports = function noop() {
    return function noopSubware(req, res, next) {
        next();
    };
};
