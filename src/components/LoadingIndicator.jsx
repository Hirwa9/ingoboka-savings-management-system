import React from 'react';

const LoadingIndicator = ({ icon, text, className }) => {
    return (
        <div className={`flex-column flex-center px-3 py-5 text-muted  ${className !== undefined ? className : ''} `}>
            {icon && icon}
            {text && text}
            <span className={`${icon  ? 'mt-5' : text ? 'mt-4' : ''} loader`}></span>
        </div>
    )
}

export default LoadingIndicator;