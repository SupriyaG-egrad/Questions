import { useState } from "react";
import './Questions.css'; // Import the CSS file
import ParagraphCreation from "./ParagraphCreation";
import React, { useContext } from 'react';
import { QuestionsContext } from './QuestionsContext';
const Assertion = ({
  Paragraphs,
  setParagraphs,
  handleOptionPaste,
  addNewQuestion,
  handlePaste,
  handleAnswerChange,
  handleRemoveImage,
  removeQuestion,
  includeParagraph,
  includeSolution,
}) => {
   const {questionIndex,setQuestionIndex}=useContext(QuestionsContext)
  const [clickedBox, setClickedBox] = useState(null); // Track the clicked box
  const { Questions, setQuestions,questionCount } = useContext(QuestionsContext)
  const handleClickBox = (boxName) => {
    setClickedBox(boxName);
  };
  return (
    <div className="mcq-container">
      <div className="question-wrapper">
        {Questions.length > 0 ? (
                Questions.map((question, index) => (
                  <div key={index} className="question-item">
               <h3>Question {questionCount} </h3>
              {/* Assertion Image Section */}
              <div className="question-image-container">
                <h3>Paste Image for Assertion</h3>
                <div
                  className={`option box ${clickedBox === `assertion-${index}` ? 'clicked' : ''}`}
                  onClick={() => handleClickBox(`assertion-${index}`)} // Handle the click event
                  onPaste={(e) => {
                    const clipboardItems = e.clipboardData.items;
                    for (let i = 0; i < clipboardItems.length; i++) {
                      if (clipboardItems[i].type.startsWith("image/")) {
                        const file = clipboardItems[i].getAsFile();
                        const reader = new FileReader();
                        reader.onload = () => {
                          const updatedQuestions = [...Questions];
                          updatedQuestions[index].assertionImage = reader.result;
                          setQuestions(updatedQuestions)
                        };
                        reader.readAsDataURL(file);
                        break;
                      }
                    }
                  }}
                >
                  {question.assertionImage ? (
                    <>
                      <img
                        style={{ maxWidth: "100%" }}
                        src={question.assertionImage}
                        alt={`Assertion ${index + 1}`}
                      />
                      <button
                        onClick={() => handleRemoveImage(index, "assertion")}
                        className="remove-button"
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    "Paste your assertion image here (ctrl+v)"
                  )}
                </div>
              </div>

              {/* Reason Image Section */}
              <div className="question-image-container">
                <h3>Paste Image for Reason</h3>
                <div
                  className={`option box ${clickedBox === `reason-${index}` ? 'clicked' : ''}`}
                  onClick={() => handleClickBox(`reason-${index}`)} // Handle the click event
                  onPaste={(e) => {
                    const clipboardItems = e.clipboardData.items;
                    for (let i = 0; i < clipboardItems.length; i++) {
                      if (clipboardItems[i].type.startsWith("image/")) {
                        const file = clipboardItems[i].getAsFile();
                        const reader = new FileReader();
                        reader.onload = () => {
                          const updatedQuestions = [...Questions];
                          updatedQuestions[index].reasonImage = reader.result;
                        setQuestions(updatedQuestions)
                        };
                        reader.readAsDataURL(file);
                        break;
                      }
                    }
                  }}
                >
                  {question.reasonImage ? (
                    <>
                      <img
                        style={{ maxWidth: "100%" }}
                        src={question.reasonImage}
                        alt={`Reason ${index + 1}`}
                      />
                      <button
                        onClick={() => handleRemoveImage(index, "reason")}
                        className="remove-button"
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    "Paste your reason image here (ctrl+v)"
                  )}
                </div>
              </div>
              {/* Paragraph Section */}
              {includeParagraph && <ParagraphCreation Paragraphs={Paragraphs} setParagraphs={setParagraphs} />}
              {/*Option section*/}
              <h4>Options</h4>
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="option-item">
                  <div>
                    <label className="option-label">
                      <input
                        name="radio"
                        type="radio"
                        value={option.isCorrect}
                        onChange={(e) => handleAnswerChange(index, optionIndex, e.target.checked)}
                        className="option-box"
                      />
                      <span>Option {String.fromCharCode(65 + optionIndex)}</span>
                    </label>
                    <div
                      className={`option-box ${clickedBox === `option-${index}-${optionIndex}` ? 'clicked' : ''}`}
                      onClick={() => handleClickBox(`option-${index}-${optionIndex}`)} // Handle the click event
                      onPaste={(e) => handleOptionPaste(e, index, optionIndex)}
                    >
                      {option.image ? (
                        <>
                          <img
                            src={option.image}
                            alt={`Option ${String.fromCharCode(65 + optionIndex)}`}
                            style={{ maxWidth: '100%' }}
                          />
                          <button
                            onClick={() => handleRemoveImage(index, "option", optionIndex)}
                            className="remove-button"
                          >
                            Remove
                          </button>
                        </>
                      ) : (
                        "Paste your option image here (ctrl+v)"
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Solution Image Section */}
              <div className="solution-image-container">
                <h3>Paste Image for Solution</h3>
                <div
                  className={`option-box ${clickedBox === `solution-${index}` ? 'clicked' : ''}`}
                  onClick={() => handleClickBox(`solution-${index}`)} // Handle the click event
                  onPaste={(e) => handlePaste(e, index)}
                >
                  {question.solutionImage ? (
                    <>
                      <img
                        src={question.solutionImage}
                        alt={`Solution ${index + 1}`}
                        style={{ maxWidth: '100%' }}
                      />
                      <button
                        onClick={() => handleRemoveImage(index, "solution")}
                        className="remove-button"
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    "Paste your solution image here (ctrl+v)"
                  )}
                </div>
              </div>
              {includeSolution && (
                <div className="solution-section">
                  <strong>Solution:</strong>
                  <div
                    className={`option-box ${clickedBox === `solution-${index}` ? 'clicked' : ''}`}
                    onClick={() => handleClickBox(`solution-${index}`)} // Handle the click event
                    onPaste={(e) => handlePaste(e, index)}
                  >
                    {question.solutionImage ? (
                      <>
                        <img
                          src={question.solutionImage}
                          alt={`Solution ${index + 1}`}
                        />
                        <button
                          onClick={() => handleRemoveImage(index, "solution")}
                          className="remove-button"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <div
                        className="paste-container"
                        onPaste={(e) => handlePaste(e, index, "solution")}
                      >
                        Paste solution image (ctrl+v)
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Answer Section */}
              <div className="answer-container">
                <h3>Selected Answer</h3>
                <input
                  readOnly
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  type="text"
                  value={question.answer}
                  className="answer-input"
                />
              </div>
              <div>
               

                <button
                  onClick={() => removeQuestion(index)}
                  className="remove-button"
                >
                  Remove Previous Question
                </button>
               

              </div>
            </div>
          ))
        ) : (
          <p>Loading questions...</p>
        )}


      </div>
    </div>
  );
};

export default Assertion;