import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/authContext";

const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

export default GuestRoute;
