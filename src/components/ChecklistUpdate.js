import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config'; 

const ChecklistUpdate = () => {
  const { checklistId } = useParams();
  const [checklist, setChecklist] = useState(null);
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE_URL}/checklists/${checklistId}`)
      .then(response => {
        const data = response.data;
        setChecklist(data);
        setDescription(data.description);
        setQuestions(data.questions.map(q => ({
          question: q.question,
          description: q.description || '',
        })));
      })
      .catch(error => {
        console.error('There was an error fetching the checklist details!', error);
      });
  }, [checklistId]);

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleQuestionChange = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].question = value;
    setQuestions(updatedQuestions);
  };

  const handleQuestionDescriptionChange = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].description = value;
    setQuestions(updatedQuestions);
  };

  const moveQuestionUp = (index) => {
    if (index > 0) {
      const newQuestions = [...questions];
      [newQuestions[index - 1], newQuestions[index]] = [newQuestions[index], newQuestions[index - 1]];  // 交换顺序
      setQuestions(newQuestions);
    }
  };
  
  const moveQuestionDown = (index) => {
    if (index < questions.length - 1) {
      const newQuestions = [...questions];
      [newQuestions[index + 1], newQuestions[index]] = [newQuestions[index], newQuestions[index + 1]];  // 交换顺序
      setQuestions(newQuestions);
    }
  };

  const handleRemoveQuestion = (index) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { question: '', description: '' }]);
  };

  const handleUpdateChecklist = () => {
    const updatedData = {
      description,
      questions
    };

    axios.put(`${API_BASE_URL}/checklists/${checklistId}`, updatedData)
      .then(() => {
        navigate('/checklists');
      })
      .catch(error => {
        console.error('There was an error updating the checklist!', error);
      });
  };

  if (!checklist) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2>Update Checklist - {checklist.name}</h2>
      <div style={{ width: '60%', marginBottom: '20px' }}>
        <label>Description:</label>
        <textarea
          value={description}
          onChange={handleDescriptionChange}
          style={{ width: '100%', height: '100px' }}
        />
      </div>
      <div style={{ width: '60%' }}>
        <h3>Questions:</h3>
        {questions.map((question, index) => (
          <div key={index} style={{ marginBottom: '10px', display: 'flex', flexDirection: 'column' }}>
            <input
              type="text"
              value={question.question}
              onChange={(e) => handleQuestionChange(index, e.target.value)}
              style={{ width: '100%', marginBottom: '5px' }}
            />
             <textarea
              value={question.description}
              onChange={(e) => handleQuestionDescriptionChange(index, e.target.value)}
              placeholder="Enter description (max 255 characters)"
              maxLength={255}
              style={{ width: '100%', height: '60px', marginBottom: '10px' }}
            />
           <div style={{ display: 'flex', gap: '5px' }}>
              <button onClick={() => handleRemoveQuestion(index)} style={{ backgroundColor: 'red', color: 'white' }}>Remove</button>
              <button onClick={() => moveQuestionUp(index)} disabled={index === 0} className="move-btn">Move Up</button>
              <button onClick={() => moveQuestionDown(index)} disabled={index === questions.length - 1} className="move-btn">Move Down</button>
            </div>
          </div>
        ))}
        <button className='green-button' onClick={handleAddQuestion} style={{ marginTop: '10px' }}>Add Question</button>
      </div>
      <button className='green-button' onClick={handleUpdateChecklist} style={{ marginTop: '20px' }}>Update Checklist</button>
    </div>
  );
};

export default ChecklistUpdate;