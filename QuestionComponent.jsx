import React, { useState, useContext, useEffect } from 'react';
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, ImageRun, TextRun } from "docx";
import './Questions.css';
import { QuestionsContext } from './QuestionsContext.jsx';
import PreviewModal from './PreviewModal.jsx';


const Management = () => {
    const [showModal, setShowModal] = useState(false);
    const [documentContent, setDocumentContent] = useState([]);
    const {
        positiveMarks, negativeMarks, setPositiveMarks, setNegativeMarks,
        Questions, setQuestions,
        Paragraphs, setParagraphs
    } = useContext(QuestionsContext);

    const [selectedType, setSelectedQuestionType] = useState("Mcq");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for sidebar visibility
    const [clickedBox, setClickedBox] = useState(null);
    const [includeSolution, setIncludeSolution] = useState(true); // Option to include solution images
    const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0); // State for selected question index
    const [addOptionE, setAddOptionE] = useState(false); // State for adding Option E

    useEffect(() => {
        // Handle screen width check
        const checkScreenWidth = () => {
            const screenWidth = window.innerWidth;
            if (screenWidth >= 768 && screenWidth <= 1024) {
                alert('This website is not available on tablet view due to the size of the images decreasing.');
            }
        };
        checkScreenWidth();
        window.addEventListener('resize', checkScreenWidth);
        return () => {
            window.removeEventListener('resize', checkScreenWidth);
        };
    }, []);

    const handleSave = async () => {
        // Your existing save logic here
    };

    const handleEdit = () => {
        setShowModal(false);
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(prevState => !prevState); // Toggle sidebar visibility
    };

    const addNewQuestion = () => {
        const newQuestion = {
            questionNumber: Questions.length + 1,
            questionType: selectedType.toLowerCase(), // Use the selected type
            questionImage: null,
            solutionImage: null,
            assertionImage: null, // Add assertion image
            reasonImage: null, // Add reason image
            options: [
                { text: 'Option A', isCorrect: false, image: null },
                { text: 'Option B', isCorrect: false, image: null },
                { text: 'Option C', isCorrect: false, image: null },
                { text: 'Option D', isCorrect: false, image: null },
            ],
            answer: '',
            includeSolution: true, // Include solution by default
        };
        setQuestions(prev => [...prev, newQuestion]);
    };

    const addNewParagraph = () => {
        const newParagraph = {
            questionNumber: Paragraphs.length + 1,
            questions: [],
            paragraphImage: '',
            paragraphSolutionImage: '',
        };
        setParagraphs(prev => [...prev, newParagraph]);
    };

    const updateImage = (updatedItems, index, questionIndex, optionIndex, readerResult, type, isParagraph) => {
        if (isParagraph) {
            if (type === 'paragraph') {
                updatedItems[index].paragraphImage = readerResult;
            } else if (type === 'solution') {
                updatedItems[index].paragraphSolutionImage = readerResult;
            }
        } else {
            if (type === 'question') {
                updatedItems[index].questionImage = readerResult;
            } else if (type === 'solution') {
                updatedItems[index].solutionImage = readerResult;
            } else if (type === 'assertion') {
                updatedItems[index].assertionImage = readerResult;
            } else if (type === 'reason') {
                updatedItems[index].reasonImage = readerResult;
            } else if (type.startsWith('option')) {
                const optionIndex = parseInt(type.split('-')[1]);
                updatedItems[index].options[optionIndex].image = readerResult;
            }
        }
        return updatedItems;
    };

    const handleImagePaste = (e, index, type, isParagraph = false) => {
        e.preventDefault();
        const clipboardItems = e.clipboardData.items;
        for (let i = 0; i < clipboardItems.length; i++) {
            if (clipboardItems[i].type.startsWith('image/')) {
                const file = clipboardItems[i].getAsFile();
                const reader = new FileReader();
                reader.onload = () => {
                    if (isParagraph) {
                        const updatedParagraphs = updateImage([...Paragraphs], index, null, null, reader.result, type, true);
                        setParagraphs(updatedParagraphs);
                    } else {
                        const updatedQuestions = updateImage([...Questions], index, null, null, reader.result, type, false);
                        setQuestions(updatedQuestions);
                    }
                };
                reader.readAsDataURL(file);
                break;
            }
        }
    };

    const handleRemoveImage = (index, type, isParagraph = false) => {
        if (isParagraph) {
            setParagraphs((prevParagraphs) => {
                const updatedParagraphs = [...prevParagraphs];
                if (type === 'paragraph') {
                    updatedParagraphs[index].paragraphImage = null;
                } else if (type === 'solution') {
                    updatedParagraphs[index].paragraphSolutionImage = null;
                }
                return updatedParagraphs;
            });
        } else {
            setQuestions((prevQuestions) => {
                const updatedQuestions = [...prevQuestions];
                if (type === 'question') {
                    updatedQuestions[index].questionImage = null;
                } else if (type === 'solution') {
                    updatedQuestions[index].solutionImage = null;
                } else if (type === 'assertion') {
                    updatedQuestions[index].assertionImage = null;
                } else if (type === 'reason') {
                    updatedQuestions[index].reasonImage = null;
                } else if (type.startsWith('option')) {
                    const optionIndex = parseInt(type.split('-')[1]);
                    updatedQuestions[index].options[optionIndex].image = null;
                }
                return updatedQuestions;
            });
        }
    };

    const handleQuestionTypeChange = (index, newType) => {
        setQuestions((prevQuestions) => {
            const updatedQuestions = [...prevQuestions];
            updatedQuestions[index].questionType = newType;
            if (newType === 'truefalse') {
                updatedQuestions[index].options = [
                    { text: 'True', isCorrect: false, image: null },
                    { text: 'False', isCorrect: false, image: null },
                ];
            } else if (newType === 'nit') {
                updatedQuestions[index].answer = '';
            } else if (newType === 'assertion') {
                updatedQuestions[index].assertionImage = null;
                updatedQuestions[index].reasonImage = null;
            }
            return updatedQuestions;
        });
    };
    const handleSidebarQuestionTypeChange = (index, newType) => {
        setQuestions((prevQuestions) => {
          const updatedQuestions = [...prevQuestions];
          const question = updatedQuestions[index];
      
          // Reset answer state
          question.answer = '';
      
          question.questionType = newType;
          if (newType === 'truefalse') {
            question.options = [
              { text: 'True', isCorrect: false, image: null },
              { text: 'False', isCorrect: false, image: null },
            ];
          } else if (newType === 'nit') {
            question.answer = '';
          } else if (newType === 'assertion') {
            question.assertionImage = null;
            question.reasonImage = null;
            question.options = [
              { text: 'Option A', isCorrect: false, image: null },
              { text: 'Option B', isCorrect: false, image: null },
              { text: 'Option C', isCorrect: false, image: null },
              { text: 'Option D', isCorrect: false, image: null },
            ];
          } else if (newType === 'mcq') {
            question.options = [
              { text: 'Option A', isCorrect: false, image: null },
              { text: 'Option B', isCorrect: false, image: null },
              { text: 'Option C', isCorrect: false, image: null },
              { text: 'Option D', isCorrect: false, image: null },
            ];
          } else if (newType === 'msq') {
            question.options = [
              { text: 'Option A', isCorrect: false, image: null },
              { text: 'Option B', isCorrect: false, image: null },
              { text: 'Option C', isCorrect: false, image: null },
              { text: 'Option D', isCorrect: false, image: null },
            ];
          }
      
          return updatedQuestions;
        });
      };
      const handleAnswerChange = (index, answer, optionIndex) => {
        setQuestions((prevQuestions) => {
          const updatedQuestions = [...prevQuestions];
          const question = updatedQuestions[index];
      
          // Reset answer state for all question types
          question.answer = '';
      
          if (question.questionType === 'mcq') {
            question.answer = String.fromCharCode(65 + optionIndex);
            question.options = [
              { text: 'Option A', isCorrect: false, image: null },
              { text: 'Option B', isCorrect: false, image: null },
              { text: 'Option C', isCorrect: false, image: null },
              { text: 'Option D', isCorrect: false, image: null },
            ];
            question.options[optionIndex].isCorrect = true;
          } else if (question.questionType === 'truefalse') {
            question.answer = answer;
            question.options = [
              { text: 'True', isCorrect: answer === 'True', image: null },
              { text: 'False', isCorrect: answer === 'False', image: null },
            ];
          } else if (question.questionType === 'assertion') {
            question.answer = String.fromCharCode(65 + optionIndex);
            question.options = [
              { text: 'Option A', isCorrect: false, image: null },
              { text: 'Option B', isCorrect: false, image: null },
              { text: 'Option C', isCorrect: false, image: null },
              { text: 'Option D', isCorrect: false, image: null },
            ];
            question.options[optionIndex].isCorrect = true;
          } else if (question.questionType === 'msq') {
            const selectedOptions = question.answer ? question.answer.split(',') : [];
            const newOption = String.fromCharCode(65 + optionIndex);
      
            if (selectedOptions.includes(newOption)) {
              // Remove the option if it was already selected
              question.answer = selectedOptions.filter(option => option !== newOption).join(',');
            } else {
              // Add the option if it was not selected
              question.answer = [...selectedOptions, newOption].join(',');
            }
      
            // Limit the number of selected options to 2
            if (question.answer.split(',').length > 2) {
              question.answer = selectedOptions.join(',');
              alert('You can only select up to 2 options for MSQ questions.');
            }
            question.options = [
              { text: 'Option A', isCorrect: false, image: null },
              { text: 'Option B', isCorrect: false, image: null },
              { text: 'Option C', isCorrect: false, image: null },
              { text: 'Option D', isCorrect: false, image: null },
            ];
          }
      
          return updatedQuestions;
        });
      };
      const handleNITAnswerChange = (index, answer) => {
        const regex = /^[^a-zA-Z]*$/; // Regular expression to allow everything except alphabets
        if (regex.test(answer)) {
          setQuestions((prevQuestions) => {
            const updatedQuestions = [...prevQuestions];
            updatedQuestions[index].answer = answer;
            return updatedQuestions;
          });
        } else {
          alert('Only numeric values and special characters are allowed for NIT questions.');
        }
      };
  const handleClickBox = (box) => {
      setClickedBox(box);
  };

  const handleIncludeSolutionChange = (index) => {
      setQuestions((prevQuestions) => {
          const updatedQuestions = [...prevQuestions];
          updatedQuestions[index].includeSolution = !updatedQuestions[index].includeSolution;
          if (!updatedQuestions[index].includeSolution) {
              updatedQuestions[index].solutionImage = null;
          }
          return updatedQuestions;
      });
  };

  const handleAddOptionEChange = (index) => {
      setAddOptionE((prev) => !prev);
      setQuestions((prevQuestions) => {
          const updatedQuestions = [...prevQuestions];
          if (!addOptionE) {
              const newOption = { text: `Option ${String.fromCharCode(65 + updatedQuestions[index].options.length)}`, isCorrect: false, image: null };
              updatedQuestions[index].options.push(newOption);
          } else {
              updatedQuestions[index].options.pop();
          }
          return updatedQuestions;
      });
  };

  const handleNumQuestionsChange = (paragraphIndex, value) => {
      const updatedParagraphs = [...Paragraphs];
      const numQuestions = Math.max(1, parseInt(value) || 1);
      const currentParagraph = updatedParagraphs[paragraphIndex] || { questions: [] };
      while (currentParagraph.questions.length < numQuestions) {
          currentParagraph.questions.push({
              paraOptions: Array(4).fill({ isCorrect: false, image: null }),
              paraanswers: '',
              paraquestionImage: '',
              questionType: 'mcq',
          });
      }
      while (currentParagraph.questions.length > numQuestions) {
          currentParagraph.questions.pop();
      }
      updatedParagraphs[paragraphIndex] = currentParagraph;
      setParagraphs(updatedParagraphs);
  };

  const handleParagraphQuestionTypeChange = (paragraphIndex, questionIndex, type) => {
      const updatedParagraphs = [...Paragraphs];
      updatedParagraphs[paragraphIndex].questions[questionIndex].questionType = type;
      setParagraphs(updatedParagraphs);
  };

  const handleParagraphAnswerChange = (paragraphIndex, questionIndex, newAnswer, optionIndex = null) => {
      const updatedParagraphs = [...Paragraphs];
      const question = updatedParagraphs[paragraphIndex].questions[questionIndex];
      const questionType = question.questionType;
      if (questionType === 'mcq') {
          question.paraanswers = newAnswer;
          question.paraOptions = question.paraOptions.map((option, idx) => ({
              ...option,
              isCorrect: idx === optionIndex,
          }));
      } else if (questionType === 'msq') {
          question.paraOptions[optionIndex].isCorrect = !question.paraOptions[optionIndex].isCorrect;
          const selectedOptions = question.paraOptions
              .map((option, idx) => (option.isCorrect ? String.fromCharCode(65 + idx) : null))
              .filter(Boolean);
          question.paraanswers = selectedOptions;
          if (selectedOptions.length > 2) {
              question.paraOptions[optionIndex].isCorrect = false;
              alert('You can only select up to 2 options for MSQ questions.');
          }
      } else if (questionType === 'truefalse') {
          question.paraanswers = newAnswer;
          question.paraOptions = question.paraOptions.map(option => ({
              ...option,
              isCorrect: option.text === newAnswer,
          }));
      } else if (questionType === 'nit') {
          if (/\D/.test(newAnswer)) {
              alert('Only numbers allowed for numeric input type (NIT)');
              return;
          }
          question.paraanswers = newAnswer;
      }
      setParagraphs(updatedParagraphs);
  };

  const removeParagraph = (paragraphIndex) => {
      setParagraphs(prev => {
          const updatedParagraphs = prev.filter((_, index) => index !== paragraphIndex);
          return updatedParagraphs;
      });
  };
  const renderOptions = (question, index) => {
    return question.options.map((option, optionIndex) => (
        <div key={optionIndex} className="option-item">
            <label>
                <input
                    type={question.questionType === 'mcq' || question.questionType === 'assertion' || question.questionType === 'truefalse' ? 'radio' : 'checkbox'}
                    name={`answer-${index}`}
                    checked={question.questionType === 'mcq' ? question.answer === String.fromCharCode(65 + optionIndex) : question.questionType === 'truefalse' ? question.answer === option.text : question.questionType === 'assertion' ? question.answer === String.fromCharCode(65 + optionIndex) : question.answer.split(',').includes(String.fromCharCode(65 + optionIndex))}
                    onChange={() => handleAnswerChange(index, String.fromCharCode(65 + optionIndex), optionIndex)}
                />
                {option.text}
            </label>
            <div
                className={`option-box ${clickedBox === `option-${index}-${optionIndex}` ? 'clicked' : ''}`}
                onClick={() => handleClickBox(`option-${index}-${optionIndex}`)}
                onPaste={(e) => handleImagePaste(e, index, `option-${optionIndex}`)}
            >
                {option.image ? (
                    <>
                        <img src={option.image} alt={`Option ${String.fromCharCode(65 + optionIndex)}`} style={{ maxWidth: '100%' }} />
                        <button onClick={() => handleRemoveImage(index, `option-${optionIndex}`)} className="remove-button">Remove</button>
                    </>
                ) : (
                    'Paste your option image here (Ctrl+V)'
                )}
            </div>
        </div>
    ));
};

