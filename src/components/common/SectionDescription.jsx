const SectionDescription = ({
    imagePath = '',
    content = '',
    showImageOnMobile = false
}) => {
    return (
        <div className="d-lg-flex align-items-center">
            {imagePath ?
                <img src={imagePath} alt="" className={`col-md-5 ${showImageOnMobile ? 'd-none d-lg-block' : null}`} />
                : null
            }
            <div className='alert mb-4 rounded-0 smaller fw-light'>
                {content}
            </div>
        </div>
    )
}

export default SectionDescription;