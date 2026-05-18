let pendingRequests = 0;
const listeners = new Set();
const unauthorizedListeners = new Set();
const API_PREFIX = "/api";

function notifyListeners() {
  listeners.forEach((listener) => listener(pendingRequests));
}

function notifyUnauthorized() {
  unauthorizedListeners.forEach((listener) => listener());
}

export function subscribeRequestLoading(listener) {
  listeners.add(listener);
  listener(pendingRequests);

  return () => {
    listeners.delete(listener);
  };
}

export function subscribeUnauthorized(listener) {
  unauthorizedListeners.add(listener);

  return () => {
    unauthorizedListeners.delete(listener);
  };
}

export function beginRequest() {
  pendingRequests += 1;
  notifyListeners();

  return () => {
    pendingRequests = Math.max(0, pendingRequests - 1);
    notifyListeners();
  };
}

function getRequestUrl(input) {
  if (typeof input === "string") {
    return input;
  }

  if (typeof Request !== "undefined" && input instanceof Request) {
    return input.url;
  }

  return "";
}

function shouldNotifyUnauthorized(url) {
  return !url.includes("/api/login");
}

export function buildApiPath(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (normalizedPath.startsWith(API_PREFIX)) {
    return normalizedPath;
  }

  return `${API_PREFIX}${normalizedPath}`;
}

export async function trackedFetch(...args) {
  const finishRequest = beginRequest();

  try {
    const response = await fetch(...args);
    const requestUrl = getRequestUrl(args[0]);

    if (response.status === 401 && shouldNotifyUnauthorized(requestUrl)) {
      notifyUnauthorized();
    }

    return response;
  } finally {
    finishRequest();
  }
}

export function trackedApiFetch(path, options) {
  return trackedFetch(buildApiPath(path), options);
}
