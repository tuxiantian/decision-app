import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import mermaid from 'mermaid';
import { API_BASE_URL } from '../config'; 
import './ChecklistForm.css';

// 初始化 Mermaid 配置
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  flowchart: { curve: 'linear' },
  securityLevel: 'loose',
});

const ChecklistForm = () => {
  const [checklistName, setChecklistName] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState(['']);
  const [mermaidCode, setMermaidCode] = useState('');
  const [activeTab, setActiveTab] = useState('flowchart');
  const [renderError, setRenderError] = useState(null);
  const mermaidContainerRef = useRef(null);
  const navigate = useNavigate();

  // 独立函数处理 Mermaid 渲染
  const renderMermaid = async () => {
    if (mermaidCode.trim() && mermaidContainerRef.current) {
      try {
        setRenderError(null); // 清除之前的错误信息

        // Mermaid 渲染：对指定容器进行渲染
        const { svg } = await mermaid.render('generatedDiagram', mermaidCode);
        if (mermaidContainerRef.current) {
          mermaidContainerRef.current.innerHTML = svg;
        }
      } catch (e) {
        console.error('Mermaid rendering error:', e);
        setRenderError('Mermaid rendering error: Unable to render the flowchart. Please check your syntax.');
      }
    }
  };

  useEffect(() => {
    if (mermaidCode.trim()) {
      setTimeout(() => {
        renderMermaid();
      }, 100);
    }
  }, [mermaidCode]);

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

  const handlePreviewFlowchart = () => {
    if (mermaidCode.trim()) {
      setRenderError(null); // 清除之前的错误信息
      renderMermaid(); // 触发渲染逻辑
    } else {
      setRenderError('Mermaid code cannot be empty');
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/checklists`, {
        name: checklistName,
        description,
        questions,
        mermaid_code: mermaidCode,
        user_id: 1,
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
      <div className="tabs-container">
        <div className="tabs">
          <div
            className={`tab-button ${activeTab === 'flowchart' ? 'active' : ''}`}
            onClick={() => setActiveTab('flowchart')}
          >
            Flowchart
          </div>
          <div
            className={`tab-button ${activeTab === 'form' ? 'active' : ''}`}
            onClick={() => setActiveTab('form')}
          >
            Checklist Form
          </div>
        </div>
      </div>

      {activeTab === 'flowchart' && (
        <div className="tab-content">
          <h3>Mermaid Flowchart Editor</h3>
          <textarea
            value={mermaidCode}
            onChange={(e) => setMermaidCode(e.target.value)}
            rows="10"
            cols="50"
            style={{ width: '100%', marginBottom: '20px' }}
          />
          <button className="preview-btn" onClick={handlePreviewFlowchart}>Preview Flowchart</button>
          {renderError && (
            <div style={{ color: 'red', marginTop: '10px' }}>
              <strong>Error:</strong> {renderError}
            </div>
          )}
          <div
            className="mermaid-preview"
            ref={mermaidContainerRef}
            style={{ marginTop: '20px', minHeight: '200px', border: '1px solid #ccc', padding: '10px' }}
          ></div>
        </div>
      )}

      {activeTab === 'form' && (
        <div className="tab-content">
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
                <button onClick={() => handleRemoveQuestion(index)} className="remove-btn">
                  Remove
                </button>
              </div>
            ))}
            <button onClick={handleAddQuestion} className="add-btn">Add Question</button>
          </div>
          <button onClick={handleSubmit} className="submit-btn">Submit Checklist</button>
        </div>
      )}
    </div>
  );
};

export default ChecklistForm;
