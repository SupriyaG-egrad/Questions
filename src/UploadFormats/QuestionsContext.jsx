import { createContext, useState, useEffect } from 'react';

const QuestionsContext = createContext();

const QuestionsProvider = ({ children }) => {
  const [selectedQuestionType, setSelectedQuestionType] = useState("Mcq");
  const [addOptionE, setAddOptionE] = useState(false);
  const [positiveMarks, setPositiveMarks] = useState(0);
  const [negativeMarks, setNegativeMarks] = useState(0);
  const [Paragraphs, setParagraphs] = useState([]);
  const [questionCount, setQuestionCount] = useState(1); // New state variable

  const [Questions, setQuestions] = useState([
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
      ],
      type: selectedQuestionType || "",
      marks: `${positiveMarks || 0}-${negativeMarks || 0}`,
    }
  ]);

  // Update Questions whenever questionIndex, selectedQuestionType, or marks change
 
  return (
    <QuestionsContext.Provider
      value={{
        Questions,
        setQuestions,
        selectedQuestionType,
        setSelectedQuestionType,
        positiveMarks,
        setPositiveMarks,
        negativeMarks,
        setNegativeMarks,
        addOptionE,
        setAddOptionE,
        Paragraphs,
        setParagraphs,
        questionCount,
        setQuestionCount
      }}
    >
      {children}
    </QuestionsContext.Provider>
  );
};

export { QuestionsProvider, QuestionsContext };
