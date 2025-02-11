import React from 'react';
import { CaretDown } from '@phosphor-icons/react';

const NextStepInformer = ({ type = 'primary', content = '', className = '' }) => {
    return (
        <div className={`alert alert-${type} grid-center mb-4 pb-1 rounded-0 smaller ${className}`}>
            <p className='mb-0'>{content}</p>
            <CaretDown size={35} weight='light' className='p-2' />
        </div>
    )
}

export default NextStepInformer;
