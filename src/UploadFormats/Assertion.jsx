import { useState, useContext } from 'react';
import './Questions.css'; // Import the CSS file
import ParagraphCreation from "./ParagraphCreation";
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
  const [clickedBox, setClickedBox] = useState(null); // Track the clicked box
  const { assertionQuestions, setAssertionQuestions, Questions, setQuestions, questionCount } = useContext(QuestionsContext);

  const handleClickBox = (boxName) => {
    setClickedBox(boxName);
  };

  const handlePasteImage = (e, type, index, optionIndex = null) => {
    console.log("Paste event triggered");
    const clipboardItems = e.clipboardData.items;
    for (let i = 0; i < clipboardItems.length; i++) {
      if (clipboardItems[i].type.startsWith("image/")) {
        const file = clipboardItems[i].getAsFile();
        const reader = new FileReader();
        reader.onload = () => {
          console.log("Image loaded from clipboard");
          setAssertionQuestions((prevQuestions) => {
            const updatedQuestions = [...prevQuestions];
            if (type === "assertion") {
              updatedQuestions[index].assertionImage = reader.result;
            } else if (type === "reason") {
              updatedQuestions[index].reasonImage = reader.result;
            } else if (type === "option") {
              updatedQuestions[index].options[optionIndex].image = reader.result;
            } else if (type === "solution") {
              updatedQuestions[index].solutionImage = reader.result;
            }
            return updatedQuestions;
          });
        };
        reader.readAsDataURL(file);
        break;
      }
    }
  };

  return (
    <div className="mcq-container">
      <div className="question-wrapper">
        {assertionQuestions.length > 0 ? (
          assertionQuestions.map((question, index) => (
            <div key={index} className="question-item">
              <h3>Question {index + 1}</h3>

              {/* Assertion Image Section */}
              <div className="question-image-container">
                <h3>Paste Image for Assertion</h3>
                <div
                  className={`option box ${clickedBox === `assertion-${index}` ? 'clicked' : ''}`}
                  onClick={() => handleClickBox(`assertion-${index}`)} // Handle the click event
                  onPaste={(e) => handlePasteImage(e, "assertion", index)}
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
                    "Paste your assertion image here (Ctrl+V)"
                  )}
                </div>
              </div>

              {/* Reason Image Section */}
              <div className="question-image-container">
                <h3>Paste Image for Reason</h3>
                <div
                  className={`option box ${clickedBox === `reason-${index}` ? 'clicked' : ''}`}
                  onClick={() => handleClickBox(`reason-${index}`)} // Handle the click event
                  onPaste={(e) => handlePasteImage(e, "reason", index)}
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
                    "Paste your reason image here (Ctrl+V)"
                  )}
                </div>
              </div>

              {/* Option Section */}
              <h4>Options</h4>
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="option-item">
                  <div>
                    <label className="option-label">
                      <input
                        name="radio"
                        type="radio"
          
                        onChange={(e) => handleAnswerChange(index, optionIndex, e.target.checked)}
                        className="option-box"
                      />
                      <span>Option {String.fromCharCode(65 + optionIndex)}</span>
                    </label>
                    <div
                      className={`option-box ${clickedBox === `option-${index}-${optionIndex}` ? 'clicked' : ''}`}
                      onClick={() => handleClickBox(`option-${index}-${optionIndex}`)} // Handle the click event
                      onPaste={(e) => handlePasteImage(e, "option", index, optionIndex)}
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
                        "Paste your option image here (Ctrl+V)"
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
                  onPaste={(e) => handlePasteImage(e, "solution", index)}
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
                    "Paste your solution image here (Ctrl+V)"
                  )}
                </div>
              </div>

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