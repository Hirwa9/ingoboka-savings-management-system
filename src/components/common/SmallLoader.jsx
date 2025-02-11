import React from 'react'

const SmallLoader = ({ color = 'dark', className = '' }) => {
    return (
        <span className={`d-block w-1rem flex-shrink-0 ms-2 ${className} loader-small`} style={{ '--_loader-color': `var(--bs-${color})` }}></span>
    )
}

export default SmallLoader
