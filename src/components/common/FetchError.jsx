import { ArrowClockwise } from '@phosphor-icons/react';
import React from 'react'

const FetchError = ({ errorMessage, retryKeyword, refreshFunction, className }) => {
    retryKeyword = retryKeyword || "Retry"

    return (
        <div className={`col-sm-8 col-md-6 col-lg-5 col-xl-4 mx-auto p-3 rounded ${className !== undefined ? className : ''} error-message`}>
            <img src="/images/fetch_error_image-transparent.png" alt="Error" className="w-4rem h-4rem mx-auto mb-2 opacity-50" />
            <p className="text-center text-muted small">{errorMessage}</p>
            <button className="btn btn-sm btn-outline-secondary d-block mx-auto border border-secondary border-opacity-25"
                onClick={() => refreshFunction()}
            >
                <ArrowClockwise weight="bold" size={18} className="me-1" /> {retryKeyword}
            </button>
        </div>
    )
}

export default FetchError;