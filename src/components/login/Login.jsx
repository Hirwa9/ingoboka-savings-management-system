import React, { useContext, useId, useState } from 'react';
import './login.css';
import '../common/formInput/formInput.css';
import MyToast from '../common/Toast';
import { useNavigate } from "react-router-dom";
import $ from 'jquery';
import { SignIn, Wallet } from '@phosphor-icons/react';
import useCustomDialogs from '../common/hooks/useCustomDialogs';
import { Axios, BASE_URL } from '../../api/api';
import SmallLoader from '../common/SmallLoader';
import { AuthContext } from '../AuthProvider';

const Login = () => {

    // Custom hooks
    const {
        // Toast
        showToast,
        toastMessage,
        toastType,
        toastSelfClose,
        successToast,
        warningToast,
        resetToast,
    } = useCustomDialogs();

    // Auth check
    const { isAuthenticated, checkAuthOnMount, login } = useContext(AuthContext);

    const [isWaitingFetchAction, setIsWaitingFetchAction] = useState(false);
    const signInId = useId();

    /**
     * Login
    */

    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');

    // Handle sign in

    const handleSignIn = async (e) => {
        e.preventDefault();
        if (!emailOrUsername || !password) {
            return warningToast({ message: 'Enter all credentials to continue.' });
        }

        try {
            setIsWaitingFetchAction(true);
            await login(emailOrUsername, password);
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.response?.data?.message || "Login failed";
            warningToast({ message: errorMessage });
            console.error('Error signing in:', error);
        } finally {
            setIsWaitingFetchAction(false);
        }

    };

    // Handle input's UI
    const handleChange = (e) => {
        const target = e.target;
        if (target.value !== undefined && target.value !== '') {
            $(target).addClass('has-data');
        } else {
            $(target).removeClass('has-data');
        }
    };

    return (
        <>
            {/* Toast message */}
            <MyToast show={showToast} message={toastMessage} type={toastType} selfClose={toastSelfClose} onClose={() => resetToast()} />
            <main className='w-100vw h-100vh'>
                <div className="dim-100 bg-lightColor">
                    <div className='h-100 d-flex flex-column flex-lg-row mx-0'>

                        {/* Intro & illustration(s) */}
                        <div className="col-lg-7 px-4 px-sm-5 p-5 bg-primaryColor login-hero-wrapper">
                            <h2 className='fw-bolder text-gray-200'><Wallet size={40} className='me-2' /> Ikimina <span className='text-secondaryColor'>_ Ingoboka</span></h2>
                            <p className='text-light small'>
                                Your savings management system ...
                            </p>
                            <div className='d-none d-lg-block'>
                                <img src="/images/saving_illustration.png" alt="" className='mt-5 col-7' />

                            </div>
                        </div>

                        {/* Form */}
                        <div className="col-11 col-sm-9 col-md-7 col-lg-5 mx-auto mx-lg-0 py-4 bg-lightColor text-gray-900 login-form-wrapper">
                            <div className='px-3 py-3 px-sm-5 p-lg-5'>
                                <div className='flex-center mb-4'>
                                    <img src='/logo.jpeg' alt="" className="w-4rem h-4rem mx-auto rounded-circle" />
                                </div>
                                <h1 className='h5 fw-bold text-center text-gray-800'>Welcome to Ingoboka</h1>
                                <p className='mb-4 smaller text-center text-gray-600'>
                                    Sign-in to your account to continue
                                </p>
                                <form onSubmit={handleSignIn}>
                                    <div className={`form-input-element`}>
                                        <input
                                            type="text" // Changed from email to text to allow both email and username
                                            id={signInId + "EmailOrUsername"}
                                            className="form-control form-control-lg"
                                            value={emailOrUsername}
                                            onChange={e => { handleChange(e); setEmailOrUsername(e.target.value) }}
                                            required
                                        />
                                        <label htmlFor={signInId + "EmailOrUsername"} className="form-label">Email or Username</label>
                                    </div>
                                    <div className={`form-input-element`}>
                                        <input
                                            type="password"
                                            id={signInId + "Password"}
                                            className="form-control form-control-lg no-css-validation"
                                            value={password}
                                            onChange={e => { handleChange(e); setPassword(e.target.value) }}
                                            required
                                        />
                                        <label htmlFor={signInId + "Password"} className="form-label">Password</label>
                                    </div>

                                    <div className="pt-1 my-4">
                                        <button type="submit" className="btn btn-sm btn-dark flex-center px-3 rounded-0 w-100 clickDown" style={{ fontSize: "75%", paddingBlock: ".8rem" }}>
                                            {!isWaitingFetchAction ?
                                                <>SIGN IN <SignIn size={15} className='ms-2' /></>
                                                : <>SIGN IN <SmallLoader color='light' /></>
                                            }
                                        </button>
                                    </div>

                                    <div className='d-grid gap-3 place-items-center'>
                                        <a className="d-grid w-fit ms-auto smaller text-primary text-decoration-none" href="#!">Forgot password?</a>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}

export default Login;
