import React, { useState, useContext } from 'react';
import { saveAs } from "file-saver"
import { Document, Packer, Paragraph, ImageRun, TextRun } from "docx";
import MCQ from "./Mcq";
import MSQ from "./Msq";
import NIT from "./Nit";
import True from "./True";
import Assertion from "./Assertion.jsx";
import "./Questions.css"
import ParagraphCreation from "./ParagraphCreation.jsx";
import Instruction from './Instruction.jsx';
import { QuestionsContext } from './QuestionsContext.jsx';

const Management = () => {
  const { Questions, setQuestions, addOptionE, setAddOptionE,Paragraphs,positiveMarks,negativeMarks,setPositiveMarks,setNegativeMarks ,setSelectedQuestionType,selectedQuestionType,type,questionCount,setQuestionCount } = useContext(QuestionsContext)
 
   const [isInstructionsPage, setIsInstructionsPage] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [includeParagraph, setIncludeParagraph] = useState(false); // Track "Have Paragraph"
  const [includeSolution, setIncludeSolution] = useState(true);
  const [activeQuestionTypes, setActiveQuestionTypes] = useState(["Mcq"]);
  const handlePositiveChange = (e) => {
    
    setPositiveMarks(e.target.value);

  };

  const handleNegativeChange = (e) => {
    
    setNegativeMarks(e.target.value);
    

  };
  const handleQuestionClick = (e) => {
    const selectedType = e.target.value;
    setSelectedQuestionType(selectedType);
    setActiveQuestionTypes(e.target.value);
    // Update the type property in the Questions state only for new questions
    
  };
  console.log(Questions)
  const handleSave = async () => {
    let sortid = 1;
    let paragraphSortid = 1;
    let questionSortid = 1; // Initialize questionSortid
    const questionMaxWidth = 600;
    const questionMaxHeight = 900;
    const optionMaxWidth = 600;
    const optionMaxHeight = 900;
    const maxImageWidth = 700;// Adjusted width to fit images on one page
    const maxImageHeight = 700; // Adjusted height to fit images on one page
    const docSections = [];
    const clonedQuestions = JSON.parse(JSON.stringify(Questions));
  
    // Process Questions
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
        spacing: { after: 400 }, // Add spacing after the question paragraph
      });
  
      const optionParagraphs = [];
  
      // Handle True/False questions
      if (question.type === 'True') {
        optionParagraphs.push(
          new Paragraph({
            children: [
              new TextRun({ text: "(a)", bold: true }),
              new TextRun(" True"),
            ],
            spacing: { after: 200 }, // Add spacing after each option paragraph
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "(b)", bold: true }),
              new TextRun(" False"),
            ],
            spacing: { after: 200 }, // Add spacing after each option paragraph
          })
        );
      }
      // Handle other types of questions with options
      else if (question.options.length > 0 && question.type !== "Nit") {
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
              spacing: { after: 200 }, // Add spacing after each option paragraph
            })
          );
        }
      }
  
      // Solution Image Section
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
          spacing: { after: 200 }, // Add spacing after the solution paragraph
        });
      }
  
      // Final Question Section
      const questionSection = {
        children: [
          questionParagraph,
          ...optionParagraphs,
          new Paragraph(`[qtype] ${question.type}`),
          new Paragraph({ text: `[ans] ${question.answer}`, bold: true }),
          new Paragraph(`[Marks] [${positiveMarks || 0}, ${negativeMarks || 0}]`),
          solutionParagraph,
          new Paragraph(`[sortid] ${sortid++}`),
          new Paragraph({ text: "", spacing: { after: 400 } }), // Add spacing after each question
        ].filter(Boolean),
      };
  
      docSections.push(questionSection);
    }
  
    // Add a section break for the end of the questions
    docSections.push({
      children: [new Paragraph({ text: "[QQ]", pageBreakBefore: true })],
      spacing: { after: 400 }, // Add more space before the next section
    });
  
    // Process Paragraphs
    for (let i = 0; i < Paragraphs.length; i++) {
      const paragraph = Paragraphs[i];
      const paragraphImageTransform = paragraph.paragraphImage
        ? await processImage(paragraph.paragraphImage, maxImageWidth, maxImageHeight)
        : null;
      const paragraphSolutionImageTransform = paragraph.paragraphSolutionImage
        ? await processImage(paragraph.paragraphSolutionImage, maxImageWidth, maxImageHeight)
        : null;
  
      const questionOptionsParagraphs = [];
      if (paragraph.questionType === "truefalse") {
        questionOptionsParagraphs.push(
          new Paragraph({
            children: [
              new TextRun({ text: "(a) True", bold: true }),
            ],
            spacing: { after: 200 }, // Add spacing after each option paragraph
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "(b) False", bold: true }),
            ],
            spacing: { after: 200 }, // Add spacing after each option paragraph
          })
        );
      } else if (paragraph.questionType !== "nit") {
        for (let j = 0; j < paragraph.paraOptions.length; j++) {
          const option = paragraph.paraOptions[j];
          const optionTransform = option.image
            ? await processImage(option.image, maxImageWidth, maxImageHeight)
            : null;
  
          questionOptionsParagraphs.push(
            new Paragraph({
              children: [
                new TextRun({ text: `(${String.fromCharCode(97 + j)}) `, bold: true }),
                option.image
                  ? new ImageRun({
                      data: option.image.split(",")[1],
                      transformation: optionTransform,
                    })
                  : new TextRun("No image"),
              ],
              spacing: { after: 200 }, // Add spacing after each option paragraph
            })
          );
        }
      }
  
      const paragraphSection = {
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: `[p sortid]: ${paragraphSortid}`, bold: true }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `[qtype]: ${paragraph.questionType}`, bold: true }),
            ],
          }),
          paragraph.paragraphImage ? new Paragraph({
            children: [
              new TextRun({ text: "[p image]: ", bold: true }),
              new ImageRun({
                data: paragraph.paragraphImage.split(",")[1],
                transformation: paragraphImageTransform,
              }),
            ],
            spacing: { after: 400 }, // Add spacing after the image paragraph
          }) : null,
          paragraph.paragraphSolutionImage ? new Paragraph({
            children: [
              new TextRun({ text: "[p soln]: ", bold: true }),
              new ImageRun({
                data: paragraph.paragraphSolutionImage.split(",")[1],
                transformation: paragraphSolutionImageTransform,
              }),
            ],
            spacing: { after: 400 }, // Add spacing after the solution image paragraph
          }) : null,
          new Paragraph({
            children: [
              new TextRun({ text: "[ans] ", bold: true }),
              new TextRun(paragraph.paraanswers || "No answer provided"),
            ],
          }),
          ...questionOptionsParagraphs,
          new Paragraph(`[sortid] ${questionSortid++}`), // Add questionSortid for paragraph questions
          new Paragraph({ text: "", spacing: { after: 400 } }), // Add spacing after each paragraph
        ].filter(Boolean),
        properties: { pageBreakBefore: true }, // Start paragraph on a new page
      };
  
      docSections.push(paragraphSection);
      paragraphSortid++;
    }
  
    // Add a section break for the end of the document
    docSections.push({
      children: [new Paragraph({ text: "[QQ]", pageBreakBefore: true })],
      spacing: { after: 400 }, // Add more space before the next section
    });
  
    const doc = new Document({
      sections: docSections,
    });
  
    try {
      const blob = await Packer.toBlob(doc);
      saveAs(blob, "questions_with_options.docx");
      alert("Document has been downloaded successfully!");
    } catch (error) {
      console.error("Error creating the document:", error);
      alert("An error occurred while generating the document. Please try again.");
    }
    
  };
  const toggleInstructionsPage = () => {
    setIsInstructionsPage(!isInstructionsPage);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
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

    setQuestions(updatedQuestions);
  };
  const handleCheckboxChange = (e) => {

    const { name, checked } = e.target;
    if (name === "paragraph") setIncludeParagraph(checked);
    if (name === "solution") setIncludeSolution(checked)
    if (name === "optionE") {
      setAddOptionE(checked);
      setQuestions((prevQuestions) =>
        prevQuestions.map((q) => ({
          ...q,
          options: checked
            ? [...q.options, { text: "", image: null }] // Add Option E
            : q.options.slice(0, 4), // Remove Option E if unchecked
        }))
      );
    }
  };

  const renderComponent = () => {

    return (

      <div className="question-type-components">
        {/* Render MCQ if active */}
        {activeQuestionTypes.includes("Mcq") && (
          <div className="mcq-component">
            <MCQ

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
          </div>

        )}
        {/* Render MSQ if active */}
        {activeQuestionTypes.includes("Msq") && (
          <div className="msq-component">
            <MSQ
              handleParaQuestionPaste={handleParaQuestionPaste}
              handlePaste={handlePaste}
              processImage={processImage}          
              handleAnswerChange={handleAnswerChange}
              handleOptionPaste={handleOptionPaste}
              handleRemoveImage={handleRemoveImage}
              removeQuestion={removeQuestion}
              includeParagraph={includeParagraph}
              includeSolution={includeSolution}
              addOptionE={addOptionE}
              handleSave={handleSave}
            />
          </div>
        )
        }
        {/* Render Nit if active */}
        {activeQuestionTypes.includes("Nit") && (
          <div className="nit-component">
            <NIT
              handleParaQuestionPaste={handleParaQuestionPaste}
              handlePaste={handlePaste}
              processImage={processImage}
              handleAnswerChange={handleAnswerChange}
              handleOptionPaste={handleOptionPaste}
              handleRemoveImage={handleRemoveImage}
              removeQuestion={removeQuestion}
              includeParagraph={includeParagraph}
              includeSolution={includeSolution}
              addOptionE={addOptionE}
              handleSave={handleSave}
            />
          </div>
        )}
        {/* Render True/False if active */}
        {activeQuestionTypes.includes("True") && (
          <div className="true-component">
            <True
              handleParaQuestionPaste={handleParaQuestionPaste}
              handlePaste={handlePaste}
              processImage={processImage}
              handleAnswerChange={handleAnswerChange}
              handleOptionPaste={handleOptionPaste}
              handleRemoveImage={handleRemoveImage}
              removeQuestion={removeQuestion}
              includeParagraph={includeParagraph}
              includeSolution={includeSolution}
              addOptionE={addOptionE}
              handleSave={handleSave}

            />
          </div>
        )}
        {/* Render Assertion if active */}
        {activeQuestionTypes.includes("Assertion") && (
          <div className="assertion-component">
            <Assertion
              handleParaQuestionPaste={handleParaQuestionPaste}
              handlePaste={handlePaste}
              processImage={processImage}
              handleAnswerChange={handleAnswerChange}
              handleOptionPaste={handleOptionPaste}
              handleRemoveImage={handleRemoveImage}
              removeQuestion={removeQuestion}
              includeParagraph={includeParagraph}
              includeSolution={includeSolution}
              addOptionE={addOptionE}
              handleSave={handleSave}

            />
          </div>
        )}
        {includeParagraph && (
          <ParagraphCreation
            processImage={processImage}
            addOptionE={addOptionE}
            includeSolution={includeSolution}
          />
        )}

      </div>
    );
  };
  const addQuestion = () => {
    setQuestions((prevQuestions) => [
      ...prevQuestions,
      {
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
        questionNumber: questionCount, // Use the questionCount state
        type: selectedQuestionType,
      },
    ]);
    setQuestionCount((prevCount) => prevCount + 1); // Increment the questionCount
  };

  const processImage = (imageData, maxWidth, maxHeight) => {
    const img = new Image();
    img.src = imageData;

    return new Promise((resolve) => {
      img.onload = () => {
        const { naturalWidth, naturalHeight } = img;
        let width = naturalWidth;
        let height = naturalHeight;

        // Resize image if it exceeds max dimensions
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
    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];

      switch (type) {
        case "paragraph":
          updatedQuestions[index].paragraphImage = null; // Remove paragraph image
          break;
        case "paragraph-question":
          if (questionIndex !== null) {
            updatedQuestions[index].paraquestions[questionIndex].paraquestionImage = null; // Remove paragraph question image
          }
          break;
        case "question":
          updatedQuestions[index].questionImage = null; // Remove standalone question image
          break;
        case "solution":
          updatedQuestions[index].solutionImage = null; // Remove solution image
          break;
        default:
          if (type === "option" && questionIndex !== null) {
            updatedQuestions[index].options[questionIndex].image = null; // Remove option image
          }
          break;
      }

      return updatedQuestions;
    });
  };


  const removeQuestion = (index) => {
    setQuestions((prevQuestions) => prevQuestions.filter((_, i) => i !== index));
  };

  const handlePaste = (e, index) => {
    e.preventDefault();
    const clipboardItems = e.clipboardData.items;
    for (let i = 0; i < clipboardItems.length; i++) {
      if (clipboardItems[i].type.startsWith("image/")) {
        const file = clipboardItems[i].getAsFile();
        const reader = new FileReader();
        reader.onload = () => {
          const updatedQuestions = [...Questions];
          updatedQuestions[index].solutionImage = reader.result;
          setQuestions(updatedQuestions)
        };
        reader.readAsDataURL(file);
        break;
      }
    }
  };

  const handleParaQuestionPaste = (e, index, subIndex) => {
    e.preventDefault(); const clipboardItems = e.clipboardData.items; for (let i = 0; i < clipboardItems.length; i++) {
      if (clipboardItems[i].type.startsWith("image/")) {
        const file = clipboardItems[i].getAsFile(); const reader = new FileReader(); reader.onload = () => {
          const updatedQuestions = [...Questions]; updatedQuestions[index].paraquestions[subIndex].paraquestionImage = reader.result;
          setQuestions(updatedQuestions);
        };
        reader.readAsDataURL(file); break;
      }
    }
  };
  const handleOptionPaste = (e, index, optionIndex) => {
    console.log(index, optionIndex)
    e.preventDefault();
    const clipboardItems = e.clipboardData.items;
    for (let i = 0; i < clipboardItems.length; i++) {
      if (clipboardItems[i].type.startsWith("image/")) {
        const file = clipboardItems[i].getAsFile();
        const reader = new FileReader();
        reader.onload = () => {
          const updatedQuestions = [...Questions];
          updatedQuestions[index].options[optionIndex].image = reader.result;
          updatedQuestions[index].options[optionIndex].text = "";
          setQuestions(updatedQuestions)
        };
        reader.readAsDataURL(file);
        break;
      } else if (clipboardItems[i].type === "text/plain") {
        const text = e.clipboardData.getData("text");
        const updatedQuestions = [...Questions];
        updatedQuestions[index].options[optionIndex].text = text;
        updatedQuestions[index].options[optionIndex].image = null;
        setQuestions(updatedQuestions)
        break;
      }
    }
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

      <div className="main-content">
        {isInstructionsPage?(
          <Instruction/>
        ):(
        <>
        {renderComponent()}
        <button
         style={{ display: "block", width: "20%" }}
          onClick={addQuestion}
          className="save-button mcq-container"
        >
          Add New Question
        </button>
        <button
          style={{ display: "block", width: "20%" }}
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