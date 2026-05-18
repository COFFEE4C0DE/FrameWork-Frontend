import { useState } from "react";
import Login from "./Login";
import Home from "./Home";
import Products from "./Products";
import Sales from "./Sales";
import { trackedFetch } from "../services/requestLoader";

function Cadastro() {
  const [formData, setFormData] = useState({
    nome: "",
    cnpj: "",
    email: "",
    celular: "",
    senha: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [token] = useState(
    () => localStorage.getItem("token") || localStorage.getItem("access_token") || ""
  );
  const [etapa, setEtapa] = useState(() => {
    const path = window.location.pathname;
    const hasToken =
      localStorage.getItem("token") || localStorage.getItem("access_token");

    if (path === "/login") {
      return "login";
    }

    if (path.startsWith("/produtos")) {
      return hasToken ? "produtos" : "login";
    }

    if (path.startsWith("/vendas")) {
      return hasToken ? "vendas" : "login";
    }

    if (path === "/home" || hasToken) {
      return "home";
    }

    return "cadastro";
  });
  const [emailUsuario, setEmailUsuario] = useState("");

  function navegarParaLogin() {
    setEtapa("login");
    window.history.pushState(null, "", "/login");
  }

  function navegarParaCadastro() {
    setEtapa("cadastro");
    window.history.pushState(null, "", "/");
  }

  function handleChange(event) {
    const { name, value } = event.target;
    const numericFields = ["cnpj", "celular"];
    const nextValue = numericFields.includes(name)
      ? value.replace(/\D/g, "")
      : value;

    setFormData((currentData) => ({
      ...currentData,
      [name]: nextValue,
    }));
  }

  async function enviarDados() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await trackedFetch("/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json().catch(() => null);
      setEmailUsuario(formData.email);
      setFormData({
        nome: "",
        cnpj: "",
        email: "",
        celular: "",
        senha: "",
      });
      setEtapa("ativacao");
      window.history.pushState(null, "", "/ativacao-conta");
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
      setErrorMessage("Não foi possível finalizar o cadastro. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await enviarDados();
  }

  if (etapa === "ativacao") {
    return (
      <AtivacaoConta
        emailUsuario={emailUsuario}
        onAtivacaoConcluida={() => {
          navegarParaLogin();
        }}
      />
    );
  }

  if (etapa === "login") {
    return (
      <Login
        emailInicial={emailUsuario}
        onCadastroClick={navegarParaCadastro}
      />
    );
  }

  if (etapa === "home") {
    return <Home token={token} />;
  }

  if (etapa === "produtos") {
    return <Products token={token} />;
  }

  if (etapa === "vendas") {
    return <Sales token={token} />;
  }

  return (
    <main className="cadastro-page">
      <section className="cadastro-panel" aria-labelledby="cadastro-title">
        <div className="cadastro-copy">
          <span className="cadastro-eyebrow">Novo cadastro</span>
          <h1 id="cadastro-title">Crie sua conta</h1>
          <p>
            Preencha seus dados para continuar. Leva menos de um minuto e seus
            dados ficam protegidos.
          </p>
        </div>

        <form className="cadastro-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="nome">Nome completo</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Tyler Joseph"
              autoComplete="name"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="cnpj">CNPJ</label>
              <input
                type="text"
                id="cnpj"
                name="cnpj"
                value={formData.cnpj}
                onChange={handleChange}
                inputMode="numeric"
                maxLength="14"
                placeholder="Somente números"
                autoComplete="off"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="celular">Celular</label>
              <input
                type="tel"
                id="celular"
                name="celular"
                value={formData.celular}
                onChange={handleChange}
                inputMode="numeric"
                maxLength="14"
                placeholder="11999999999"
                autoComplete="tel"
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="twentyonepilots@gmail.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="senha">Senha</label>
            <input
              type="password"
              id="senha"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              placeholder="Mínimo de 8 caracteres"
              autoComplete="new-password"
              minLength="8"
              required
            />
          </div>

          {errorMessage && <p className="form-error">{errorMessage}</p>}

          <button type="submit" className="cadastro-submit" disabled={isLoading}>
            {isLoading ? "Enviando..." : "Finalizar cadastro"}
          </button>

          <button
            type="button"
            className="auth-switch-button"
            onClick={navegarParaLogin}
          >
            Já tenho uma conta
          </button>
        </form>
      </section>
    </main>
  );
}

function AtivacaoConta({ emailUsuario, onAtivacaoConcluida }) {
  const [codigoAtivacao, setCodigoAtivacao] = useState("");
  const [isActivating, setIsActivating] = useState(false);
  const [activationStatus, setActivationStatus] = useState("");
  const [activationError, setActivationError] = useState("");

  function handleCodigoChange(event) {
    setCodigoAtivacao(event.target.value.replace(/\D/g, ""));
  }

  async function ativarUsuario(event) {
    event.preventDefault();
    setIsActivating(true);
    setActivationStatus("");
    setActivationError("");

    try {
      const response = await trackedFetch("/ativarUsuario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailUsuario,
          codigoAtivacao,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      await response.text();
      setActivationStatus("Conta ativada com sucesso.");
      window.setTimeout(onAtivacaoConcluida, 900);
    } catch (error) {
      console.error("Erro ao ativar usuário:", error);
      setActivationError(
        error.message || "Não foi possível ativar a conta. Tente novamente."
      );
    } finally {
      setIsActivating(false);
    }
  }

  return (
    <main className="ativacao-page">
      <section className="ativacao-panel" aria-labelledby="ativacao-title">
        <span className="ativacao-status">Cadastro realizado</span>
        <h1 id="ativacao-title">Ative sua conta</h1>
        <p>
          Enviamos um código de ativação pelo WhatsApp. Digite o código abaixo
          para confirmar o usuário cadastrado com o e-mail{" "}
          <strong>{emailUsuario}</strong>.
        </p>

        <div className="ativacao-steps" aria-label="Próximos passos">
          <div>
            <strong>1</strong>
            <span>Abra a mensagem recebida no WhatsApp.</span>
          </div>
          <div>
            <strong>2</strong>
            <span>Digite o código enviado pela Twilio.</span>
          </div>
          <div>
            <strong>3</strong>
            <span>Acesse sua conta.</span>
          </div>
        </div>

        <form className="ativacao-form" onSubmit={ativarUsuario}>
          <div className="form-field">
            <label htmlFor="codigoAtivacao">Código de ativação</label>
            <input
              type="text"
              id="codigoAtivacao"
              name="codigoAtivacao"
              value={codigoAtivacao}
              onChange={handleCodigoChange}
              inputMode="numeric"
              maxLength="8"
              placeholder="Digite o código"
              autoComplete="one-time-code"
              required
            />
          </div>

          {activationStatus && (
            <p className="activation-success">{activationStatus}</p>
          )}
          {activationError && <p className="form-error">{activationError}</p>}

          <button
            type="submit"
            className="cadastro-submit ativacao-button"
            disabled={isActivating}
          >
            {isActivating ? "Ativando..." : "Ativar conta"}
          </button>
        </form>

        <button
          type="button"
          className="ativacao-secondary-button"
          onClick={() => window.location.assign("/")}
        >
          Voltar ao cadastro
        </button>
      </section>
    </main>
  );
}

export default Cadastro;
