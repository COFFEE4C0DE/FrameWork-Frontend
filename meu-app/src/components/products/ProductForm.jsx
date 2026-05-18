import { useEffect, useState } from "react";
import {
  STATUS_OPTIONS,
  buildProductPayload,
  getProductImage,
  getProductName,
  getProductPrice,
  getProductQuantity,
  normalizeStatusValue,
} from "./productUtils";

const emptyForm = {
  nome: "",
  preco: "",
  qtd: "",
  status: "true",
  image: "",
};

function getInitialForm(product) {
  if (!product) {
    return emptyForm;
  }

  return {
    nome: getProductName(product),
    preco: String(getProductPrice(product)),
    qtd: String(getProductQuantity(product)),
    status: normalizeStatusValue(product.status) ? "true" : "false",
    image: getProductImage(product),
  };
}

function ProductForm({ product, isSubmitting, onSubmit, onClose }) {
  const [formData, setFormData] = useState(() => getInitialForm(product));
  const [errors, setErrors] = useState({});
  const isEditing = Boolean(product);

  useEffect(() => {
    setFormData(getInitialForm(product));
    setErrors({});
  }, [product]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: name === "qtd" ? value.replace(/\D/g, "") : value,
    }));
  }

  function validate() {
    const nextErrors = {};
    const price = Number(String(formData.preco).replace(",", "."));
    const quantity = Number(formData.qtd);

    if (!formData.nome.trim()) {
      nextErrors.nome = "Informe o nome do produto.";
    }

    if (formData.preco === "" || !Number.isFinite(price) || price < 0) {
      nextErrors.preco = "Informe um preco maior ou igual a zero.";
    }

    if (formData.qtd === "" || !Number.isFinite(quantity) || quantity < 0) {
      nextErrors.qtd = "Informe uma quantidade maior ou igual a zero.";
    }

    if (formData.status === "") {
      nextErrors.status = "Selecione o status.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    onSubmit(buildProductPayload(formData));
  }

  return (
    <div className="product-modal" role="dialog" aria-modal="true">
      <button className="product-modal-backdrop" type="button" onClick={onClose}>
        <span>Fechar formulario</span>
      </button>

      <section className="product-form-panel" aria-labelledby="product-form-title">
        <div className="product-form-header">
          <span>{isEditing ? "Edicao" : "Novo cadastro"}</span>
          <h2 id="product-form-title">
            {isEditing ? "Editar produto" : "Cadastrar produto"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Fechar formulario">
            X
          </button>
        </div>

        <form className="product-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="productNome">Nome do produto</label>
            <input
              type="text"
              id="productNome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Ex: Arroz tipo 1"
              required
            />
            {errors.nome && <small className="field-error">{errors.nome}</small>}
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="productPreco">Preco</label>
              <input
                type="number"
                id="productPreco"
                name="preco"
                value={formData.preco}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                required
              />
              {errors.preco && <small className="field-error">{errors.preco}</small>}
            </div>

            <div className="form-field">
              <label htmlFor="productQtd">Quantidade</label>
              <input
                type="number"
                id="productQtd"
                name="qtd"
                value={formData.qtd}
                onChange={handleChange}
                min="0"
                step="1"
                placeholder="0"
                required
              />
              {errors.qtd && <small className="field-error">{errors.qtd}</small>}
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="productStatus">Status</label>
            <select
              id="productStatus"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.status && <small className="field-error">{errors.status}</small>}
          </div>

          <div className="form-field">
            <label htmlFor="productImage">URL da imagem</label>
            <input
              type="url"
              id="productImage"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://exemplo.com/produto.jpg"
            />
          </div>

          {formData.image && (
            <div className="product-image-preview">
              <img src={formData.image} alt="Previa do produto" />
            </div>
          )}

          <div className="product-form-actions">
            <button type="button" className="product-secondary-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="cadastro-submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Salvando..."
                : isEditing
                ? "Salvar alteracoes"
                : "Cadastrar produto"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default ProductForm;
