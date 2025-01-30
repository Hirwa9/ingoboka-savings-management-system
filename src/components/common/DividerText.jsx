import React from 'react'

const DividerText = ({ text, type, className, noBorder, noShadow, clickable, onClick }) => {
    text = text || "Or";
    type = type || 'light';
    let textColor;

    // Adjust toast color
    switch (type) {
        case 'light':
        case 'warning':
        case 'yellow':
        case 'info':
        case 'gray-100':
        case 'gray-200':
        case 'gray-300':
        case 'gray-400':
        case 'gray-500':
            textColor = 'dark';
            break;
        default:
            textColor = 'light';
            break;
    }

    if (className) {
        const providedClasses = className.split(' '),
            textColorIsProvided = providedClasses.some(item => item.indexOf('text-') > -1);

        if (textColorIsProvided) {
            textColor = String(providedClasses.find(item => item.indexOf('text-') > -1)).slice(5);
        }
    }

    return (
        <>
            <div className={`position-relative h-2_5rem flex-center ${!clickable ? 'ptr-none' : ''} ${className !== undefined ? className : ''} text-divider`}>
                <div className={`h-2rem ${text === 'Or' ? 'w-2rem rounded-circle' : 'rounded-pill px-3'} mx-auto flex-center ${!noBorder ? 'border border-black4' : ''} bg-${type} text-${textColor} fs-75 ${!noShadow ? 'shadow-sm' : ''}`} onClick={() => onClick()}>{text}</div>
            </div>
        </>
    )
}

export default DividerText;
