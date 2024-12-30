import React, { useRef, useState } from 'react';
import './formInput.css';

const FormInput = (props) => {
    const [inputHasData, setInputHasData] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const inputRef = useRef();
    const handleChange = (e) => {
        const val = e.target.value;
        // Set state based on the input's value
        if (val !== undefined && val !== '') {
            setInputHasData(true);
        } else {
            setInputHasData(false);
        }
    };

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    return (
        <>
            <div className={` ${props.moreformInputElementClasses} form-input-element`}>
                <input
                    type={isPasswordVisible ? 'text' : props.inputType}
                    id={props.inputId}
                    placeholder={props.placeholder}
                    className={`form-control ${props.moreInputClasses} ${inputHasData ? 'has-data' : ''}`}
                    ref={inputRef}
                    onChange={handleChange}  // Pass the event to handleChange
                />
                <label htmlFor={props.inputId} className={`form-label ${props.moreLabelClasses}`}>
                    {props.labelText}
                </label>
                {props.togglePassword && inputHasData && (
                    <button
                        type="button"
                        className={`fa ${isPasswordVisible ? 'fa-eye-slash' : 'fa-eye'} togglePWview`}
                        onClick={togglePasswordVisibility}
                    ></button>
                )}
            </div>
        </>
    );
};

export default FormInput;