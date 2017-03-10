# http-proxy-subware

Express/connect middleware for composing http proxies with more middleware - subware!

# Why

[express](https://expressjs.com/)/[connect](https://github.com/senchalabs/connect) middleware is a good idea. It's modular, composable, and easy to reason about. Building a node http proxy server is a common task that remains awkward whether you decide to roll your own, or take on a dependency. This "subware" framework makes defining proxy servers as easy as composing common middleware.
