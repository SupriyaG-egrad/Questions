import React from 'react'
import "./instruction.css"
const Instruction = () => {
  return (
    <div className="App">
      {/* Header Section */}
      <header>
        <h1>GuideLines</h1>
      </header>

      {/* Main Content Container */}
      <div className="containerbox">

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
                <div>
                  What is the capital of France? 
                <div> a) Berlin </div>  
                 <div> b) Madrid</div>  
                 <div> c) Paris</div>
                </div>
            </li>
            <li><strong>MSQ (Multiple Select Question):</strong> A question with multiple options, where more than one option can be selected. 
                Example: 
                <div>
                  Which of these are programming languages? 
                 <div>a) JavaScript </div> 
                 <div>b) Python </div> 
                 <div> c) English </div>
                 <div>d) Java </div> 
                </div>
            </li>
            <li><strong>True/False:</strong> A question with two options, True or False, where only one option is correct. 
                Example:
                <div>
                  <div>The Earth is flat.</div> 
                 <div>a) True </div> 
                  <div>b) False </div>
                </div>
            </li>
            <li><strong>Assertion:</strong> A statement where the user has to assert the correct option based on a true or false statement. 
                Example: 
                <div>
                <div>Assertion (A) – A statement that presents a fact or claim.</div>
                <div>Reason (R) – A statement that explains why the assertion is true or false.</div>
                <div>a)Both A and R are true, and R correctly explains A.</div>
                <div>b)Both A and R are true, but R does not explain A.</div>
                <div>c)A is true, but R is false.</div>
                <div>A is false, but R is true.</div>
                </div>
            </li>
            <li><strong>NIT (Not in Text):</strong> A question where the answer must be a numeric value, no options are provided. 
                Example: 
                <div>
                  What is the population of the world in billions? (Numeric answer)
                </div>
            </li>
            <li><strong>Paragraph:</strong> A question where the user has to interpret or answer based on a paragraph provided. 
                Example: 
                <div style={{margin:"10px"}}>
                Photosynthesis is the process by which green plants prepare their own food using sunlight, carbon dioxide, and water. This process occurs in the chloroplasts of plant cells, where chlorophyll absorbs light energy.
                 Oxygen is released as a byproduct, and the stored glucose helps plants grow.
                </div>
                <div>1)What is the byproduct of photosynthesis?</div>
                <div>2)What is the role of chlorophyll in photosynthesis?</div>
                <div>3)What is the byproduct of photosynthesis?</div>
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
