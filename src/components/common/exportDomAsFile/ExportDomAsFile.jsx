import React, { useEffect } from 'react'
import domtoimage from "dom-to-image";
import jsPDF from "jspdf";
import { FileImage, FilePdf, X } from '@phosphor-icons/react';
import AbsoluteCloseButton from '../AbsoluteCloseButton';

const ExportDomAsFile = ({ show, container, exportName, onClose }) => {

    // Function to export as image
    const exportAsImage = ({ node, name }) => {
        const fileName = name ? `${name}.png` : "exported-image.png"; // Use the provided name or a default
        // Create image
        domtoimage.toPng(node)
            .then((dataUrl) => {
                const link = document.createElement("a");
                link.href = dataUrl;
                link.download = fileName;
                link.click();
            })
            .catch((error) => {
                console.error("Error exporting as image:", error);
            });
    };

    // Function to export as PDF
    const exportAsPDF = ({ node, name }) => {
        const fileName = name ? `${name}.pdf` : "exported-document.pdf"; // Use the provided name or a default
        domtoimage.toPng(node)
            .then((dataUrl) => {
                const pdf = new jsPDF("p", "mm", "a4"); // Create a PDF document
                const imgProps = pdf.getImageProperties(dataUrl);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
                pdf.save(fileName);
            })
            .catch((error) => {
                console.error("Error exporting as PDF:", error);
            });
    };

    // Handle key press functions
    useEffect(() => {
        const handleKeyPress = (e) => {
            // Esc to hide the component
            if (e.key === 'Escape') {
                onClose();
            }
        };

        // Attach key press event listener
        document.addEventListener('keyup', handleKeyPress);
        return () => {
            document.removeEventListener('keyup', handleKeyPress); // Clean up
        };
    }, [onClose]);

    return (
        <>
            {show && (
                <div className='position-fixed fixed-top inset-0 py-4 bg-black3 inx-high add-property-form'>
                    <div className="container w-100 h-100 d-flex overflow-auto" style={{ animation: "flyInBottom .2s 1", maxHeight: '100%' }}>
                        <div className="position-relative mx-auto mt-auto p-3 pt-4 bg-gray-200 blur-bg-3px rounded-3">
                            <AbsoluteCloseButton bg="gray-200" text="primaryColor" onClose={() => onClose()} />
                            <div className='flex-center flex-wrap gap-3 mb-4'>
                                <button className='btn btn-sm btn-outline-dark border-0 px-3 text-nowrap rounded-pill clickDown shadow-sm'
                                    onClick={() => exportAsImage({ node: container.current, name: exportName })}
                                ><FileImage weight='fill' size={20} /> Export as Image</button>
                                <button className='btn btn-sm btn-outline-dark border-0 px-3 text-nowrap rounded-pill clickDown shadow-sm'
                                    onClick={() => exportAsPDF({ node: container.current, name: exportName })}
                                ><FilePdf weight='fill' size={20} /> Export as PDF</button>
                            </div>
                            <button className='btn btn-sm text-uppercase text-primaryColor w-100 px-3 text-nowrap border rounded-pill clickDown'
                                onClick={() => onClose()}
                            ><X /> Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default ExportDomAsFile;
