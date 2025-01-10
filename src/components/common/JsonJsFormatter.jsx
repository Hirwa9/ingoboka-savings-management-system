import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ArrowFatLineRight, Copy } from '@phosphor-icons/react';

const JsonJsFormatter = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [format, setFormat] = useState('JSON'); // JSON or JS

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    const handleFormatChange = (e) => {
        setFormat(e.target.value);
    };

    const [usePrettyPrinted, setUsePrettyPrinted] = useState(true);

    const formatInput = () => {
        if (input === '') {
            return alert(`Enter ${format} data to format.`);
        }
        try {
            if (format === 'JSON') {
                // Convert JS-like input to JSON
                const parsed = eval(`(${input})`); // Parse input as JavaScript object
                // Convert to pretty-printed JSON
                setOutput(
                    usePrettyPrinted ?
                        JSON.stringify(parsed, null, 2)
                        : JSON.stringify(parsed)
                )
            } else if (format === 'JS') {
                // Convert JSON input to JS-like output
                const parsed = JSON.parse(input); // Parse JSON input
                let jsFormatted = usePrettyPrinted ?
                    JSON.stringify(parsed, null, 2)
                    : JSON.stringify(parsed);
                jsFormatted = jsFormatted.replace(/"(\w+)":/g, '$1:') // Remove quotes around keys
                    .replace(/"([^"]*)"/g, (match, p1) =>
                        isNaN(p1) && p1 !== 'true' && p1 !== 'false' && p1 !== 'null' ? `'${p1}'` : match
                    ); // Convert string values to single-quoted strings if needed
                setOutput(jsFormatted);
            }
        } catch (error) {
            setOutput(`Error: ${error.message}`);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(output).then(
            () => alert('Output copied to clipboard!'),
            (err) => alert('Failed to copy text!')
        );
    };

    return (
        <>
            <div className="container my-4">
                <h2 className="text-center mb-4">JSON/JS Formatter</h2>
                <div className='mb-3'>
                    <h3>JSON Sample</h3>
                    <pre className='p-2 bg-gray-800 text-gray-200'>
                        <code style={{ whiteSpace: 'pre' }}>
                            {`[
    {
        "tranchNumber": 1,
        "tranchDueDate": "2025-03-28",
        "paid": false,
        "slipUrl": null,
        "finesCount": 0
    },
    {
        "tranchNumber": 2,
        "tranchDueDate": "2025-04-28",
        "paid": false,
        "slipUrl": null,
        "finesCount": 0
    }
]`}
                        </code>
                    </pre>
                </div>
                <div className="row row-gap-3">
                    {/* Input Textarea */}
                    <div className="col-md-6">
                        <textarea
                            placeholder="Enter JSON or JavaScript here..."
                            value={input}
                            onChange={handleInputChange}
                            className="form-control border-3 rounded-0"
                            rows="12"
                        ></textarea>
                    </div>

                    {/* Output Textarea */}
                    <div className="col-md-6">
                        <textarea
                            placeholder="Formatted output will appear here..."
                            value={output}
                            onChange={e => setOutput(e.target.value)}
                            // readOnly
                            className="form-control border-3 rounded-0"
                            rows="12"
                        ></textarea>
                    </div>
                </div>

                {/* Format Options and Button */}
                <div className="row my-3">
                    <div className="col-md-6">
                        <div className="mb-3">
                            <label className="form-label">Format as:</label>
                            <select
                                value={format}
                                onChange={handleFormatChange}
                                className="form-select"
                            >
                                <option value="JSON">JSON</option>
                                <option value="JS">JS</option>
                            </select>
                        </div>

                        <div className="mb-3 flex-align-center gap-2">
                            <input type="checkbox" name="" id="usePretty"
                                onChange={() => setUsePrettyPrinted(!usePrettyPrinted)}
                                checked={usePrettyPrinted}
                            />
                            <label htmlFor="usePretty">Use pretty code</label>
                        </div>
                    </div>
                    <div className="col-md-6 d-flex align-items-end">
                        <button
                            onClick={formatInput}
                            className="btn btn-primary w-100 rounded-0"
                        >
                            <ArrowFatLineRight /> Format to {format}
                        </button>
                    </div>
                </div>

                {/* Copy Button */}
                <div className="row">
                    <div className="col-md-12 text-center">
                        <button
                            onClick={copyToClipboard}
                            className="btn btn-outline-success rounded-0"
                        >
                            <Copy /> Copy Formatted Output
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default JsonJsFormatter;