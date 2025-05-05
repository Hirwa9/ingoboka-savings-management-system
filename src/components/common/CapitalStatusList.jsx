import React from 'react';

const CapitalStatusList = ({
    memberData,
    actionButton = null,
    className = null,
}) => {
    return (
        <ul className={`list-unstyled text-gray-700 px-2 smaller ${className}`}>
            <li className="py-1 w-100">
                <span className={`d-flex align-items-center ${actionButton ? 'justify-content-between' : null}`}>
                    <b className='fs-5'>{memberData?.shares} Shares</b>
                    {actionButton && actionButton}
                </span>
            </li>
            <li className="py-1 d-table-row">
                <span className='d-table-cell border-start border-secondary ps-2'>Cotisation:</span> <span className='d-table-cell ps-2'>{memberData?.cotisation.toLocaleString()} RWF</span>
            </li>
            <li className="py-1 d-table-row">
                <span className='d-table-cell border-start border-secondary ps-2'>Social:</span> <span className='d-table-cell ps-2'>{Number(memberData?.social).toLocaleString()} RWF</span>
            </li>
            <li className="py-1 fs-5 d-table-row">
                <b className='d-table-cell'>Total:</b> <span className='d-table-cell ps-2'>{(memberData?.cotisation + Number(memberData?.social)).toLocaleString()} RWF</span>
            </li>
        </ul>
    )
}

export default CapitalStatusList;