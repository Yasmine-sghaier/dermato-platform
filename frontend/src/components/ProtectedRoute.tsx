import { Navigate } from "react-router-dom";
import React from "react";

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredRole?: string;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Si aucun token : non connecté
  if (!token) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Si un rôle est requis et que celui du user ne correspond pas
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Sinon, accès autorisé
  return <>{children}</>;
};

export default ProtectedRoute;
