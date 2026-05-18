import {
  buildReportCards,
  getReportExtraFields,
  getReportFromResponse,
} from "./saleUtils";

function SalesReportCards({ reportData, isLoading, errorMessage }) {
  const report = getReportFromResponse(reportData);
  const cards = buildReportCards(report);
  const extraFields = getReportExtraFields(report);

  if (isLoading) {
    return (
      <section className="products-stats sales-report-grid" aria-label="Carregando relatório">
        {[1, 2, 3, 4].map((item) => (
          <div className="sales-kpi-card is-loading" key={item}>
            <span>Carregando</span>
            <strong>...</strong>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section className="sales-report-section" aria-label="Relatório de vendas">
      <div className="products-stats sales-report-grid">
        {cards.length > 0 ? (
          cards.map((card) => (
            <div className="sales-kpi-card" key={card.label}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </div>
          ))
        ) : (
          <div className="sales-kpi-card sales-kpi-empty">
            <span>Relatório</span>
            <strong>Sem KPIs</strong>
          </div>
        )}
      </div>

      {errorMessage && <p className="sales-report-note is-error">{errorMessage}</p>}

      {!errorMessage && cards.length === 0 && (
        <p className="sales-report-note">
          O relatório foi carregado, mas a API não retornou indicadores consolidados para exibir.
        </p>
      )}

      {!errorMessage && extraFields.length > 0 && (
        <div className="sales-report-extra" aria-label="Outras informações do relatório">
          {extraFields.map((field) => (
            <div key={field.label}>
              <span>{field.label}</span>
              <strong>{field.value}</strong>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default SalesReportCards;
