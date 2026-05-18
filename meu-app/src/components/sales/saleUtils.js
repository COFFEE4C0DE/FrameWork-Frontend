import {
  formatCurrency,
  getProductId,
  getProductImage,
  getProductName,
  getProductPrice,
  getProductQuantity,
  normalizeStatusValue,
} from "../products/productUtils";

const emptyValue = "Não informado";

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

function toFiniteNumber(value) {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : null;
}

function primitiveValue(value) {
  return value && typeof value === "object" ? undefined : value;
}

function toDisplayValue(value) {
  if (value === undefined || value === null || value === "") {
    return emptyValue;
  }

  if (typeof value === "boolean") {
    return value ? "Sim" : "Não";
  }

  if (typeof value === "number") {
    return new Intl.NumberFormat("pt-BR").format(value);
  }

  return String(value);
}

function prettifyKey(key) {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (letter) => letter.toUpperCase());
}

function getReportSummary(report) {
  return report?.summary ?? report?.resumo ?? report?.data?.summary ?? report?.data?.resumo ?? report;
}

function getReportPeriod(report) {
  return report?.periodo ?? report?.period ?? report?.data?.periodo ?? report?.data?.period ?? null;
}

function formatReportDate(value) {
  if (!value) {
    return emptyValue;
  }

  const dateValue = String(value);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(dateValue)
    ? new Date(`${dateValue}T00:00:00`)
    : new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(date);
}

export function getSalesListFromResponse(data) {
  if (Array.isArray(data)) {
    return data;
  }

  const directList =
    data?.sales ||
    data?.vendas ||
    data?.items ||
    data?.results ||
    data?.result ||
    data?.data;

  if (Array.isArray(directList)) {
    return directList;
  }

  const nestedList =
    data?.data?.sales ||
    data?.data?.vendas ||
    data?.data?.items ||
    data?.data?.results ||
    data?.result?.sales ||
    data?.result?.vendas ||
    data?.result?.items;

  if (Array.isArray(nestedList)) {
    return nestedList;
  }

  if (data && typeof data === "object" && (data.product_id || data.produto_id || data.quantidade)) {
    return [data];
  }

  return [];
}

export function getReportFromResponse(data) {
  return (
    data?.report ??
    data?.relatorio ??
    data?.data?.report ??
    data?.data?.relatorio ??
    data?.data ??
    data?.result ??
    data
  );
}

export function getSaleId(sale) {
  return sale?.id ?? sale?._id ?? sale?.sale_id ?? sale?.saleId ?? sale?.venda_id ?? sale?.vendaId ?? "";
}

export function getSaleProductId(sale) {
  return firstDefined(
    sale?.product_id ??
    sale?.produto_id ??
    sale?.productId ??
    sale?.produtoId,
    primitiveValue(sale?.product),
    primitiveValue(sale?.produto),
    primitiveValue(sale?.item),
    getProductId(sale?.product),
    getProductId(sale?.produto),
    ""
  );
}

export function buildProductsById(products) {
  return products.reduce((map, product) => {
    const productId = getProductId(product);

    if (productId) {
      map.set(String(productId), product);
    }

    return map;
  }, new Map());
}

export function getSaleProduct(sale, productsById) {
  const saleProduct = sale?.product ?? sale?.produto ?? sale?.item ?? null;

  if (saleProduct && typeof saleProduct === "object") {
    return saleProduct;
  }

  const productId = getSaleProductId(sale);

  return productId ? productsById.get(String(productId)) ?? null : null;
}

export function getSaleProductName(sale, product) {
  return (
    firstDefined(
      sale?.produto_nome,
      sale?.product_name,
      sale?.nome_produto,
      sale?.nomeProduto,
      product ? getProductName(product) : "",
      getSaleProductId(sale) ? `Produto ${getSaleProductId(sale)}` : ""
    ) || "Produto sem identificação"
  );
}

export function getSaleProductImage(sale, product) {
  return (
    firstDefined(
      sale?.product_image,
      sale?.produto_imagem,
      sale?.image,
      product ? getProductImage(product) : ""
    ) || ""
  );
}

export function getSaleQuantity(sale) {
  return (
    toFiniteNumber(
      firstDefined(sale?.quantidade, sale?.qtd, sale?.quantity, sale?.sale_quantidade)
    ) ?? 0
  );
}