const renderQuestions = () => {
    return Questions.map((question, index) => (
        <div key={index} className="question-item">
            <h3>{question.questionType.toUpperCase()} Question {question.questionNumber}</h3>
            {/* Question Image Section */}
            <div className="question-image-container">
                <h3>Paste Image for Question</h3>
                <div
                    className={`option-box ${clickedBox === `question-${index}` ? 'clicked' : ''}`}
                    onClick={() => handleClickBox(`question-${index}`)}
                    onPaste={(e) => handleImagePaste(e, index, 'question')}
                >
                    {question.questionImage ? (
                        <>
                            <img src={question.questionImage} alt={`Question ${index + 1}`} style={{ maxWidth: '100%' }} />
                            <button onClick={() => handleRemoveImage(index, 'question')} className="remove-button">Remove</button>
                        </>
                    ) : (
                        'Paste your question image here (Ctrl+V)'
                    )}
                </div>
            </div>
            {/* Assertion and Reason Images Section */}
            {question.questionType === 'assertion' && (
                <div className="assertion-image-container">
                    <h3>Paste Image for Assertion</h3>
                    <div
                        className={`option-box ${clickedBox === `assertion-${index}` ? 'clicked' : ''}`}
                        onClick={() => handleClickBox(`assertion-${index}`)}
                        onPaste={(e) => handleImagePaste(e, index, 'assertion')}
                    >
                        {question.assertionImage ? (
                            <>
                                <img src={question.assertionImage} alt={`Assertion ${index + 1}`} style={{ maxWidth: '100%' }} />
                                <button onClick={() => handleRemoveImage(index, 'assertion')} className="remove-button">Remove</button>
                            </>
                        ) : (
                            'Paste your assertion image here (Ctrl+V)'
                        )}
                    </div>
                </div>
            )}
            {/* Options Section */}
            {question.questionType !== 'nit' && question.questionType !== 'assertion' && renderOptions(question, index)}
            {/* Assertion Options Section */}
            {question.questionType === 'assertion' && (
                <div className="assertion-options-container">
                    <label>Options:</label>
                    {renderOptions(question, index)}
                    <div className="selected-answer-box">
                        Selected Answer: {question.answer}
                    </div>
                </div>
            )}
            {/* NIT Answer Box */}
            {question.questionType === 'nit' && (
                <div className="nit-answer-container">
                    <label>Answer:</label>
                    <input
                        type="text"
                        value={question.answer}
                        onChange={(e) => handleNITAnswerChange(index, e.target.value)}
                        pattern="[0-9]*"
                    />
                </div>
            )}
            {/* Solution Image Section */}
            {question.includeSolution && (
                <div className="solution-image-container">
                    <h3>Paste Image for Solution</h3>
                    <div
                        className={`option-box ${clickedBox === `solution-${index}` ? 'clicked' : ''}`}
                        onClick={() => handleClickBox(`solution-${index}`)}
                        onPaste={(e) => handleImagePaste(e, index, 'solution')}
                    >
                        {question.solutionImage ? (
                            <>
                                <img src={question.solutionImage} alt={`Solution ${index + 1}`} style={{ maxWidth: '100%' }} />
                                <button onClick={() => handleRemoveImage(index, 'solution')} className="remove-button">Remove</button>
                            </>
                        ) : (
                            'Paste your solution image here (Ctrl+V)'
                        )}
                    </div>
                </div>
            )}
            {/* Selected Answer Box */}
            <div className="selected-answer-container">
                <label>Selected Answer:</label>
                {question.questionType === 'mcq' && (
                    <input type="text" value={question.answer} readOnly />
                )}
                {question.questionType === 'msq' && (
                    <input type="text" value={question.answer.split(',').join(', ')} readOnly />
                )}
                {question.questionType === 'truefalse' && (
                    <input type="text" value={question.answer} readOnly />
                )}
            </div>
        </div>
    ));
};
    const renderParagraphs = () => {
        return Paragraphs.map((paragraph, paragraphIndex) => (
            <div key={paragraphIndex} className="paragraph-section">
                <h3>Paragraph {paragraph.questionNumber}</h3>
                <input
                    className="input-field"
                    type="number"
                    min={1}
                    value={paragraph.questions?.length || 1}
                    onChange={(e) => handleNumQuestionsChange(paragraphIndex, e.target.value)}
                    placeholder="Number of Questions"
                />
                <div className="paragraph-image-container">
                    <h3>Paste Image for Paragraph</h3>
                    <div
                        className={`option-box ${clickedBox === `paragraph-image-${paragraphIndex}` ? 'clicked' : ''}`}
                        onClick={() => setClickedBox(`paragraph-image-${paragraphIndex}`)}
                        onPaste={(e) => handleImagePaste(e, paragraphIndex, 'paragraph', true)}
                    >
                        {paragraph.paragraphImage ? (
                            <>
                                <img src={paragraph.paragraphImage} alt="Paragraph" style={{ maxWidth: '100%' }} />
                                <button onClick={() => handleRemoveImage(paragraphIndex, 'paragraph', true)} className="remove-button">Remove Image</button>
                            </>
                        ) : (
                            'Paste your paragraph image here (Ctrl+V)'
                        )}
                    </div>
                </div>
                {includeSolution && (
                    <div className="solution-image-container">
                        <h3>Paste Image for Solution</h3>
                        <div
                            className={`option-box ${clickedBox === `solution-image-${paragraphIndex}` ? 'clicked' : ''}`}
                            onClick={() => setClickedBox(`solution-image-${paragraphIndex}`)}
                            onPaste={(e) => handleImagePaste(e, paragraphIndex, 'solution', true)}
                        >
                            {paragraph.paragraphSolutionImage ? (
                                <>
                                    <img src={paragraph.paragraphSolutionImage} alt="Solution" style={{ maxWidth: '100%' }} />
                                    <button onClick={() => handleRemoveImage(paragraphIndex, 'solution', true)} className="remove-button">Remove Image</button>
                                </>
                            ) : (
                                'Paste your solution image here (Ctrl+V)'
                            )}
                        </div>
                    </div>
                )}
                {paragraph.questions?.map((question, questionIndex) => (
                    <div key={questionIndex} className="question-section">
                        <h4>Question {questionIndex + 1}</h4>
                        <div className="question-image-container">
                            <h3>Paste Image for Question</h3>
                            <div
                                className={`option-box ${clickedBox === `question-${paragraphIndex}-${questionIndex}` ? 'clicked' : ''}`}
                                onClick={() => setClickedBox(`question-${paragraphIndex}-${questionIndex}`)}
                                onPaste={(e) => handleImagePaste(e, paragraphIndex, questionIndex, null, false, true)}
                            >
                                {question.paraquestionImage ? (
                                    <>
                                        <img src={question.paraquestionImage} alt={`Question ${questionIndex + 1}`} style={{ maxWidth: '100%' }} />
                                        <button onClick={() => handleRemoveImage(paragraphIndex, questionIndex, null, false, true)} className="remove-button">Remove Image</button>
                                    </>
                                ) : (
                                    'Paste your question image here (Ctrl+V)'
                                )}
                            </div>
                        </div>
                        <label>Select Question Type:</label>
                        <select
                            value={question.questionType}
                            onChange={(e) => handleParagraphQuestionTypeChange(paragraphIndex, questionIndex, e.target.value)}
                        >
                            <option value="mcq">MCQ</option>
                            <option value="msq">MSQ</option>
                            <option value="nit">NIT</option>
                            <option value="truefalse">True/False</option>
                        </select>
                        <h4>Options</h4>
                        {question.questionType === 'truefalse' ? (
                            <div className="truefalse-options">
                                <label>
                                    <input
                                        type="radio"
                                        name={`option-${paragraphIndex}-${questionIndex}`}
                                        value="True"
                                        onChange={() => handleParagraphAnswerChange(paragraphIndex, questionIndex, 'True')}
                                    />
                                    True
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name={`option-${paragraphIndex}-${questionIndex}`}
                                        value="False"
                                        onChange={() => handleParagraphAnswerChange(paragraphIndex, questionIndex, 'False')}
                                    />
                                    False
                                </label>
                                <div className="selected-answer-box">
                                    Selected Answer: {question.paraanswers}
                                </div>
                            </div>
                        ) : question.questionType === 'nit' ? (
                            <>
                                <input
                                    type="text"
                                    value={question.paraanswers}
                                    onChange={(e) => handleParagraphAnswerChange(paragraphIndex, questionIndex, e.target.value)}
                                    placeholder="Enter numeric answer"
                                />
                                <div className="selected-answer-box">
                                    Entered Answer: {question.paraanswers || 'Enter numeric answer'}
                                </div>
                            </>
                        ) : (
                            <>
                                {question.paraOptions.map((option, optionIndex) => (
                                    <div key={optionIndex} className="option-item">
                                        <label>
                                            <input
                                                name={`option-${paragraphIndex}-${questionIndex}`}
                                                type={question.questionType === 'msq' ? 'checkbox' : 'radio'}
                                             
                                                onChange={() => handleParagraphAnswerChange(paragraphIndex, questionIndex, String.fromCharCode(65 + optionIndex), optionIndex)}
                                            />
                                            Option {String.fromCharCode(65 + optionIndex)}
                                        </label>
                                        <div
                                            className={`option-box ${clickedBox === `option-${paragraphIndex}-${questionIndex}-${optionIndex}` ? 'clicked' : ''}`}
                                            onClick={() => setClickedBox(`option-${paragraphIndex}-${questionIndex}-${optionIndex}`)}
                                            onPaste={(e) => handleImagePaste(e, paragraphIndex, questionIndex, optionIndex, false, true)}
                                            >
                                                {option.image ? (
                                                    <>
                                                        <img src={option.image} alt={`Option ${String.fromCharCode(65 + optionIndex)}`} style={{ maxWidth: '100%' }} />
                                                        <button onClick={() => handleRemoveImage(paragraphIndex, questionIndex, optionIndex, false, true)} className="remove-button">Remove Image</button>
                                                    </>
                                                ) : (
                                                    'Paste your option image here (Ctrl+V)'
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="selected-answer-box">
                                        Selected Answer: {Array.isArray(question.paraanswers) ? question.paraanswers.join(', ') : question.paraanswers}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                    <button onClick={() => removeParagraph(paragraphIndex)} className="remove-button mcq-container">Remove Paragraph</button>
                </div>
            ));
        };
    
        return (
            <div className="container">
                <button onClick={toggleSidebar} className="sidebar-toggle">
                    ☰ {/* Menu Icon */}
                </button>
                <div className={`sidebar ${isSidebarOpen ? 'show' : ''}`}>
                    <h3>Type of Question:</h3>
                    <label>Select Question:</label>
                    <select
                        value={selectedQuestionIndex}
                        onChange={(e) => setSelectedQuestionIndex(parseInt(e.target.value))}
                    >
                        {Questions.map((question, index) => (
                            <option key={index} value={index}>
                                Question {question.questionNumber}
                            </option>
                        ))}
                    </select>
                    <label>Question Type:</label>
                    <select
                        value={Questions[selectedQuestionIndex]?.questionType}
                        onChange={(e) => handleSidebarQuestionTypeChange(selectedQuestionIndex, e.target.value)}
                    >
                        <option value="mcq">MCQ</option>
                        <option value="msq">MSQ</option>
                        <option value="truefalse">True/False</option>
                        <option value="nit">NIT</option>
                        <option value="assertion">Assertion</option>
                    </select>
                    <div className="marks-container">
                        <label>Marks:</label>
                        <input type="number" placeholder="+ve" onChange={(e) => setPositiveMarks(e.target.value)} />
                        <input type="number" placeholder="-ve" onChange={(e) => setNegativeMarks(e.target.value)} />
                    </div>
                    <div style={{marginBottom:"10px"}}>
                   
                    <input
                        type="checkbox"
                        checked={Questions[selectedQuestionIndex]?.includeSolution}
                        onChange={() => handleIncludeSolutionChange(selectedQuestionIndex)}
                    /> Include Solution
                    </div>
                    
                    <div>
                   
                    <input
                        type="checkbox"
                        checked={addOptionE}
                        onChange={() => handleAddOptionEChange(selectedQuestionIndex)}
                    /> Add Option E
                    </div>
                    <div>
                    <label>Total Questions:</label>
                    <input className='total-questions' value={Questions.length} readOnly />
                    </div>
                    
                   
                </div>
                <div className="main-content">
                    {renderQuestions()}
                    {renderParagraphs()}
                    <button onClick={addNewQuestion} className="add-question-button">Add Question</button>
                    <button onClick={addNewParagraph} className="add-question-button">Add Paragraph</button>
                    {Questions.length > 0 && (
                        <div>
                            <button
                                style={{ display: "block" }}
                                className="save-button mcq-container"
                                onClick={handleSave}
                            >
                                Preview
                            </button>
                            <PreviewModal
                                show={showModal}
                                handleClose={() => setShowModal(false)}
                                documentContent={documentContent}
                                handleEdit={handleEdit}
                            />
                            <button
                                style={{ display: "block" }}
                                onClick={handleSave}
                                className="save-button mcq-container"
                            >
                                Save Document
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };
    
    export default Management;