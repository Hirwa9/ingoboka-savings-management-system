import { Info } from '@phosphor-icons/react';
import React from 'react'
import AbsoluteCloseButton from '../AbsoluteCloseButton';

const RightFixedCard = ({ show, title = "Information", icon, content, onClose, fitWidth = false, className = '' }) => {
    icon = icon || <Info weight="fill" size={20} className='text-light' />;
    // onClose = onClose || () => alert('Finish up');
    content = content || <div className='p-2 fw-bold'>Put something here</div>;

    return (
        <>
            {show && (
                <div className='position-fixed fixed-top inset-0 bg-black2 px-2 pt-5 pb-3 inx-max'>
                    <div className={`position-relative h-100 ${fitWidth ? 'w-fit' : 'col-sm-7 col-md-5 col-lg-4 col-xxl-3'} mx-auto me-md-0 bg-light border-secondary border-opacity-25 rounded-4 ${className} right-fixed-card`} style={{ animation: 'flyInTop .3s 1' }}>
                        {/* Icon */}
                        <div className="position-absolute start-50 w-fit h-fit px-3 py-1 blur-bg-3px border border-light border-opacity-50 rounded-pill text-truncate" style={{ translate: "-50% -120%", animation: 'flyInBottom .5s 1' }}>
                            {icon} <span className='smaller text-gray-200'>{title}</span>
                        </div>
                        <AbsoluteCloseButton text="primaryColor" onClose={() => onClose()} />
                        {/* Content */}
                        <div className="h-100 p-3 overflow-auto">
                            {content}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default RightFixedCard
