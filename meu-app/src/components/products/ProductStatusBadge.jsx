import { getStatusMeta } from "./productUtils";

function ProductStatusBadge({ product }) {
  const status = getStatusMeta(product);

  return (
    <span className={`product-status ${status.className}`}>
      {status.label}
    </span>
  );
}

export default ProductStatusBadge;
