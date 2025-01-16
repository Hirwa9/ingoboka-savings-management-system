import { X } from '@phosphor-icons/react';
import React from 'react';

const AbsoluteCloseButton = ({ onClose, bg, text }) => {
    bg = bg || 'light';
    text = text || 'gray-600';

    return (
        <X size={40} className={`position-absolute top-0 end-0 translate-middle-y bg-${bg} text-${text} border border-light border-opacity-25 rounded-3 me-2 p-2 clickDown ptr`}
            onClick={() => onClose()}
        />
    )
}

export default AbsoluteCloseButton;
