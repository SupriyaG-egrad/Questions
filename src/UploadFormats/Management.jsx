import React, { useState, useContext } from 'react';
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, ImageRun, TextRun } from "docx";
import MCQ from "./Mcq";
import MSQ from "./Msq";
import NIT from "./Nit";
import True from "./True";
import Assertion from "./Assertion.jsx";
import "./Questions.css";
import ParagraphCreation from "./ParagraphCreation.jsx";
import Instruction from './Instruction.jsx';
import { QuestionsContext } from './QuestionsContext.jsx';
import PreviewModal from './PreviewModal.jsx';
const Management = () => {
  const [showModal, setShowModal] = useState(false);
  const [documentContent, setDocumentContent] = useState([]);
  
  const {
    mcqQuestions, setMcqQuestions,
    msqQuestions, setMsqQuestions,
    nitQuestions, setNitQuestions,
    trueQuestions, setTrueQuestions,
    assertionQuestions, setAssertionQuestions,
    Questions, setQuestions,
    positiveMarks, negativeMarks, setPositiveMarks, setNegativeMarks,
    selectedQuestionType, setSelectedQuestionType,
    addOptionE, setAddOptionE, Paragraphs
  } = useContext(QuestionsContext);
  let [globalQuestionCounter, setGlobalQuestionCounter] = useState(1);
  const [isInstructionsPage, setIsInstructionsPage] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [includeParagraph, setIncludeParagraph] = useState(false);
  const [includeSolution, setIncludeSolution] = useState(true);

  const toggleInstructionsPage = () => {
    setIsInstructionsPage(!isInstructionsPage);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  const handlePositiveChange = (e) => {
    setPositiveMarks(e.target.value);
  };

  const handleNegativeChange = (e) => {
    setNegativeMarks(e.target.value);
  };

  const handleQuestionClick = (e) => {
    setSelectedQuestionType(e.target.value);
    console.log(Questions)
    console.log(Paragraphs)
  };


 
  const handleAnswerChange = (index, newAnswer) => {

    const updatedQuestions = [...Questions];

    switch (selectedQuestionType) {
      case "Mcq":
      case "Msq":
      case "Assertion":
        // Keep original options but update the label (A, B, C, D)
        updatedQuestions[index].options = updatedQuestions[index].options.map((option, idx) => ({
          ...option,  // Keep the original option properties (including images)
          label: String.fromCharCode(65 + idx),  // Convert index to label (A, B, C, D)
        }));

        if (selectedQuestionType === "Mcq" || selectedQuestionType === "Assertion") {
          // MCQ and Assertion: Allow only one selection, update the answer
          updatedQuestions[index].answer = String.fromCharCode(65 + parseInt(newAnswer, 10));
        } else if (selectedQuestionType === "Msq") {
          // MSQ: Multiple selections allowed, update the answer
          if (!Array.isArray(updatedQuestions[index].answer)) {
            updatedQuestions[index].answer = [];
          }

          const newAnswerLabel = String.fromCharCode(65 + parseInt(newAnswer, 10));

          if (updatedQuestions[index].answer.includes(newAnswerLabel)) {
            // Remove if already selected (toggle)
            updatedQuestions[index].answer = updatedQuestions[index].answer.filter(ans => ans !== newAnswerLabel);
          } else {
            // Allow adding new selection only if less than 2 selected
            if (updatedQuestions[index].answer.length < 2) {
              updatedQuestions[index].answer.push(newAnswerLabel);
            } else {
              alert("You can only select two options");
            }
          }
        }
        break;

      case "Nit":
        // Allow only numbers (restrict alphabets and special characters)
        const validAnswer = newAnswer.replace(/[A-Za-z]/g, '');  // This removes alphabets

        if (newAnswer !== validAnswer) {
          console.error('Invalid input: Alphabets are not allowed for "Nit" question type');
          alert('Invalid input: Alphabets are not allowed for "Nit" question type');
          return; // Exit early if the input is invalid
        }
        newAnswer = validAnswer; // Update the newAnswer to keep only valid characters

        // Directly update answer for "Nit" question type
        updatedQuestions[index].answer = newAnswer;
        break;

      default:
        // Directly update answer for other question types (if applicable)
        updatedQuestions[index].answer = newAnswer;
        break;
    }

    // Update the specific question type state
    switch (selectedQuestionType) {
      case "Mcq":
        setMcqQuestions(updatedQuestions.filter(q => q.type === "Mcq"));
        break;
      case "Msq":
        setMsqQuestions(updatedQuestions.filter(q => q.type === "Msq"));
        break;
      case "Nit":
        setNitQuestions(updatedQuestions.filter(q => q.type === "Nit"));
        break;
      case "True":
        setTrueQuestions(updatedQuestions.filter(q => q.type === "True"));
        break;
      case "Assertion":
        setAssertionQuestions(updatedQuestions.filter(q => q.type === "Assertion"));
        break;
      default:
        break;
    }

    // Update the combined Questions state
    setQuestions(updatedQuestions);
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    if (name === "paragraph") setIncludeParagraph(checked);
    if (name === "solution") setIncludeSolution(checked);
    if (name === "optionE") {
      setAddOptionE(checked);
      const updateQuestions = (questions, setQuestions) => {
        setQuestions(questions.map(q => ({
          ...q,
          options: checked ? [...q.options, { text: "", image: null }] : q.options.slice(0, 4),
        })));
      };

      updateQuestions(mcqQuestions, setMcqQuestions);
      updateQuestions(msqQuestions, setMsqQuestions);
      updateQuestions(assertionQuestions, setAssertionQuestions);
    }
  };

  const renderComponent = () => {
    const questionCount = {
      Mcq: mcqQuestions.length,
      Msq: msqQuestions.length,
      Nit: nitQuestions.length,
      True: trueQuestions.length,
      Assertion: assertionQuestions.length
    }[selectedQuestionType];

    return (
      <div className="question-type-components">
        {selectedQuestionType === "Mcq" && (
          <MCQ
            index={questionCount}
            questionCount={questionCount}
            handleParaQuestionPaste={handleParaQuestionPaste}
            handleAnswerChange={handleAnswerChange}
            handlePaste={handlePaste}
            processImage={processImage}
            handleOptionPaste={handleOptionPaste}
            handleRemoveImage={handleRemoveImage}
            removeQuestion={removeQuestion}
            includeParagraph={includeParagraph}
            includeSolution={includeSolution}
            addOptionE={addOptionE}
            handleSave={handleSave}
          />
        )}
        {selectedQuestionType === "Msq" && (
          <MSQ
            index={questionCount}
            questionCount={questionCount}
            handleParaQuestionPaste={handleParaQuestionPaste}
            handleAnswerChange={handleAnswerChange}
            handlePaste={handlePaste}
            processImage={processImage}
            handleOptionPaste={handleOptionPaste}
            handleRemoveImage={handleRemoveImage}
            removeQuestion={removeQuestion}
            includeParagraph={includeParagraph}
            includeSolution={includeSolution}
            addOptionE={addOptionE}
            handleSave={handleSave}
          />
        )}
        {selectedQuestionType === "Nit" && (
          <NIT
            index={questionCount}
            questionCount={questionCount}
            handleParaQuestionPaste={handleParaQuestionPaste}
            handleAnswerChange={handleAnswerChange}
            handlePaste={handlePaste}
            processImage={processImage}
            handleOptionPaste={handleOptionPaste}
            handleRemoveImage={handleRemoveImage}
            removeQuestion={removeQuestion}
            includeParagraph={includeParagraph}
            includeSolution={includeSolution}
            addOptionE={addOptionE}
            handleSave={handleSave}
          />
        )}
        {selectedQuestionType === "True" && (
          <True
            index={questionCount}
            questionCount={questionCount}
            handleParaQuestionPaste={handleParaQuestionPaste}
            handleAnswerChange={handleAnswerChange}
            handlePaste={handlePaste}
            processImage={processImage}
            handleOptionPaste={handleOptionPaste}
            handleRemoveImage={handleRemoveImage}
            removeQuestion={removeQuestion}
            includeParagraph={includeParagraph}
            includeSolution={includeSolution}
            addOptionE={addOptionE}
            handleSave={handleSave}
          />
        )}
        {selectedQuestionType === "Assertion" && (
          <Assertion
            index={questionCount}
            questionCount={questionCount}
            handleParaQuestionPaste={handleParaQuestionPaste}
            handleAnswerChange={handleAnswerChange}
            handlePaste={handlePaste}
            processImage={processImage}
            handleOptionPaste={handleOptionPaste}
            handleRemoveImage={handleRemoveImage}
            removeQuestion={removeQuestion}
            includeParagraph={includeParagraph}
            includeSolution={includeSolution}
            addOptionE={addOptionE}
            handleSave={handleSave}
          />
        )}
        {includeParagraph && (
          <ParagraphCreation
            index={questionCount}
            addOptionE={addOptionE}
            includeSolution={includeSolution}
          />
        )}
      </div>
    );
  };

  const addQuestion = () => {
    const newQuestion = {
      assertionImage: null,
      reasonImage: null,
      questionImage: null,
      answer: "",
      solutionImage: null,
      options: [
        { text: "", image: null },
        { text: "", image: null },
        { text: "", image: null },
        { text: "", image: null },
        ...(addOptionE ? [{ text: "", image: null }] : []),
      ],
      type: selectedQuestionType,
      questionNumber: globalQuestionCounter++,
    };
    setGlobalQuestionCounter(globalQuestionCounter + 1);
    const updateQuestions = (questions, setQuestions) => {
      setQuestions([...questions, newQuestion]);
    };

    switch (selectedQuestionType) {
      case "Mcq":
        updateQuestions(mcqQuestions, setMcqQuestions);
        break;
      case "Msq":
        updateQuestions(msqQuestions, setMsqQuestions);
        break;
      case "Nit":
        updateQuestions(nitQuestions, setNitQuestions);
        break;
      case "True":
        updateQuestions(trueQuestions, setTrueQuestions);
        break;
      case "Assertion":
        updateQuestions(assertionQuestions, setAssertionQuestions);
        break;
      default:
        break;
    }
  };

  const processImage = (imageData, maxWidth, maxHeight) => {
    const img = new Image();
    img.src = imageData;

    return new Promise((resolve) => {
      img.onload = () => {
        const { naturalWidth, naturalHeight } = img;
        let width = naturalWidth;
        let height = naturalHeight;

        if (naturalWidth > maxWidth || naturalHeight > maxHeight) {
          if (naturalWidth / maxWidth > naturalHeight / maxHeight) {
            width = maxWidth;
            height = Math.round((naturalHeight / naturalWidth) * maxWidth);
          } else {
            height = maxHeight;
            width = Math.round((naturalWidth / naturalHeight) * maxHeight);
          }
        }

        resolve({ width, height });
      };
    });
  };

  const handleRemoveImage = (index, type, questionIndex = null) => {
    const updateQuestions = (questions, setQuestions) => {
      const updatedQuestions = [...questions];

      switch (type) {
        case "paragraph":
          updatedQuestions[index].paragraphImage = null;
          break;
        case "paragraph-question":
          if (questionIndex !== null) {
            updatedQuestions[index].paraquestions[questionIndex].paraquestionImage = null;
          }
          break;
        case "question":
          updatedQuestions[index].questionImage = null;
          break;
        case "solution":
          updatedQuestions[index].solutionImage = null;
          break;
        default:
          if (type === "option" && questionIndex !== null) {
            updatedQuestions[index].options[questionIndex].image = null;
          }
          break;
      }

      setQuestions(updatedQuestions);
    };

    switch (selectedQuestionType) {
      case "Mcq":
        updateQuestions(mcqQuestions, setMcqQuestions);
        break;
      case "Msq":
        updateQuestions(msqQuestions, setMsqQuestions);
        break;
      case "Nit":
        updateQuestions(nitQuestions, setNitQuestions);
        break;
      case "True":
        updateQuestions(trueQuestions, setTrueQuestions);
        break;
      case "Assertion":
        updateQuestions(assertionQuestions, setAssertionQuestions);
        break;
      default:
        break;
    }
  };

  const removeQuestion = (index) => {
    const updateQuestions = (questions, setQuestions) => {
      setQuestions(questions.filter((_, i) => i !== index));
    };

    switch (selectedQuestionType) {
      case "Mcq":
        updateQuestions(mcqQuestions, setMcqQuestions);
        break;
      case "Msq":
        updateQuestions(msqQuestions, setMsqQuestions);
        break;
      case "Nit":
        updateQuestions(nitQuestions, setNitQuestions);
        break;
      case "True":
        updateQuestions(trueQuestions, setTrueQuestions);
        break;
      case "Assertion":
        updateQuestions(assertionQuestions, setAssertionQuestions);
        break;
      default:
        break;
    }
  };

  const handlePaste = (e, index) => {
    e.preventDefault();
    const clipboardItems = e.clipboardData.items;
    for (let i = 0; i < clipboardItems.length; i++) {
      if (clipboardItems[i].type.startsWith("image/")) {
        const file = clipboardItems[i].getAsFile();
        const reader = new FileReader();
        reader.onload = () => {
          const updateQuestions = (questions, setQuestions) => {
            const updatedQuestions = [...questions];
            updatedQuestions[index].solutionImage = reader.result;
            setQuestions(updatedQuestions);
          };

          switch (selectedQuestionType) {
            case "Mcq":
              updateQuestions(mcqQuestions, setMcqQuestions);
              break;
            case "Msq":
              updateQuestions(msqQuestions, setMsqQuestions);
              break;
            case "Nit":
              updateQuestions(nitQuestions, setNitQuestions);
              break;
            case "True":
              updateQuestions(trueQuestions, setTrueQuestions);
              break;
            case "Assertion":
              updateQuestions(assertionQuestions, setAssertionQuestions);
              break;
            default:
              break;
          }
        };
        reader.readAsDataURL(file);
        break;
      }
    }
  };

  const handleParaQuestionPaste = (e, index, subIndex) => {
    e.preventDefault();
    const clipboardItems = e.clipboardData.items;
    for (let i = 0; i < clipboardItems.length; i++) {
      if (clipboardItems[i].type.startsWith("image/")) {
        const file = clipboardItems[i].getAsFile();
        const reader = new FileReader();
        reader.onload = () => {
          const updateQuestions = (questions, setQuestions) => {
            const updatedQuestions = [...questions];
            updatedQuestions[index].paraquestions[subIndex].paraquestionImage = reader.result;
            setQuestions(updatedQuestions);
          };

          switch (selectedQuestionType) {
            case "Mcq":
              updateQuestions(mcqQuestions, setMcqQuestions);
              break;
            case "Msq":
              updateQuestions(msqQuestions, setMsqQuestions);
              break;
            case "Nit":
              updateQuestions(nitQuestions, setNitQuestions);
              break;
            case "True":
              updateQuestions(trueQuestions, setTrueQuestions);
              break;
            case "Assertion":
              updateQuestions(assertionQuestions, setAssertionQuestions);
              break;
            default:
              break;
          }
        };
        reader.readAsDataURL(file);
        break;
      }
    }
  };

  const handleOptionPaste = (e, index, optionIndex) => {
    e.preventDefault();
    const clipboardItems = e.clipboardData.items;
    for (let i = 0; i < clipboardItems.length; i++) {
      if (clipboardItems[i].type.startsWith("image/")) {
        const file = clipboardItems[i].getAsFile();
        const reader = new FileReader();
        reader.onload = () => {
          const updateQuestions = (questions, setQuestions) => {
            const updatedQuestions = [...questions];
            updatedQuestions[index].options[optionIndex].image = reader.result;
            updatedQuestions[index].options[optionIndex].text = "";
            setQuestions(updatedQuestions);
          };

          switch (selectedQuestionType) {
            case "Mcq":
              updateQuestions(mcqQuestions, setMcqQuestions);
              break;
            case "Msq":
              updateQuestions(msqQuestions, setMsqQuestions);
              break;
            case "Nit":
              updateQuestions(nitQuestions, setNitQuestions);
              break;
            case "True":
              updateQuestions(trueQuestions, setTrueQuestions);
              break;
            case "Assertion":
              updateQuestions(assertionQuestions, setAssertionQuestions);
              break;
            default:
              break;
          }
        };
        reader.readAsDataURL(file);
        break;
      } else if (clipboardItems[i].type === "text/plain") {
        const text = e.clipboardData.getData("text");
        const updateQuestions = (questions, setQuestions) => {
          const updatedQuestions = [...questions];
          updatedQuestions[index].options[optionIndex].text = text;
          updatedQuestions[index].options[optionIndex].image = null;
          setQuestions(updatedQuestions);
        };

        switch (selectedQuestionType) {
          case "Mcq":
            updateQuestions(mcqQuestions, setMcqQuestions);
            break;
          case "Msq":
            updateQuestions(msqQuestions, setMsqQuestions);
            break;
          case "Nit":
            updateQuestions(nitQuestions, setNitQuestions);
            break;
          case "True":
            updateQuestions(trueQuestions, setTrueQuestions);
            break;
          case "Assertion":
            updateQuestions(assertionQuestions, setAssertionQuestions);
            break;
          default:
            break;
        }
        break;
      }
    }
  };

  const handleSave = async () => {
    let sortid = 1;
    const questionMaxWidth = 600;
    const questionMaxHeight = 900;
    const optionMaxWidth = 600;
    const optionMaxHeight = 900;
    const maxImageWidth = 700;
    const maxImageHeight = 700;
    const docSections = [];

    const processQuestions = async (questions) => {
      const clonedQuestions = JSON.parse(JSON.stringify(questions));
      for (let index = 0; index < clonedQuestions.length; index++) {
        const question = clonedQuestions[index];
        const questionImageTransform = question.questionImage
          ? await processImage(question.questionImage, questionMaxWidth, questionMaxHeight)
          : null;
        const solutionImageTransform = question.solutionImage
          ? await processImage(question.solutionImage, questionMaxWidth, questionMaxHeight)
          : null;

        const questionTextRun = question.questionImage
          ? new ImageRun({
            data: question.questionImage.split(",")[1],
            transformation: questionImageTransform,
          })
          : new TextRun(question.questionText || "");

        const questionParagraph = new Paragraph({
          children: [new TextRun({ text: "[Q] ", bold: true }), questionTextRun],
          spacing: { after: 400 },
        });

        const optionParagraphs = [];

        if (question.type === 'True') {
          optionParagraphs.push(
            new Paragraph({
              children: [
                new TextRun({ text: "(a)", bold: true }),
                new TextRun(" True"),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "(b)", bold: true }),
                new TextRun(" False"),
              ],
              spacing: { after: 200 },
            })
          );
        } else if (question.options.length > 0 && question.type !== "Nit") {
          for (let i = 0; i < question.options.length; i++) {
            const option = question.options[i];
            const label = `(${String.fromCharCode(97 + i)}) `;
            const optionTransform = option.image
              ? await processImage(option.image, optionMaxWidth, optionMaxHeight)
              : null;

            optionParagraphs.push(
              new Paragraph({
                children: [
                  new TextRun({ text: label, bold: true }),
                  option.image
                    ? new ImageRun({
                      data: option.image.split(",")[1],
                      transformation: optionTransform,
                    })
                    : new TextRun(option.text),
                ],
                spacing: { after: 200 },
              })
            );
          }
        }

        let solutionParagraph = null;
        if (question.options.length > 0 && question.solutionImage) {
          solutionParagraph = new Paragraph({
            children: [
              new TextRun({ text: "[soln] ", bold: true }),
              new ImageRun({
                data: question.solutionImage.split(",")[1],
                transformation: solutionImageTransform,
              }),
            ],
            spacing: { after: 200 },
          });
        }

        const questionSection = {
          children: [
            questionParagraph,
            ...optionParagraphs,
            new Paragraph(`[qtype] ${question.type}`),
            new Paragraph({ text: `[ans] ${question.answer}`, bold: true }),
            new Paragraph(`[Marks] [${positiveMarks || 0}, ${negativeMarks || 0}]`),
            solutionParagraph,
            new Paragraph(`[sortid] ${sortid++}`),
            new Paragraph({ text: "", spacing: { after: 400 } }),
          ].filter(Boolean),
        };

        docSections.push(questionSection);
      }
    };

    await processQuestions(mcqQuestions);
    await processQuestions(msqQuestions);
    await processQuestions(nitQuestions);
    await processQuestions(trueQuestions);
    await processQuestions(assertionQuestions);

    docSections.push({
      children: [new Paragraph({ text: "[QQ]", pageBreakBefore: true })],
      spacing: { after: 400 },
    });
    const goToQuestion = (type, index) => {
      setCurrentQuestion({ type, index });
      setShowModal(false);
  };
    const doc = new Document({
      sections: docSections,
    });

    try {
      const blob = await Packer.toBlob(doc);
      const arrayBuffer = await blob.arrayBuffer();
      setDocumentContent(arrayBuffer);
      setShowModal(true);
  } catch (error) {
      console.error("Error creating the document:", error);
  }
  };

  const handleEdit = () => {
    // Close the modal and go back to editing
    setShowModal(false);
};
  return (
    <div className="container">
      <button onClick={toggleSidebar} className="sidebar-toggle">
        ☰ {/* Menu Icon */}
      </button>
      <div className={`sidebar ${isSidebarOpen ? 'show' : ''}`}>
        <h3>Type of Question:</h3>
        <button onClick={toggleInstructionsPage} className="instructions-btn">
          {isInstructionsPage ? 'Back' : 'Instructions'}
        </button>
        <select onChange={handleQuestionClick} value={selectedQuestionType}>
          <option value="Mcq">MCQ</option>
          <option value="Msq">MSQ</option>
          <option value="Nit">NIT</option>
          <option value="True">True/False</option>
          <option value="Assertion">Assertion</option>
        </select>
        <div className="marks-container">
          <label>Marks:</label>
          <input type="number" placeholder="+ve" onChange={handlePositiveChange} />
          <input type="number" placeholder="-ve" onChange={handleNegativeChange} />
        </div>
        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              name="paragraph"
              checked={includeParagraph}
              onChange={handleCheckboxChange}
            />{" "}
            Have Paragraph
          </label>
          <label>
            <input
              type="checkbox"
              name="solution"
              checked={includeSolution}
              onChange={handleCheckboxChange}
            />{" "}
            Have Solution
          </label>
          <label>
            <input
              type="checkbox"
              name="optionE"
              checked={addOptionE}
              onChange={handleCheckboxChange}
            />{" "}
            Add Option E
          </label>
        </div>
      </div>
      <div className="main-content" style={{ overflowX: 'auto', width:"100%", height: '100vh' }}>
        {isInstructionsPage ? (
          <Instruction />
        ) : (
          <>
            <div>
              <h2>Total no.of Questions: {Questions.length}</h2>
              {renderComponent()}
            </div>
            <button
              style={{ display: "block" }}
              onClick={addQuestion}
              className="save-button mcq-container"
            >
              Add New Question
            </button>
            <div>
              <button  style={{ display: "block" }}  className="save-button mcq-container" onClick={handleSave}>Preview</button>
              <PreviewModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                documentContent={documentContent}
                handleEdit={handleEdit}
              />
            </div>
            <button
              style={{ display: "block" }}
              onClick={(data) => handleSave(data)}
              className="save-button mcq-container"
            >
              Save Document
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Management;