import React from 'react';
import CurrencyText from './CurrencyText';

const LoanStatusTable = ({ loanData = {} }) => {
    return (
        <div className='overflow-auto'>
            <table className="table table-hover h-100">
                <thead className='table-secondary position-sticky top-0 inx-1 text-uppercase small'>
                    <tr>
                        <th className='py-3 text-nowrap text-gray-700 fw-normal'>Title</th>
                        <th className='py-3 text-nowrap text-gray-700 fw-normal'>Taken  <sub className='fs-60'>/RWF</sub></th>
                        <th className='py-3 text-nowrap text-gray-700 fw-normal'>Paid  <sub className='fs-60'>/RWF</sub></th>
                        <th className='py-3 text-nowrap text-gray-700 fw-normal'>Pending  <sub className='fs-60'>/RWF</sub></th>
                    </tr>
                </thead>
                <tbody>
                    <tr className={`small credit-row`}>
                        <td className={`ps-sm-3 border-bottom-3 border-end fw-bold`}>
                            Loan
                        </td>
                        <td>
                            <CurrencyText amount={loanData?.loanTaken} />
                        </td>
                        <td className='text-primary-emphasis'>
                            <CurrencyText amount={loanData?.loanPaid} />
                        </td>
                        <td className='text-warning-emphasis'>
                            <CurrencyText amount={loanData?.loanPending} />
                        </td>
                    </tr>
                    <tr className={`small credit-row`}>
                        <td className={`ps-sm-3 border-bottom-3 border-end fw-bold`}>
                            Interest
                        </td>
                        <td>
                            <CurrencyText amount={loanData?.interestTaken} />
                        </td>
                        <td className='text-primary-emphasis'>
                            <CurrencyText amount={loanData?.interestPaid} />
                        </td>
                        <td className='text-warning-emphasis'>
                            <CurrencyText amount={loanData?.interestPending} />
                        </td>
                    </tr>
                    <tr className={`small credit-row`}>
                        <td className={`ps-sm-3 border-bottom-3 border-end fw-bold`}>
                            Tranches
                        </td>
                        <td>
                            {loanData?.tranchesTaken}
                        </td>
                        <td className='text-primary-emphasis'>
                            {loanData?.tranchesPaid}
                        </td>
                        <td className='text-warning-emphasis'>
                            {loanData?.tranchesPending}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default LoanStatusTable;