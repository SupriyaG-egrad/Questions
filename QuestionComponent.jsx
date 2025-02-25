import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { saveAs } from "file-saver";
import BASE_URL from "../apiConfig"
import { Document, Packer, TextRun, Paragraph, ImageRun } from "docx";
import Modal from './Modal';
import axios from 'axios';
const examConfig = {
  "JEE Mains": {
    sections: [
      { name: "Section A", questionCount: 20, questionType: "MCQ" },
      { name: "Section B", questionCount: 10, questionType: "NAT" },
      { name: "Full Document upload" },
    ],
  },
  "BITSAT": {
    subjects: [
      "Physics",
      "Chemistry",
      "Mathematics",
      "English Proficiency && Logical Reasoning",
      "FullDocumentUpload",
      "Extra Question Physics",
      "Extra Question Chemistry",
      "Extra Question Mathematics",
      "Extra Question English Proficiency && Logical Reasoning"
    ],
    questionCounts: {
      "Physics": 30,
      "Chemistry": 30,
      "Mathematics": 40,
      "English Proficiency && Logical Reasoning": 30,
      "Extra Question Physics": 3,
      "Extra Question Chemistry": 3,
      "Extra Question Mathematics": 3,
      "Extra Question English Proficiency && Logical Reasoning": 3
    },
    questionTypes: {
      "Physics": "MCQ",
      "Chemistry": "MCQ",
      "Mathematics": "MCQ",
      "English Proficiency && Logical Reasoning": "Paragraph",
      "Extra Question Physics": "MCQ",
      "Extra Question Chemistry": "MCQ",
      "Extra Question Mathematics": "MCQ",
      "Extra Question English Proficiency && Logical Reasoning": "Paragraph"
    },
  },
  "NEET": {
    subjects: ["Physics", "Chemistry", "Biology", "full DocumentUpload"],
    questionCount: 45,
    questionType: "MCQ",
  },
};
const labelTypes = {
  letters: {
    display: 'Alphabets (a, b, c)',
    getLabel: (index) => String.fromCharCode(97 + index)
  },
  numbers: {
    display: 'Numbers (1, 2, 3)',
    getLabel: (index) => (index + 1).toString()
  },
  roman: {
    display: 'Roman Numerals (I, II, III)',
    getLabel: (index) => ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][index] || (index + 1).toString()
  },
  uppercase: {
    display: 'Uppercase (A, B, C)',
    getLabel: (index) => String.fromCharCode(65 + index)
  }
};
const generateFormFields = (examType, sectionOrSubject) => {
  const config = examConfig[examType];
  let fields = [];
  if (examType === "JEE Mains") {
    if (sectionOrSubject === "Full Document upload") {
      fields.push(...Array.from({ length: 20 }, (_, i) => ({
        section: "Section A",
        type: "MCQ",
        index: i,
        questionImage: null,
        options: Array.from({ length: 4 }, () => ({ image: null })),
        solutionImage: null,
        answer: "",
        paragraphImage: null,
        paragraphSolutionImage: null,
        url: "",
      })));
      fields.push(...Array.from({ length: 10 }, (_, i) => ({
        section: "Section B",
        type: "NAT",
        index: i,
        questionImage: null,
        options: undefined,
        solutionImage: null,
        answer: "",
        paragraphImage: null,
        paragraphSolutionImage: null,
        url: "",
      })));
    } else {
      const section = config.sections.find(sec => sec.name === sectionOrSubject);
      for (let i = 0; i < section.questionCount; i++) {
        fields.push({
          section: section.name,
          type: section.questionType,
          index: i,
          questionImage: null,
          options: section.questionType === "MCQ" || section.questionType === "MSQ" ?
            Array.from({ length: 4 }, () => ({ image: null })) : undefined,
          solutionImage: null,
          answer: section.questionType === "MSQ" ? [] : "",
          paragraphImage: null,
          paragraphSolutionImage: null,
          url: "",
        });
      }
    }
  } else if (examType === "BITSAT") {
    if (sectionOrSubject === "FullDocumentUpload") {
      fields.push(...Array.from({ length: 30 }, (_, i) => ({
        section: "Physics",
        type: "MCQ",
        index: i,
        questionImage: null,
        options: Array.from({ length: 4 }, () => ({ image: null })),
        solutionImage: null,
        answer: "",
        paragraphImage: null,
        paragraphSolutionImage: null,
        url: "",
      })));
      fields.push(...Array.from({ length: 30 }, (_, i) => ({
        section: "Chemistry",
        type: "MCQ",
        index: i,
        questionImage: null,
        options: Array.from({ length: 4 }, () => ({ image: null })),
        solutionImage: null,
        answer: "",
        paragraphImage: null,
        paragraphSolutionImage: null,
        url: "",
      })));
      fields.push(...Array.from({ length: 40 }, (_, i) => ({
        section: "Mathematics",
        type: "MCQ",
        index: i,
        questionImage: null,
        options: Array.from({ length: 4 }, () => ({ image: null })),
        solutionImage: null,
        answer: "",
        paragraphImage: null,
        paragraphSolutionImage: null,
        url: "",
      })));
      fields.push(...Array.from({ length: 30 }, (_, i) => ({
        section: "English Proficiency && Logical Reasoning",
        type: "Paragraph",
        index: i,
        paragraphImage: null,
        questionCount: 1,
        questions: Array.from({ length: 1 }, () => ({
          type: "MCQ",
          questionImage: null,
          options: Array.from({ length: 4 }, () => ({ image: null })),
          solutionImage: null,
          answer: "",
          url: ""
        }))
      })));
      fields.push(...Array.from({ length: 3 }, (_, i) => ({
        section: "Extra Question Physics",
        type: "MCQ",
        index: i,
        questionImage: null,
        options: Array.from({ length: 4 }, () => ({ image: null })),
        solutionImage: null,
        answer: "",
        paragraphImage: null,
        paragraphSolutionImage: null,
        url: "",
      })));

      fields.push(...Array.from({ length: 3 }, (_, i) => ({
        section: "Extra Question Chemistry",
        type: "MCQ",
        index: i,
        questionImage: null,
        options: Array.from({ length: 4 }, () => ({ image: null })),
        solutionImage: null,
        answer: "",
        paragraphImage: null,
        paragraphSolutionImage: null,
        url: "",
      })));

      fields.push(...Array.from({ length: 3 }, (_, i) => ({
        section: "Extra Question Mathematics",
        type: "MCQ",
        index: i,
        questionImage: null,
        options: Array.from({ length: 4 }, () => ({ image: null })),
        solutionImage: null,
        answer: "",
        paragraphImage: null,
        paragraphSolutionImage: null,
        url: "",
      })));
      fields.push(...Array.from({ length: 3 }, (_, i) => ({
        section: "Extra Question English Proficiency && Logical Reasoning",
        type: "Paragraph",
        index: i,
        paragraphImage: null,
        questionCount: 1,
        questions: Array.from({ length: 1 }, () => ({
          type: "MCQ",
          questionImage: null,
          options: Array.from({ length: 4 }, () => ({ image: null })),
          solutionImage: null,
          answer: "",
          url: ""
        }))
      })));
    } else {
      const questionCount = config.questionCounts[sectionOrSubject];
      const questionType = config.questionTypes[sectionOrSubject];
      for (let i = 0; i < questionCount; i++) {
        fields.push({
          section: sectionOrSubject,
          type: questionType,
          index: i,
          questionImage: null,
          options: questionType === "MCQ" || questionType === "MSQ" ?
            Array.from({ length: 4 }, () => ({ image: null })) : undefined,
          solutionImage: null,
          answer: questionType === "MSQ" ? [] : "",
          paragraphImage: null,
          paragraphSolutionImage: null,
          url: "",
        });

      }
    }
  } else if (examType === "NEET") {
    if (sectionOrSubject === "full DocumentUpload") {
      fields.push(...Array.from({ length: 45 }, (_, i) => ({
        section: "Physics",
        type: "MCQ",
        index: i,
        questionImage: null,
        options: Array.from({ length: 4 }, () => ({ image: null })),
        solutionImage: null,
        answer: "",
        paragraphImage: null,
        paragraphSolutionImage: null,
        url: "",
      })));
      fields.push(...Array.from({ length: 45 }, (_, i) => ({
        section: "Chemistry",
        type: "MCQ",
        index: i,
        questionImage: null,
        options: Array.from({ length: 4 }, () => ({ image: null })),
        solutionImage: null,
        answer: "",
        paragraphImage: null,
        paragraphSolutionImage: null,
        url: "",
      })));
      fields.push(...Array.from({ length: 45 }, (_, i) => ({
        section: "Biology",
        type: "MCQ",
        index: i,
        questionImage: null,
        options: Array.from({ length: 4 }, () => ({ image: null })),
        solutionImage: null,
        answer: "",
        paragraphImage: null,
        paragraphSolutionImage: null,
        url: "",
      })));
    } else {
      for (let i = 0; i < config.questionCount; i++) {
        fields.push({
          section: sectionOrSubject,
          type: config.questionType,
          index: i,
          questionImage: null,
          options: Array.from({ length: 4 }, () => ({ image: null })),
          solutionImage: null,
          answer: "",
          paragraphImage: null,
          paragraphSolutionImage: null,
          url: "",
        });
      }
    }
  }
  return fields;
};

