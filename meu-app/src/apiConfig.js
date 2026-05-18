const API_BASE_URL =
  process.env.API_BASE_URL ||
  process.env.REACT_APP_API_BASE_URL ||
  "https://framework-backend-gm8v.onrender.com";

const API_PROXY_PREFIX = "/api";

module.exports = {
  API_BASE_URL,
  API_PROXY_PREFIX,
};
