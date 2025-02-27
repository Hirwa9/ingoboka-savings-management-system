import React, { createContext, useState, useEffect, useContext } from "react";
import LoadingIndicator from "./LoadingIndicator";
import { Bank, CaretDown } from "@phosphor-icons/react";
import { Axios } from "../api/api";
import { Navigate, useNavigate } from "react-router";
import MyToast from "./common/Toast";
import useCustomDialogs from "./common/hooks/useCustomDialogs";

// AuthContext
export const AuthContext = createContext();

// A custom hook for using AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};

// AuthProvider Component
export const AuthProvider = ({ children }) => {

    // Custom hooks
    const {
        // Toast
        showToast,
        toastMessage,
        toastType,
        resetToast,
        warningToast,
    } = useCustomDialogs();

    const navigate = useNavigate();

    const [user, setUser] = useState(null); // User object or null
    const [loading, setLoading] = useState(true); // Loading state for auth checks
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Auth state

    // Check authentication
    const checkAuthOnMount = async () => {
        try {
            const response = await Axios.get(`/verifyToken`, {
                withCredentials: true,  // Send cookies and auth headers
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.status !== 200) {
                const text = response.data;
                throw new Error(`HTTP error! Status: ${response.status}, Response: ${text}`);
            }

            const data = response.data;
            setUser(data.user);
            setIsAuthenticated(true);
        } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    // Check authentication on mount
    useEffect(() => {
        checkAuthOnMount();
    }, []);

    // Login function
    const login = async (emailOrUsername, password) => {

        try {
            const response = await Axios.post(`/login`, {
                emailOrUsername,
                password
            }, {
                withCredentials: true
            });

            const data = response.data;

            // Authentication handling
            if (data.accessToken) {
                const { id, type } = data.user;
                setUser(data.user);
                setIsAuthenticated(true);

                if (type === "admin") {
                    navigate("/admin");
                } else if (type === "member") {
                    navigate(`/user/${id}`);
                } else {
                    warningToast({ message: 'Unable to login. Please contact support.' });
                }
            } else {
                warningToast({ message: 'Invalid credentials. Please try again.' });
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Login failed";
            warningToast({ message: errorMessage });
            setUser(null);
            setIsAuthenticated(false);
            console.error("Login failed:", error);
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await Axios.post('/logout', {}, {
                withCredentials: true // Include cookies
            });

            // Clear user state and redirect to login
            setUser(null);
            setIsAuthenticated(false);
            <Navigate to="/login" replace />;
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    // Check authentication status when the component mounts
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false); // Authentication check is complete
    }, []);

    // Context value
    const value = {
        user,
        login,
        logout,
        isAuthenticated,
        checkAuthOnMount,
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

    return (
        <>
            <MyToast show={showToast} message={toastMessage} type={toastType} selfClose onClose={() => resetToast(false)} />
            <AuthContext.Provider value={value}>
                {children}
            </AuthContext.Provider>
        </>
    );
};