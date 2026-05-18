const TOKEN_KEY = "token";
const ACCESS_TOKEN_KEY = "access_token";

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(ACCESS_TOKEN_KEY) || "";
}

export function setStoredToken(token) {
  if (!token) {
    clearStoredToken();
    return;
  }

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}
