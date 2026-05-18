let pendingRequests = 0;
const listeners = new Set();

function notifyListeners() {
  listeners.forEach((listener) => listener(pendingRequests));
}

export function subscribeRequestLoading(listener) {
  listeners.add(listener);
  listener(pendingRequests);

  return () => {
    listeners.delete(listener);
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

export async function trackedFetch(...args) {
  const finishRequest = beginRequest();

  try {
    return await fetch(...args);
  } finally {
    finishRequest();
  }
}
