import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { trackedApiFetch } from "../services/requestLoader";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!location.state?.emailInicial) {
      return;
    }

    setFormData((currentData) => ({
      ...currentData,
      email: location.state.emailInicial,
    }));
  }, [location.state]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    navigate("/home", { replace: true });
  }, [isAuthenticated, navigate]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await trackedApiFetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.erro || "Login inválido.");
      }

      const tokenRecebido =
        data?.token ||
        data?.access_token ||
        data?.data?.token ||
        data?.data?.access_token;

      if (!tokenRecebido) {
        throw new Error("Token não recebido no login.");
      }

      login(tokenRecebido);
      setSuccessMessage("Login realizado com sucesso.");
      navigate("/home", { replace: true });
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      setErrorMessage(error.message || "Não foi possível fazer login.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-title">
        <span className="ativacao-status">Conta ativada</span>
        <h1 id="login-title">Entrar</h1>
        <p>Use seu e-mail e senha para acessar sua conta.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="loginEmail">E-mail</label>
            <input
              type="email"
              id="loginEmail"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="voce@email.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="loginSenha">Senha</label>
            <input
              type="password"
              id="loginSenha"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              placeholder="Digite sua senha"
              autoComplete="current-password"
              required
            />
          </div>

          {successMessage && <p className="activation-success">{successMessage}</p>}
          {errorMessage && <p className="form-error">{errorMessage}</p>}

          <button type="submit" className="cadastro-submit" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </button>

          <button
            type="button"
            className="auth-switch-button"
            onClick={() => navigate("/cadastro")}
          >
            Criar uma conta
          </button>
        </form>
      </section>
    </main>
  );
}

export default Login;
