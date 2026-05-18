import ProductStatusBadge from "../products/ProductStatusBadge";
import {
  formatCurrency,
  getProductId,
  getProductImage,
  getProductName,
  getProductPrice,
  getProductQuantity,
} from "../products/productUtils";
import { getProductAvailability } from "./saleUtils";

function ProductSaleSelect({
  products,
  value,
  searchTerm,
  onSearchChange,
  onChange,
  isLoading,
}) {
  const filteredProducts = products.filter((product) =>
    getProductName(product).toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  return (
    <div className="product-sale-select">
      <label className="product-sale-search">
        <span>Produto</span>
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar produto pelo nome"
          disabled={isLoading}
        />
      </label>

      {isLoading ? (
        <div className="product-sale-loading">Carregando produtos...</div>
      ) : filteredProducts.length === 0 ? (
        <p className="sale-form-note">Nenhum produto encontrado para essa busca.</p>
      ) : (
        <div className="product-sale-options" aria-label="Produtos para venda">
          {filteredProducts.map((product) => {
            const productId = getProductId(product);
            const image = getProductImage(product);
            const availability = getProductAvailability(product);
            const isSelected = String(value) === String(productId);

            return (
              <button
                type="button"
                key={productId || getProductName(product)}
                className={`product-sale-option ${isSelected ? "is-selected" : ""} ${
                  availability.isAvailable ? "" : "is-disabled"
                }`}
                onClick={() => onChange(product)}
                disabled={!availability.isAvailable}
              >
                <span className="product-sale-image">
                  {image ? <img src={image} alt={getProductName(product)} /> : "Sem imagem"}
                </span>

                <span className="product-sale-content">
                  <span className="product-sale-title-row">
                    <strong>{getProductName(product)}</strong>
                    <ProductStatusBadge product={product} />
                  </span>

                  <span className="product-sale-meta">
                    <span>{formatCurrency(getProductPrice(product))}</span>
                    <span>{getProductQuantity(product)} em estoque</span>
                  </span>

                  {!availability.isAvailable && (
                    <small className="product-sale-warning">{availability.message}</small>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ProductSaleSelect;
