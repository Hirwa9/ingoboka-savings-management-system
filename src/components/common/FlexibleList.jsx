const FlexibleList = ({ list = [], rounded = true, containerBg = 'gray-300', listItemBg = 'light', color = 'gray-700', className = '' }) => {
    return (
        <ul className={`list-unstyled d-flex align-items-start gap-2 flex-wrap w-fit bg-${containerBg} p-2 ${rounded ? 'rounded-3' : null} ${className}`}>
            {list.map((item, index) => (
                <li key={index} className={`flex-align-center gap-2 ${item?.icon ? 'ps-3 pe-2' : 'px-3'} py-1 bg-${listItemBg} text-${color} ${rounded ? 'rounded-2' : null}`}>
                    <span className='text-capitalize'>{item?.title}</span> {item?.icon && item?.icon}
                </li>
            ))}
        </ul>
    )
}

export default FlexibleList;