export function getSaleUnitPrice(sale) {
  return toFiniteNumber(
    firstDefined(
      sale?.preco_unitario,
      sale?.valor_unitario,
      sale?.preco_no_momento,
      sale?.precoNoMomento,
      sale?.preco,
      sale?.preco_venda,
      sale?.precoVenda,
      sale?.unit_price,
      sale?.unitPrice,
      sale?.price_at_sale
    )
  );
}

export function getSaleTotal(sale) {
  const explicitTotal = toFiniteNumber(
    firstDefined(
      sale?.valor_total,
      sale?.valor,
      sale?.valor_venda,
      sale?.valorVenda,
      sale?.total,
      sale?.total_value,
      sale?.totalValue,
      sale?.total_price,
      sale?.totalPrice,
      sale?.total_amount,
      sale?.amount,
      sale?.subtotal
    )
  );

  if (explicitTotal !== null) {
    return explicitTotal;
  }

  const unitPrice = getSaleUnitPrice(sale);
  const quantity = getSaleQuantity(sale);

  if (unitPrice !== null && quantity > 0) {
    return unitPrice * quantity;
  }

  return null;
}

export function getSaleDate(sale) {
  return firstDefined(
    sale?.created_at,
    sale?.createdAt,
    sale?.data_venda,
    sale?.dataVenda,
    sale?.sale_date,
    sale?.date,
    sale?.data,
    sale?.timestamp
  );
}

