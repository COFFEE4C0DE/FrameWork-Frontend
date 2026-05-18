import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { trackedApiFetch } from "../services/requestLoader";

const ACTIVATION_EMAIL_KEY = "activation_email";
const CELULAR_PREFIX = "55";
const MAX_CELULAR_LENGTH = 13;

function Cadastro() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    nome: "",
    cnpj: "",
    email: "",
    celular: CELULAR_PREFIX,
    senha: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [emailUsuario, setEmailUsuario] = useState(
    () => sessionStorage.getItem(ACTIVATION_EMAIL_KEY) || ""
  );

  const isActivationStage = location.pathname === "/ativacao-conta";

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    navigate("/home", { replace: true });
  }, [isAuthenticated, navigate]);

  function navegarParaLogin(emailInicial = "") {
    navigate("/login", { replace: true, state: emailInicial ? { emailInicial } : undefined });
  }

  function handleChange(event) {
    const { name, value } = event.target;
    let nextValue = value;

    if (name === "celular") {
      const numericValue = value.replace(/\D/g, "");
      const valueWithoutPrefix = numericValue
        .replace(/^(?:55)+/, "")
        .replace(/^5$/, "");

      nextValue = `${CELULAR_PREFIX}${valueWithoutPrefix}`.slice(
        0,
        MAX_CELULAR_LENGTH
      );
    } else if (name === "cnpj") {
      nextValue = value.replace(/\D/g, "");
    }

    setFormData((currentData) => ({
      ...currentData,
      [name]: nextValue,
    }));
  }

  async function enviarDados() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await trackedApiFetch("/user", {
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
      sessionStorage.setItem(ACTIVATION_EMAIL_KEY, formData.email);
      setFormData({
        nome: "",
        cnpj: "",
        email: "",
        celular: CELULAR_PREFIX,
        senha: "",
      });
      navigate("/ativacao-conta", { replace: true });
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

  if (isActivationStage) {
    return (
      <AtivacaoConta
        emailUsuario={emailUsuario}
        onAtivacaoConcluida={() => {
          sessionStorage.removeItem(ACTIVATION_EMAIL_KEY);
          navegarParaLogin(emailUsuario);
        }}
        onVoltarInicio={() => navigate("/", { replace: true })}
      />
    );
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
                maxLength={MAX_CELULAR_LENGTH}
                placeholder="5511999999999"
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
            onClick={() => navigate("/login")}
          >
            Já tenho uma conta
          </button>
        </form>
      </section>
    </main>
  );
}

function AtivacaoConta({ emailUsuario, onAtivacaoConcluida, onVoltarInicio }) {
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
      const response = await trackedApiFetch("/ativarUsuario", {
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
          <strong>{emailUsuario || "não informado"}</strong>.
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
          onClick={onVoltarInicio}
        >
          Voltar ao início
        </button>
      </section>
    </main>
  );
}

export default Cadastro;
