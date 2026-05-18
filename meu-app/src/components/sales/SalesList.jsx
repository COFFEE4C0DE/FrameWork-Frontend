import ProductStatusBadge from "../products/ProductStatusBadge";
import { getProductQuantity } from "../products/productUtils";
import {
  buildProductsById,
  formatMaybeCurrency,
  formatQuantity,
  formatSaleDate,
  getSaleDate,
  getSaleExtraFields,
  getSaleId,
  getSaleProduct,
  getSaleProductImage,
  getSaleProductName,
  getSaleQuantity,
  getSaleTotal,
  getSaleUnitPrice,
} from "./saleUtils";

function SalesList({ sales, products, isLoading, hasFilters, onCreate }) {
  const productsById = buildProductsById(products);

  if (isLoading) {
    return <SalesSkeletonList />;
  }

  if (sales.length === 0) {
    return (
      <section className="products-empty-state sales-empty-state">
        <span className="products-eyebrow">Lista vazia</span>
        <h2>
          {hasFilters
            ? "Nenhuma venda encontrada para o período selecionado."
            : "Nenhuma venda registrada ainda."}
        </h2>
        <p>
          {hasFilters
            ? "Tente ajustar as datas ou limpe os filtros para ver todas as vendas."
            : "Registre sua primeira venda para começar."}
        </p>
        {!hasFilters && (
          <button type="button" className="products-primary-button" onClick={onCreate}>
            Nova venda
          </button>
        )}
      </section>
    );
  }

  return (
    <section className="sales-list" aria-label="Lista de vendas">
      {sales.map((sale, index) => {
        const product = getSaleProduct(sale, productsById);
        const saleId = getSaleId(sale);
        const productImage = getSaleProductImage(sale, product);
        const unitPrice = getSaleUnitPrice(sale);
        const total = getSaleTotal(sale);
        const extraFields = getSaleExtraFields(sale);

        return (
          <article className="sale-card" key={saleId || `${getSaleProductName(sale, product)}-${index}`}>
            <div className="sale-card-image">
              {productImage ? (
                <img src={productImage} alt={getSaleProductName(sale, product)} />
              ) : (
                <span>Sem imagem</span>
              )}
            </div>

            <div className="sale-card-body">
              <div className="sale-card-header">
                <div>
                  <span className="sales-eyebrow">Venda realizada</span>
                  <h2>{getSaleProductName(sale, product)}</h2>
                </div>
                {product && <ProductStatusBadge product={product} />}
              </div>

              <div className="sale-card-metrics">
                <div>
                  <span>Quantidade</span>
                  <strong>{formatQuantity(getSaleQuantity(sale))}</strong>
                </div>
                <div>
                  <span>Data</span>
                  <strong>{formatSaleDate(getSaleDate(sale))}</strong>
                </div>
                <div>
                  <span>Preço unitário</span>
                  <strong>{formatMaybeCurrency(unitPrice)}</strong>
                </div>
                <div>
                  <span>Valor total</span>
                  <strong>{formatMaybeCurrency(total)}</strong>
                </div>
              </div>

              {product && (
                <p className="sale-stock-note">
                  Estoque atual do produto: <strong>{getProductQuantity(product)}</strong>
                </p>
              )}

              {extraFields.length > 0 && (
                <div className="sale-extra-fields">
                  {extraFields.map((field) => (
                    <span key={field.label}>
                      {field.label}: <strong>{field.value}</strong>
                    </span>
                  ))}
                </div>
              )}

              {saleId && <small className="product-id">ID da venda: {saleId}</small>}
            </div>
          </article>
        );
      })}
    </section>
  );
}

function SalesSkeletonList() {
  return (
    <section className="sales-list" aria-label="Carregando vendas">
      {[1, 2, 3].map((item) => (
        <article className="sale-card product-skeleton" key={item}>
          <div className="sale-card-image" />
          <div className="sale-card-body">
            <div className="skeleton-line is-wide" />
            <div className="skeleton-line" />
            <div className="skeleton-actions" />
          </div>
        </article>
      ))}
    </section>
  );
}

export default SalesList;
