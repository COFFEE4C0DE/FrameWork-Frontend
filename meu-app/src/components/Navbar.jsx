import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const menuItems = [
  { label: "Dashboard", href: "/home" },
  { label: "Produtos", href: "/produtos" },
  { label: "Vendas", href: "/vendas" },
];

function Navbar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <header className="app-navbar">
      <NavLink className="app-brand" to="/home" aria-label="Inicio do sistema">
        twentyone market
      </NavLink>

      <nav className="app-nav" aria-label="Paginas do sistema">
        {menuItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) => (isActive ? "is-active" : undefined)}
            end={item.href === "/home"}
          >
            {item.label}
          </NavLink>
        ))}
        <button type="button" className="app-logout" onClick={handleLogout}>
          Sair
        </button>
      </nav>
    </header>
  );
}

export default Navbar;
