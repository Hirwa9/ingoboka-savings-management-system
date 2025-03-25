import React, { useRef, useState } from 'react';
import './actionPrompt.css';
import { CaretRight } from '@phosphor-icons/react';
import SmallLoader from '../SmallLoader';

const ActionPrompt = ({ show, isStatic, message, type, inputType, selectInputOptions, promptInputValue, inputPlaceholder, action, actionText, actionIsWaiting, onClose, onCloseFallback, closeText }) => {
    message = message || 'This is an prompt component designed to submit information.';
    type = type || 'light';
    let textColor;

    // Adjust prompt color
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
    // Input value

    const [promptValue, setPromptValue] = useState('');

    // Hide card
    const slideOutCard = () => {
        cardRef.current.classList.add('flyOutT');
        setTimeout(() => {
            setPromptValue('');
            onClose();
            onCloseFallback && onCloseFallback();
        }, 400);
    }

    // Select case
    let disabledSelection;
    let filteredSelections = [];
    if (inputType === 'select') {
        disabledSelection = selectInputOptions
            .filter(val => val.default) // Remove the default object
            .map(val => val.default); // Get the default value
        disabledSelection = String(disabledSelection);
        // Remove any values same as the default value
        filteredSelections = selectInputOptions
            .filter(opt => (typeof opt === 'string' && opt !== disabledSelection));
    }

    // Set input value
    const handleOptionSelection = (e) => {
        const selectedOption = e.target.value;
        promptInputValue.current = selectedOption;
    }

    // Execute action
    const executeAction = () => {
        if (selectInputOptions.length === 0) {
            if (promptValue === '') {
                return alert('Enter a value to continue.');
            }
            promptInputValue.current = promptValue;
        }
        if (selectInputOptions.length > 0
            && (promptInputValue.current === undefined || promptInputValue.current === '')
        ) {
            return alert('Select a value to continue.');
        }
        action();
        setPromptValue(''); // Reset value
    };

    return (
        <>
            {show && (
                <div className={`${!isStatic ? 'position-fixed fixed-top inx-max inset-0' : ''} bg-white3`}>
                    <div
                        ref={cardRef}
                        className={`position-sticky top-0 mx-auto blur-bg-3px bg-${type} text-${textColor} overflow-auto rounded-4 top-fixed-prompt`}
                    >
                        <div className="fs-80">{message}</div>
                        <div className='my-3'>
                            {(inputType === "select" && selectInputOptions) ? (
                                <select
                                    name="promptSelect"
                                    id="promptSelect"
                                    className={`h-2_5rem w-100 border-1 border-${textColor} border-opacity-25 rounded-0 px-2`}
                                    defaultValue="" // First item in the filtered list
                                    onChange={handleOptionSelection}
                                >
                                    <option value="" disabled>
                                        Select a value
                                    </option>
                                    {filteredSelections.map((opt, index) => (
                                        <option key={index} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            ) : inputType === "textarea" ? (
                                <textarea name="promptTextares" id="promptTextares"
                                    className={`form-control border-bottom border-${textColor} border-opacity-25 text-gray-700 border-opacity-25 rounded-0`} placeholder={inputPlaceholder}
                                    cols="30" rows="5"
                                    value={promptValue}
                                    onChange={(e) => setPromptValue(e.target.value)}
                                ></textarea>
                            ) : (
                                <input type={inputType} className={`h-2_5rem w-100 border-1 border-${textColor} border-opacity-25 rounded-0 px-2`} placeholder={inputPlaceholder}
                                    value={promptValue}
                                    onChange={(e) => setPromptValue(e.target.value)}
                                />
                            )}
                        </div>
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
                                className={`btn btn-sm btn-${textColor} flex-align-center px-4 rounded-pill clickDown`}
                                disabled={actionIsWaiting}
                                onClick={executeAction}
                            >
                                {!actionIsWaiting ? (
                                    <>{actionText || 'Submit'} <CaretRight className='ms-1' /></>
                                ) : (
                                    <>
                                        Working <SmallLoader color='gray-500' />
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

export default ActionPrompt;