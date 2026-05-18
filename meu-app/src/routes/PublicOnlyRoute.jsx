import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}

export default PublicOnlyRoute;
