import React from 'react';
import { ArrowClockwise } from '@phosphor-icons/react';

const NotFound = ({ notFoundMessage, icon, refreshKeyword, refreshFunction, className }) => {
    refreshKeyword = refreshKeyword || "Refresh";

    return (
        <div className={`col-sm-8 col-md-6 mx-auto p-3 ${className !== undefined ? className : ''} info-message`}>
            {icon && icon}
            <p className="text-center text-muted small">{notFoundMessage}</p>
            {refreshFunction && (
                <button className="btn btn-sm btn-outline-secondary d-block mx-auto border border-secondary border-opacity-25"
                    onClick={() => refreshFunction()}
                >
                    <ArrowClockwise weight="bold" size={18} className="me-1" /> {refreshKeyword ? refreshKeyword : ''}
                </button>
            )}
        </div>
    )
}

export default NotFound;