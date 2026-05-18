import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Navbar from "./Navbar";
import {
  getDashboardSummary,
  getSummaryFromResponse,
} from "../services/dashboardService";

function Dashboard() {
  const { token: authToken } = useAuth();
  const [summary, setSummary] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadDashboard = useCallback(async () => {
    if (!authToken) {
      setIsLoading(false);
      setErrorMessage("Sessão expirada. Faça login novamente para carregar o dashboard.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await getDashboardSummary(authToken);
      setSummary(getSummaryFromResponse(data));
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      setSummary({});
      setErrorMessage(error.message || "Não foi possível carregar o dashboard.");
    } finally {
      setIsLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const cards = useMemo(() => {
    return [
      {
        label: "Total de vendas",
        value: formatInteger(summary.total_vendas),
      },
      {
        label: "Valor total vendido",
        value: formatCurrency(summary.valor_total_vendido),
      },
      {
        label: "Itens vendidos",
        value: formatInteger(summary.quantidade_total_itens_vendidos),
      },
      {
        label: "Estoque total",
        value: formatInteger(summary.total_estoque),
      },
    ];
  }, [summary]);

  return (
    <main className="dashboard-page products-page">
      <Navbar />

      <section className="products-header dashboard-header" aria-labelledby="dashboard-title">
        <div>
          <span className="products-eyebrow">Dashboard</span>
          <h1 id="dashboard-title">Visão geral do twentyone market</h1>
          <p>
            Acompanhe rapidamente vendas e estoque do sistema em um único painel
            com dados consolidados do backend.
          </p>
        </div>

        <button
          type="button"
          className="products-primary-button"
          onClick={loadDashboard}
          disabled={isLoading}
        >
          {isLoading ? "Atualizando..." : "Atualizar dados"}
        </button>
      </section>

      {errorMessage && <p className="products-error">{errorMessage}</p>}

      <section className="products-stats dashboard-stats" aria-label="Resumo do dashboard">
        {cards.map((card) => (
          <div key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </div>
        ))}
      </section>

      <section className="landing-cards dashboard-links" aria-label="Ações rápidas">
        <article>
          <span>Produtos</span>
          <h2>Gerenciar catálogo</h2>
          <p>Cadastre, edite e acompanhe disponibilidade e estoque.</p>
          <Link className="dashboard-link" to="/produtos">
            Ir para produtos
          </Link>
        </article>
        <article>
          <span>Vendas</span>
          <h2>Operação de vendas</h2>
          <p>Registre vendas e acompanhe os relatórios por período.</p>
          <Link className="dashboard-link" to="/vendas">
            Ir para vendas
          </Link>
        </article>
      </section>
    </main>
  );
}

function formatInteger(value) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return "0";
  }

  return new Intl.NumberFormat("pt-BR").format(numberValue);
}

function formatCurrency(value) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return "R$ 0,00";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numberValue);
}

export default Dashboard;
