import ProductStatusBadge from "./ProductStatusBadge";
import {
  formatCurrency,
  getProductId,
  getProductImage,
  getProductName,
  getProductPrice,
  getProductQuantity,
  normalizeStatusValue,
} from "./productUtils";

function ProductDetails({
  product,
  onClose,
  onEdit,
  onToggleStatus,
  isUpdatingStatus,
}) {
  const image = getProductImage(product);
  const productId = getProductId(product);
  const isActive = normalizeStatusValue(product.status);

  return (
    <div className="product-modal" role="dialog" aria-modal="true">
      <button className="product-modal-backdrop" type="button" onClick={onClose}>
        <span>Fechar detalhes</span>
      </button>

      <section className="product-details-panel" aria-labelledby="product-details-title">
        <div className="product-details-image">
          {image ? (
            <img src={image} alt={getProductName(product)} />
          ) : (
            <span>Sem imagem cadastrada</span>
          )}
        </div>

        <div className="product-details-content">
          <button type="button" className="product-close-button" onClick={onClose}>
            X
          </button>
          <ProductStatusBadge product={product} />
          <h2 id="product-details-title">{getProductName(product)}</h2>

          <dl className="product-details-list">
            <div>
              <dt>Preço</dt>
              <dd>{formatCurrency(getProductPrice(product))}</dd>
            </div>
            <div>
              <dt>Quantidade</dt>
              <dd>{getProductQuantity(product)}</dd>
            </div>
            {productId && (
              <div>
                <dt>ID</dt>
                <dd>{productId}</dd>
              </div>
            )}
          </dl>

          <div className="product-details-actions">
            <button type="button" className="cadastro-submit" onClick={() => onEdit(product)}>
              Editar produto
            </button>
            <button
              type="button"
              className="product-secondary-button"
              onClick={() => onToggleStatus(product)}
              disabled={isUpdatingStatus}
            >
              {isUpdatingStatus ? "Alterando..." : isActive ? "Desativar produto" : "Ativar produto"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProductDetails;
