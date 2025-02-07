import React, { useState, useContext, useEffect } from 'react';
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, ImageRun, TextRun } from "docx";
import './Questions.css';
import PreviewModal from './PreviewModal.jsx';

const Management = () => {
  const [boxBackgroundColor, setBoxBackgroundColor] = useState('');
  const [combinedItems, setCombinedItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [documentContent, setDocumentContent] = useState([]);
  const [positiveMarks, setPositiveMarks] = useState(0)
  const [negativeMarks, setNegativeMarks] = useState(0)
  const [Questions, setQuestions] = useState([])
  const [Paragraphs, setParagraphs] = useState([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [clickedBox, setClickedBox] = useState(null);
  const [includeSolution, setIncludeSolution] = useState(true); 
  const [addOptionE, setAddOptionE] = useState(false);
  const [includeParagraph, setIncludeParagraph] = useState(false);
 // Initialize combinedItems as an empty array
useEffect(() => {
  setCombinedItems([]);
  sessionStorage.setItem('combinedItems', JSON.stringify([]));
}, []);
  
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
  const handleToggleIncludeParagraph = () => {
    setIncludeParagraph(!includeParagraph);
  };
  useEffect(() => {
    // Initialize with one default question
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
        url:"",
      
      };
      setQuestions([defaultQuestion]);
    }

    // Initialize with one default paragraph
    if (Paragraphs.length === 0) {
      const defaultParagraph = {
        paragraphNumber: 1,
        paragraphImage: null,
        paragraphSolutionImage: null,
        questions: [
          {
            questionNumber: 1,
            questionType: 'mcq',
            paraquestionImage: null,
            url:"",
            paraOptions: [
              { text: 'Option A', image: null },
              { text: 'Option B', image: null },
              { text: 'Option C', image: null },
              { text: 'Option D', image: null },
            ],
            paraanswers: '',
           
          },
        ],
      };
      setParagraphs([defaultParagraph]);
    }
    
  }, [Questions, Paragraphs]);
  const handleUrlChange = (index, url) => {
    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions[index].url = url;
      return updatedQuestions;
    });
  };
  const handleSaveQuestion = (index) => {
    const originalQuestion = JSON.parse(JSON.stringify(Questions[index]));
  
    // Save original question with images to session storage
    const savedOriginalQuestions = JSON.parse(sessionStorage.getItem('originalQuestions')) || [];
    savedOriginalQuestions.push(originalQuestion);
    sessionStorage.setItem('originalQuestions', JSON.stringify(savedOriginalQuestions));
  
    // Update combinedItems with the original question
    const updatedCombinedItems = JSON.parse(sessionStorage.getItem('combinedItems')) || [];
    updatedCombinedItems.push(originalQuestion);
    setCombinedItems(updatedCombinedItems);
    sessionStorage.setItem('combinedItems', JSON.stringify(updatedCombinedItems));
  
    // Remove images from the displayed state
    const question = JSON.parse(JSON.stringify(originalQuestion));
    question.questionImage = null;
    question.solutionImage = null;
    question.assertionImage = null;
    question.reasonImage = null;
     question.answer = '';
    question.options.forEach((option) => {
      option.image = null;
    });
  
    // Save to session storage
    const savedQuestions = JSON.parse(sessionStorage.getItem('questions')) || [];
    savedQuestions.push(question);
    sessionStorage.setItem('questions', JSON.stringify(savedQuestions));
  
    // Update state
    const updatedQuestions = [...Questions];
    updatedQuestions[index] = question;
    setQuestions(updatedQuestions);
  };
  const handleSaveParagraph = (index) => {
    const originalParagraph = JSON.parse(JSON.stringify(Paragraphs[index]));
  
    // Save original paragraph with images to session storage
    const savedOriginalParagraphs = JSON.parse(sessionStorage.getItem('originalParagraphs')) || [];
    savedOriginalParagraphs.push(originalParagraph);
    sessionStorage.setItem('originalParagraphs', JSON.stringify(savedOriginalParagraphs));
  
    // Update combinedItems with the original paragraph
    const updatedCombinedItems = JSON.parse(sessionStorage.getItem('combinedItems')) || [];
    updatedCombinedItems.push(originalParagraph);
    setCombinedItems(updatedCombinedItems);
    sessionStorage.setItem('combinedItems', JSON.stringify(updatedCombinedItems));
  
    // Remove images and answers from the displayed state
    const paragraph = JSON.parse(JSON.stringify(originalParagraph));
    paragraph.paragraphImage = null;
    paragraph.paragraphSolutionImage = null;
    paragraph.questions.forEach((question) => {
      question.paraquestionImage = null;
      question.paraanswers = ''; // Remove the answer
      question.paraOptions.forEach((option) => {
        option.image = null;
      });
    });
  
    // Log the paragraph to check if images and answers are removed
    console.log('Paragraph after removing images and answers:', paragraph);
  
    // Save to session storage
    const savedParagraphs = JSON.parse(sessionStorage.getItem('paragraphs')) || [];
    savedParagraphs.push(paragraph);
    sessionStorage.setItem('paragraphs', JSON.stringify(savedParagraphs));
  
    // Update state
    const updatedParagraphs = [...Paragraphs];
    updatedParagraphs[index] = paragraph;
    setParagraphs(updatedParagraphs);
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
  const handleEdit = () => {
    setShowModal(false);
  };
  const handleParagraphUrlChange = (paragraphIndex, questionIndex, url) => {
    const updatedParagraphs = [...Paragraphs];
    updatedParagraphs[paragraphIndex].questions[questionIndex].url = url;
    setParagraphs(updatedParagraphs);
  };
  const handleSaveCombinedItems = async () => {
    debugger
    const combinedItems = JSON.parse(sessionStorage.getItem('combinedItems')) || [];
    console.log(combinedItems)
    let sortid = 1;
    const questionMaxWidth = 600;
    const questionMaxHeight = 900;
    const optionMaxWidth = 600;
    const optionMaxHeight = 900;
    let Paragraphid = 1;
    let questionid=1;
    const docSections = [];
  
    for (let item of combinedItems) {
      if (item.questionNumber) {
        // Handle question logic
        const questionImageTransform = item.questionImage
          ? await processImage(item.questionImage, questionMaxWidth, questionMaxHeight)
          : null;
        const solutionImageTransform = item.solutionImage
          ? await processImage(item.solutionImage, questionMaxWidth, questionMaxHeight)
          : null;
        const assertionImageTransform = item.assertionImage
          ? await processImage(item.assertionImage, questionMaxWidth, questionMaxHeight)
          : null;
        const reasonImageTransform = item.reasonImage
          ? await processImage(item.reasonImage, questionMaxWidth, questionMaxHeight)
          : null;
  
        const questionTextRun = item.questionImage
          ? new ImageRun({
              data: item.questionImage.split(",")[1],
              transformation: questionImageTransform,
            })
          : new TextRun(item.questionText || "");
        const solutionTextRun = item.solutionImage
          ? new ImageRun({
              data: item.solutionImage.split(",")[1],
              transformation: solutionImageTransform,
            })
          : new TextRun(item.solutionText || "");
        const assertionTextRun = item.assertionImage
          ? new ImageRun({
              data: item.assertionImage.split(",")[1],
              transformation: assertionImageTransform,
            })
          : new TextRun(item.assertionText || "");
        const reasonTextRun = item.reasonImage
          ? new ImageRun({
              data: item.reasonImage.split(",")[1],
              transformation: reasonImageTransform,
            })
          : new TextRun(item.reasonText || "");
  
        const questionPart = new TextRun({ text: "[Q] ", bold: true });
        const solutionPart = new TextRun({ text: " [soln] ", bold: true });
        const assertionPart = new TextRun({ text: " [assertion] ", bold: true });
        const reasonPart = new TextRun({ text: " [reason] ", bold: true });
  
        const questionParagraph = new Paragraph({
          children: [questionPart, questionTextRun],
        });
        const solutionParagraph = new Paragraph({
          children: [solutionPart, solutionTextRun],
        });
        const assertionParagraph = new Paragraph({
          children: [assertionPart, assertionTextRun],
        });
        const reasonParagraph = new Paragraph({
          children: [reasonPart, reasonTextRun],
        });
  
        const optionParagraphs = [];
        if (item.questionType !== "nit") {
          for (let i = 0; i < item.options.length; i++) {
            const option = item.options[i];
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
        }
  
        const questionSection = {
          children: [
            questionParagraph,
            ...optionParagraphs,
            new Paragraph(`[qtype] ${item.questionType.toUpperCase()}`),
            new Paragraph({ text: `[ans] ${item.answer}`, bold: true }),
            new Paragraph({ text: `[Marks] [+${positiveMarks}, -${negativeMarks}]`, bold: true }),
            new Paragraph(`[sortid]  ${sortid++}`),
            new Paragraph(`[vsoln]  ${item.url}`),
            solutionParagraph,
          ],
        };
  
        if (item.questionType === "assertion") {
          questionSection.children.push(assertionParagraph);
          questionSection.children.push(reasonParagraph);
        }
  
        docSections.push(questionSection);
      } else if (item.paragraphNumber) {
        // Handle paragraph logic
        const paragraphImageTransform = item.paragraphImage
          ? await processImage(item.paragraphImage, questionMaxWidth, questionMaxHeight)
          : null;
        const paragraphSolutionImageTransform = item.paragraphSolutionImage
          ? await processImage(item.paragraphSolutionImage, questionMaxWidth, questionMaxHeight)
          : null;
  
        const paragraphTextRun = item.paraanswers
          ? new TextRun(item.paraanswers)
          : "";
  
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
  
        if (item.paragraphImage) {
          const paragraphImageRun = new ImageRun({
            data: item.paragraphImage.split(",")[1],
            transformation: paragraphImageTransform,
          });
          paragraphSection.children.push(
            new Paragraph({
              children: [
                new TextRun({ text: "[PRG] ", bold: true }),
                paragraphImageRun,
              ],
            })
          );
        }
  
     
        for (let questionIndex = 0; questionIndex < item.questions.length; questionIndex++) {
          const question = item.questions[questionIndex];
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
  
          const optionParagraphs = [];
          if (question.questionType === "truefalse") {
            const trueOption = new Paragraph({
              children: [
                new TextRun({ text: "(a) True", bold: true }),
              ],
            });
            const falseOption = new Paragraph({
              children: [
                new TextRun({ text: "() False", bold: true }),
              ],
            });
            optionParagraphs.push(trueOption, falseOption);
          } else {
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
          }
  
          paragraphSection.children.push(
            questionParagraph,
            ...optionParagraphs,
            new Paragraph(`[qtype] ${question.questionType}`),
            new Paragraph({ text: `[ans] ${question.paraanswers}`, bold: true }),
           new Paragraph({ text: `[Marks] [+${positiveMarks}, -${negativeMarks}]`, bold: true }),
            new Paragraph(`[sortid] ${sortid++}`),
            new Paragraph(`[QID] ${questionid++}`),
            new Paragraph(`[PQNO] ${Paragraphid}`),
            new Paragraph(`[vsoln] ${question.url}`),
          );
          if (item.paragraphSolutionImage) {
            const solutionImageRun = new ImageRun({
              data: item.paragraphSolutionImage.split(",")[1],
              transformation: paragraphSolutionImageTransform,
            });
            paragraphSection.children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: "[soln] ", bold: true }),
                  solutionImageRun,
                ],
              })
            );
          }
    
        }
  
        Paragraphid++;
        docSections.push(paragraphSection);
      }
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
  const handleDownload = async () => {
    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions.forEach((question) => {
        question.questionImage = null;
        question.solutionImage = null;
        question.assertionImage = null;
        question.answer=""
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
        paragraph.answer=""
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
    // Download the document
    const blob = new Blob([documentContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    saveAs(blob, 'document.docx');
    setShowModal(false);
  };
 
  const handleIncludeSolutionChange = () => {
    
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
 setBoxBackgroundColor(boxBackgroundColor === '#9c9cb5' ? '' : '#9c9cb5');
  };
  const handleAddOptionEChange = (index) => {
    setAddOptionE(!addOptionE);
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
    const options = addOptionE && !question.options.some(option => option.text === 'Option E')
        ? [...question.options, { text: 'Option E', image: null }]
        : question.options;
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
                    style={{ backgroundColor: clickedBox === `option-${index}-${optionIndex}` ? '#b6b6c5' : '' }}
                >
                    {option.image ? (
                        <>
                            <img src={option.image} alt={`Option ${String.fromCharCode(65 + optionIndex)}`} style={{ maxWidth: '100%' }} />
                            <i onClick={() => handleRemoveImage(index, `option-${optionIndex}`, optionIndex)} className="fa-sharp fa-solid fa-rectangle-xmark"></i>
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
            const optionIdx = parseInt(type.split('-')[1], 10);
            const existingOptionE = updatedItems[index].questions[questionIndex].paraOptions.find(option => option.text === 'Option E');
            if (existingOptionE) {
                existingOptionE.image = readerResult;
            } else if (optionIdx === updatedItems[index].questions[questionIndex].paraOptions.length) {
                updatedItems[index].questions[questionIndex].paraOptions.push({ text: 'Option E', image: readerResult });
            } else {
                updatedItems[index].questions[questionIndex].paraOptions[optionIdx].image = readerResult;
            }
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
            const optionIdx = parseInt(type.split('-')[1], 10);
            const existingOptionE = updatedItems[index].options.find(option => option.text === 'Option E');
            if (existingOptionE) {
                existingOptionE.image = readerResult;
            } else if (optionIdx === updatedItems[index].options.length) {
                updatedItems[index].options.push({ text: 'Option E', image: readerResult });
            } else {
                updatedItems[index].options[optionIdx].image = readerResult;
            }
        }
    }
    return updatedItems;
};
const renderQuestions = () => {
  if (Questions.length > 0) {
    const currentQuestion = Questions[0];
    return (
      <div key={0} className="question-item">
        <h3>{currentQuestion.questionType.toUpperCase()} </h3>
        {/* Question Image Section */}
        <div className="question-image-container">
          <h3>Paste Image for Question</h3>
          <div
            className={`option-box ${clickedBox === `question-0` ? 'box' : ''}`}
            onClick={() => handleClickBox(`question-0`)}
            onPaste={(e) => handleImagePaste(e, 0, null, 'question')}
            style={{ backgroundColor: clickedBox === `question-0` ? '#b6b6c5' : '' }}
          >
            {currentQuestion.questionImage ? (
              <>
                <img src={currentQuestion.questionImage} alt={`Question 1`} style={{ maxWidth: '100%' }} />
                <i onClick={() => handleRemoveImage(0, 'question')} className="fa-sharp fa-solid fa-rectangle-xmark"></i>
              </>
            ) : (
              'Paste your question image here (Ctrl+V)'
            )}
          </div>
        </div>
        {/* Assertion and Reason Images Section */}
        {currentQuestion.questionType === 'assertion' && (
          <div className="assertion-reason-container">
            <h3>Paste Image for Assertion</h3>
            <div
              className={`option-box ${clickedBox === `assertion-0` ? 'clicked' : ''}`}
              onClick={() => handleClickBox(`assertion-0`)}
              onPaste={(e) => handleImagePaste(e, 0, null, 'assertion')}
              style={{ backgroundColor: clickedBox === `assertion-0` ? '#b6b6c5' : '' }}
            >
              {currentQuestion.assertionImage ? (
                <>
                  <img src={currentQuestion.assertionImage} alt={`Assertion 1`} style={{ maxWidth: '100%' }} />
                  <i onClick={() => handleRemoveImage(0, 'assertion')} className="fa-sharp fa-solid fa-rectangle-xmark"></i>
                </>
              ) : (
                'Paste your assertion image here (Ctrl+V)'
              )}
            </div>
            <h3>Paste Image for Reason</h3>
            <div
              className={`option-box ${clickedBox === `reason-0` ? 'clicked' : ''}`}
              onClick={() => handleClickBox(`reason-0`)}
              onPaste={(e) => handleImagePaste(e, 0, null, 'reason')}
              style={{ backgroundColor: clickedBox === `reason-0` ? '#b6b6c5' : '' }}
            >
              {currentQuestion.reasonImage ? (
                <>
                  <img src={currentQuestion.reasonImage} alt={`Reason 1`} style={{ maxWidth: '100%' }} />
                  <i onClick={() => handleRemoveImage(0, 'reason')} className="fa-sharp fa-solid fa-rectangle-xmark"></i>
                </>
              ) : (
                'Paste your reason image here (Ctrl+V)'
              )}
            </div>
          </div>
        )}
        {/* Options Section */}
        {currentQuestion.questionType !== 'nit' && currentQuestion.questionType !== 'assertion' && (
          renderOptions(currentQuestion, 0)
        )}
        {currentQuestion.questionType === 'assertion' && (
          renderOptions(currentQuestion, 0)
        )}
        {/* NIT Answer Box */}
        {currentQuestion.questionType === 'nit' && (
          <div className="nit-answer-container">
            <label>Answer:</label>
            <input
              style={{ margin: "12px", borderRadius: "5px", textAlign: "center", padding: "10px" }}
              className='input-field'
              type="text"
              value={currentQuestion.answer}
              placeholder='Enter Answer here'
              onChange={(e) => handleNITAnswerChange(0, e.target.value)}
              pattern="[0-9]*"
            />
            <div><b>Entered Answer</b>: {currentQuestion.answer}</div>
          </div>
        )}
        {/* Solution Image Section */}
        {includeSolution && (
          <div className="solution-image-container">
            <h3>Paste Image for Solution</h3>
            <div
              className={`option-box ${clickedBox === `solution-0` ? 'clicked' : ''}`}
              onClick={() => handleClickBox(`solution-0`)}
              onPaste={(e) => handleImagePaste(e, 0, null, 'solution')}
              style={{ backgroundColor: clickedBox === `solution-0` ? '#b6b6c5' : '' }}
            >
              {currentQuestion.solutionImage ? (
                <>
                  <img src={currentQuestion.solutionImage} alt={`Solution 1`} style={{ maxWidth: '100%' }} />
                  <i onClick={() => handleRemoveImage(0, 'solution')} className="fa-sharp fa-solid fa-rectangle-xmark"></i>
                </>
              ) : (
                'Paste your solution image here (Ctrl+V)'
              )}
            </div>
          </div>
        )}
        <label>URL:</label>
<input
  className='url'
  type="text"
  value={currentQuestion.url}
  onChange={(e) => handleUrlChange(0, e.target.value)}
  placeholder="Enter URL here"
/>
        {/* Selected Answer Box */}
        <div className="selected-answer-container">
          {currentQuestion.questionType !== 'nit' && <label>Selected Answer:</label>}
          {currentQuestion.questionType === 'mcq' && (
            <input style={{ margin: "12px", borderRadius: "5px", textAlign: "center", padding: "10px" }} type="text" className='selectedAnswerInput' value={currentQuestion.answer} readOnly />
          )}
          {currentQuestion.questionType === 'msq' && (
            <input style={{ margin: "12px", borderRadius: "5px", textAlign: "center", padding: "10px" }} type="text" className='selectedAnswerInput' value={currentQuestion.answer.split(',').join(', ')} readOnly />
          )}
          {currentQuestion.questionType === 'truefalse' && (
            <input style={{ margin: "12px", borderRadius: "5px", textAlign: "center", padding: "10px" }} type="text" className='selectedAnswerInput' value={currentQuestion.answer} readOnly />
          )}
          {currentQuestion.questionType === 'assertion' && (
            <input style={{ margin: "12px", borderRadius: "5px", textAlign: "center", padding: "10px" }} type="text" className='selectedAnswerInput' value={currentQuestion.answer} readOnly />
          )}
        </div>
        <button className="save-button mcq-container" onClick={() => handleSaveQuestion(0)}>Save Question</button>
      </div>
    );
  } else {
    return null;
  }
};
const renderParagraphs = () => {
  if (Paragraphs.length > 0) {
    const currentParagraph = Paragraphs[0];
    return (
      <div key={0} className="paragraph-section">
        <h3>Paragraph</h3>
        <input
         style={{padding:"12px",border:"2px solid black ",borderRadius:"21px",width:"98%"}}
          className="input-field"
          type="number"
          onChange={(e) => handleNumQuestionsChange(0, e.target.value)}
          placeholder="Number of Questions for paragraph"
        />
     
        <div className="paragraph-image-container">
          <h3>Paste Image for Paragraph</h3>
          <div
            className={`option-box ${clickedBox === `paragraph-image-0` ? 'clicked' : ''}`}
            onClick={() => setClickedBox(`paragraph-image-0`)}
            onPaste={(e) => handleImagePaste(e, 0, null, 'paragraph', true)}
            style={{ backgroundColor: clickedBox === `paragraph-image-0` ? '#b6b6c5' : '' }}
          >
            {currentParagraph.paragraphImage ? (
              <>
                <img src={currentParagraph.paragraphImage} alt="Paragraph" style={{ maxWidth: '100%' }} />
                <i onClick={() => handleRemoveImage(0, 'paragraph', null, true)} className="fa-sharp fa-solid fa-rectangle-xmark"></i>
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
              className={`option-box ${clickedBox === `solution-image-0` ? 'clicked' : ''}`}
              onClick={() => setClickedBox(`solution-image-0`)}
              onPaste={(e) => handleImagePaste(e, 0, null, 'solution', true)}
              style={{ backgroundColor: clickedBox === `solution-image-0` ? '#b6b6c5' : '' }}
            >
              {currentParagraph.paragraphSolutionImage ? (
                <>
                  <img src={currentParagraph.paragraphSolutionImage} alt="Solution" style={{ maxWidth: '100%' }} />
                  <i onClick={() => handleRemoveImage(0, 'solution', null, true)} className="fa-sharp fa-solid fa-rectangle-xmark"></i>
                </>
              ) : (
                'Paste your solution image here (Ctrl+V)'
              )}
            </div>
          </div>
        )}
        {currentParagraph.questions.map((question, questionIndex) => (
          <div key={questionIndex} className="question-section">
            <h4>Question {questionIndex + 1}</h4>
            <div className="question-image-container">
              <h3>Paste Image for Question</h3>
              <div
                className={`option-box ${clickedBox === `question-0-${questionIndex}` ? 'clicked' : ''}`}
                onClick={() => setClickedBox(`question-0-${questionIndex}`)}
                onPaste={(e) => handleImagePaste(e, 0, questionIndex, 'paraquestion', true)}
                style={{ backgroundColor: clickedBox === `question-0-${questionIndex}` ? '#b6b6c5' : '' }}
              >
                {question.paraquestionImage ? (
                  <>
                    <img src={question.paraquestionImage} alt={`Question ${questionIndex + 1}`} style={{ maxWidth: '100%' }} />
                    <i onClick={() => handleRemoveImage(0, 'paraquestion', questionIndex, true)} className="fa-sharp fa-solid fa-rectangle-xmark"></i>
                  </>
                ) : (
                  'Paste your question image here (Ctrl+V)'
                )}
              </div>
            </div>
            <label>Select Question Type:</label>
            <select
             style={{padding:"10px",margin:"10px",width:"16%",borderRadius:"12px"}}
              value={question.questionType}
              onChange={(e) => handleParagraphQuestionTypeChange(0, questionIndex, e.target.value)}
            >
              <option value="mcq">MCQ</option>
              <option value="msq">MSQ</option>
              <option value="nit">NIT</option>
              <option value="truefalse">True/False</option>
            </select>
            {question.questionType === 'truefalse' ? (
              <div className="truefalse-options">
                <label>
                  <input
                    type="radio"
                    name={`option-0-${questionIndex}`}
                    value="True"
                    onChange={() => handleParagraphAnswerChange(0, questionIndex, 'True')}
                  />
                  True
                </label>
                <label>
                  <input
                    type="radio"
                    name={`option-0-${questionIndex}`}
                    value="False"
                    onChange={() => handleParagraphAnswerChange(0, questionIndex, 'False')}
                  />
                  False
                </label>
              </div>
            ) :  question.questionType === 'nit' ? (
              <div className="nit-answer-container">
                <label>Answer:</label>
                <input
                  style={{ margin: "12px", borderRadius: "5px", textAlign: "center", padding: "10px" }}
                  className='input-field'
                  type="text"
                  value={question.paraanswers}
                  placeholder='Enter Answer here'
                  onChange={(e) => handleParagraphAnswerChange(0, questionIndex, e.target.value)}
                  pattern="[0-9]*"
                />
                <div><b>Entered Answer</b>: {question.paraanswers}</div>
              </div>
            ) : (
              question.paraOptions.map((option, optionIndex) => (
                <div key={optionIndex} className="option-item">
                  <label>
                    <input
                      name={`option-0-${questionIndex}`}
                      type={question.questionType === 'msq' ? 'checkbox' : 'radio'}
                      onChange={() => handleParagraphAnswerChange(0, questionIndex, String.fromCharCode(65 + optionIndex), optionIndex)}
                    />
                 <b> Option {String.fromCharCode(65 + optionIndex)}</b>  
                  </label>
                  <div
                    className={`option-box ${clickedBox === `option-0-${questionIndex}-${optionIndex}` ? 'clicked' : ''}`}
                    onClick={() => setClickedBox(`option-0-${questionIndex}-${optionIndex}`)}
                    onPaste={(e) => handleImagePaste(e, 0, questionIndex, `option-${optionIndex}`, true)}
                    style={{ backgroundColor: clickedBox === `option-0-${questionIndex}-${optionIndex}` ? '#b6b6c5' : '' }}
                  >
                    {option.image ? (
                      <>
                        <img src={option.image} alt={`Option ${String.fromCharCode(65 + optionIndex)}`} style={{ maxWidth: '100%' }} />
                        <i onClick={() => handleRemoveImage(0, `option-${optionIndex}`, questionIndex, true)} className="fa-sharp fa-solid fa-rectangle-xmark"></i>
                      </>
                    ) : (
                      'Paste your option image here (Ctrl+V)'
                    )}
                  </div>
                </div>
              ))
            )}
            <label>URL:</label>
            <input
               className='url'
              type="text"
              value={question.url}
              onChange={(e) => handleParagraphUrlChange(0, questionIndex, e.target.value)}
              placeholder="Enter URL here"
            />
          </div>
        ))}
        <button className="save-button mcq-container" onClick={() => handleSaveParagraph(0)}>Save Paragraph</button>
      </div>
    );
  } else {
    return null;
  }
};
  return (
    <div className="container">
    
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
              onClick={handleToggleIncludeParagraph}
            />
            <span style={{ marginLeft: "18px", fontSize: "larger" }}>Include Paragraph</span>
          </div>
        </div>
      </div>
      <div className="main-content">
        {includeParagraph == false && renderQuestions()}
        {includeParagraph && renderParagraphs()}
        {Questions.length > 0 && (
          <div style={{display:"flex",justifyContent:"center"}}>
          
            <button
              style={{ display: "block" }}
              className="save-button mcq-container"
              onClick={handleSaveCombinedItems}
            >
              Save Docx
            </button>
       
        

            <PreviewModal
             show={showModal}
             handleClose={() => setShowModal(false)}
             documentContent={documentContent}
             handleEdit={handleEdit}
             handleDownload={handleDownload}
            />

          </div>
        )}
      </div>
    </div>
  );
};

export default Management;
