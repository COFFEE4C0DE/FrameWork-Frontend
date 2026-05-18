import { Link } from "react-router-dom";

function Landing() {
  return (
    <main className="landing-page">
      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-copy">
          <span className="landing-eyebrow">Projeto acadêmico</span>
          <h1 id="landing-title">twentyone market</h1>
          <p>
            Plataforma para gerenciamento de produtos e vendas, criada como
            projeto da Faculdade Impacta para integrar interface web e backend
            em um fluxo real de operação.
          </p>

          <div className="landing-actions">
            <Link to="/login" className="cadastro-submit">
              Entrar no sistema
            </Link>
            <Link to="/cadastro" className="product-secondary-button">
              Criar conta
            </Link>
          </div>
        </div>

        <div className="landing-highlight" aria-label="Resumo do projeto">
          <article>
            <strong>Gestão de produtos</strong>
            <p>Cadastro, edição, controle de estoque e status de disponibilidade.</p>
          </article>
          <article>
            <strong>Gestão de vendas</strong>
            <p>Registro de vendas, filtro por período e indicadores do relatório.</p>
          </article>
          <article>
            <strong>Integração completa</strong>
            <p>Frontend React conectado ao backend Flask para operações reais.</p>
          </article>
        </div>
      </section>

      <section className="landing-cards" aria-label="Objetivo do projeto">
        <article>
          <span>01</span>
          <h2>Objetivo</h2>
          <p>
            Aplicar conceitos de desenvolvimento full stack em um cenário de
            mini mercado com autenticação e módulos de negócio.
          </p>
        </article>
        <article>
          <span>02</span>
          <h2>Escopo</h2>
          <p>
            Cadastro e ativação de conta, acesso autenticado e manutenção de
            produtos e vendas de ponta a ponta.
          </p>
        </article>
        <article>
          <span>03</span>
          <h2>Faculdade Impacta</h2>
          <p>
            Trabalho acadêmico desenvolvido para consolidar práticas de
            arquitetura, APIs e experiência de uso.
          </p>
        </article>
      </section>
    </main>
  );
}

export default Landing;
