import React from 'react';

const CurrencyText = ({ amount, currency, smallCurrency, boldAmount, className, style = {} }) => {
    currency = currency || 'RWF';

    return (
        <span className={className !== undefined ? `${className}` : ''} style={style}>
            <span className={`${boldAmount ? 'fw-bold' : ''}`}>{amount.toLocaleString()}</span><span className={`ms-1 opacity-50 ${smallCurrency ? 'fs-60' : ''}`}>{currency}</span>
        </span>
    )
}

export default CurrencyText;
