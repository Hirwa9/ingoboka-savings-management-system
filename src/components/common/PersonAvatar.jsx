const PersonAvatar = ({
    type = 'man',
    data = {},
    size = '3rem',
    bordered = true,
    showAlt = true,
    onClick = () => { },
    className = '',
}) => {
    return (
        <>
            <img
                src={
                    type === 'man'
                        ? data?.husbandAvatar ? data?.husbandAvatar : '/images/man_avatar_image.jpg'
                        : type === 'woman' ? data?.wifeAvatar : '/images/woman_avatar_image.jpg'
                }
                alt={showAlt ? 'avatar' : ''}
                className={`w-${size} h-${size} object-fit-cover ${bordered && 'p-1 border border-3 border-secondary border-opacity-25'} bg-light rounded-circle ${className}`}
                onClick={onClick}
            />
        </>
    )
}

export default PersonAvatar;