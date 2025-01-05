import React, { createContext, useState, useEffect, useContext } from "react";
import LoadingIndicator from "./LoadingIndicator";
import { Bank, CaretDown } from "@phosphor-icons/react";

// Create the AuthContext
const AuthContext = createContext();

// Create a custom hook for using the AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};

// AuthProvider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // User object or null
    const [loading, setLoading] = useState(true); // Loading state for auth checks

    // Mock a login function
    const login = (userData) => {
        setUser(userData); // Update the user state
        localStorage.setItem("user", JSON.stringify(userData)); // Save user in localStorage
    };

    // Mock a logout function
    const logout = () => {
        setUser(null);
        localStorage.removeItem("user"); // Clear user from localStorage
    };

    // Check authentication status when the component mounts
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false); // Authentication check is complete
    }, []);

    // Context value to provide to children
    const value = {
        user,
        login,
        logout,
        isAuthenticated: !!user, // Boolean indicating if the user is logged in
    };

    // Show a loading indicator until the auth check is complete
    if (loading) {
        return (
            <div className="h-100vh d-flex flex-column app-loading-page">
                <LoadingIndicator className="h-80 text-gray-200" icon={<Bank size={80} className="loading-skeleton" />} />
                <p className="grid-center gap-3 mt-auto p-4 smaller text-gray-200 text-center fw-semibold" style={{ animation: 'zoomInBack .8s 1' }}>
                    <CaretDown className="opacity-75 me-2" /> IKIMINA INGOBOKA. Your savings management system
                </p>
            </div>
        );
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};