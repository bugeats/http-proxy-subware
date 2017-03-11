module.exports = function debug(msg) {
    if (process.env['DEBUG']) {
        console.log(`[proxy] ${ msg }`); // eslint-disable-line no-console
    }
};
