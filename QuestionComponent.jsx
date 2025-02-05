import React, { useState, useContext, useEffect } from 'react';
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, ImageRun, TextRun } from "docx";
import './Questions.css';
import { QuestionsContext } from './QuestionsContext.jsx';
import PreviewModal from './PreviewModal.jsx';

const Management = () => {

  const [showModal, setShowModal] = useState(false);
  const [documentContent, setDocumentContent] = useState([]);
  const [positiveMarks, setPositiveMarks] = useState(0)
  const [negativeMarks, setNegativeMarks] = useState(0)
  const [Questions, setQuestions] = useState([])
  const [Paragraphs, setParagraphs] = useState([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for sidebar visibility
  const [clickedBox, setClickedBox] = useState(null);
  const [includeSolution, setIncludeSolution] = useState(true); // Option to include solution images


  const [addOptionE, setAddOptionE] = useState(false); // State for adding Option E
  const [includeParagraph, setIncludeParagraph] = useState(false); // State for including paragraph

  useEffect(() => {
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
  useEffect(() => {
    if (includeParagraph && Paragraphs.length === 0) {
      const defaultParagraph = {
        questionNumber: 1,
        paragraphImage: null,
        paragraphSolutionImage: null,
        questions: [], // Initialize with an empty array
      };
      setParagraphs([defaultParagraph]);
    }
  }, [includeParagraph, Paragraphs]);
  // Initialize state with one default question
  useEffect(() => {
    if (Questions.length === 0) {
      const defaultQuestion = {
        questionNumber: 1,
        questionType: 'mcq',
        questionImage: null,
        solutionImage: null,
        assertionImage: null,
        reasonImage: null,
        options: [
          { text: 'Option A', isCorrect: false, image: null },
          { text: 'Option B', isCorrect: false, image: null },
          { text: 'Option C', isCorrect: false, image: null },
          { text: 'Option D', isCorrect: false, image: null },
        ],
        answer: '',
        includeSolution: true, // Ensure this is set
      };
      setQuestions([defaultQuestion]);
    }
  }, [Questions, setQuestions]);



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
  const handleEdit = () => {
    setShowModal(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prevState => !prevState); // Toggle sidebar visibility
  };
  const handleSave = async () => {
    if (includeParagraph === false) {
      await handleSaveQuestions();
    } else if (includeParagraph == true) {
      await handleSaveParagraphs();
    }
    // Clear images
    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions.forEach((question) => {
        question.questionImage = null;
        question.solutionImage = null;
        question.assertionImage = null;
        question.reasonImage = null;
        question.options.forEach((option) => {
          option.image = null;
        });
      });
      return updatedQuestions;
    });
    setParagraphs((prevParagraphs) => {
      const updatedParagraphs = [...prevParagraphs];
      updatedParagraphs.forEach((paragraph) => {
        paragraph.paragraphImage = null;
        paragraph.paragraphSolutionImage = null;
        paragraph.questions.forEach((question) => {
          question.paraquestionImage = null;
          question.paraOptions.forEach((option) => {
            option.image = null;
          });
        });
      });
      return updatedParagraphs;
    });
  };
  const handleSaveQuestions = async () => {
    let sortid = 1;
    const questionMaxWidth = 600;
    const questionMaxHeight = 900;
    const optionMaxWidth = 600;
    const optionMaxHeight = 900;

    const docSections = [];

    // Clone questions to avoid direct mutation and potential cyclic references
    const clonedQuestions = JSON.parse(JSON.stringify(Questions));

    for (let index = 0; index < clonedQuestions.length; index++) {
      const question = clonedQuestions[index];

      // Process question image
      const questionImageTransform = question.questionImage
        ? await processImage(question.questionImage, questionMaxWidth, questionMaxHeight)
        : null;

      // Process solution image
      const solutionImageTransform = question.solutionImage
        ? await processImage(question.solutionImage, questionMaxWidth, questionMaxHeight)
        : null;

      // Process assertion image
      const assertionImageTransform = question.assertionImage
        ? await processImage(question.assertionImage, questionMaxWidth, questionMaxHeight)
        : null;

      // Process reason image
      const reasonImageTransform = question.reasonImage
        ? await processImage(question.reasonImage, questionMaxWidth, questionMaxHeight)
        : null;

      const questionTextRun = question.questionImage
        ? new ImageRun({
          data: question.questionImage.split(",")[1],
          transformation: questionImageTransform,
        })
        : new TextRun(question.questionText || "");

      const solutionTextRun = question.solutionImage
        ? new ImageRun({
          data: question.solutionImage.split(",")[1],
          transformation: solutionImageTransform,
        })
        : new TextRun(question.solutionText || "");

      const assertionTextRun = question.assertionImage
        ? new ImageRun({
          data: question.assertionImage.split(",")[1],
          transformation: assertionImageTransform,
        })
        : new TextRun(question.assertionText || "");

      const reasonTextRun = question.reasonImage
        ? new ImageRun({
          data: question.reasonImage.split(",")[1],
          transformation: reasonImageTransform,
        })
        : new TextRun(question.reasonText || "");

      const questionPart = new TextRun({ text: "[Q] ", bold: true });
      const solutionPart = new TextRun({ text: "    [soln] ", bold: true });
      const assertionPart = new TextRun({ text: "    [assertion] ", bold: true });
      const reasonPart = new TextRun({ text: "    [reason] ", bold: true });

      const questionParagraph = new Paragraph({
        children: [
          questionPart,
          questionTextRun,
        ],
      });

      const solutionParagraph = new Paragraph({
        children: [
          solutionPart,
          solutionTextRun,
        ],
      });

      const assertionParagraph = new Paragraph({
        children: [
          assertionPart,
          assertionTextRun,
        ],
      });

      const reasonParagraph = new Paragraph({
        children: [
          reasonPart,
          reasonTextRun,
        ],
      });

      // Create option paragraphs
      const optionParagraphs = [];
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
          })
        );
      }

      // Add question, options, and answer to document sections
      const questionSection = {
        children: [
          questionParagraph,
          ...optionParagraphs,
          new Paragraph(`[qtype] ${question.questionType.toUpperCase()}`),
          new Paragraph({ text: `[ans] ${question.answer}`, bold: true }),
          new Paragraph({ text: `[Marks] ${positiveMarks},${negativeMarks}`, bold: true }),
          new Paragraph(`[sortid] ${sortid++}`),
          solutionParagraph,
        ],
      };

      // Add assertion and reason paragraphs if the question type is 'assertion'
      if (question.questionType === 'assertion') {
        questionSection.children.push(assertionParagraph);
        questionSection.children.push(reasonParagraph);
      }

      docSections.push(questionSection);
    }

    docSections.push({
      children: [new Paragraph({ text: "[QQ]", bold: true })],
    });

    const doc = new Document({
      sections: docSections,
    });

    try {
      const blob = await Packer.toBlob(doc);
      setDocumentContent(blob);
      setShowModal(true);
      alert("Document has been created successfully!");
    } catch (error) {
      console.error("Error creating the document:", error);
    }
  };
  const handleSaveParagraphs = async () => {
    let sortid = 1;
    const questionMaxWidth = 600;
    const questionMaxHeight = 900;
    const optionMaxWidth = 600;
    const optionMaxHeight = 900;

    const docSections = [];

    // Clone paragraphs to avoid direct mutation and potential cyclic references
    const clonedParagraphs = JSON.parse(JSON.stringify(Paragraphs));

    for (let index = 0; index < clonedParagraphs.length; index++) {
      const paragraph = clonedParagraphs[index];

      // Process paragraph-specific properties
      const paragraphImageTransform = paragraph.paragraphImage
        ? await processImage(paragraph.paragraphImage, questionMaxWidth, questionMaxHeight)
        : null;

      const paragraphSolutionImageTransform = paragraph.paragraphSolutionImage
        ? await processImage(paragraph.paragraphSolutionImage, questionMaxWidth, questionMaxHeight)
        : null;

      const paragraphTextRun = paragraph.paraanswers
        ? new TextRun(paragraph.paraanswers)
        : ""

      const paragraphSection = {
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: "[Paragraph] ", bold: true }),
              paragraphTextRun,
            ],
          }),
        ],
      };

      // Add paragraph image if it exists
      if (paragraph.paragraphImage) {
        const paragraphImageRun = new ImageRun({
          data: paragraph.paragraphImage.split(",")[1],
          transformation: paragraphImageTransform,
        });

        paragraphSection.children.push(
          new Paragraph({
            children: [
              new TextRun({ text: "[pImage] ", bold: true }),
              paragraphImageRun,
            ],
          })
        );
      }

      // Add paragraph solution image if it exists
      if (paragraph.paragraphSolutionImage) {
        const solutionImageRun = new ImageRun({
          data: paragraph.paragraphSolutionImage.split(",")[1],
          transformation: paragraphSolutionImageTransform,
        });

        paragraphSection.children.push(
          new Paragraph({
            children: [
              new TextRun({ text: "[psoln] ", bold: true }),
              solutionImageRun,
            ],
          })
        );
      }

      // Process each question within the paragraph
      for (let questionIndex = 0; questionIndex < paragraph.questions.length; questionIndex++) {
        const question = paragraph.questions[questionIndex];

        // Process question image
        const questionImageTransform = question.paraquestionImage
          ? await processImage(question.paraquestionImage, questionMaxWidth, questionMaxHeight)
          : null;

        const questionTextRun = question.paraquestionImage
          ? new ImageRun({
            data: question.paraquestionImage.split(",")[1],
            transformation: questionImageTransform,
          })
          : new TextRun(question.paraanswers || "");

        const questionParagraph = new Paragraph({
          children: [
            new TextRun({ text: `[Question ${questionIndex + 1}] `, bold: true }),
            questionTextRun,
          ],
        });

        // Create option paragraphs
        const optionParagraphs = [];
        for (let i = 0; i < question.paraOptions.length; i++) {
          const option = question.paraOptions[i];
          const label = `(${String.fromCharCode(65 + i)}) `;
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
            })
          );
        }

        // Add question, options, and answer to document sections
        paragraphSection.children.push(
          questionParagraph,
          ...optionParagraphs,
          new Paragraph(`[qtype] ${question.questionType}`),
          new Paragraph({ text: `[ans] ${question.paraanswers}`, bold: true }),
          new Paragraph({ text: `[Marks] ${positiveMarks},${negativeMarks}`, bold: true }),
          new Paragraph(`[sortid] ${sortid++}`)
        );
      }

      docSections.push(paragraphSection);
    }

    // Final section marker
    docSections.push({
      children: [new Paragraph({ text: "[QQ]", bold: true })],
    });

    const doc = new Document({
      sections: docSections,
    });

    try {
      const blob = await Packer.toBlob(doc);
      setDocumentContent(blob);
      setShowModal(true);
      alert("Document has been created successfully!");
    } catch (error) {
      console.error("Error creating the document:", error);
    }
  };
  const handleIncludeSolutionChange = () => {
    console.log(includeSolution)
    setIncludeSolution(!includeSolution);
  };
  const handleImagePaste = (e, index, questionIndex, type, isParagraph = false) => {
    e.preventDefault();
    const clipboardItems = e.clipboardData.items;
    for (let i = 0; i < clipboardItems.length; i++) {
      if (clipboardItems[i].type.startsWith('image/')) {
        const file = clipboardItems[i].getAsFile();
        const reader = new FileReader();
        reader.onload = () => {
          console.log('Image pasted:', reader.result);
          if (isParagraph) {
            const updatedParagraphs = updateImage([...Paragraphs], index, questionIndex, null, reader.result, type, true);

            setParagraphs(updatedParagraphs);
          } else {
            const updatedQuestions = updateImage([...Questions], index, questionIndex, null, reader.result, type, false);

            setQuestions(updatedQuestions);
          }
        };
        reader.readAsDataURL(file);
        break;
      }
    }
  };

  const handleSidebarQuestionTypeChange = (index, newType) => {
    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      const question = updatedQuestions[index];
      question.answer = ''; // Reset the answer

      question.questionType = newType;
      if (newType === 'truefalse') {
        question.options = [
          { text: 'True', image: null },
          { text: 'False', image: null },
        ];
      } else if (newType === 'nit') {
        question.answer = '';
      } else if (newType === 'assertion') {
        question.assertionImage = null;
        question.reasonImage = null;
        question.options = [
          { text: 'Option A', image: null },
          { text: 'Option B', image: null },
          { text: 'Option C', image: null },
          { text: 'Option D', image: null },
        ];
      } else if (newType === 'mcq') {
        question.options = [
          { text: 'Option A', image: null },
          { text: 'Option B', image: null },
          { text: 'Option C', image: null },
          { text: 'Option D', image: null },
        ];
      } else if (newType === 'msq') {
        question.options = [
          { text: 'Option A', image: null },
          { text: 'Option B', image: null },
          { text: 'Option C', image: null },
          { text: 'Option D', image: null },
        ];
      }

      return updatedQuestions;
    });
  };
  const handleAnswerChange = (index, answer, optionIndex) => {

    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      const question = updatedQuestions[index];

      if (question.questionType === 'mcq') {
        question.answer = String.fromCharCode(65 + optionIndex); // Use the option letter (A, B, C, etc.)
      } else if (question.questionType === 'truefalse') {
        question.answer = answer; // Use the text value (True/False)
      } else if (question.questionType === 'assertion') {
        question.answer = String.fromCharCode(65 + optionIndex); // Use the option letter (A, B, C, etc.)
      } else if (question.questionType === 'msq') {

        const selectedOptions = question.answer ? question.answer.split(',') : [];

        const newOption = String.fromCharCode(65 + optionIndex);

        if (selectedOptions.length < 2) {
          // Add the option if it's not already selected
          if (!selectedOptions.includes(newOption)) {
            question.answer = [...selectedOptions, newOption].join(',');
          }
        } else if (selectedOptions.length === 2 && !selectedOptions.includes(newOption)) {
          // Show an alert message if the user tries to select a third option
          alert("You can only select up to 2 options for MSQ questions.");
        }

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

  const handleAddOptionEChange = (index) => {
    setAddOptionE(!addOptionE);
  };
  const handleParagraph = () => {

    setIncludeParagraph(!includeParagraph);
    if (!includeParagraph) {
      setParagraphs([]);
    } else {
      const defaultParagraph = {
        questionNumber: 1,
        paragraphImage: null,
        paragraphSolutionImage: null,
        questions: [
          {
            paraOptions: [
              { text: 'Option A', image: null },
              { text: 'Option B', image: null },
              { text: 'Option C', image: null },
              { text: 'Option D', image: null },
            ],
            paraanswers: '',
            paraquestionImage: '',
            questionType: 'mcq',
          },
        ],
      };
      setParagraphs([defaultParagraph]);
    }
  };
  const handleRemoveImage = (index, imageType, optionIndex, isParagraph = false) => {
    console.log(`Removing image: index=${index}, type=${imageType}, optionIndex=${optionIndex}`);

    if (imageType === null || imageType === undefined) {
      console.error('Type is null or undefined');
      return;
    }

    if (isParagraph) {
      setParagraphs((prevParagraphs) => {
        const updatedParagraphs = [...prevParagraphs];

        if (imageType === 'paragraph') {
          updatedParagraphs[index].paragraphImage = null;
        } else if (imageType === 'solution') {
          updatedParagraphs[index].paragraphSolutionImage = null;
        } else if (imageType === 'paraquestion') {
          updatedParagraphs[index].questions[optionIndex].paraquestionImage = null;
        } else if (typeof imageType === 'string' && imageType.startsWith('option')) {
          const optionIdx = parseInt(imageType.split('-')[1], 10);
          updatedParagraphs[index].questions[optionIndex].paraOptions[optionIdx].image = null;
        }

        return updatedParagraphs;
      });
    } else {
      setQuestions((prevQuestions) => {
        const updatedQuestions = [...prevQuestions];

        if (imageType === 'question') {
          updatedQuestions[index].questionImage = null;
        } else if (imageType === 'assertion') {
          updatedQuestions[index].assertionImage = null;
        } else if (imageType === 'reason') {
          updatedQuestions[index].reasonImage = null;
        } else if (imageType === 'solution') {
          updatedQuestions[index].solutionImage = null;
        } else if (typeof imageType === 'string' && imageType.startsWith('option')) {
          const optionIdx = parseInt(imageType.split('-')[1], 10);
          updatedQuestions[index].options[optionIdx].image = null;
        }

        return updatedQuestions;
      });
    }
  };
  const handleNumQuestionsChange = (paragraphIndex, value) => {
    const updatedParagraphs = [...Paragraphs];
    const numQuestions = Math.max(1, parseInt(value) || 1);
    const currentParagraph = updatedParagraphs[paragraphIndex] || { questions: [] };

    while (currentParagraph.questions.length < numQuestions) {
      currentParagraph.questions.push({
        paraOptions: [
          { text: 'Option A', image: null },
          { text: 'Option B', image: null },
          { text: 'Option C', image: null },
          { text: 'Option D', image: null },
        ],
        paraanswers: '',
        paraquestionImage: '',
        questionType: 'mcq',
        questionNumber: currentParagraph.questions.length + 1,
      });
    }

    while (currentParagraph.questions.length > numQuestions) {
      currentParagraph.questions.pop();
    }

    updatedParagraphs[paragraphIndex] = currentParagraph;
    setParagraphs(updatedParagraphs);
  };
  const handleParagraphQuestionTypeChange = (paragraphIndex, questionIndex, type) => {
    console.log(Paragraphs);
    const updatedParagraphs = [...Paragraphs];
    updatedParagraphs[paragraphIndex].questions[questionIndex].questionType = type;
    updatedParagraphs[paragraphIndex].questions[questionIndex].paraanswers = ''; // Reset the answer

    setParagraphs(updatedParagraphs);
  };
  const handleParagraphAnswerChange = (paragraphIndex, questionIndex, newAnswer, optionIndex = null) => {
    const updatedParagraphs = [...Paragraphs];
    const question = updatedParagraphs[paragraphIndex].questions[questionIndex];
    const questionType = question.questionType;

    if (questionType === 'mcq') {
      question.paraanswers = String.fromCharCode(65 + optionIndex); // Use the option letter (A, B, C, etc.)
    } else if (questionType === 'msq') {
      const selectedOptions = question.paraanswers ? question.paraanswers.split(',') : [];
      const newOption = String.fromCharCode(65 + optionIndex);

      if (selectedOptions.includes(newOption)) {
        // Remove the option if it was already selected
        question.paraanswers = selectedOptions.filter(option => option !== newOption).join(',');
      } else {
        // Add the option if it was not selected
        question.paraanswers = [...selectedOptions, newOption].join(',');

        // Limit the number of selected options to 2
        if (question.paraanswers.split(',').length > 2) {
          question.paraanswers = selectedOptions.join(',');
          alert('You can only select up to 2 options for MSQ questions.');
        }
      }
    } else if (questionType === 'truefalse') {
      question.paraanswers = newAnswer; // Use the text value (True/False)
    } else if (questionType === 'nit') {
      if (/^[^a-zA-Z]*$/.test(newAnswer)) {
        question.paraanswers = newAnswer; // Use the numeric value
      } else {
        alert('Only numbers and special characters are allowed for NIT questions.');
      }
    }

    setParagraphs(updatedParagraphs);
  };
  const renderOptions = (question, index) => {
    const options = addOptionE ? [...question.options, { text: 'Option E', image: null }] : question.options;
    return options.map((option, optionIndex) => (
      <div key={optionIndex} className="option-item">
        <label>
          <input
            type={question.questionType === 'mcq' || question.questionType === 'assertion' || question.questionType === 'truefalse' ? 'radio' : 'checkbox'}
            name={`answer-${index}`}
            onChange={() => handleAnswerChange(index, option.text, optionIndex)}
            checked={question.questionType === 'truefalse' ? question.answer === option.text : (question.questionType === 'msq' ? question.answer.includes(String.fromCharCode(65 + optionIndex)) : question.answer === String.fromCharCode(65 + optionIndex))}
          />
          {option.text}
        </label>
        {(question.questionType === 'mcq' || question.questionType === 'assertion' || question.questionType === 'msq') && (
          <div
            className={`option-box ${clickedBox === `option-${index}-${optionIndex}` ? 'clicked' : ''}`}
            onClick={() => handleClickBox(`option-${index}-${optionIndex}`)}
            onPaste={(e) => handleImagePaste(e, index, null, `option-${optionIndex}`)}
          >
            {option.image ? (
              <>
                <img src={option.image} alt={`Option ${String.fromCharCode(65 + optionIndex)}`} style={{ maxWidth: '100%' }} />
                <button onClick={() => handleRemoveImage(index, `option-${optionIndex}`, optionIndex)} className="remove-button">Remove</button>
              </>
            ) : (
              'Paste your option image here (Ctrl+V)'
            )}
          </div>
        )}
      </div>
    ));
  };
  const updateImage = (updatedItems, index, questionIndex, optionIndex, readerResult, type, isParagraph) => {
    if (isParagraph) {
      if (type === 'paragraph') {
        updatedItems[index].paragraphImage = readerResult;
      } else if (type === 'solution') {
        updatedItems[index].paragraphSolutionImage = readerResult;
      } else if (type === 'paraquestion') {
        updatedItems[index].questions[questionIndex].paraquestionImage = readerResult;
      } else if (typeof type === 'string' && type.startsWith('option')) {
        const optionIndex = parseInt(type.split('-')[1]);
        updatedItems[index].questions[questionIndex].paraOptions[optionIndex].image = readerResult;
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
      } else if (typeof type === 'string' && type.startsWith('option')) {
        const optionIndex = parseInt(type.split('-')[1]);
        updatedItems[index].options[optionIndex].image = readerResult;
      }
    }
    return updatedItems;
  };
  const renderQuestions = () => {
    return Questions.map((question, index) => (
      <div key={index} className="question-item">
        <h3>{question.questionType.toUpperCase()} </h3>
        {/* Question Image Section */}
        <div className="question-image-container">
          <h3>Paste Image for Question</h3>
          <div
            className={`option-box ${clickedBox === `question-${index}` ? 'clicked' : ''}`}
            onClick={() => handleClickBox(`question-${index}`)}
            onPaste={(e) => handleImagePaste(e, index, null, 'question')}
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
          <div className="assertion-reason-container">
            <h3>Paste Image for Assertion</h3>
            <div
              className={`option-box ${clickedBox === `assertion-${index}` ? 'clicked' : ''}`}
              onClick={() => handleClickBox(`assertion-${index}`)}
              onPaste={(e) => handleImagePaste(e, index, null, 'assertion')}
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
            <h3>Paste Image for Reason</h3>
            <div
              className={`option-box ${clickedBox === `reason-${index}` ? 'clicked' : ''}`}
              onClick={() => handleClickBox(`reason-${index}`)}
              onPaste={(e) => handleImagePaste(e, index, null, 'reason')}
            >
              {question.reasonImage ? (
                <>
                  <img src={question.reasonImage} alt={`Reason ${index + 1}`} style={{ maxWidth: '100%' }} />
                  <button onClick={() => handleRemoveImage(index, 'reason')} className="remove-button">Remove</button>
                </>
              ) : (
                'Paste your reason image here (Ctrl+V)'
              )}
            </div>
          </div>
        )}
        {/* Options Section */}
        {question.questionType !== 'nit' && question.questionType !== 'assertion' && (
          renderOptions(question, index)
        )}
        {question.questionType === 'assertion' && (
          renderOptions(question, index)
        )}
        {/* NIT Answer Box */}
        {question.questionType === 'nit' && (
          <div className="nit-answer-container">
            <label>Answer:</label>
            <input
              className='input-field'
              type="text"
              value={question.answer}
              onChange={(e) => handleNITAnswerChange(index, e.target.value)}
              pattern="[0-9]*"
            />
          </div>
        )}
        {/* Solution Image Section */}
        {includeSolution && (
          <div className="solution-image-container">
            <h3>Paste Image for Solution</h3>
            <div
              className={`option-box ${clickedBox === `solution-${index}` ? 'clicked' : ''}`}
              onClick={() => handleClickBox(`solution-${index}`)}
              onPaste={(e) => handleImagePaste(e, index, null, 'solution')}
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
          {question.questionType !== 'nit' && <label>Selected Answer:</label>}
          {question.questionType === 'mcq' && (
            <input type="text" className='selectedAnswerInput' value={question.answer} readOnly />
          )}
          {question.questionType === 'msq' && (
            <input type="text" className='selectedAnswerInput' value={question.answer.split(',').join(', ')} readOnly />
          )}
          {question.questionType === 'truefalse' && (
            <input type="text" className='selectedAnswerInput' value={question.answer} readOnly />
          )}
          {question.questionType === 'assertion' && (
            <input type="text" className='selectedAnswerInput' value={question.answer} readOnly />
          )}
        </div>
      </div>
    ));
  };
  const renderParagraphs = () => {
    return Paragraphs.map((paragraph, paragraphIndex) => (
      <div key={paragraphIndex} className="paragraph-section">
        <h3>Paragraph</h3>
        <input
          className="input-field"
          type="number"
          onChange={(e) => handleNumQuestionsChange(paragraphIndex, e.target.value)}
          placeholder="Number of Questions for paragraph"
        />
        <div className="paragraph-image-container">
          <h3>Paste Image for Paragraph</h3>
          <div
            className={`option-box ${clickedBox === `paragraph-image-${paragraphIndex}` ? 'clicked' : ''}`}
            onClick={() => setClickedBox(`paragraph-image-${paragraphIndex}`)}
            onPaste={(e) => handleImagePaste(e, paragraphIndex, null, 'paragraph', true)}
          >
            {paragraph.paragraphImage ? (
              <>
                <img src={paragraph.paragraphImage} alt="Paragraph" style={{ maxWidth: '100%' }} />
                <button onClick={() => handleRemoveImage(paragraphIndex, 'paraquestion', questionIndex, true)} className="remove-button">Remove Image</button>
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
              onPaste={(e) => handleImagePaste(e, paragraphIndex, null, 'solution', true)}
            >
              {paragraph.paragraphSolutionImage ? (
                <>
                  <img src={paragraph.paragraphSolutionImage} alt="Solution" style={{ maxWidth: '100%' }} />
                  <button onClick={() => handleRemoveImage(paragraphIndex, 'solution', null, true)} className="remove-button">Remove Image</button>
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
                onPaste={(e) => handleImagePaste(e, paragraphIndex, questionIndex, 'paraquestion', true)}
              >
                {question.paraquestionImage ? (
                  <>
                    <img src={question.paraquestionImage} alt={`Question ${questionIndex + 1}`} style={{ maxWidth: '100%' }} />
                    <button onClick={() => handleRemoveImage(paragraphIndex, 'paraquestion', questionIndex, true)} className="remove-button">Remove Image</button>
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
                      onPaste={(e) => handleImagePaste(e, paragraphIndex, questionIndex, `option-${optionIndex}`, true)}
                    >
                      {option.image ? (
                        <div>
                          <img src={option.image} alt={`Option ${String.fromCharCode(65 + optionIndex)}`} style={{ maxWidth: '100%' }} />
                          <button onClick={() => handleRemoveImage(paragraphIndex, `option-${optionIndex}`, questionIndex, true)} className="remove-button">Remove Image</button>
                        </div>
                      ) : (
                        'Paste your option image here (Ctrl+V)'
                      )}
                    </div>
                  </div>
                ))}

              </>
            )}
          </div>
        ))}

      </div>
    ));
  };
  return (
    <div className="container">
      <button onClick={toggleSidebar} className="sidebar-toggle">
        ☰ {/* Menu Icon */}
      </button>
      <div className={`sidebar ${isSidebarOpen ? 'show' : ''}`}>
        <h3>Question Management :</h3>
        <label>Question Type:</label>
        <select
          value={Questions[0]?.questionType}
          onChange={(e) => handleSidebarQuestionTypeChange(0, e.target.value)}
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
        <div style={{ marginBottom: "10px" }}>
          <div className="checkbox-group">
            <input
              type="checkbox"
              checked={includeSolution}
              onChange={() => handleIncludeSolutionChange(0)}
            />
            <span style={{ marginLeft: "18px", fontSize: "larger" }}>Include Solution</span>
          </div>
        </div>
        <div>
          <div className="checkbox-group">
            <input
              type="checkbox"
              checked={addOptionE}
              onChange={() => handleAddOptionEChange(0)}
            />
            <span style={{ marginLeft: "18px", fontSize: "larger" }}>Add Option E</span>
          </div>
        </div>
        <div>
          <div className="checkbox-group">
            <input
              type="checkbox"
              checked={includeParagraph}
              onChange={handleParagraph}
            />
            <span style={{ marginLeft: "18px", fontSize: "larger" }}>Include Paragraph</span>
          </div>
        </div>
      </div>
      <div className="main-content">
        {includeParagraph == false && renderQuestions()}
        {includeParagraph && renderParagraphs()}
        {Questions.length > 0 && (
          <div>
            <button
              style={{ display: "block" }}
              className="save-button mcq-container"
              onClick={handleSave}
            >
              Save Docx
            </button>
            <PreviewModal
              show={showModal}
              handleClose={() => setShowModal(false)}
              documentContent={documentContent}
              handleEdit={handleEdit}
            />

          </div>
        )}
      </div>
    </div>
  );
};

export default Management;
