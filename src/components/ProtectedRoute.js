import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="text-center mt-5">Loading...</div>;
    }
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;