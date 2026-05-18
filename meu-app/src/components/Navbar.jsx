const menuItems = [
  { label: "Produtos", href: "/produtos" },
  // { label: "Cadastrar produto", href: "/produtos/cadastro" },
  //{ label: "Editar produto", href: "/produtos/edicao" },
  { label: "Cadastrar venda", href: "/vendas/cadastro" },
  { label: "Vendas", href: "/vendas" },
  { label: "Dashboard", href: "/dashboard" },
];

function Navbar() {
  const currentPath = window.location.pathname;

  function isActive(href) {
    if (href === "/produtos") {
      return currentPath === "/produtos" || currentPath.startsWith("/produtos/edicao");
    }

    return currentPath === href;
  }

  return (
    <header className="app-navbar">
      <a className="app-brand" href="/home" aria-label="Inicio do sistema">
        twentyone market
      </a>

      <nav className="app-nav" aria-label="Paginas do sistema">
        {menuItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={isActive(item.href) ? "is-active" : undefined}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

export default Navbar;
