import React from 'react';

const EmptyBox = ({ notFoundMessage, refreshKeyword = 'Refresh', refreshFunction, className, fluid }) => {

    return (
        <div className={`position-relative isolate mx-auto p-3 ${className !== undefined ? className : ''} peak-borders-t info-message`}>
            <img src="/images/empty_box_svg.svg" alt="Error" className="position-absolute inset-0 inx--1 object-fit-contain ptr-none" />
            <div className={` ${!fluid ? 'col-sm-8 col-md-6' : ''} mx-auto px-3 pb-3`} style={{ paddingTop: '7rem' }}>
                <p className="text-muted text-center small">{notFoundMessage}</p>
                {refreshFunction && (
                    <button className="btn btn-sm btn-outline-secondary d-block mx-auto border border-secondary border-opacity-25"
                        onClick={() => refreshFunction()}
                    >
                        {refreshKeyword ? refreshKeyword : ''}
                    </button>
                )}
            </div>
        </div>
    )
}

export default EmptyBox;