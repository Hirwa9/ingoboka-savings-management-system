import React, { useRef, useState } from 'react';
import './header.css';
import { List, SignOut } from '@phosphor-icons/react';

const Header = () => {
    const sideNavbarTogglerRef = useRef();
    const [sideNavbarIsFloated, setSideNavbarIsFloated] = useState(false);
    return (
        <>
            {/* <header className={headerVisible === true ? "" : "dom-scrolling-down"}> */}
            <header className="navbar navbar-light sticky-top flex-md-nowrap py-0 admin-header">
                <div className='nav-item navbar-brand col-md-3 col-xl-2 d-flex align-items-center me-0 px-2'>
                    <div className="me-2 logo">
                        <img src="logo.jpg" alt="" className="rounded-circle logo"></img>
                    </div>
                    <small className='fs-70 text-gray-200'>
                        INGOBOKA
                    </small>
                </div>
                {/* <input className="form-control form-control-dark w-100" type="text" placeholder="Search" aria-label="Search" /> */}
                <div className="ms-auto me-3 navbar-nav">
                    <div className="nav-item text-nowrap d-none d-md-block small">
                        <button className="nav-link px-3" ><SignOut size={20} weight='fill' className="opacity-50" /> Sign out</button>
                    </div>
                </div>
                <button ref={sideNavbarTogglerRef} className="d-md-none me-3 text-light navbar-toggler" type="button" aria-controls="sidebarMenu" aria-label="Toggle navigation" onClick={() => setSideNavbarIsFloated(!sideNavbarIsFloated)}>
                    <List />
                </button>
            </header>

        </>
    )
}

export default Header;
