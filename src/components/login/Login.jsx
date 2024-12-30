import React, { useId, useState } from 'react';
import './login.css';
import '../common/formInput/formInput.css';
import MyToast from '../common/Toast';
import { isValidEmail } from '../../scripts/myScripts';
import { useLocation } from 'react-router';
import $ from 'jquery';
import { SignIn, UserCircleDashed, Wallet } from '@phosphor-icons/react';


const Login = () => {

    const location = useLocation();
    const signInId = useId();

    // Toast
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('purple');

    const toast = (message, type) => {
        setShowToast(true);
        setToastMessage(message);
        setToastType(type || toastType);
    };


    /**
     * Login
    */

    const [email, setEmail] = useState();
    const [password, setPassword] = useState();

    // Submit sign in form
    // const handleSignIn = (e) => {
    //   e.preventDefault();
    //   axios.post('http://localhost:5000/login', { email, password })
    //     .then(res => {
    //       console.log(res);
    //     }).catch(err => {
    //       console.error(err)
    //     });
    // }

    const handleSignIn = async (e) => {
        e.preventDefault();
        if (!isValidEmail(email)) {
            return alert('Enter a valid email address.');
        }
        try {
            // await axios.post('http://localhost:5000/login', { email, password });
            // location.push("../Dashboard.js");

            const response = await fetch(`http://localhost:5000/login`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            toast(data.message, 'success');

            // Clear the reply message and refresh the messages list
            // setShowContactUsMessage(false);
            // setReplyMessage('');
            // setTimeout(() => {
            //     fetchMessages();
            // }, 1000);

        } catch (error) {
            if (error.response) {
                console.error(error.response.data.message);
                toast(error.response.data.message, 'warning');
            }
        }
    }

    // Handle input's UI
    // Handle input changes
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
            <MyToast show={showToast} message={toastMessage} type={toastType} selfClose onClose={() => setShowToast(false)} />
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
                                <img src="images/saving_illustration.png" alt="" className='mt-5 col-7'/>

                            </div>
                        </div>

                        {/* Form */}
                        <div className="col-11 col-sm-9 col-md-7 col-lg-5 mx-auto mx-lg-0 py-4 bg-lightColor text-gray-900 login-form-wrapper">
                            <div className='px-3 py-3 px-sm-5 p-lg-5'>
                                <div className='flex-center mb-4'>
                                    <UserCircleDashed size={80} weight='duotone' className='text-gray-500' />
                                </div>
                                <h1 className='h5 fw-bold text-center text-gray-800'>Welcome to Ingoboka</h1>
                                <p className='mb-4 smaller text-center text-gray-600'>
                                    Sign-in to your account to continue
                                </p>
                                <form onSubmit={handleSignIn}>
                                    <div className={`form-input-element`}>
                                        <input
                                            type="email"
                                            id={signInId + "Email"}
                                            // id="signInEmail"
                                            className="form-control form-control-lg"
                                            value={email}
                                            required
                                            onChange={e => { handleChange(e); setEmail(e.target.value) }}
                                        />
                                        <label htmlFor={signInId + "Email"} className="form-label">Email</label>
                                    </div>
                                    <div className={`form-input-element`}>
                                        <input
                                            type="password"
                                            id={signInId + "Password"}
                                            className="form-control form-control-lg no-css-validation"
                                            value={password}
                                            required
                                            onChange={e => { handleChange(e); setPassword(e.target.value) }}
                                        />
                                        <label htmlFor={signInId + "Password"} className="form-label">Password</label>
                                    </div>

                                    <div className="pt-1 my-4">
                                        <button type="submit" className="btn btn-sm btn-dark flex-center px-3 rounded-0 w-100 clickDown" style={{ fontSize: "75%", paddingBlock: ".8rem" }}>SIGN IN <SignIn size={15} className='ms-2' /></button>
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
