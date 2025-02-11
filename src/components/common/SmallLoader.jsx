import React from 'react'

const SmallLoader = ({ color = 'dark', className = '' }) => {
    return (
        <span className={`loader-small w-1rem ms-2 ${className}`} style={{ '--_loader-color': `var(--bs-${color})` }}></span>
    )
}

export default SmallLoader
