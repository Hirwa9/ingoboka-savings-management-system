import React from 'react';
import {
    Routes, // Replaces Switch
    Route,
    useLocation,
} from "react-router-dom";

import Admin from '../adminUI/admin/Admin';
import User from '../userUI/user/User';
import Header from '../header/Header';
// import Footer from '../footer/Footer';
import Login from '../login/Login';
import ProtectedRoute from '../ProtectedRoute';

const Pages = () => {
    // let location = window.location;
    // const currentLocation = location.pathname;

    const location = useLocation();
    const currentLocation = location.pathname;
    // const excludedRoutes = ["/login", "/admin", "/admin/dashboard"];
    const excludedRoutes = ["/login",];
    const isExcludedRoute = excludedRoutes.includes(currentLocation);

    return (
        <>
            {/* Conditionally render the Header */}
            {/* <Header /> */}
            {/* {!isExcludedRoute && <Header />} */}
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                {/* Admin */}
                {/* <Route path="/admin" element={
                    <ProtectedRoute>
                        <Admin />
                    </ProtectedRoute>
                } /> */}
                <Route path="/admin" element={
                    <Admin />
                } />
                {/* User */}
                <Route path="/user/:userId" element={
                    <ProtectedRoute>
                        <User />
                    </ProtectedRoute>
                } />
            </Routes>
            {/* Conditionally render the Footer */}
            {/* <Footer /> */}
            {/* {!isExcludedRoute && <Footer />} */}
        </>
    );
};

export default Pages;