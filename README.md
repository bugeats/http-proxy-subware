# http-proxy-subware

![under](http://www.textfiles.com/underconstruction/HeHeartlandPark2601underconstructionbar9.gif)
![construction](http://www.textfiles.com/underconstruction/HeartlandFlats5661CONSTRUCTION.gif)

Node middleware for composing http proxies with more middleware - subware!

## Why

[Express](https://expressjs.com/) / [connect](https://github.com/senchalabs/connect) middleware is a good idea. It's modular, composable, and easy to reason about. Building a Node http proxy server is a common task that can be awkward whether you decide to roll your own, or take on a dependency. This "subware" framework makes defining proxy servers as easy as composing common middleware.

## How

```javascript
const app = require('express')();
const proxy = require('http-proxy-subware');

function mySubware() {
    return function (req, res, next, targetReq, targetRes) {
        const startTime = Date.now();
        targetRes.on('end', () => {
            const ms = startTime - Date.now();
            res.write(`target took ${ ms } ms to response`);
        });
    }
}

app.use('/', proxy({
    target: 'https://example.com',
    subware: [
        proxy.subware.stripTargetHeaders()
        mySubware()
        proxy.subware.forceJson()
        proxy.subware.flipImages()
    ]
}));
```
