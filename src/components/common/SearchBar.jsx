
import { Form } from "react-bootstrap";
import { X } from '@phosphor-icons/react';

const SearchBar = ({
    value = '',
    setValue = () => { },
    search = () => { },
    clearSearchValue = () => { },
    reference = null,
    className = '',
    placeholder = 'Search'
}) => {


    return (
        <Form onSubmit={e => e.preventDefault()} className={className}>
            <Form.Control ref={reference} type="text" placeholder={placeholder} id='memberSearcher' className="h-2_5rem border border-2 bg-gray-200 rounded-0"
                value={value} onChange={(e) => setValue(e.target.value)}
                onKeyUp={e => { (e.key === "Enter") && search() }}
            />
            {value !== '' && (
                <X className='ptr r-middle-m me-1' onClick={clearSearchValue} />
            )}
        </Form>

    )
}

export default SearchBar;