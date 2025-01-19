import React from 'react';

const LoadingIndicator = ({ icon, text, className, loaderColor }) => {
    return (
        <div className={`flex-column flex-center px-3 py-5 text-muted ${className !== undefined ? className : ''} `}>
            <span className='opacity-25'>{icon && icon}</span>
            {text && text}
            <span className={`${icon ? 'mt-5' : text ? 'mt-4' : ''} ${loaderColor ? `text-${loaderColor}` : ''} loader`}></span>
        </div>
    )
}

export default LoadingIndicator;