const handleImage = (e, setImage) => {
  e.preventDefault();
  const clipboardItems = e.clipboardData.items;
  for (let i = 0; i < clipboardItems.length; i++) {
    if (clipboardItems[i].type.startsWith("image/")) {
      const file = clipboardItems[i].getAsFile();
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
      break;
    }
  }
};
const ImageBox = ({ image, onPaste, onClick, onRemove, label, style, isActive = true, disabledMessage = "" }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      style={{
        ...style,
        border: `2px dashed ${isFocused ? '#1a5a99' : isActive ? '#3498db' : '#ccc'}`,
        backgroundColor: isFocused ? '#e3f2fd' : (image ? "#f0f0f0" : "transparent"),
        opacity: isActive ? 1 : 0.6,
        pointerEvents: isActive ? 'all' : 'none',
        position: 'relative',
        padding: "10px",
        textAlign: "center",
        marginTop: "10px",
        minHeight: "100px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: 'all 0.2s ease',
        cursor: isActive ? 'pointer' : 'not-allowed',
      }}
      title={!isActive ? disabledMessage : ''}
      onPaste={isActive ? onPaste : undefined}
      onClick={(e) => {
        if (isActive) {
          onClick?.(e);
          setIsFocused(true);
        }
      }}
      onBlur={() => setIsFocused(false)}
      tabIndex={isActive ? 0 : -1}
    >
      {!isActive && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: 0,
          background: '#ff4444',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '0.8em'
        }}>
          {disabledMessage}
        </div>
      )}
      {image ? (
        <div style={{ position: "relative" }}>
          <img src={image} alt={label} style={{ maxWidth: "100%", maxHeight: "200px", objectFit: "contain" }} />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            style={{
              position: "absolute",
              top: "5px",
              right: "5px",
              background: "red",
              color: "white",
              border: "none",
              borderRadius: "50%",
              cursor: "pointer"
            }}
          >
            ×
          </button>
        </div>
      ) : (
        <div>
          <p style={{ margin: 0 }}>Paste {label} image (Ctrl+V)</p>
          <p style={{
            margin: 0,
            fontSize: "0.8em",
            color: isFocused ? '#1a5a99' : "#666",
            fontWeight: isFocused ? 600 : 400
          }}>
            Click to focus
          </p>
        </div>
      )}
    </div>
  );
};
const questionContainerStyle = {
  marginBottom: "40px",
  padding: "20px",
  border: "1px solid #eee",
  borderRadius: "8px"
};
const optionsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "20px",
  marginTop: "15px"
};
const inputStyle = {
  transform: "scale(1.2)"
};
const numericInputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "6px",
  border: "2px solid #ced4da",
  fontSize: "16px"
};
const answerDisplayStyle = {
  padding: "12px",
  backgroundColor: "#e9ecef",
  borderRadius: "6px",
  fontWeight: "bold",
  color: "#2b8a3e",
  marginTop: "20px"
};
const OptionWrapper = ({ children, isActive }) => (
  <div style={{
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    cursor: isActive ? 'pointer' : 'not-allowed'
  }}>
    {children}
  </div>
);
const updateQuestionType = (question, newType) => {
  const baseQuestion = {
    ...question,
    type: newType,
    answer: "",
    options: []

  };

  switch (newType) {
    case 'Paragraph':
      return {
        ...baseQuestion,
        paragraphImage: null,
        questions: [],
        questionCount: 1,
        isConvertedFromParagraph: undefined
      };
    case 'MCQ':
      return { ...baseQuestion, options: Array.from({ length: 4 }, () => ({ image: null })) };
    case 'MSQ':
      return { ...baseQuestion, options: Array.from({ length: 4 }, () => ({ image: null })), answer: [] };
    case 'NAT':
      return { ...baseQuestion, options: undefined };
    case 'TF':
      return {
        ...baseQuestion, options: [
          { image: null, label: "True" },
          { image: null, label: "False" }
        ]
      };
    default:
      return baseQuestion
  }
};
const ParagraphQuestion = ({ question, onChange, index, containerRef, labelType }) => {
  const [numQuestions, setNumQuestions] = useState(question.questionCount || 0);
  const handleMainQuestionTypeChange = (newType) => {
    if (newType === "MCQ") {
      onChange({
        ...question,
        type: "MCQ",
        isConvertedFromParagraph: true,
        options: Array.from({ length: 4 }, () => ({ image: null })),
        paragraphImage: null,
        questions: undefined,
        questionCount: undefined,
        answer: ""
      });
    }
  };

  const handleQuestionCountChange = (count) => {
      const newCount = Math.max(1, parseInt(count) || 0);
      setNumQuestions(newCount);
      const currentQuestions = question.questions || [];
      const newQuestions = Array.from({ length: newCount }, (_, i) =>
          i < currentQuestions.length
              ? currentQuestions[i]
              : {
                    type: "MCQ", 
                    questionImage: null,
                    options: Array.from({ length: 4 }, () => ({ image: null })),
                    solutionImage: null,
                    answer: ""
                }
      );
      onChange({
          ...question,
          questionCount: newCount,
          questions: newQuestions
      });
  };

  return (
      <div style={questionContainerStyle}>
          <h4>Question {index + 1}</h4>
          <div style={{ margin: "10px 0" }}>
              <label>Question Type: </label>
              <select
                  value={question.type}
                  onChange={(e) => handleMainQuestionTypeChange(e.target.value)}
                  style={{
                      padding: "8px",
                      width: "120px",
                      marginLeft: "10px"
                  }}
              >
                  <option value="Paragraph">Paragraph</option>
                  <option value="MCQ">MCQ</option>
              </select>
          </div>
          {question.type === "Paragraph" ? (
              <>
                  <div style={{ margin: "10px 0" }}>
                      <label>Number of Sub-Questions: </label>
                      <input
                          type="number"
                          value={numQuestions}
                          onChange={(e) => handleQuestionCountChange(e.target.value)}
                          disabled={question.preventAdd}
                          style={{
                              padding: "8px",
                              width: "60px",
                              marginLeft: "10px"
                          }}
                      />
                  </div>
                  <ImageBox
                      image={question.paragraphImage}
                      onPaste={(e) => handleImage(e, (img) => onChange({ ...question, paragraphImage: img }))}
                      onRemove={() => onChange({ ...question, paragraphImage: null })}
                      label="paragraph"
                  />
                  <h4 style={{ marginTop: 20 }}>Sub-Questions:</h4>
                  {(question.questions || []).map((subQuestion, subIndex) => (
                      <div key={subIndex} style={{ marginTop: 15, padding: 15, border: "1px solid #ddd", borderRadius: 8 }}>
                          <QuestionRenderer
                              question={subQuestion}
                              onChange={(updatedSub) => {
                                  const newQuestions = [...question.questions];
                                  newQuestions[subIndex] = updatedSub;
                                  onChange({ ...question, questions: newQuestions });
                              }}
                              index={subIndex}
                              containerRef={containerRef}
                              labelType={labelType}
                              isSubQuestion
                          />
                      </div>
                  ))}
              </>
          ) : (
              <QuestionRenderer
                  question={question}
                  onChange={onChange}
                  index={index}
                  containerRef={containerRef}
                  labelType={labelType}
              />
          )}
      </div>
  );
};
const QuestionRenderer = ({ 
  question, 
  onChange, 
  index, 
  containerRef, 
  labelType, 
  isSubQuestion = false 
}) => {
  const getOptionLabel = (index) => {
    switch (labelType) {
      case 'roman':
        return ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][index] || (index + 1).toString();
      case 'numbers':
        return (index + 1).toString();
      case 'uppercase':
        return String.fromCharCode(65 + index);
      default: 
        return String.fromCharCode(97 + index);
    }
  };

  const [validationState, setValidationState] = useState({
    questionImage: !!question.questionImage,
    options: question.options?.map(opt => !!opt.image) || [],
    solutionImage: !!question.solutionImage,
    url: !!question.url
  });

  useEffect(() => {
    const answerValid = question.type === 'MSQ'
      ? question.answer.length > 0
      : question.type === 'NAT'
        ? question.answer.trim() !== ''
        : question.answer !== '';

    setValidationState({
      questionImage: !!question.questionImage,
      options: question.options?.map(opt => !!opt.image) || [],
      solutionImage: !!question.solutionImage,
      url: !!question.url,
      answer: answerValid
    });
  }, [question]);

  const isValid = validationState.questionImage &&
    validationState.solutionImage &&
    validationState.answer &&
    (question.type === 'NAT' || validationState.options.every(opt => opt));

  const ProgressBar = () => {
    const isNAT = question.type === 'NAT';
    const steps = [
      validationState.questionImage,
      ...(isNAT ? [] : validationState.options),
      validationState.solutionImage,
      validationState.answer,
      validationState.url
    ].filter(Boolean);

    return (
      <div style={{ width: '100%', height: '8px', backgroundColor: '#eee', borderRadius: '4px', margin: '10px 0' }}>
        <div style={{
          width: `${(steps.length / (isNAT ? 4 : 4 + (question.options?.length || 0))) * 100}%`,
          height: '100%',
          backgroundColor: '#2ecc71',
          borderRadius: '4px',
          transition: 'width 0.3s ease'
        }} />
      </div>
    );
  };

  const handleImage = (e, setImage) => {
    e.preventDefault();
    const clipboardItems = e.clipboardData.items;
    for (let i = 0; i < clipboardItems.length; i++) {
      if (clipboardItems[i].type.startsWith("image/")) {
        const file = clipboardItems[i].getAsFile();
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const pngDataUrl = canvas.toDataURL('image/png');
            setImage(pngDataUrl);
          };
          img.src = reader.result;
        };
        reader.readAsDataURL(file);
        break;
      }
    }
  };

  const handleTypeChange = (newType) => {
    onChange(updateQuestionType(question, newType));
  };

  const renderOptions = () => {
    const getOptionStatus = (optionIndex) => {
      if (optionIndex === 0) return !!question.questionImage;
      return question.options[optionIndex - 1]?.image;
    };

    switch (question.type) {
      case 'MCQ':
      case 'MSQ':
        return (
          <>
            <h4>Options{question.type === 'MSQ' && ' (Multiple Select)'}:</h4>
            <div style={optionsGridStyle}>
              {question.options.map((option, i) => {
                const isActive = getOptionStatus(i);
                const isLastOption = i === question.options.length - 1;
                const isComplete = option.image && (
                  isLastOption ||
                  (i < question.options.length - 1 && !question.options[i + 1].image)
                );

                return (
                  <OptionWrapper
                    key={i}
                    isActive={isActive}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "8px",
                      pointerEvents: isActive ? 'all' : 'none',
                    }}
                  >
                    <input
                      type={question.type === 'MCQ' ? 'radio' : 'checkbox'}
                      name={`${question.type}-${question.index}`}
                      onChange={(e) => {
                        const newAnswers = question.type === 'MCQ'
                          ? e.target.value
                          : e.target.checked
                            ? [...question.answer, e.target.value]
                            : question.answer.filter(ans => ans !== e.target.value);
                        onChange({ ...question, answer: newAnswers });
                      }}
                      value={getOptionLabel(i).toUpperCase()}
                      checked={question.answer.includes(getOptionLabel(i).toUpperCase())}
                      style={inputStyle}
                      disabled={!isActive}
                    />
                    <span>{getOptionLabel(i)}.</span>
                    <ImageBox
                      image={option.image}
                      onPaste={isActive ? (e) => handleImage(e, (image) => {
                        const newOptions = [...question.options];
                        newOptions[i].image = image;
                        onChange({ ...question, options: newOptions });
                      }) : undefined}
                      onRemove={() => {
                        const newOptions = [...question.options];
                        newOptions[i].image = null;
                        onChange({ ...question, options: newOptions });
                      }}
                      label={`option ${getOptionLabel(i)}`}
                      isActive={isActive}
                      disabledMessage={i === 0
                        ? "Complete question image first"
                        : `Complete option ${getOptionLabel(i - 1)} first`}
                      style={{
                        flex: 1,
                        marginTop: 0,
                        border: `2px solid ${isComplete ? "#2ecc71" : isActive ? "#3498db" : "#ccc"}`
                      }}
                    />
                  </OptionWrapper>
                );
              })}
            </div>
          </>
        );

      case 'NAT':
        return (
          <div style={{ marginTop: 20 }}>
            <h4>Numerical Answer:</h4>
            <div
              style={{ position: 'relative' }}
              title={!question.questionImage ? "Complete question image first" : ""}
            >
              <input
                type="text"
                value={question.answer}
                onChange={(e) => onChange({
                  ...question,
                  answer: e.target.value.replace(/[^0-9.-]/g, '')
                })}
                style={{
                  ...numericInputStyle,
                  border: `2px solid ${question.questionImage ? "#ced4da" : "#ff4444"}`,
                  backgroundColor: question.questionImage ? "#fff" : "#ffeaea",
                  pointerEvents: question.questionImage ? 'auto' : 'none'
                }}
                placeholder="Enter numerical value"
              />
              {!question.questionImage && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  cursor: 'not-allowed'
                }} />
              )}
            </div>
          </div>
        );

      case 'TF':
        return (
          <>
            <h4>True/False:</h4>
            <div style={optionsGridStyle}>
              {question.options.map((option, i) => {
                const isActive = i === 0 ?
                  !!question.questionImage :
                  !!question.options[i - 1].image;

                return (
                  <OptionWrapper key={i}>
                    <input
                      type="radio"
                      name={`${question.type}-${question.index}`}
                      value={option.label}
                      onChange={(e) => onChange({ ...question, answer: e.target.value })}
                      checked={question.answer === option.label}
                      style={inputStyle}
                      disabled={!option.image}
                    />
                    <span>{getOptionLabel(i)}.</span>
                    <ImageBox
                      image={option.image}
                      onPaste={(e) => handleImage(e, (image) => {
                        const newOptions = [...question.options];
                        newOptions[i].image = image;
                        onChange({ ...question, options: newOptions });
                      })}
                      onRemove={() => {
                        const newOptions = [...question.options];
                        newOptions[i].image = null;
                        onChange({ ...question, options: newOptions });
                      }}
                      label={`option ${option.label}`}
                      isActive={isActive}
                      disabledMessage={i === 0
                        ? "Complete question image first"
                        : `Complete ${question.options[i - 1].label} first`
                      }
                    />
                  </OptionWrapper>
                );
              })}
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div style={questionContainerStyle}>
      {!isSubQuestion && (
        <QuestionTypeSelector  isConverted={question.isConvertedFromParagraph}  value={question.type} onChange={handleTypeChange} />
      )}
      
      <h4>Question {index + 1}:</h4>
      <ProgressBar />
      {question.type !== 'Paragraph' && (
        <ImageBox
          image={question.questionImage}
          onPaste={(e) => handleImage(e, (image) => {
            onChange({ ...question, questionImage: image });
          })}
          onRemove={() => {
            onChange({ ...question, questionImage: null });
          }}
          label="question"
        />
      )}
      {renderOptions()}
      {question.type !== 'Paragraph' && (
        <ImageBox
          image={question.solutionImage}
          onPaste={(e) => handleImage(e, (image) => {
            onChange({ ...question, solutionImage: image });
          })}
          onRemove={() => {
            onChange({ ...question, solutionImage: null });
          }}
          label="solution"
          isActive={validationState.options.every(opt => opt)}
          disabledMessage="Complete all options first"
        />
      )}
      <div style={{ marginTop: "15px" }}>
        <label><b>Question Reference URL: </b></label>
        <div
          style={{ position: 'relative' }}
          title={!isValid ? "Complete all images and Answer first" : ""}
        >
          <input
            type="url"
            value={question.url || ""}
            onChange={(e) => onChange({ ...question, url: e.target.value })}
            placeholder="Enter url"
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: `2px solid ${isValid ? '#ced4da' : '#ff4444'}`,
              backgroundColor: isValid ? '#fff' : '#ffeaea',
              pointerEvents: isValid ? 'auto' : 'none'
            }}
          />
          {!isValid && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              cursor: 'not-allowed'
            }} />
          )}
        </div>
      </div>
      {['MCQ', 'MSQ', 'TF'].includes(question.type) && (
        <div style={answerDisplayStyle}>
          {question.type === 'TF' ? (
            <span>Selected Answer: {question.answer || "None"}</span>
          ) : (
            <span>
              Selected Answer: {Array.isArray(question.answer)
                ? question.answer.join(", ")
                : question.answer}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
const QuestionTypeSelector = ({ value, onChange, isConverted }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={{
      padding: "8px",
      borderRadius: "4px",
      border: "1px solid #ced4da",
      marginBottom: "10px"
    }}
  >
    <option value="MCQ">Multiple Choice (MCQ)</option>
    {isConverted && <option value="Paragraph">Paragraph</option>}
  </select>
); 

const QuestionUploadForm = ({onClose,style}) => {
 const formatedQuestionRef=useRef([])
 const formattedParagraphQuestion=useRef([])
  const [labelType, setLabelType] = useState('letters'); 
  const [editingIndex, setEditingIndex] = useState(null);
  const questionRefs = useRef([]);
  const containerRef = useRef(null);
  const [examType, setExamType] = useState("");
  const [sectionOrSubject, setSectionOrSubject] = useState("");
  const [questions, setQuestions] = useState([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [numQuestions, setNumQuestions] = useState({});
  const handleExamTypeChange = (e) => {
    const newExamType = e.target.value;
    setExamType(newExamType);
    setSectionOrSubject("");
    setQuestions([]);
  };
  const handleSectionOrSubjectChange = (e) => {
    const newSectionOrSubject = e.target.value;
    setSectionOrSubject(newSectionOrSubject);
    setQuestions([]);
    setTimeout(() => {
      setQuestions(generateFormFields(examType, newSectionOrSubject));
    }, 0);
  };
  const validateAndUpdateQuestions = (questions) => {
    let totalUserAddedEnglishProficiencyQuestions = 0;
    let totalUserAddedExtraQuestions = 0;
    const limits = {
      EnglishProficiency: 30,
      ExtraQuestions: 3,
    };
    const validQuestions = [];
    for (const question of questions) {
      if (question.section === "English Proficiency && Logical Reasoning") {
        const questionCount = 1 + (question.questions?.length || 0);
        if (totalUserAddedEnglishProficiencyQuestions + questionCount <= limits.EnglishProficiency) {
          totalUserAddedEnglishProficiencyQuestions += questionCount;
          validQuestions.push(question);
        }
      } else if (question.section.startsWith("Extra Question")) {
        const questionCount = 1 + (question.questions?.length || 0);
        if (totalUserAddedExtraQuestions + questionCount <= limits.ExtraQuestions) {
          totalUserAddedExtraQuestions += questionCount;
          validQuestions.push(question);
        }
      } else {
        validQuestions.push(question);
      }
    }
    return validQuestions;
  };
  
  const handleQuestionChange = (index, updatedQuestion) => {
    const newQuestions = [...questions];
    newQuestions[index] = updatedQuestion;
    let englishCount = 0;
    let extraCount = 0;
    const limitEnglish = 30;
    const limitExtra = 3;
    const validQuestions = newQuestions.filter(question => {
      if (question.section === "English Proficiency && Logical Reasoning") {
        const count = question.type === 'Paragraph' ? (question.questions?.length || 0) : 1;
        if (englishCount + count > limitEnglish) return false;
        englishCount += count;
        return true;
      }
      if (question.section.startsWith("Extra Question")) {
        const count = question.type === 'Paragraph' ? (question.questions?.length || 0) : 1;
        if (extraCount + count > limitExtra) return false;
        extraCount += count;
        return true;
      }
      return true;
    });
    if (validQuestions.length !== newQuestions.length) {
      alert(`Question limits exceeded! Max 30 for English, 3 for Extra Questions.`);
      setQuestions(validQuestions);
    } else {
      setQuestions(newQuestions);
    }
  };

  const handleDownloadDocument = async () => {
    try {
      if (!previewDocument) {
        throw new Error('No document to download');
      }

      const blob = await Packer.toBlob(previewDocument);
      saveAs(blob, "exam_document.docx");
      
      // Optional: Clear form after download
      setExamType("");
      setSectionOrSubject("");
      setQuestions([]);
      setEditingIndex(null);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to generate document");
    }
  };
 
  useLayoutEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [sectionOrSubject]);
 

  const handleSubmittoBackend = async () => {
    const formattedQuestions = formatedQuestionRef.current; 
  
    console.log("Formatted Questions for Backend:", formattedQuestions);
  
    try {
      const response = await axios.post(`${BASE_URL}/DocumentUpload/testuploadformat`, formattedQuestions, {
        headers: {
          'Content-Type': 'application/json', 
        },
       });
  
      console.log('Response from server:', response.data);
       alert(response.data.message); 
   } catch (error) {
       console.error('Error submitting to backend:', error);
       alert('Failed to submit data to the server');
     }
  };
  const handlePreview = async () => {
    const getMarks = () => {
        switch (examType) {
            case "BITSAT": return { positive: "3", negative: "1" };
            default: return { positive: "4", negative: "1" };
        }
    };

    const validateImageData = (imageData) => {
        if (!imageData || typeof imageData !== 'string') return false;
        const parts = imageData.split(',');
        return parts.length === 2 && parts[0].startsWith('data:image/') && parts[1].length > 0;
    };

    const processImageDimensions = async (imageData) => {
        try {
            if (!validateImageData(imageData)) return { width: 100, height: 100 };

            return new Promise((resolve) => {
                const img = new Image();
                img.src = imageData;
                img.onload = () => resolve({
                    width: Math.max(img.naturalWidth, 100),
                    height: Math.max(img.naturalHeight, 100)
                });
                img.onerror = () => resolve({ width: 100, height: 100 });
            });
        } catch (error) {
            console.error('Image processing error:', error);
            return { width: 100, height: 100 };
        }
    };

    const createImageComponent = async (imageData) => {
        try {
            if (!validateImageData(imageData)) {
                console.log('Invalid image data:', imageData);
                return null;
            }

            const dimensions = await processImageDimensions(imageData);
            const [header, data] = imageData.split(',');

            return new ImageRun({
                data: data,
                width: dimensions.width * 15,
                height: dimensions.height * 15,
                transformation: {
                    width: dimensions.width,
                    height: dimensions.height,
                }
            });
        } catch (error) {
            console.error('Image component creation failed:', error);
            return null;
        }
    };

    try {
        const { positive, negative } = getMarks();
        const docSections = [{
            properties: { page: { margin: { top: 100, right: 100, bottom: 100, left: 100 } } },
            children: []
        }];

        const formattedQuestions = [];
        let globalSortId = 1; // Global sort ID for all questions
        let paragraphIdCounter = 0; // Counter for paragraph numbers

        for (const question of questions) {
            const questionContent = [];

            if (question.type === 'Paragraph') {
                paragraphIdCounter++; // Increment paragraph number for each paragraph question
                const currentParagraphId = paragraphIdCounter;
                const formattedCTQ = {
                    type: question.isConverted ? 'MCQ4' : 'CTQ', // Set type based on conversion
                    paragraphId: currentParagraphId.toString(),
                    paragraphImage: question.paragraphImage,
                    Questions: [], // Changed from subQuestions to Questions
                    Marks: `${positive}, ${negative}`
                };

                questionContent.push(new Paragraph({
                    children: [new TextRun({ text: `[PRG ${currentParagraphId}] `, bold: true })]
                }));

                if (question.paragraphImage) {
                    const imageComponent = await createImageComponent(question.paragraphImage);
                    if (imageComponent) {
                        questionContent.push(new Paragraph({ children: [imageComponent] }));
                    } else {
                        questionContent.push(new Paragraph('(Paragraph image failed to load)'));
                    }
                }

                let subQuestionCounter = 1; // Reset sub-question counter for each paragraph

                if (question.questions) {
                    for (const subQuestion of question.questions) {
                        const currentSortId = globalSortId++; // Increment sort ID for each sub-question

                        questionContent.push(new Paragraph({
                            children: [new TextRun({ text: `[Q] `, bold: true })]
                        }));

                        if (subQuestion.questionImage) {
                            const imageComponent = await createImageComponent(subQuestion.questionImage);
                            if (imageComponent) {
                                questionContent.push(new Paragraph({ children: [imageComponent] }));
                            } else {
                                questionContent.push(new Paragraph('(Question image failed to load)'));
                            }
                        }

                        if (subQuestion.options) {
                            for (const [optIndex, option] of subQuestion.options.entries()) {
                                if (option.image) {
                                    const imageComponent = await createImageComponent(option.image);
                                    if (imageComponent) {
                                        questionContent.push(new Paragraph({
                                            children: [
                                                new TextRun(`(${String.fromCharCode(97 + optIndex)}) `),
                                                imageComponent
                                            ],
                                            spacing: { after: 200 }
                                        }));
                                    } else {
                                        questionContent.push(new Paragraph({
                                            children: [
                                                new TextRun(`(${String.fromCharCode(97 + optIndex)}) `),
                                                new TextRun('(Option image failed to load)')
                                            ],
                                            spacing: { after: 200 }
                                        }));
                                    }
                                }
                            }
                        }

                        questionContent.push(
                            new Paragraph(`[qtype] ${formattedCTQ.type}`), // Use the determined type
                            new Paragraph(`[ans] ${subQuestion.answer?.toString().toLowerCase() || ''}`),
                            new Paragraph(`[Marks] ${positive}, ${negative}`),
                            new Paragraph(`[sortid] ${currentSortId}`),
                            new Paragraph(`[PQNo] ${subQuestionCounter}`), // Use sub-question counter
                            new Paragraph("")
                        );

                        // Check for solution image for each sub-question
                        if (subQuestion.solutionImage) {
                            const solutionImageComponent = await createImageComponent(subQuestion.solutionImage);
                            if (solutionImageComponent) {
                                questionContent.push(new Paragraph({
                                    children: [new TextRun("[soln] "), solutionImageComponent]
                                }));
                            } else {
                                questionContent.push(new Paragraph({
                                    children: [new TextRun("[soln] ")]
                                }));
                            }
                        }

                        // Changed from subQuestions to Questions
                        formattedCTQ.Questions.push({
                            questionImage: subQuestion.questionImage,
                            options: subQuestion.options?.map(opt => opt.image) || [],
                            solutionImage: subQuestion.solutionImage,
                            answer: subQuestion.answer,
                            Marks: `${positive}, ${negative}`,
                            qtype: formattedCTQ.type, // Use the determined type
                            sortid: currentSortId.toString(),
                            paragraphId: subQuestionCounter.toString() // Use sub-question counter
                        });

                        subQuestionCounter++; // Increment sub-question counter
                    }
                }

                formattedQuestions.push(formattedCTQ);

            } else {
                const currentSortId = globalSortId++;
                const isConvertedCTQ = question.isConvertedParagraph;

                questionContent.push(new Paragraph({
                    children: [new TextRun({ text: `[Q] `, bold: true })]
                }));

                if (question.questionImage) {
                    const imageComponent = await createImageComponent(question.questionImage);
                    if (imageComponent) {
                        questionContent.push(new Paragraph({ children: [imageComponent] }));
                    } else {
                        questionContent.push(new Paragraph('(Question image failed to load)'));
                    }
                }

                if (question.options) {
                    for (const [optIndex, option] of question.options.entries()) {
                        if (option.image) {
                            const imageComponent = await createImageComponent(option.image);
                            if (imageComponent) {
                                questionContent.push(new Paragraph({
                                    children: [
                                        new TextRun(`(${String.fromCharCode(97 + optIndex)}) `),
                                        imageComponent
                                    ],
                                    spacing: { after: 200 }
                                }));
                            } else {
                                questionContent.push(new Paragraph({
                                    children: [
                                        new TextRun(`(${String.fromCharCode(97 + optIndex)}) `),
                                        new TextRun('(Option image failed to load)')
                                    ],
                                    spacing: { after: 200 }
                                }));
                            }
                        }
                    }
                }

                questionContent.push(
                    new Paragraph(`[qtype] MCQ4`),
                    new Paragraph(`[ans] ${question.answer?.toString().toLowerCase() || ''}`),
                    new Paragraph(`[Marks] ${positive}, ${negative}`),
                    new Paragraph(`[sortid] ${currentSortId}`),
                    new Paragraph("")
                );

                if (question.solutionImage) {
                    const imageComponent = await createImageComponent(question.solutionImage);
                    if (imageComponent) {
                        questionContent.push(new Paragraph({
                            children: [new TextRun("[soln] "), imageComponent]
                        }));
                    } else {
                        questionContent.push(new Paragraph({
                            children: [new TextRun("[soln] ")]
                        }));
                    }
                }

                formattedQuestions.push({
                    questionImage: question.questionImage,
                    options: question.options?.map(opt => opt.image) || [],
                    solutionImage: question.solutionImage,
                    answer: question.answer,
                    Marks: `${positive}, ${negative}`,
                    qtype: isConvertedCTQ ? 'CTQ' : 'MCQ4',
                    sortid: currentSortId.toString(),
                  
                });
            }

            docSections[0].children.push(...questionContent);
        }

        formatedQuestionRef.current = formattedQuestions;
        const doc = new Document({ sections: docSections });
        setPreviewDocument(doc);
        setIsPreviewOpen(true);
    } catch (error) {
        console.error("Error generating preview:", error);
        alert("Error generating preview. Check console for details.");
    }
};
  return (
    <div style={{
      position: 'relative',
      backgroundColor: "white",
      borderRadius: "12px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      display: 'flex',
      flexDirection: 'column',
      width: '95%',
      maxWidth: '1000px', 
      margin: "40px auto",
      padding: "30px",
      maxHeight: '90vh', 
    
    }}>
       <button
      onClick={onClose}
      style={{
        position: 'absolute',
        top: '15px',
        right: '20px',
        background: 'none',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        color: '#666',
        zIndex: 1000
      }}
    >
      ×
    </button>

      <h1 style={{

        textAlign: "center",

        color: "#2c3e50",

        marginBottom: "30px",

        fontSize: "2.2rem",
        flexShrink: 0 

      }}>

        Exam Question Generator

      </h1>



      <div style={{

        display: "grid",

        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",

        gap: "20px",

        marginBottom: "30px",
        flexShrink: 0,

      }}>

        <div>

          <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>

            Exam Type:

          </label>

          <select

            value={examType}

            onChange={handleExamTypeChange}

            style={{

              width: "100%",

              padding: "12px",

              borderRadius: "8px",

              border: "2px solid #ced4da",

              fontSize: "16px"

            }}

          >
            <option value="">Select Exam Type</option>

            {Object.keys(examConfig).map((type) => (

              <option key={type} value={type}>{type}</option>

            ))}

          </select>

        </div>



        {examType && (

          <div>

            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>

              {examType === "JEE Mains" ? "Section" : "Subject"}:

            </label>

            <select

              value={sectionOrSubject}

              onChange={handleSectionOrSubjectChange}

              style={{

                width: "100%",

                padding: "12px",

                borderRadius: "8px",

                border: "2px solid #ced4da",

                fontSize: "16px"

              }}

            >

              <option value="">Select {examType === "JEE Mains" ? "Section" : "Subject"}</option>

              {examType === "JEE Mains"

                ? examConfig[examType].sections.map((section) => (

                  <option key={section.name} value={section.name}> {section.name} </option>

                ))

                : examConfig[examType].subjects.map((subject) => (

                  <option key={subject} value={subject}>{subject}</option>

                ))}

            </select>

          </div>

        )}

      </div>

      {sectionOrSubject && (

        <div
          key={sectionOrSubject}
          ref={containerRef}
          style={{
            maxHeight: "70vh",
            overflowY: "auto",
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none', 
            '&::-webkit-scrollbar': { 
              display: 'none'
          }}
        }
        >
          <div style={{
            marginBottom: "20px",
            display: "flex",
            gap: "20px",
            alignItems: "center"
          }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                Option Label Type:
              </label>
              <select
                value={labelType}
                onChange={(e) => setLabelType(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "2px solid #ced4da",
                  fontSize: "16px"
                }}
              >
                <option value="letters">Letters (a, b, c)</option>
                <option value="numbers">Numbers (1, 2, 3)</option>
                <option value="roman">Roman Numerals (I, II, III)</option>
                <option value="uppercase">Uppercase (A, B, C)</option>
              </select>
            </div>
          </div>
          {questions.reduce((acc, question, index) => {
            if (index === 0 || question.section !== questions[index - 1].section) {
              acc.push(
                <div key={`header-${question.section}`} style={{
                  padding: "15px",
                  backgroundColor: question.section.startsWith("Extra Question") ? "#ffe6e6" : "#e6f3ff",
                  borderLeft: `4px solid ${question.section.startsWith("Extra Question") ? "#ff4444" : "#3498db"}`,
                  margin: "20px 0",
                  borderRadius: "4px"
                }}>
                  <h3 style={{
                    margin: 0,
                    color: question.section.startsWith("Extra Question") ? "#ff4444" : "#2c3e50"
                  }}>
                    {question.section}
                    {examType === "JEE Mains" && (
                      <span style={{
                        fontSize: "0.9em",
                        color: "#666",
                        marginLeft: "10px"
                      }}>
                        ({question.type} Questions)
                      </span>
                    )}
                  </h3>
                </div>
              );
            }
            acc.push(
              <div
                key={index}
                ref={el => (questionRefs.current[index] = el)}
                style={{
                  filter: editingIndex !== null && editingIndex !== index ? 'blur(3px)' : 'none',
                  pointerEvents: editingIndex !== null && editingIndex !== index ? 'none' : 'all',
                  transition: 'filter 0.3s ease',
                  position: 'relative'
                }}
              >
                {/* Question component */}
                {question.type === 'Paragraph' ? (
                  <ParagraphQuestion
                  key={index}
                  question={question}
                  onChange={(updatedQuestion) => handleQuestionChange(index, updatedQuestion)}
                  index={index}
                  containerRef={containerRef}
                  labelType={labelType}
                  numQuestions={numQuestions[index] || 1}
                  setNumQuestions={(count) => setNumQuestions(prev => ({ ...prev, [index]: count }))} 
              />
                ) : (
                  <QuestionRenderer
                    question={question}
                    onChange={(updatedQuestion) => handleQuestionChange(index, updatedQuestion)}
                    index={index}
                    containerRef={containerRef}
                    labelType={labelType}
                  />
                )}
                {editingIndex === index && (
                  <div style={{
                    position: 'absolute',
                    top: '10px', 
                    right: '10px',
                    zIndex: 1000,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                    padding: '10px',
                    borderRadius: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}>
                    <button
                      onClick={() => {
                        setEditingIndex(null); 
                        handlePreview(); 
                      }}
                      style={{
                        padding: "10px 20px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "16px"
                      }}
                    >
                      Update Question
                    </button>
                  </div>
                )}
              </div>
            );
            return acc;
          }, [])}
        </div>
      )}


      {questions.length > 0 && (

        <div style={{textAlign: "center",
          flexShrink: 0, 
          paddingTop: '20px' }}>

<button
            onClick={handlePreview}
            style={{
              padding: "14px 28px",
              fontSize: "16px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              marginRight: "10px"
            }}
          >
            Preview Exam Document
          </button>
          <button
          onClick={handleSubmittoBackend}
            disabled={isSubmitting}
            style={{
              padding: "14px 28px",
              fontSize: "16px",
              backgroundColor: "#3498db",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              marginRight: "10px",
              opacity: isSubmitting ? 0.7 : 1
            }}
          >
            {isSubmitting ? 'Saving...' : 'Save to Server'}
          </button>
        </div>

      )}
      <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)}>
        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", marginBottom: "30px", color: "#2c3e50" }}>Exam Preview</h2>
          <div style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: "15px" }}>
            {questions.map((question, index) => (
              <div key={index} style={{
                marginBottom: "30px",
                padding: "20px",
                border: "1px solid #eee",
                borderRadius: "8px",
                backgroundColor: "#f9f9f9",
                position: 'relative' 
              }}>
                <button
                  onClick={() => {
                    setIsPreviewOpen(false);
                    setEditingIndex(index);
                    setTimeout(() => {
                      questionRefs.current[index]?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                      });
                    }, 100);
                  }}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    padding: '5px 10px',
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Edit
                </button>

                {/* Existing question content */}
                {question.type === 'Paragraph' && (
                  <div style={{ marginBottom: "20px" }}>
                    <h4 style={{ color: "#3498db" }}>
                      [PRG] Paragraph {index + 1}
                    </h4>
                    {question.paragraphImage && (
                      <div style={{ marginTop: "15px" }}>
                        <h5>Paragraph Image:</h5>
                        <img
                          src={question.paragraphImage}
                          alt="Paragraph"
                          style={{ maxWidth: "100%", maxHeight: "300px", border: "1px solid #ddd" }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-questions for Paragraph */}
                {question.type === 'Paragraph' && question.questions?.map((subQuestion, subIndex) => (
                  <div key={subIndex} style={{
                    marginTop: "20px",
                    padding: "15px",
                    border: "1px solid #ddd",
                    borderRadius: "8px"
                  }}>
                    <h5>Sub-question {subIndex + 1}</h5>
                    {subQuestion.questionImage && (
                      <div style={{ margin: "15px 0" }}>
                        <h6>Question Image:</h6>
                        <img
                          src={subQuestion.questionImage}
                          alt="Sub-question"
                          style={{ maxWidth: "100%", maxHeight: "250px", border: "1px solid #ddd" }}
                        />
                      </div>
                    )}
                    {subQuestion.options && (
                      <div style={{ margin: "15px 0" }}>
                        <h6>Options:</h6>
                        <div style={{ display: "grid", gap: "10px" }}>
                          {subQuestion.options.map((option, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span>({labelTypes[labelType].getLabel(i)})</span>
                              {option.image && (
                                <img
                                  src={option.image}
                                  alt={`Option ${labelTypes[labelType].getLabel(i)}`}
                                  style={{ maxWidth: "150px", maxHeight: "100px", border: "1px solid #ddd" }}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div style={{ marginTop: "15px", color: "#2e7d32" }}>
                      <strong>Answer:</strong> {subQuestion.answer}
                    </div>
                  </div>
                ))}

                {/* Regular Question Display */}
                {question.type !== 'Paragraph' && (
                  <>
                    <h4 style={{ color: "#3498db", marginBottom: "15px" }}>
                      [Q] Question {index + 1} ({question.type})
                    </h4>
                    {question.questionImage && (
                      <div style={{ marginBottom: "20px" }}>
                        <h5>Question Image:</h5>
                        <img
                          src={question.questionImage}
                          alt="Question"
                          style={{ maxWidth: "100%", maxHeight: "300px", border: "1px solid #ddd" }}
                        />
                      </div>
                    )}
                    {question.options && (
                      <div style={{ marginBottom: "20px" }}>
                        <h5>Options:</h5>
                        <div style={{ display: "grid", gap: "15px" }}>
                          {question.options.map((option, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <span style={{ fontWeight: "bold", minWidth: "30px" }}>
                                ({String.fromCharCode(97 + i)})
                              </span>
                              {option.image && (
                                <img
                                  src={option.image}
                                  alt={`Option ${String.fromCharCode(97 + i)}`}
                                  style={{ maxWidth: "200px", maxHeight: "150px", border: "1px solid #ddd" }}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div style={{
                      backgroundColor: "#e8f5e9",
                      padding: "15px",
                      borderRadius: "6px",
                      marginTop: "15px"
                    }}>
                      <h5 style={{ marginBottom: "10px", color: "#2e7d32" }}>Correct Answer:</h5>
                      <div style={{
                        padding: "10px",
                        backgroundColor: "white",
                        borderRadius: "4px",
                        fontWeight: "bold"
                      }}>
                        {Array.isArray(question.answer) ? question.answer.join(", ") : question.answer}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          <div style={{
            marginTop: "30px",
            display: "flex",
            justifyContent: "center",
            gap: "20px"
          }}>
            <button
              onClick={() => setIsPreviewOpen(false)}
              style={{
                padding: "10px 20px",
                backgroundColor: "#e74c3c",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "500",
                transition: "background-color 0.3s"
              }}
            >
              Close Preview
            </button>

            <button
              onClick={handleDownloadDocument}
              style={{
                padding: "10px 20px",
                backgroundColor: "#2ecc71",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Download Document
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
export default QuestionUploadForm;
