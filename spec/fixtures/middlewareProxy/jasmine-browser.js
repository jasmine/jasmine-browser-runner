const http = require('http');

module.exports = {
  "srcDir": ".",
  "srcFiles": [],
  "specDir": ".",
  "specFiles": ["aSpec.js"],
  "helpers": [],
  "browser": {
    "name": "headlessChrome"
  },
  "middleware": {
    "/api": function(req, res, next) {
      const proxyReq = http.request({
        hostname: 'localhost',
        port: 18900,
        path: req.url,
        method: req.method,
        headers: req.headers
      }, function(proxyRes) {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      });
      proxyReq.on('error', function(err) { next(err); });
      req.pipe(proxyReq);
    }
  }
}
