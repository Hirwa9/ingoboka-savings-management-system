import React, { createContext, useState, useEffect, useContext } from "react";
import LoadingIndicator from "./LoadingIndicator";
import { Bank, CaretDown } from "@phosphor-icons/react";
import { Axios } from "../api/api";
import { useNavigate } from "react-router";
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
    const [userType, setUserType] = useState(null); // User type value or null
    const [loading, setLoading] = useState(true); // Loading state for auth checks
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Auth state

    // Check authentication
    const checkAuthOnMount = async () => {
        try {
            const storedUserType = localStorage.getItem("userType") || null;

            const response = await Axios.get(`/verifyToken?userType=${storedUserType}`, { withCredentials: true });

            if (response.status !== 200) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = response.data;
            setUser(data.user);
            setUserType(data.userType);
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
            const response = await Axios.post(`/login`, { emailOrUsername, password }, { withCredentials: true });

            const data = response.data;
            if (data.accessToken) {
                const { id, type } = data.user;
                setUser(data.user);
                setIsAuthenticated(true);

                // Store user type in localStorage
                localStorage.setItem("userType", type);

                if (type === "admin") {
                    setUserType("admin");
                    navigate("/admin");
                } else if (type === "member") {
                    setUserType("member");
                    navigate(`/user/${id}`);
                } else {
                    warningToast({ message: 'Unable to login. Please contact support.' });
                }
            } else {
                warningToast({ message: 'Invalid credentials. Please try again.' });
            }
        } catch (error) {
            warningToast({ message: "Login failed" });
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    // Logout function
    const logout = async () => {
        try {
            setLoading(true);
            await Axios.post('/logout', {}, {
                withCredentials: true // Include cookies
            });

            // Clear stored user data
            localStorage.removeItem("userType");

            // Reset state
            setUser(null);
            setUserType(null);
            setIsAuthenticated(false);

            // Redirect after logout
            navigate("/login", { replace: true });
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            setLoading(false);
        }
    };

    // Context value
    const value = {
        loading,
        user,
        userType,
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