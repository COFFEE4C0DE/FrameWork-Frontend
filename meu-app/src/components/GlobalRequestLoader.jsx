import { useEffect, useState } from "react";
import { subscribeRequestLoading } from "../services/requestLoader";

function GlobalRequestLoader() {
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    return subscribeRequestLoading(setPendingRequests);
  }, []);

  if (pendingRequests <= 0) {
    return null;
  }

  return (
    <div className="global-request-loader" role="alert" aria-live="assertive" aria-busy="true">
      <section className="global-request-loader-panel" aria-label="Carregando requisição">
        <div className="global-request-loader-spinner" />
        <h2>Processando solicitação</h2>
        <p>Aguarde a conclusão antes de continuar.</p>
      </section>
    </div>
  );
}

export default GlobalRequestLoader;
