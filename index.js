const Server = require('./lib/server');

module.exports = {
  startServer: function(options, serverOptions) {
    const server = new Server(options);
    return server.start(serverOptions);
  },
};
