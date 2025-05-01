import { X } from '@phosphor-icons/react';

const Overlay = ({
    titleIcon = null,
    titleText = '',
    uppercaseTitleText = false,
    children = null,
    onClose = () => { },
    onCloseTitle = undefined,
    isSmall = false,
    isMedium = false
}) => {
    return (
        <div className={`position-fixed fixed-top inset-0 ${(isSmall || isMedium) ? 'bg-black3 py-3' : 'bg-white3'} inx-high`}>
            <div className={`${isSmall ? 'container col-md-6 col-lg-5 col-xl-4' : isMedium ? 'container col-md-9 col-lg-8 col-xl-6' : 'offset-md-3 col-md-9 offset-xl-2 col-xl-10 px-0'} h-100 overflow-auto`} style={{ animation: "zoomInBack .2s 1", maxHeight: '100%' }}>
                <div className={`${(isSmall || isMedium) ? 'container' : 'h-100 overflow-auto'} px-3 bg-light text-gray-700`} style={{ minHeight: (isSmall || isMedium) ? '100%' : undefined }}>
                    <h6 className={`sticky-top flex-align-center justify-content-between mb-2 pt-3 pb-2 bg-light text-gray-700 border-bottom ${(uppercaseTitleText || isSmall || isMedium) ? 'text-uppercase' : null}`}>
                        <div className='flex-align-center'>
                            {titleIcon}
                            <span style={{ lineHeight: 1 }} className='ms-2 pe-1'> {titleText}</span>
                        </div>
                        <div title={onCloseTitle} onClick={onClose}>
                            <X size={25} className='ptr' />
                        </div>
                    </h6>
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Overlay;