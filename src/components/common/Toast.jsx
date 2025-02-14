import React, { useEffect } from 'react';
import { Toast, Button } from 'react-bootstrap';

const MyToast = ({ show, message, type = 'light', selfClose, selfCloseTimeout = 4000, onClose }) => {
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

    // Manage self-close behavior with useEffect
    useEffect(() => {
        let timer;
        if (selfClose && show) {
            timer = setTimeout(() => {
                onClose();
            }, selfCloseTimeout);
        }

        // Cleanup: Clear timer if component unmounts or `show` changes
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [show, selfClose, selfCloseTimeout, onClose]);

    return (
        <Toast
            show={show}
            onClose={onClose}
            className={`position-fixed ${selfClose ? 'w-fit' : ''} mx-auto my-3 bg-${type} text-${textColor} border-0 rounded-0`}
            style={{
                top: '1.5rem',
                left: '0',
                right: '0',
                animation: 'flyInTop .5s 1',
                zIndex: 4001
            }}
        >
            <Toast.Body className={`d-flex ${selfClose ? 'justify-content-center' : ''}`}>
                {message}{' '}
                {!selfClose && (
                    <Button
                        variant="close"
                        style={{ border: `1px solid var(--bs-${textColor}) !important` }}
                        size="sm"
                        onClick={onClose}
                        className="ms-auto p-2"
                    />
                )}
            </Toast.Body>
        </Toast>
    );
};

export default MyToast;