import React from 'react';
import CurrencyText from './CurrencyText';

const CapitalStatusTable = ({ memberData }) => {
    return (
        <div className='overflow-auto'>
            <table className="table table-hover h-100">
                <thead className='table-secondary position-sticky top-0 inx-1 text-uppercase small'>
                    <tr>
                        <th className='py-3 text-nowrap text-gray-700 fw-normal'>Title</th>
                        <th className='py-3 text-nowrap text-gray-700 fw-normal'>Amount  <sub className='fs-60'>/RWF</sub></th>
                    </tr>
                </thead>
                <tbody>
                    <tr className={`small credit-row`}>
                        <td className={`ps-sm-3 border-bottom-3 border-end fw-bold`}>
                            Cotisation
                        </td>
                        <td className='text-primary-emphasis'>
                            <CurrencyText amount={memberData?.cotisation} />
                        </td>
                    </tr>
                    <tr className={`small credit-row`}>
                        <td className={`ps-sm-3 border-bottom-3 border-end fw-bold`}>
                            Social
                        </td>
                        <td className='text-primary-emphasis'>
                            <CurrencyText amount={Number(memberData?.social)} />
                        </td>
                    </tr>
                    <tr className={`small credit-row`}>
                        <td className={`ps-sm-3 border-bottom-3 border-end fw-bold`}>
                            Total
                        </td>
                        <td className='text-primary-emphasis text-decoration-underline'>
                            <CurrencyText amount={memberData?.cotisation + Number(memberData?.social)} />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default CapitalStatusTable;