import React, { useCallback, useEffect, useRef } from 'react';
import './confirmDialog.css';

const ConfirmDialog = ({ show, message, type, action, actionText, actionIsWaiting, onClose, onCloseCallback, closeText }) => {
    message = message || 'This is an alert component designed to confirm or cancel something.';
    type = type || 'light';
    let textColor;

    // Adjust alert color
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

    const cardRef = useRef(null);
    const cardContainerRef = useRef(null);

    // Hide card
    const slideOutCard = useCallback(() => {
        cardRef.current.classList.add('flyOutT');
        setTimeout(() => {
            cardRef.current.classList.remove('flyOutT');
            onClose();
            onCloseCallback && onCloseCallback();
        }, 400);
    }, [onClose, onCloseCallback]);

    // Handle clicks outside the card
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (cardRef.current && !cardRef.current.contains(e.target)) {
                slideOutCard(); // Hide the card
            }
        };

        const container = cardContainerRef.current;
        if (container) {
            container.addEventListener('click', handleClickOutside);
        }
        return () => {
            if (container) {
                container.removeEventListener('click', handleClickOutside);
            }
        };
    }, [slideOutCard]);

    return (
        <>
            {show && (
                <div ref={cardContainerRef} className={`position-fixed fixed-top inx-max inset-0 bg-white3`}>
                    <div
                        ref={cardRef}
                        className={`position-sticky top-0 mx-auto blur-bg-3px bg-${type} text-${textColor} overflow-auto peak-borders-b top-fixed-confirm-dialog`}
                    >
                        <div className="fs-80">{message}</div>
                        <div className="modal-footer mt-3">
                            <button
                                type="button"
                                className={`btn btn-sm me-3 text-${textColor} border-0 ${actionIsWaiting ? 'opacity-25' : 'opacity-75'
                                    } clickDown`}
                                disabled={actionIsWaiting}
                                onClick={slideOutCard}
                            >
                                {closeText || 'Cancel'}
                            </button>
                            <button
                                type="submit"
                                className={`btn btn-sm btn-${textColor} flex-align-center px-3 rounded-pill clickDown`}
                                disabled={actionIsWaiting}
                                onClick={() => action()}
                            >
                                {!actionIsWaiting ? (
                                    <>{actionText || 'Yes, continue'}</>
                                ) : (
                                    <>
                                        Working <div className="spinner-border spinner-border-sm ms-2"></div>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ConfirmDialog;
