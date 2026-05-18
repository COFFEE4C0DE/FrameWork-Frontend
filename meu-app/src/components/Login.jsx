import { useState } from "react";

function Login({ emailInicial = "", onCadastroClick }) {
  const [formData, setFormData] = useState({
    email: emailInicial,
    senha: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
      const response = await fetch("/login", {
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

      localStorage.setItem("access_token", data.access_token);
      setSuccessMessage("Login realizado com sucesso.");
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      setErrorMessage(error.message || "Não foi possivel fazer login.");
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
            onClick={onCadastroClick}
          >
            Criar uma conta
          </button>
        </form>
      </section>
    </main>
  );
}

export default Login;
