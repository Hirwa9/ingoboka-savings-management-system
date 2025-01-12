import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import './bottomFixedCard.css';
import MyToast from '../Toast';
import { CaretDown } from '@phosphor-icons/react';
import useCustomDialogs from '../hooks/useCustomDialogs';

const BottomFixedCard = ({ show, content, className, id, blurBg, toggler, closeButton, onClose, avoidCloseReasons }) => {

    // Custom hooks
    const {
        // Toast
        showToast,
        setShowToast,
        toastMessage,
        toastType,
        toast,
    } = useCustomDialogs();

    const cardRef = useRef(null);
    const cardContainerRef = useRef(null);
    const [processing, setProcessing] = useState(false);

    // Update "processing" based on "avoidCloseReasons"
    useEffect(() => {
        const isProcessing = (
            avoidCloseReasons && avoidCloseReasons.some((item) => item.value)
        ) || false;
        setProcessing(isProcessing);
    }, [avoidCloseReasons]);

    // Hide card
    const slideOutCard = useCallback(() => {
        if (processing) {
            toast({ message: 'Wait, there is something in progress...', type: 'gray-700' });
        } else {
            cardRef.current.classList.add('flyOutB');
            setTimeout(() => {
                onClose(); // Close card
            }, 400);
        }
    }, [processing, onClose]);

    // Handle clicks outside the card
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (toggler) {
                if (cardRef.current && toggler.current) {
                    if (
                        !cardRef.current.contains(e.target) &&
                        !toggler.current.contains(e.target)
                    ) {
                        slideOutCard(); // Attempt to hide the card
                    }
                }
            } else if (cardRef.current) {
                if (!cardRef.current.contains(e.target)) {
                    slideOutCard(); // Attempt to hide the card
                }
            }

        };

        // Attach "click outside" event listener
        const cardContainer = cardContainerRef.current;
        if (toggler) {
            document.addEventListener('click', handleClickOutside);
            return () => {
                document.removeEventListener('click', handleClickOutside); // Clean up
            };
        } else if (cardContainer) {
            cardContainer.addEventListener('click', handleClickOutside);
            return () => {
                cardContainer.removeEventListener('click', handleClickOutside); // Clean up
            };
        }
    }, [toggler, slideOutCard]);

    return (
        <>
            {show && (
                <>
                    <MyToast
                        show={showToast}
                        message={toastMessage}
                        type={toastType}
                        selfClose
                        onClose={() => setShowToast(false)}
                    />
                    <div ref={cardContainerRef} className={`position-fixed fixed-top inset-0 ${blurBg ? 'bg-white3 blur-bg-1px' : ''}`}>
                        <div
                            ref={cardRef}
                            className={`position-absolute bottom-0 inx-inherit mx-auto col-sm-10 col-md-8 col-lg-6 col-xl-5 blur-bg-3px overflow-auto ${className} bottom-fixed-card`}
                            id={id}
                        >
                            <div className="position-sticky top-0 inx-inherit d-flex align-items-center w-100 py-2 card-top" style={{ minHeight: '2.5rem' }}>
                                <div className="border ptr clickDown card-toggler" onClick={slideOutCard}></div>
                                {closeButton &&
                                    <div className='ms-auto me-3 text-gray-600 border border-2 border-secondary border-opacity-25 rounded-circle ptr clickDown' title="Close" onClick={slideOutCard} >
                                        {closeButton === true ?
                                            <CaretDown size={35} weight='bold' className='p-2' />
                                            : closeButton
                                        }
                                    </div>
                                }
                            </div>
                            <div className="p-3 card-content">
                                {
                                    content.map((item, index) => (
                                        <Fragment key={index}>
                                            {item}
                                        </Fragment>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default BottomFixedCard;