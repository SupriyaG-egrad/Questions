import React from 'react'
import "./instruction.css"
const Instruction = () => {
  return (
    <div className="App">
      {/* Header Section */}
      <header>
        <h1>Question Generator Tool</h1>
      </header>

      {/* Main Content Container */}
      <div className="container">

        {/* Introduction Section */}
        <section className="section">
          <h2>Introduction</h2>
          <p>
            This tool is designed to help you create a <strong>.docx</strong> document containing various types of
            questions, options, solutions, and paragraphs. You can upload images for questions, options, solutions, and
            paragraphs, select the answers, and save the document as a Word file.
          </p>
        </section>

        {/* Question Types Section */}
        <section className="section">
          <h2>Question Types</h2>
          <ul>
            <li><strong>MCQ (Multiple Choice Question):</strong> A question with multiple options, where only one option can be selected. 
                Example: 
                <pre>
                  What is the capital of France? 
                  a) Berlin 
                  b) Madrid 
                  c) Paris 
                  d) Rome 
                </pre>
            </li>
            <li><strong>MSQ (Multiple Select Question):</strong> A question with multiple options, where more than one option can be selected. 
                Example: 
                <pre>
                  Which of these are programming languages? 
                  a) JavaScript 
                  b) Python 
                  c) English 
                  d) Java 
                </pre>
            </li>
            <li><strong>True/False:</strong> A question with two options, True or False, where only one option is correct. 
                Example:
                <pre>
                  The Earth is flat. 
                  a) True 
                  b) False 
                </pre>
            </li>
            <li><strong>Assertion:</strong> A statement where the user has to assert the correct option based on a true or false statement. 
                Example: 
                <pre>
                  Assertion: The capital of India is Delhi. 
                  a) True 
                  b) False 
                </pre>
            </li>
            <li><strong>NIT (Not in Text):</strong> A question where the answer must be a numeric value, no options are provided. 
                Example: 
                <pre>
                  What is the population of the world in billions? (Numeric answer)
                </pre>
            </li>
            <li><strong>Paragraph:</strong> A question where the user has to interpret or answer based on a paragraph provided. 
                Example: 
                <pre>
                  Read the paragraph below and answer the question:
                  "In 1492, Christopher Columbus discovered the New World."
                  Question: When did Columbus discover the New World?
                </pre>
            </li>
          </ul>
        </section>

        {/* Instructions Section */}
        <section className="section">
          <h2>Instructions for Use</h2>
          <ol>
            <li><strong>Select a Question Type:</strong> In the left sidebar, choose the type of question you wish to create. This will show the corresponding input fields.</li>
            <li><strong>Upload Images:</strong> For questions with images, you will need to upload images for the questions, options, solutions, and paragraphs. 
                <br />Click on the provided file input fields to upload images for each part.</li>
            <li><strong>Enter Question Details:</strong> Once the images are uploaded, enter the question text and provide options where applicable.</li>
            <li><strong>Select Answer:</strong> For MCQs, MSQs, and True/False questions, you will need to select the correct answer(s). 
                Use radio buttons for MCQs and True/False, and checkboxes for MSQs.</li>
            <li><strong>Numeric Answers:</strong> For NIT questions, enter numeric values in the text fields instead of selecting options.</li>
            <li><strong>Add Question:</strong> After completing each question, click on the "Add Question" button to save your question.</li>
            <li><strong>Preview Questions:</strong> After adding all your questions, click on the "Preview" button to review your questions and answers before generating the document.</li>
            <li><strong>Save Document:</strong> Click on the "Save Document" button to save the questions, answers, and solutions as a Word document (.docx).</li>
          </ol>
        </section>

        {/* Features Section */}
        <section className="section">
          <h2>Key Features</h2>
          <ul>
            <li><strong>Multiple Question Types:</strong> Choose from MCQ, MSQ, True/False, Assertion, NIT, and Paragraph.</li>
            <li><strong>Image Upload:</strong> Upload images for questions, options, solutions, and paragraphs to make your document more interactive.</li>
            <li><strong>Answer Selection:</strong> Easily select the correct answers using radio buttons or checkboxes.</li>
            <li><strong>Document Generation:</strong> Automatically create a Word document (.docx) with all your questions, options, and solutions.</li>
            <li><strong>Preview Feature:</strong> Preview the document before saving to ensure everything is correct and formatted properly.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default Instruction
