import { useState } from "react";
import Navbar from "./Navbar";

function Home({ token = "" }) {
  const [authToken] = useState(
    () => token || localStorage.getItem("token") || localStorage.getItem("access_token") || ""
  );

  return (
    <main className="home-page">
      <Navbar />

      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-copy">
          <span className="home-status">
            {authToken ? "Login confirmado" : "Sessão não confirmada"}
          </span>
          <h1 id="home-title">Bem-vindo ao sistema do mini mercado</h1>
          <p>
            Esta área será usada para acompanhar
            produtos, vendedores, usuários, vendas e relatórios do backend em
            Flask.
          </p>
        </div>

        <div className="home-summary" aria-label="Resumo do sistema">
          <div>
            <strong>Flask API</strong>
            <span>Backend preparado para cadastros e consultas.</span>
          </div>
          <div>
            <strong>Gestão de vendas</strong>
            <span>Fluxo futuro para registrar e listar vendas.</span>
          </div>
          <div>
            <strong>Relatórios</strong>
            <span>Painel planejado para indicadores do mercado.</span>
          </div>
        </div>
      </section>

      <section className="home-modules" aria-label="Módulos futuros">
        <article>
          <span>01</span>
          <h2>Produtos</h2>
          <p>Listagem, cadastro e edição dos itens vendidos no mercado.</p>
        </article>
        <article>
          <span>02</span>
          <h2>Vendas</h2>
          <p>Cadastro de novas vendas e consulta do histórico registrado.</p>
        </article>
        <article>
          <span>03</span>
          <h2>Dashboard</h2>
          <p>Relatórios para acompanhar desempenho, estoque e movimentação.</p>
        </article>
      </section>
    </main>
  );
}

export default Home;
