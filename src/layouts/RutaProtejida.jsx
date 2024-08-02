import { Outlet, Navigate } from "react-router-dom";

const RutaProtegida = ({ isAllowed, children, redirectTo }) => {
  if (!isAllowed) return <Navigate to={redirectTo} replace />;

  return children ? children : <Outlet />;
};

export default RutaProtegida;