export function formatSaleDate(value) {
  if (!value) {
    return emptyValue;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function getProductAvailability(product) {
  const productId = getProductId(product);
  const quantity = getProductQuantity(product);
  const isActive = normalizeStatusValue(product?.status);

  if (!productId) {
    return {
      isAvailable: false,
      message: "Produto sem identificador para venda.",
    };
  }

  if (!isActive) {
    return {
      isAvailable: false,
      message: "Este produto está desativado e não pode ser vendido.",
    };
  }

  if (quantity <= 0) {
    return {
      isAvailable: false,
      message: "Produto sem estoque disponível.",
    };
  }

  return {
    isAvailable: true,
    message: "",
  };
}

export function getSaleExtraFields(sale) {
  const knownKeys = new Set([
    "id",
    "_id",
    "sale_id",
    "saleId",
    "venda_id",
    "vendaId",
    "product_id",
    "produto_id",
    "productId",
    "produtoId",
    "product",
    "produto",
    "item",
    "preco",
    "preco_no_momento",
    "precoNoMomento",
    "preco_venda",
    "precoVenda",
    "produto_nome",
    "product_name",
    "nome_produto",
    "nomeProduto",
    "product_image",
    "produto_imagem",
    "image",
    "quantidade",
    "qtd",
    "quantity",
    "sale_quantidade",
    "preco_unitario",
    "valor_unitario",
    "unit_price",
    "unitPrice",
    "price_at_sale",
    "valor_total",
    "valor",
    "valor_venda",
    "valorVenda",
    "total",
    "total_value",
    "totalValue",
    "total_price",
    "totalPrice",
    "total_amount",
    "amount",
    "subtotal",
    "created_at",
    "createdAt",
    "data_venda",
    "dataVenda",
    "sale_date",
    "date",
    "data",
    "timestamp",
  ]);

  return Object.entries(sale || {})
    .filter(([key, value]) => {
      return (
        !knownKeys.has(key) &&
        value !== undefined &&
        value !== null &&
        value !== "" &&
        typeof value !== "object"
      );
    })
    .slice(0, 4)
    .map(([key, value]) => ({
      label: prettifyKey(key),
      value: toDisplayValue(value),
    }));
}

export function buildReportCards(report) {
  if (!report || typeof report !== "object" || Array.isArray(report)) {
    return [];
  }

  const summary = getReportSummary(report);

  const totalSales = firstDefined(
    summary?.total_vendas,
    summary?.quantidade_vendas,
    summary?.totalVendas,
    summary?.quantidadeVendas,
    summary?.sales_count,
    summary?.total_sales,
    summary?.totalSales,
    summary?.count
  );
  const revenue = firstDefined(
    summary?.valor_total_vendido,
    summary?.valorTotalVendido,
    summary?.faturamento_total,
    summary?.faturamento,
    summary?.faturamentoTotal,
    summary?.totalVendido,
    summary?.total_revenue,
    summary?.revenue,
    summary?.valor_total,
    summary?.total_amount,
    summary?.total_vendido
  );
  const totalProducts = firstDefined(
    summary?.quantidade_total_itens,
    summary?.quantidadeTotalItens,
    summary?.quantidade_total,
    summary?.total_quantidade,
    summary?.quantidadeTotal,
    summary?.quantidadeProdutosVendidos,
    summary?.total_products_sold,
    summary?.total_items_sold,
    summary?.produtos_vendidos
  );
  const topProduct = firstDefined(
    summary?.produto_mais_vendido,
    summary?.produtoMaisVendido,
    summary?.best_selling_product,
    summary?.top_product,
    summary?.most_sold_product
  );
  const explicitAverageTicket = firstDefined(
    summary?.ticket_medio,
    summary?.ticketMedio,
    summary?.average_ticket,
    summary?.avg_ticket
  );
  const totalSalesNumber = toFiniteNumber(totalSales);
  const revenueNumber = toFiniteNumber(revenue);
  const averageTicket =
    explicitAverageTicket ??
    (totalSalesNumber && revenueNumber !== null ? revenueNumber / totalSalesNumber : undefined);

  const cards = [];

  if (totalSales !== undefined) {
    cards.push({
      label: "Total de vendas",
      value: toDisplayValue(totalSales),
    });
  }

  if (revenue !== undefined) {
    cards.push({
      label: "Faturamento total",
      value: formatCurrency(revenue),
    });
  }

  if (totalProducts !== undefined) {
    cards.push({
      label: "Produtos vendidos",
      value: toDisplayValue(totalProducts),
    });
  }

  if (topProduct !== undefined) {
    cards.push({
      label: "Produto mais vendido",
      value:
        typeof topProduct === "object"
          ? firstDefined(topProduct.nome, topProduct.name, getProductName(topProduct))
          : toDisplayValue(topProduct),
    });
  }

  if (averageTicket !== undefined) {
    cards.push({
      label: "Ticket médio",
      value: formatCurrency(averageTicket),
    });
  }

  return cards;
}

export function getReportExtraFields(report) {
  if (!report || typeof report !== "object" || Array.isArray(report)) {
    return [];
  }

  const summary = getReportSummary(report);
  const period = getReportPeriod(report);
  const periodFields = [];

  if (period?.start_date || period?.startDate) {
    periodFields.push({
      label: "Início do período",
      value: formatReportDate(period.start_date ?? period.startDate),
    });
  }

  if (period?.end_date || period?.endDate) {
    periodFields.push({
      label: "Fim do período",
      value: formatReportDate(period.end_date ?? period.endDate),
    });
  }

  const knownKeys = new Set([
    "summary",
    "resumo",
    "periodo",
    "period",
    "sales",
    "vendas",
    "total_vendas",
    "quantidade_vendas",
    "totalVendas",
    "quantidadeVendas",
    "sales_count",
    "total_sales",
    "totalSales",
    "count",
    "faturamento_total",
    "faturamento",
    "valor_total_vendido",
    "valorTotalVendido",
    "faturamentoTotal",
    "totalVendido",
    "total_revenue",
    "revenue",
    "valor_total",
    "total_amount",
    "total_vendido",
    "quantidade_total",
    "quantidade_total_itens",
    "quantidadeTotalItens",
    "total_quantidade",
    "quantidadeTotal",
    "quantidadeProdutosVendidos",
    "total_products_sold",
    "total_items_sold",
    "produtos_vendidos",
    "produto_mais_vendido",
    "produtoMaisVendido",
    "best_selling_product",
    "top_product",
    "most_sold_product",
    "ticket_medio",
    "ticketMedio",
    "average_ticket",
    "avg_ticket",
  ]);

  const summaryFields = Object.entries(summary || {})
    .filter(([key, value]) => {
      return (
        !knownKeys.has(key) &&
        value !== undefined &&
        value !== null &&
        value !== "" &&
        typeof value !== "object"
      );
    })
    .slice(0, 6)
    .map(([key, value]) => ({
      label: prettifyKey(key),
      value: toDisplayValue(value),
    }));

  return [...periodFields, ...summaryFields].slice(0, 6);
}

export function formatMaybeCurrency(value) {
  return value === null || value === undefined ? emptyValue : formatCurrency(value);
}

export function formatQuantity(value) {
  return new Intl.NumberFormat("pt-BR").format(value || 0);
}

export function getCurrentProductPrice(product) {
  return product ? getProductPrice(product) : 0;
}
