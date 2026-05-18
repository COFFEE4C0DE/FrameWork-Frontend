function SalesFilters({
  filters,
  onChange,
  onApply,
  onClear,
  isLoading,
  validationMessage,
}) {
  return (
    <section className="products-toolbar sales-toolbar" aria-label="Filtros de vendas">
      <form className="sales-filter-card" onSubmit={onApply}>
        <div className="form-field">
          <label htmlFor="salesStartDate">Data inicial</label>
          <input
            type="date"
            id="salesStartDate"
            name="startDate"
            value={filters.startDate}
            onChange={(event) => onChange("startDate", event.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="salesEndDate">Data final</label>
          <input
            type="date"
            id="salesEndDate"
            name="endDate"
            value={filters.endDate}
            onChange={(event) => onChange("endDate", event.target.value)}
          />
        </div>

        <div className="sales-filter-actions">
          <button type="submit" className="products-primary-button" disabled={isLoading}>
            {isLoading ? "Filtrando..." : "Filtrar"}
          </button>
          <button type="button" className="product-secondary-button" onClick={onClear} disabled={isLoading}>
            Limpar filtros
          </button>
        </div>

        {validationMessage && <p className="sales-filter-error">{validationMessage}</p>}
      </form>
    </section>
  );
}

export default SalesFilters;
