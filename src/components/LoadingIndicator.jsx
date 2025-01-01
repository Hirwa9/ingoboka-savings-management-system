import React from 'react';

const LoadingIndicator = ({ className, icon }) => {
    return (
        <div className={`flex-column flex-center px-3 py-5 text-muted  ${className !== undefined ? className : ''} `}>
            {icon && icon}
            <span className={`${icon ? 'mt-5' : ''} loader`}></span>
        </div>
    )
}

export default LoadingIndicator;