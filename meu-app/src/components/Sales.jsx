import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Navbar from "./Navbar";
import { listProducts } from "../services/productsService";
import {
  createSale,
  getSalesReport,
  listSales,
} from "../services/salesService";
import { getProductListFromResponse } from "./products/productUtils";
import SaleForm from "./sales/SaleForm";
import SalesFilters from "./sales/SalesFilters";
import SalesList from "./sales/SalesList";
import SalesReportCards from "./sales/SalesReportCards";
import { getProductAvailability, getSalesListFromResponse } from "./sales/saleUtils";

function Sales() {
  const { token: authToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isFormOpen = location.pathname === "/vendas/cadastro";
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [filters, setFilters] = useState({ startDate: "", endDate: "" });
  const [appliedFilters, setAppliedFilters] = useState({ startDate: "", endDate: "" });
  const [filterError, setFilterError] = useState("");
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingSales, setIsLoadingSales] = useState(true);
  const [isLoadingReport, setIsLoadingReport] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [reportErrorMessage, setReportErrorMessage] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const hasAppliedFilters = Boolean(appliedFilters.startDate && appliedFilters.endDate);

  const loadProducts = useCallback(
    async ({ silent = false } = {}) => {
      if (!authToken) {
        setIsLoadingProducts(false);
        setErrorMessage("Sessão expirada. Faça login novamente para carregar os produtos.");
        return;
      }

      if (!silent) {
        setIsLoadingProducts(true);
      }

      try {
        const data = await listProducts(authToken);
        setProducts(getProductListFromResponse(data));
      } catch (error) {
        console.error("Erro ao carregar produtos para vendas:", error);
        setErrorMessage(
          error.message || "Não foi possível carregar os produtos para venda."
        );
      } finally {
        setIsLoadingProducts(false);
      }
    },
    [authToken]
  );

  const loadSales = useCallback(
    async ({ nextFilters = { startDate: "", endDate: "" }, silent = false } = {}) => {
      if (!authToken) {
        setIsLoadingSales(false);
        setErrorMessage("Sessão expirada. Faça login novamente para carregar as vendas.");
        return;
      }

      if (!silent) {
        setIsLoadingSales(true);
      }

      try {
        const data = await listSales(nextFilters, authToken);
        setSales(getSalesListFromResponse(data));
      } catch (error) {
        console.error("Erro ao carregar vendas:", error);
        setErrorMessage(
          error.message || "Não foi possível carregar as vendas. Tente novamente em instantes."
        );
      } finally {
        setIsLoadingSales(false);
      }
    },
    [authToken]
  );

  const loadReport = useCallback(
    async ({ nextFilters = { startDate: "", endDate: "" }, silent = false } = {}) => {
      if (!authToken) {
        setIsLoadingReport(false);
        setReportErrorMessage("Sessão expirada. Faça login novamente para carregar o relatório.");
        return;
      }

      if (!silent) {
        setIsLoadingReport(true);
      }

      setReportErrorMessage("");

      try {
        const data = await getSalesReport(nextFilters, authToken);
        setReportData(data);
      } catch (error) {
        console.error("Erro ao carregar relatório de vendas:", error);
        setReportData(null);
        setReportErrorMessage(
          error.message || "Não foi possível carregar o relatório de vendas."
        );
      } finally {
        setIsLoadingReport(false);
      }
    },
    [authToken]
  );

  useEffect(() => {
    loadProducts();
    loadSales();
    loadReport();
  }, [loadProducts, loadSales, loadReport]);

  useEffect(() => {
    if (!feedbackMessage) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setFeedbackMessage("");
    }, 3600);

    return () => window.clearTimeout(timer);
  }, [feedbackMessage]);

  const availableProductsCount = useMemo(() => {
    return products.filter((product) => getProductAvailability(product).isAvailable).length;
  }, [products]);

  function openCreateForm() {
    navigate("/vendas/cadastro");
  }

  function closeForm() {
    navigate("/vendas");
  }

  function handleFilterChange(name, value) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
    setFilterError("");
  }

  function validateFilters(nextFilters) {
    if (!nextFilters.startDate && !nextFilters.endDate) {
      return "";
    }

    if (!nextFilters.startDate || !nextFilters.endDate) {
      return "Informe a data inicial e a data final para filtrar por período.";
    }

    if (nextFilters.startDate > nextFilters.endDate) {
      return "A data inicial não pode ser maior que a data final.";
    }

    return "";
  }

  async function applyFilters(event) {
    event.preventDefault();
    const validationMessage = validateFilters(filters);

    if (validationMessage) {
      setFilterError(validationMessage);
      return;
    }

    setFilterError("");
    setErrorMessage("");
    setAppliedFilters(filters);
    await Promise.all([
      loadSales({ nextFilters: filters }),
      loadReport({ nextFilters: filters }),
    ]);
  }

  async function clearFilters() {
    const emptyFilters = { startDate: "", endDate: "" };

    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setFilterError("");
    setErrorMessage("");
    await Promise.all([
      loadSales({ nextFilters: emptyFilters }),
      loadReport({ nextFilters: emptyFilters }),
    ]);
  }

  async function handleCreateSale(payload) {
    setIsSaving(true);
    setErrorMessage("");
    setFeedbackMessage("");

    try {
      await createSale(payload, authToken);
      closeForm();
      setFeedbackMessage("Venda registrada com sucesso.");
      await Promise.all([
        loadProducts({ silent: true }),
        loadSales({ nextFilters: appliedFilters, silent: true }),
        loadReport({ nextFilters: appliedFilters, silent: true }),
      ]);
    } catch (error) {
      console.error("Erro ao registrar venda:", error);
      setErrorMessage(error.message || "Não foi possível registrar a venda.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="sales-page products-page">
      <Navbar />

      <section className="products-header sales-header" aria-labelledby="sales-title">
        <div>
          <span className="products-eyebrow">Vendas</span>
          <h1 id="sales-title">Vendas</h1>
          <p>
            Registre vendas, acompanhe o histórico, filtre por período e veja os
            indicadores retornados pelo backend.
          </p>
        </div>

        <button type="button" className="products-primary-button" onClick={openCreateForm}>
          Nova venda
        </button>
      </section>

      <SalesReportCards
        reportData={reportData}
        isLoading={isLoadingReport}
        errorMessage={reportErrorMessage}
      />

      <section className="products-stats sales-stock-summary" aria-label="Resumo operacional">
        <div>
          <span>Vendas listadas</span>
          <strong>{sales.length}</strong>
        </div>
        <div>
          <span>Produtos carregados</span>
          <strong>{products.length}</strong>
        </div>
        <div>
          <span>Disponíveis para venda</span>
          <strong>{availableProductsCount}</strong>
        </div>
        <div>
          <span>Filtro ativo</span>
          <strong>{hasAppliedFilters ? "Sim" : "Não"}</strong>
        </div>
      </section>

      <SalesFilters
        filters={filters}
        onChange={handleFilterChange}
        onApply={applyFilters}
        onClear={clearFilters}
        isLoading={isLoadingSales || isLoadingReport}
        validationMessage={filterError}
      />

      {feedbackMessage && <p className="products-feedback">{feedbackMessage}</p>}
      {errorMessage && <p className="products-error">{errorMessage}</p>}

      <SalesList
        sales={sales}
        products={products}
        isLoading={isLoadingSales}
        hasFilters={hasAppliedFilters}
        onCreate={openCreateForm}
      />

      {isFormOpen && (
        <SaleForm
          products={products}
          isLoadingProducts={isLoadingProducts}
          isSubmitting={isSaving}
          onSubmit={handleCreateSale}
          onClose={closeForm}
        />
      )}
    </main>
  );
}

export default Sales;
