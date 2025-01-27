import { useState, useContext } from 'react';
import './Questions.css'; // Import the CSS file
import { QuestionsContext } from './QuestionsContext';

const True = ({
  handleOptionPaste,
  handlePaste,
  handleAnswerChange,
  handleRemoveImage,
  removeQuestion,
  includeSolution,
  addOptionE,
  index
}) => {
  const [clickedBox, setClickedBox] = useState(null); // Track the clicked box
  const { trueQuestions, setTrueQuestions, Questions, setQuestions } = useContext(QuestionsContext);

  const handleClickBox = (boxName) => {
    setClickedBox(boxName);
  };

  const handlePasteImage = (e, type, index, optionIndex = null) => {
    const clipboardItems = e.clipboardData.items;
    for (let i = 0; i < clipboardItems.length; i++) {
      if (clipboardItems[i].type.startsWith("image/")) {
        const file = clipboardItems[i].getAsFile();
        const reader = new FileReader();
        reader.onload = () => {
          const updatedQuestions = [...trueQuestions];
          if (type === "question") {
            updatedQuestions[index].questionImage = reader.result;
          } else if (type === "solution") {
            updatedQuestions[index].solutionImage = reader.result;
          }
          setTrueQuestions(updatedQuestions);
        };
        reader.readAsDataURL(file);
        break;
      }
    }
  };

  return (
    <div className="mcq-container">
      <div className="question-wrapper">
        {trueQuestions.length > 0 ? (
          trueQuestions.map((question, index) => (
            <div key={index} className="question-item">
              <h3>Question {index + 1}</h3>

              {/* Question Image Section */}
              <div className="question-image-container">
                <h3>Paste Image for Question</h3>
                <div
                  className={`option box ${clickedBox === `question-${index}` ? 'clicked' : ''}`}
                  onClick={() => handleClickBox(`question-${index}`)} // Handle the click event
                  onPaste={(e) => handlePasteImage(e, "question", index)}
                >
                  {question.questionImage ? (
                    <>
                      <img
                        style={{ maxWidth: "100%" }}
                        src={question.questionImage}
                        alt={`Question ${index + 1}`}
                      />
                      <button
                        onClick={() => handleRemoveImage(index, "question")}
                        className="remove-button"
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    "Paste your question image here (Ctrl+V)"
                  )}
                </div>
              </div>

              {/* Solution Image Section */}
              {includeSolution && (
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
              )}

              <div>
                <button
                  onClick={() => removeQuestion(index)}
                  className="remove-button"
                >
                  Remove Question
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

export default True;