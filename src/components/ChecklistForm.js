import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ChecklistForm.css';

const ChecklistForm = () => {
  const [checklistName, setChecklistName] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState(['']);
  const navigate = useNavigate();

  const handleAddQuestion = () => {
    setQuestions([...questions, '']);
  };

  const handleRemoveQuestion = (index) => {
    const newQuestions = questions.filter((_, idx) => idx !== index);
    setQuestions(newQuestions);
  };

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:5000/checklists', {
        name: checklistName,
        description,
        questions,
        user_id: 1 // Default user ID for now
      });
      console.log('Checklist saved:', response.data);
      navigate('/checklists');
    } catch (error) {
      console.error('Error saving checklist:', error);
    }
  };

  return (
    <div className="checklist-form">
      <h2>Create Checklist</h2>
      <div className="form-group">
        <label>Checklist Name:</label>
        <input
          type="text"
          placeholder="Enter checklist name"
          value={checklistName}
          onChange={(e) => setChecklistName(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Description:</label>
        <textarea
          placeholder="Enter checklist description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="questions-group">
        {questions.map((question, index) => (
          <div key={index} className="form-group">
            <label>{`Question ${index + 1}:`}</label>
            <input
              type="text"
              placeholder={`Enter question ${index + 1}`}
              value={question}
              onChange={(e) => handleQuestionChange(index, e.target.value)}
            />
            <button onClick={() => handleRemoveQuestion(index)} className="remove-btn">Remove</button>
          </div>
        ))}
        <button onClick={handleAddQuestion} className="add-btn">Add Question</button>
      </div>
      <button onClick={handleSubmit} className="submit-btn">Submit Checklist</button>
    </div>
  );
};

export default ChecklistForm;
