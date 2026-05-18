import { useEffect, useMemo, useState } from "react";
import {
  formatCurrency,
  getProductId,
  getProductName,
  getProductPrice,
  getProductQuantity,
} from "../products/productUtils";
import { getProductAvailability } from "./saleUtils";
import ProductSaleSelect from "./ProductSaleSelect";

function SaleForm({ products, isLoadingProducts, isSubmitting, onSubmit, onClose }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setErrors({});
  }, [selectedProduct, quantity]);

  const selectedAvailability = useMemo(() => {
    return selectedProduct ? getProductAvailability(selectedProduct) : null;
  }, [selectedProduct]);

  function handleQuantityChange(event) {
    setQuantity(event.target.value.replace(/\D/g, ""));
  }

  function validate() {
    const nextErrors = {};
    const quantityNumber = Number(quantity);

    if (!selectedProduct) {
      nextErrors.product = "Selecione um produto para continuar.";
    } else if (!selectedAvailability?.isAvailable) {
      nextErrors.product = selectedAvailability?.message;
    }

    if (!Number.isFinite(quantityNumber) || quantityNumber <= 0) {
      nextErrors.quantity = "Informe uma quantidade válida para realizar a venda.";
    } else if (selectedProduct && quantityNumber > getProductQuantity(selectedProduct)) {
      nextErrors.quantity = "A quantidade informada é maior que o estoque disponível.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    onSubmit({
      product_id: getProductId(selectedProduct),
      quantidade: Number(quantity),
    });
  }

  const quantityNumber = Number(quantity);
  const estimatedTotal =
    selectedProduct && Number.isFinite(quantityNumber) && quantityNumber > 0
      ? getProductPrice(selectedProduct) * quantityNumber
      : 0;

  return (
    <div className="product-modal" role="dialog" aria-modal="true">
      <button className="product-modal-backdrop" type="button" onClick={onClose}>
        <span>Fechar formulário</span>
      </button>

      <section className="product-form-panel sale-form-panel" aria-labelledby="sale-form-title">
        <div className="product-form-header">
          <span>Nova venda</span>
          <h2 id="sale-form-title">Registrar venda</h2>
          <button type="button" onClick={onClose} aria-label="Fechar formulário">
            X
          </button>
        </div>

        <form className="product-form sale-form" onSubmit={handleSubmit}>
          <ProductSaleSelect
            products={products}
            value={selectedProduct ? getProductId(selectedProduct) : ""}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onChange={setSelectedProduct}
            isLoading={isLoadingProducts}
          />
          {errors.product && <small className="field-error">{errors.product}</small>}

          {selectedProduct && (
            <section className="sale-selected-product" aria-label="Produto selecionado">
              <span>Produto selecionado</span>
              <strong>{getProductName(selectedProduct)}</strong>
              <div>
                <small>{getProductQuantity(selectedProduct)} em estoque</small>
                <small>{formatCurrency(getProductPrice(selectedProduct))}</small>
              </div>
              {!selectedAvailability?.isAvailable && (
                <p className="sale-validation-message">{selectedAvailability?.message}</p>
              )}
            </section>
          )}

          <div className="form-field">
            <label htmlFor="saleQuantity">Quantidade</label>
            <input
              type="number"
              id="saleQuantity"
              name="quantidade"
              value={quantity}
              onChange={handleQuantityChange}
              min="1"
              step="1"
              placeholder="0"
              required
            />
            {errors.quantity && <small className="field-error">{errors.quantity}</small>}
          </div>

          {selectedProduct && quantityNumber > 0 && (
            <p className="sale-form-note">
              Total estimado pelo preço atual: <strong>{formatCurrency(estimatedTotal)}</strong>
            </p>
          )}

          <div className="product-form-actions">
            <button type="button" className="product-secondary-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="cadastro-submit" disabled={isSubmitting}>
              {isSubmitting ? "Registrando..." : "Registrar venda"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default SaleForm;
