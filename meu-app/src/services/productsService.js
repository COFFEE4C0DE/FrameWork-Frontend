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

    throw new Error(apiMessage || "Não foi possível concluir a solicitação.");
  }

  return data;
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

export function listProducts(token) {
  return request("/products", { token });
}

export function getProductById(productId, token) {
  return request(`/products/${productId}`, { token });
}

export function createProduct(product, token) {
  return request("/products", {
    method: "POST",
    body: product,
    token,
  });
}

export function updateProduct(productId, product, token) {
  return request(`/products/${productId}`, {
    method: "PUT",
    body: product,
    token,
  });
}

export function updateProductStatus(productId, status, token) {
  return request(`/products/${productId}/status`, {
    method: "PATCH",
    body: { status },
    token,
  });
}
