import { CaretDown, CaretUp } from '@phosphor-icons/react';
import React from 'react';

const ContentToggler = ({ state, setState, text, className }) => {
    return (
        <div className="my-3 d-flex">
            <span className={`btn btn-sm btn-${state ? 'dark' : 'outline-secondary'} border-start-0 border-end-0 ${state ? 'fw-bold' : ''} rounded-0 ${className !== undefined ? className : ''}`}
                onClick={() => setState(!state)}
            >
                {state ?
                    <CaretUp />
                    : <CaretDown />
                } {text}
            </span>
        </div>
    )
}

export default ContentToggler;
