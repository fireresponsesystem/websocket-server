module.exports = {
  apps: [
    {
      name: "api-server",
      script: "./server.js",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "websocket-server",
      script: "./ws-server.js",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
