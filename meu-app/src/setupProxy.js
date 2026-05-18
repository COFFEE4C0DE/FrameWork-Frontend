const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function setupProxy(app) {
  app.use(
    "/user",
    createProxyMiddleware({
      target: "https://framework-backend-gm8v.onrender.com",
      changeOrigin: true,
    })
  );
  app.use(
    "/ativarUsuario",
    createProxyMiddleware({
      target: "https://framework-backend-gm8v.onrender.com",
      changeOrigin: true,
    })
  );
  app.use(
    "/login",
    createProxyMiddleware({
      target: "https://framework-backend-gm8v.onrender.com",
      changeOrigin: true,
    })
  );
};
