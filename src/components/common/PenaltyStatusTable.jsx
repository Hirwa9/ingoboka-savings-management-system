import React from 'react';
import CurrencyText from './CurrencyText';
import FormatedDate from './FormatedDate';

const PenaltyStatusTable = (
    {
        records = [],
        members = [],
        selectedMember = {},
    }
) => {
    return (
        <div className='overflow-auto'>
            <table className="table table-striped table-hover h-100">
                <thead className='table-secondary position-sticky top-0 inx-1 text-uppercase small'>
                    <tr>
                        <th className='ps-sm-3 py-3 text-nowrap text-gray-700'>N°</th>
                        <th className='py-3 text-nowrap text-gray-700 fw-normal' style={{ minWidth: '10rem' }}>Member</th>
                        <th className='py-3 text-nowrap text-gray-700 fw-normal'>Amount  <sub className='fs-60'>/RWF</sub></th>
                        <th className='py-3 text-nowrap text-gray-700 fw-normal' style={{ maxWidth: '13rem' }} >Comment</th>
                        <th className='py-3 text-nowrap text-gray-700 fw-normal'>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {records
                        .filter(cr => (cr?.recordType === 'penalty' && cr?.memberId === selectedMember?.id))
                        .sort((a, b) => new Date(b?.createdAt) - new Date(a?.createdAt))
                        .map((record, index) => {
                            const associatedMember = members?.find(m => m?.id === record?.memberId);
                            const memberNames = `${associatedMember?.husbandFirstName} ${associatedMember?.husbandLastName}`;

                            return (
                                <tr key={index} className="small cursor-default">
                                    <td className="ps-sm-3 border-bottom-3 border-end">
                                        {index + 1}
                                    </td>
                                    <td className="text-nowrap">
                                        {memberNames}
                                    </td>
                                    <td>
                                        <CurrencyText amount={Number(record?.recordAmount)} />
                                    </td>
                                    <td>
                                        {record?.comment}
                                    </td>
                                    <td className="text-nowrap" style={{ maxWidth: '13rem' }}>
                                        <FormatedDate date={record?.createdAt} showTime={true} />
                                    </td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
        </div>
    )
}

export default PenaltyStatusTable;