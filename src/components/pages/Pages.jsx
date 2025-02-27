import React from 'react';
import {
    Routes,
    Route,
} from "react-router-dom";

import Admin from '../adminUI/admin/Admin';
import User from '../userUI/user/User';
import Login from '../login/Login';
import ProtectedRoute from '../ProtectedRoute';

const Pages = () => {

    return (
        <>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                {/* Admin */}
                <Route path="/admin" element={
                    <ProtectedRoute>
                        <Admin />
                    </ProtectedRoute>
                } />
                {/* User */}
                <Route path="/user/:userId" element={
                    <ProtectedRoute>
                        <User />
                    </ProtectedRoute>
                } />
            </Routes>
        </>
    );
};

export default Pages;