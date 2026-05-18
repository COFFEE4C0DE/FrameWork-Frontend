const { createProxyMiddleware } = require("http-proxy-middleware");
const { API_BASE_URL, API_PROXY_PREFIX } = require("./apiConfig");

module.exports = function setupProxy(app) {
  app.use(
    API_PROXY_PREFIX,
    createProxyMiddleware({
      target: API_BASE_URL,
      changeOrigin: true,
      pathRewrite: {
        [`^${API_PROXY_PREFIX}`]: "",
      },
    })
  );
};
