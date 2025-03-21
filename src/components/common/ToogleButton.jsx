import { CursorClick } from '@phosphor-icons/react';

const ToogleButton = ({ icon = <CursorClick />, text = 'Action', func = () => { }, className = '' }) => {
    return (
        <button className={`btn btn-sm flex-center gap-1 text-primaryColor fw-semibold border-secondary border border-opacity-25 clickDown ${className}`}
            onClick={() => func()}>
            {icon} {text}
        </button>
    )
}

export default ToogleButton;