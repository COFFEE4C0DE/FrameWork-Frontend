import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useMatch, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Navbar from "./Navbar";
import ProductCard from "./products/ProductCard";
import ProductDetails from "./products/ProductDetails";
import ProductForm from "./products/ProductForm";
import ProductSearch from "./products/ProductSearch";
import {
  createProduct,
  getProductById,
  listProducts,
  updateProduct,
  updateProductStatus,
} from "../services/productsService";
import {
  getProductFromResponse,
  getProductId,
  getProductListFromResponse,
  getProductName,
  getProductQuantity,
  getStatusMeta,
  isLowStock,
  normalizeStatusValue,
} from "./products/productUtils";

function Products() {
  const { token: authToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const editMatch = useMatch("/produtos/edicao/:productId");
  const editProductId = editMatch?.params?.productId || "";
  const isCreateRoute = location.pathname === "/produtos/cadastro";
  const isFormOpen = isCreateRoute || Boolean(editProductId);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [statusLoadingId, setStatusLoadingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const loadProducts = useCallback(
    async ({ silent = false } = {}) => {
      if (!authToken) {
        setIsLoading(false);
        setErrorMessage("Sessão expirada. Faça login novamente para carregar os produtos.");
        return;
      }

      if (!silent) {
        setIsLoading(true);
      }

      setErrorMessage("");

      try {
        const data = await listProducts(authToken);
        setProducts(getProductListFromResponse(data));
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        setErrorMessage(
          error.message || "Não foi possível carregar os produtos. Tente novamente em instantes."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [authToken]
  );

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (!feedbackMessage) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setFeedbackMessage("");
    }, 3600);

    return () => window.clearTimeout(timer);
  }, [feedbackMessage]);

  useEffect(() => {
    if (isCreateRoute) {
      setEditingProduct(null);
      return;
    }

    if (!editProductId) {
      setEditingProduct(null);
      return;
    }

    const existingProduct = products.find(
      (product) => String(getProductId(product)) === String(editProductId)
    );

    if (existingProduct) {
      setEditingProduct(existingProduct);
      return;
    }

    let isMounted = true;

    async function loadProductForEdit() {
      try {
        const data = await getProductById(editProductId, authToken);

        if (isMounted) {
          setEditingProduct(getProductFromResponse(data));
        }
      } catch (error) {
        if (isMounted) {
          console.error("Erro ao buscar produto para ediÃ§Ã£o:", error);
          setErrorMessage(error.message || "NÃ£o foi possÃ­vel carregar o produto para ediÃ§Ã£o.");
          navigate("/produtos", { replace: true });
        }
      }
    }

    loadProductForEdit();

    return () => {
      isMounted = false;
    };
  }, [authToken, editProductId, isCreateRoute, navigate, products]);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) =>
      getProductName(product).toLowerCase().includes(query)
    );
  }, [products, searchTerm]);

  const productStats = useMemo(() => {
    return products.reduce(
      (stats, product) => {
        const status = getStatusMeta(product);

        if (status.className === "is-active") {
          stats.active += 1;
        }

        if (status.className === "is-inactive") {
          stats.inactive += 1;
        }

        if (getProductQuantity(product) <= 0) {
          stats.out += 1;
        }

        if (isLowStock(product)) {
          stats.lowStock += 1;
        }

        return stats;
      },
      { active: 0, inactive: 0, out: 0, lowStock: 0 }
    );
  }, [products]);

  function openCreateForm() {
    setEditingProduct(null);
    navigate("/produtos/cadastro");
  }

  function openEditForm(product) {
    const productId = getProductId(product);

    setSelectedProduct(null);
    setEditingProduct(product);
    navigate(productId ? `/produtos/edicao/${productId}` : "/produtos");
  }

  function closeForm() {
    setEditingProduct(null);
    navigate("/produtos");
  }

  async function handleSaveProduct(payload) {
    setIsSaving(true);
    setErrorMessage("");
    setFeedbackMessage("");

    try {
      const productId = getProductId(editingProduct);

      if (editingProduct && productId) {
        await updateProduct(productId, payload, authToken);
        setFeedbackMessage("Produto atualizado com sucesso.");
      } else {
        await createProduct(payload, authToken);
        setFeedbackMessage("Produto cadastrado com sucesso.");
      }

      closeForm();
      await loadProducts({ silent: true });
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      setErrorMessage(error.message || "Não foi possível salvar o produto.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleViewProduct(product) {
    const productId = getProductId(product);

    if (!productId) {
      setErrorMessage("Não foi possível identificar o produto selecionado.");
      return;
    }

    setSelectedProduct(null);
    setIsDetailsLoading(true);
    setErrorMessage("");

    try {
      const data = await getProductById(productId, authToken);
      setSelectedProduct(getProductFromResponse(data));
    } catch (error) {
      console.error("Erro ao buscar produto:", error);
      setErrorMessage(error.message || "Não foi possível carregar os detalhes do produto.");
    } finally {
      setIsDetailsLoading(false);
    }
  }

  async function handleToggleStatus(product) {
    const productId = getProductId(product);

    if (!productId) {
      setErrorMessage("Não foi possível identificar o produto selecionado.");
      return;
    }

    setStatusLoadingId(productId);
    setErrorMessage("");
    setFeedbackMessage("");

    try {
      const nextStatus = !normalizeStatusValue(product.status);

      await updateProductStatus(productId, nextStatus, authToken);
      setFeedbackMessage("Status do produto atualizado com sucesso.");
      await loadProducts({ silent: true });

      if (selectedProduct && getProductId(selectedProduct) === productId) {
        const data = await getProductById(productId, authToken);
        setSelectedProduct(getProductFromResponse(data));
      }
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      setErrorMessage(error.message || "Não foi possível alterar o status do produto.");
    } finally {
      setStatusLoadingId("");
    }
  }

  return (
    <main className="products-page">
      <Navbar />

      <section className="products-header" aria-labelledby="products-title">
        <div>
          <span className="products-eyebrow">Produtos</span>
          <h1 id="products-title">Controle de produtos</h1>
          <p>
            Cadastre, acompanhe estoque, atualize status e mantenha as imagens
            dos produtos do mini mercado em um único lugar.
          </p>
        </div>

        <button type="button" className="products-primary-button" onClick={openCreateForm}>
          Novo Produto
        </button>
      </section>

      <section className="products-stats" aria-label="Resumo dos produtos">
        <div>
          <span>Total</span>
          <strong>{products.length}</strong>
        </div>
        <div>
          <span>Ativos</span>
          <strong>{productStats.active}</strong>
        </div>
        <div>
          <span>Baixo estoque</span>
          <strong>{productStats.lowStock}</strong>
        </div>
        <div>
          <span>Esgotados</span>
          <strong>{productStats.out}</strong>
        </div>
      </section>

      <section className="products-toolbar" aria-label="Ferramentas da listagem">
        <ProductSearch
          value={searchTerm}
          onChange={setSearchTerm}
          total={filteredProducts.length}
        />
      </section>

      {feedbackMessage && <p className="products-feedback">{feedbackMessage}</p>}
      {errorMessage && <p className="products-error">{errorMessage}</p>}

      {isLoading ? (
        <ProductSkeletonList />
      ) : products.length === 0 ? (
        <EmptyProductsState onCreate={openCreateForm} />
      ) : filteredProducts.length === 0 ? (
        <section className="products-empty-state">
          <h2>Nenhum produto encontrado para essa busca.</h2>
          <p>Tente procurar por outro nome ou limpe o campo de busca.</p>
        </section>
      ) : (
        <section className="products-grid" aria-label="Lista de produtos">
          {filteredProducts.map((product) => {
            const productId = getProductId(product);

            return (
              <ProductCard
                key={productId || getProductName(product)}
                product={product}
                onView={handleViewProduct}
                onEdit={openEditForm}
                onToggleStatus={handleToggleStatus}
                isUpdatingStatus={statusLoadingId === productId}
              />
            );
          })}
        </section>
      )}

      {isFormOpen && (
        <ProductForm
          product={editingProduct}
          isSubmitting={isSaving}
          onSubmit={handleSaveProduct}
          onClose={closeForm}
        />
      )}

      {isDetailsLoading && (
        <div className="product-modal" role="dialog" aria-modal="true">
          <button
            className="product-modal-backdrop"
            type="button"
            onClick={() => setIsDetailsLoading(false)}
          >
            <span>Fechar carregamento</span>
          </button>
          <section className="product-loading-panel">
            <div className="product-spinner" />
            <p>Carregando detalhes do produto...</p>
          </section>
        </div>
      )}

      {selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onEdit={openEditForm}
          onToggleStatus={handleToggleStatus}
          isUpdatingStatus={statusLoadingId === getProductId(selectedProduct)}
        />
      )}
    </main>
  );
}

function ProductSkeletonList() {
  return (
    <section className="products-grid" aria-label="Carregando produtos">
      {[1, 2, 3].map((item) => (
        <article className="product-card product-skeleton" key={item}>
          <div className="product-card-image" />
          <div className="product-card-body">
            <div className="skeleton-line is-wide" />
            <div className="skeleton-line" />
            <div className="skeleton-actions" />
          </div>
        </article>
      ))}
    </section>
  );
}

function EmptyProductsState({ onCreate }) {
  return (
    <section className="products-empty-state">
      <span className="products-eyebrow">Lista vazia</span>
      <h2>Nenhum produto cadastrado ainda.</h2>
      <p>Cadastre seu primeiro produto para começar.</p>
      <button type="button" className="products-primary-button" onClick={onCreate}>
        Cadastrar produto
      </button>
    </section>
  );
}

export default Products;
