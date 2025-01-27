import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import mammoth from 'mammoth';
import { saveAs } from 'file-saver';

const PreviewModal = ({ show, handleClose, documentContent, handleEdit }) => {
    const [htmlContent, setHtmlContent] = useState('');

    const handleDownload = () => {
        const blob = new Blob([documentContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        saveAs(blob, "questions_with_options.docx");
    };

    const generateDocument = async () => {
        try {
            const { value } = await mammoth.convertToHtml({ arrayBuffer: documentContent }, {
                convertImage: mammoth.images.imgElement((image) => {
                    return image.read("base64").then((imageBuffer) => {
                        return {
                            src: `data:${image.contentType};base64,${imageBuffer}`
                        };
                    });
                })
            });
            setHtmlContent(value);
        } catch (error) {
            console.error("Error creating the document:", error);
        }
    };

    useEffect(() => {
        if (show) {
            generateDocument();
        }
    }, [show]);

    return (
        <Modal show={show} onHide={handleClose} size="lg" className="preview-modal">
            <Modal.Header >
                <Modal.Title>Document Preview</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="document-container" dangerouslySetInnerHTML={{ __html: htmlContent }} />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleEdit}>
                    Edit
                </Button>
                <Button variant="primary" onClick={handleDownload}>
                    Download
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default PreviewModal;