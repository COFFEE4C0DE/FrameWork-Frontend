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

    if (typeof apiMessage === "string" && apiMessage.includes("Cannot POST /sales")) {
      throw new Error(
        "A rota de vendas não foi encontrada no servidor local. Reinicie o npm start para carregar o proxy atualizado."
      );
    }

    if (typeof apiMessage === "string" && apiMessage.trim().startsWith("<!DOCTYPE html>")) {
      throw new Error("Não foi possível registrar a venda. Verifique se o backend e o proxy estão ativos.");
    }

    throw new Error(apiMessage || "Não foi possível concluir a solicitação.");
  }

  return data;
}

function buildQuery({ startDate, endDate } = {}) {
  const params = new URLSearchParams();

  if (startDate) {
    params.set("start_date", startDate);
  }

  if (endDate) {
    params.set("end_date", endDate);
  }

  const query = params.toString();

  return query ? `?${query}` : "";
}

async function request(path, { method = "GET", body, token } = {}) {
  const authToken = getToken(token);

  if (!authToken) {
    throw new Error("Sessão expirada. Faça login novamente para continuar.");
  }

  const response = await trackedApiFetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  return parseResponse(response);
}

export function listSales(filters = {}, token) {
  return request(`/sales${buildQuery(filters)}`, { token });
}

export function createSale(sale, token) {
  return request("/sales", {
    method: "POST",
    body: sale,
    token,
  });
}

export function getSalesReport(filters = {}, token) {
  return request(`/reports/sales${buildQuery(filters)}`, { token });
}
