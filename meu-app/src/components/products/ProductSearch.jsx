function ProductSearch({ value, onChange, total }) {
  return (
    <label className="product-search">
      <span>Buscar produto</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Digite o nome do produto"
        aria-label="Buscar produto por nome"
      />
      <small>{total} produto(s) na listagem</small>
    </label>
  );
}

export default ProductSearch;
