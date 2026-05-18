import ProductStatusBadge from "./ProductStatusBadge";
import {
  formatCurrency,
  getProductId,
  getProductImage,
  getProductName,
  getProductPrice,
  getProductQuantity,
  isLowStock,
  normalizeStatusValue,
} from "./productUtils";

function ProductCard({
  product,
  onView,
  onEdit,
  onToggleStatus,
  isUpdatingStatus,
}) {
  const productId = getProductId(product);
  const image = getProductImage(product);
  const quantity = getProductQuantity(product);
  const lowStock = isLowStock(product);
  const isActive = normalizeStatusValue(product.status);

  return (
    <article className={`product-card ${lowStock ? "is-low-stock" : ""}`}>
      <div className="product-card-image">
        {image ? (
          <img src={image} alt={getProductName(product)} />
        ) : (
          <span>Sem imagem</span>
        )}
      </div>

      <div className="product-card-body">
        <div className="product-card-title-row">
          <h2>{getProductName(product)}</h2>
          <ProductStatusBadge product={product} />
        </div>

        <div className="product-card-metrics">
          <div>
            <span>Preço</span>
            <strong>{formatCurrency(getProductPrice(product))}</strong>
          </div>
          <div>
            <span>Estoque</span>
            <strong>{quantity}</strong>
          </div>
        </div>

        {lowStock && (
          <p className="product-low-stock">Baixo estoque: revise a reposição.</p>
        )}

        <div className="product-card-actions">
          <button type="button" onClick={() => onView(product)}>
            Ver
          </button>
          <button type="button" onClick={() => onEdit(product)}>
            Editar
          </button>
          <button
            type="button"
            onClick={() => onToggleStatus(product)}
            disabled={isUpdatingStatus}
          >
            {isUpdatingStatus ? "Alterando..." : isActive ? "Desativar" : "Ativar"}
          </button>
        </div>

        {productId && <small className="product-id">ID: {productId}</small>}
      </div>
    </article>
  );
}

export default ProductCard;
