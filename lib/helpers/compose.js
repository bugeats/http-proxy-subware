module.exports = function compose() {
    const args = Array.prototype.slice.call(arguments);

    return args.reverse().reduce(function (prev, arg) {
        const fn = (typeof arg !== 'function') ? arg => arg : arg;
        return function () {
            return prev(fn.apply(this, arguments));
        };
    });
};
