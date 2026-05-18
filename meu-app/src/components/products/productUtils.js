export const STATUS_OPTIONS = [
  { label: "Ativo", value: "true" },
  { label: "Inativo", value: "false" },
];

export function getProductId(product) {
  return product?.id ?? product?._id ?? product?.product_id ?? product?.productId ?? "";
}

export function getProductName(product) {
  return product?.nome ?? product?.name ?? "Produto sem nome";
}

export function getProductPrice(product) {
  const value = product?.preco ?? product?.price ?? 0;
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : 0;
}

export function getProductQuantity(product) {
  const value = product?.qtd ?? product?.quantidade ?? product?.quantity ?? 0;
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : 0;
}

export function getProductImage(product) {
  return product?.image ?? product?.imagem ?? product?.image_url ?? product?.imageUrl ?? "";
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(getProductPrice({ preco: value }));
}

export function normalizeStatusValue(status) {
  if (typeof status === "boolean") {
    return status;
  }

  if (typeof status === "number") {
    return status === 1;
  }

  if (typeof status === "string") {
    const statusLower = status.trim().toLowerCase();

    if (["ativo", "active", "true", "1", "disponível", "disponivel"].includes(statusLower)) {
      return true;
    }

    if (
      ["inativo", "inactive", "false", "0", "indisponível", "indisponivel", "esgotado"].includes(
        statusLower
      )
    ) {
      return false;
    }
  }

  return Boolean(status);
}

export function getStatusMeta(product) {
  const quantity = getProductQuantity(product);
  const status = product?.status;

  if (quantity <= 0) {
    return {
      label: "Esgotado",
      className: "is-out",
    };
  }

  if (typeof status === "string") {
    const statusLower = status.trim().toLowerCase();

    if (statusLower.includes("indispon")) {
      return {
        label: "Indisponível",
        className: "is-unavailable",
      };
    }
  }

  if (normalizeStatusValue(status)) {
    return {
      label: "Ativo",
      className: "is-active",
    };
  }

  return {
    label: "Inativo",
    className: "is-inactive",
  };
}

export function isLowStock(product) {
  const quantity = getProductQuantity(product);

  return quantity > 0 && quantity <= 5;
}

export function buildProductPayload(formData) {
  return {
    nome: formData.nome.trim(),
    preco: Number(String(formData.preco).replace(",", ".")),
    qtd: Number(formData.qtd),
    status: formData.status === "true",
    image: formData.image.trim(),
  };
}

export function getProductListFromResponse(data) {
  if (Array.isArray(data)) {
    return data;
  }

  const directList =
    data?.products ||
    data?.produtos ||
    data?.items ||
    data?.results ||
    data?.result ||
    data?.data;

  if (Array.isArray(directList)) {
    return directList;
  }

  const nestedList =
    data?.data?.products ||
    data?.data?.produtos ||
    data?.data?.items ||
    data?.data?.results ||
    data?.data?.result ||
    data?.result?.products ||
    data?.result?.produtos ||
    data?.result?.items;

  if (Array.isArray(nestedList)) {
    return nestedList;
  }

  if (data && typeof data === "object") {
    const productLikeValues = Object.values(data).filter((value) => {
      return (
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        ("nome" in value || "name" in value || "preco" in value || "qtd" in value)
      );
    });

    if (productLikeValues.length > 0) {
      return productLikeValues;
    }
  }

  return [];
}

export function getProductFromResponse(data) {
  return (
    data?.product ??
    data?.produto ??
    data?.data?.product ??
    data?.data?.produto ??
    data?.data?.item ??
    data?.data ??
    data?.result?.product ??
    data?.result?.produto ??
    data?.result ??
    data
  );
}
