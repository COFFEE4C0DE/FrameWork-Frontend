import { getStoredToken } from "../auth/tokenStorage";
import { trackedApiFetch } from "./requestLoader";

function getToken(token) {
  return token || getStoredToken();
}

async function parseResponse(response) {
  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const apiMessage =
      data?.erro || data?.error || data?.message || data?.mensagem || data;

    throw new Error(apiMessage || "Não foi possível carregar o dashboard.");
  }

  return data;
}

async function request(path, { token } = {}) {
  const authToken = getToken(token);

  if (!authToken) {
    throw new Error("Sessão expirada. Faça login novamente para continuar.");
  }

  const response = await trackedApiFetch(path, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });

  return parseResponse(response);
}

export function getDashboardSummary(token) {
  return request("/dashboard/summary", { token });
}

export function getSummaryFromResponse(data) {
  return (
    data?.data?.summary ||
    data?.summary ||
    data?.data ||
    {}
  );
}
