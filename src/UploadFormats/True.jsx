import { useState, useEffect,useContext} from 'react';
import './Questions.css'; // Import the CSS file
import { QuestionsContext } from './QuestionsContext';
const True = ({
  handleOptionPaste,
  addNewQuestion,
  handlePaste,
  handleAnswerChange,
  handleRemoveImage,
  removeQuestion,
  includeSolution,
  addOptionE,
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
        <h2>Paste Question and Options (True) </h2>
        {Questions.length > 0 ? (
                Questions.map((question, index) => (
                  <div key={index} className="question-item">
              <h3>Question {questionCount}</h3>

              {/* Question Image Section */}
              <div className="question-image-container">
                <h3>Paste Image for Question</h3>
                <div
                  className={`option box ${clickedBox === `question-${index}` ? 'clicked' : ''}`}
                  onClick={() => handleClickBox(`question-${index}`)} // Handle the click event
                  onPaste={(e) => {
                    const clipboardItems = e.clipboardData.items;
                    for (let i = 0; i < clipboardItems.length; i++) {
                      if (clipboardItems[i].type.startsWith("image/")) {
                        const file = clipboardItems[i].getAsFile();
                        const reader = new FileReader();
                        reader.onload = () => {
                          const updatedQuestions = [...Questions];
                          updatedQuestions[index].questionImage = reader.result;
                          setQuestions(updatedQuestions)
                        };
                        reader.readAsDataURL(file);
                        break;
                      }
                    }
                  }}
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
                    "Paste your question image here (ctrl+v)"
                  )}
                </div>
              </div>
              {/* Options Section */}
              <div style={{ marginBottom: "20px" }}>
                <h3>Choose an Option</h3>
                <div>
                  <label>
                    <input
                      type="radio"
                      name={`option-${index}`}
                      value="True"
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                    />
                    True
                  </label>
                </div>
                <div>
                  <label>
                    <input
                      type="radio"
                      name={`option-${index}`}
                      value="False"
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                    />
                    False
                  </label>
                </div>
                <div>
                </div>
              </div>
              {addOptionE && question.options.length < 5 && (
                <div className="option-item">
                  <label>
                    <input
                      name="radio"
                      type="radio"
                      value={question.options[4]?.isCorrect}
                      onChange={(e) => handleAnswerChange(index, 4, e.target.checked)} // Change optionIndex to 4
                      onClick={() => handleClickBox(`option-${index}-4`)} // Change optionIndex to 4
                      onPaste={(e) => handleOptionPaste(e, index, 4)} // Change optionIndex to 4
                    />
                    Option E
                  </label>
                  <div
                    className="option-box"
                    onPaste={(e) => handleOptionPaste(e, index, 4)} // Change optionIndex to 4
                  >
                    {question.options[4]?.image ? (
                      <>
                        <img src={question.options[4].image} alt="Option E" />
                        <button
                          onClick={() => handleRemoveImage(index, "option-4")}
                          className="remove-button"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      "Paste Option E image here (ctrl+v)"
                    )}
                  </div>
                </div>
              )}

              {/* Solution Image Section */}
              {includeSolution != false &&
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
              }

              {/* Answer Section */}
            
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

export default True;
