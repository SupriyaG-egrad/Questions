import React, { useState, useEffect, useContext } from 'react';
import { QuestionsContext } from './QuestionsContext';
import './Questions.css';

const ParagraphCreation = ({ includeSolution, processImage }) => {
    const { Paragraphs, setParagraphs,questionCount } = useContext(QuestionsContext);
    const [numberOfQuestions, setNumberOfQuestions] = useState('');
    const [clickedBox, setClickedBox] = useState(null);

    // Helper function to handle image paste logic
    const handleImagePaste = (e, questionIndex, optionIndex = null, isSolution = false, isParagraph = false) => {
        e.preventDefault();
        const clipboardItems = e.clipboardData.items;
      
        for (let i = 0; i < clipboardItems.length; i++) {
          if (clipboardItems[i].type.startsWith('image/')) {
            const file = clipboardItems[i].getAsFile();
            const reader = new FileReader();
            reader.onload = () => {
              // Ensure the Paragraphs array and the specific question exist
              const updatedParagraphs = [...Paragraphs];
              updatedParagraphs[questionIndex] = updatedParagraphs[questionIndex] || {
                paraOptions: Array(4).fill({ isCorrect: false, image: null }), // Ensure paraOptions is always an array
                paraquestionImage: '',
                paragraphImage: '',
                paragraphSolutionImage: ''
              };
      
              if (isParagraph) {
                // For paragraph images
                if (isSolution) {
                  updatedParagraphs[questionIndex].paragraphSolutionImage = reader.result;
                } else {
                  updatedParagraphs[questionIndex].paragraphImage = reader.result;
                }
              } else {
                // For question images or option images
                if (isSolution) {
                  if (optionIndex !== null && updatedParagraphs[questionIndex].paraOptions[optionIndex]) {
                    updatedParagraphs[questionIndex].paraOptions[optionIndex].image = reader.result;
                  } else {
                    updatedParagraphs[questionIndex].paraquestionImage = reader.result;
                  }
                } else {
                  if (optionIndex !== undefined && updatedParagraphs[questionIndex].paraOptions[optionIndex]) {
                    updatedParagraphs[questionIndex].paraOptions[optionIndex].image = reader.result;
                  } else {
                    updatedParagraphs[questionIndex].paraquestionImage = reader.result;
                  }
                }
              }
      
              setParagraphs(updatedParagraphs);
            };
            reader.readAsDataURL(file);
            break;
          }
        }
      };
      


    // Update the number of questions and generate default structure
    const updateQuestions = (numQuestions) => {
        const parsedNum = parseInt(numQuestions);
        if (isNaN(parsedNum) || parsedNum < 0) return;

        const newQuestions = Array.from({ length: parsedNum }, () => ({
            questionType: 'mcq',
            paraOptions: [
              { isCorrect: false, image: null },
              { isCorrect: false, image: null },
              { isCorrect: false, image: null },
              { isCorrect: false, image: null },
            ],
            paraanswers: '',
            paraquestionImage: '',
            paragraphImage: '',
            paragraphSolutionImage: '',
          }));
          setParagraphs(newQuestions)
    };

    // Handle the question type change
    const handleQuestionTypeChange = (index, type) => {
        const updatedParagraphs = [...Paragraphs];
        updatedParagraphs[index].questionType = type;
        setParagraphs(updatedParagraphs);
    };

    // Handle the answer change
    const handleAnswerChange = (questionIndex, newAnswer, optionIndex = null) => {
        const updatedParagraphs = [...Paragraphs];
        const question = updatedParagraphs[questionIndex];

        if (question.questionType === 'mcq') {
            updatedParagraphs[questionIndex].paraanswers = newAnswer;
            updatedParagraphs[questionIndex].paraOptions.forEach((option, idx) => {
                option.isCorrect = idx === optionIndex;
            });
        } else if (question.questionType === 'msq') {
            const updatedOptions = [...question.paraOptions];
            updatedOptions[optionIndex].isCorrect = !updatedOptions[optionIndex].isCorrect;

            if (updatedOptions.filter(option => option.isCorrect).length > 2) {
                updatedOptions[optionIndex].isCorrect = false;
                alert('You can only select up to 2 options for MSQ questions.');
            }

            updatedParagraphs[questionIndex].paraOptions = updatedOptions;
            updatedParagraphs[questionIndex].paraanswers = updatedOptions
                .map((option, idx) => String.fromCharCode(65 + idx)); // Correct options as letters (A, B, C, D)
        } else {
            updatedParagraphs[questionIndex].paraanswers = newAnswer;
        }

        setParagraphs(updatedParagraphs);
    };

    useEffect(() => {
        updateQuestions(numberOfQuestions);
    }, [numberOfQuestions]);

    return (
        <div>
            <div className="mcq-container">
                <div className="question-wrapper">
                    {/* Paragraph Image Section */}
                    <div className="paragraph-image-container">
                        <h3>Paste Image for Paragraph</h3>
                        <div
                            className={`option box ${clickedBox === 'paragraph-image' ? 'clicked' : ''}`}
                            onClick={() => setClickedBox('paragraph-image')}
                            onPaste={(e) => handleImagePaste(e, 0, null, false, true)}
                        >
                            {Paragraphs[0]?.paragraphImage ? (
                                <>
                                    <img src={Paragraphs[0].paragraphImage} alt="Paragraph" style={{ maxWidth: '100%' }} />
                                    <button onClick={() => handleImagePaste({ target: { value: null } }, 0, null, false, true)} className="remove-button">
                                        Remove Image
                                    </button>
                                </>
                            ) : (
                                'Paste your paragraph image here (ctrl+v)'
                            )}
                        </div>
                    </div>

                    {/* Optional Solution Image Section */}
                    {includeSolution && (
                        <div className="solution-image-container">
                            <h3>Paste Image for Solution</h3>
                            <div
                                className={`option box ${clickedBox === 'solution-image' ? 'clicked' : ''}`}
                                onClick={() => setClickedBox('solution-image')}
                                onPaste={(e) => handleImagePaste(e, 0, null, true, true)}
                            >
                                {Paragraphs[0]?.paragraphSolutionImage ? (
                                    <>
                                        <img src={Paragraphs[0].paragraphSolutionImage} alt="Solution" style={{ maxWidth: '100%' }} />
                                        <button onClick={() => handleImagePaste({ target: { value: null } }, 0, null, true, true)} className="remove-button">
                                            Remove Image
                                        </button>
                                    </>
                                ) : (
                                    'Paste your solution image here (ctrl+v)'
                                )}
                            </div>
                        </div>
                    )}


                    {/* Number of Questions Input */}
                    <div>
                        <input
                            className="input-field"
                            type="number"
                            value={numberOfQuestions}
                            onChange={(e) => setNumberOfQuestions(e.target.value)}
                            placeholder="Enter number of questions"
                        />
                    </div>

                    {/* Questions Section */}
                    { numberOfQuestions>0 && Paragraphs.map((question, index) => (
                        <div key={index} className="question-section">
                            <h3>Question {index + 1}</h3>

                            {/* Question Type Dropdown */}
                            <div>
                                <label>Select Question Type:</label>
                                <select
                                    style={{ padding: '5px', border: '1px solid', borderRadius: '17px', margin: '12px' }}
                                    value={question.questionType}
                                    onChange={(e) => handleQuestionTypeChange(index, e.target.value)}
                                >
                                    <option value="mcq">MCQ</option>
                                    <option value="msq">MSQ</option>
                                    <option value="nit">NIT</option>
                                    <option value="truefalse">True/False</option>
                                </select>
                            </div>

                            {/* Question Image */}
                            <div className="question-image-container">
                                <h3>Paste Image for Question</h3>
                                <div
                                    className={`option box ${clickedBox === `question-${index}` ? 'clicked' : ''}`}
                                    onClick={() => setClickedBox(`question-${index}`)}
                                    onPaste={(e) => handleImagePaste(e, index)}
                                >
                                    {question.paraquestionImage ? (
                                        <>
                                            <img
                                                src={question.paraquestionImage}
                                                alt={`Question ${index + 1}`}
                                                style={{ maxWidth: '100%' }}
                                            />
                                            <button onClick={() => handleImagePaste({ target: { value: null } }, index)} className="remove-button">
                                                Remove Image
                                            </button>
                                        </>
                                    ) : (
                                        'Paste your question image here (ctrl+v)'
                                    )}
                                </div>
                            </div>

                            {/* Options Section */}
                            <h4>Options</h4>
                            {question.questionType === 'truefalse' ? (
                                <div className="truefalse-options">
                                    <label>
                                        <input
                                            type="radio"
                                            name={`option-${index}`}
                                            value="True"
                                            onChange={() => handleAnswerChange(index, 'True')}
                                        />
                                        True
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name={`option-${index}`}
                                            value="False"
                                            onChange={() => handleAnswerChange(index, 'False')}
                                        />
                                        False
                                    </label>
                                </div>
                            ) : question.questionType === 'nit' ? (
                                <div className="nit-option">
                                    <input
                                        className="answer-input"
                                        type="text"
                                        value={question.paraanswers}
                                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                                        placeholder="Enter numeric answer"
                                    />
                                </div>
                            ) : (
                                question.paraOptions.map((option, optionIndex) => (
                                    <div key={optionIndex} className="option-item">
                                        <div>
                                            <label>
                                                <input
                                                    name={`option-${index}`}
                                                    type={question.questionType === 'msq' ? 'checkbox' : 'radio'}
                                                    value={option.isCorrect}
                                                    onChange={() => handleAnswerChange(index, String.fromCharCode(65 + optionIndex), optionIndex)}
                                                />
                                                Option {String.fromCharCode(65 + optionIndex)}
                                            </label>
                                            <div
                                                className={`option-box ${clickedBox === `option-${index}-${optionIndex}` ? 'clicked' : ''}`}
                                                onClick={() => setClickedBox(`option-${index}-${optionIndex}`)}
                                                onPaste={(e) => handleImagePaste(e, index, optionIndex)}
                                            >
                                                {option.image ? (
                                                    <>
                                                        <img src={option.image} alt={`Option ${String.fromCharCode(65 + optionIndex)}`} style={{ maxWidth: '100%' }} />
                                                        <button onClick={() => handleImagePaste({ target: { value: null } }, index, optionIndex)} className="remove-button">
                                                            Remove Image
                                                        </button>
                                                    </>
                                                ) : (
                                                    'Paste your option image here (ctrl+v)'
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ParagraphCreation;