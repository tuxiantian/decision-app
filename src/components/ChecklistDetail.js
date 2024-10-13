import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';

const ChecklistDetail = () => {
  const { checklistId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [decisionName, setDecisionName] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [finalDecision, setFinalDecision] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [articles, setArticles] = useState([]);
  const [selectedArticles, setSelectedArticles] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeQuestionId, setActiveQuestionId] = useState(null);

  useEffect(() => {
    const fetchChecklistDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/checklists/${checklistId}`);
        setQuestions(response.data.questions);
      } catch (error) {
        console.error('Error fetching checklist details', error);
      }
    };
    fetchChecklistDetails();
  }, [checklistId]);

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers({
      ...answers,
      [questionId]: {
        ...answers[questionId],
        answer: value,
      },
    });
  };

  const handleReferenceArticles = (questionId) => {
    setActiveQuestionId(questionId);
    setIsModalOpen(true);
    fetchArticles(); // 初始加载文章数据
  };

  const fetchArticles = async () => {
    try {
      const response = await axios.get('http://localhost:5000/articles', {
        params: { search: searchTerm, page: currentPage, page_size: 10 },
      });
      setArticles(response.data.articles);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error('Error fetching articles', error);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1); // 重置为第一页
    fetchArticles();
  };

  const handleSelectArticle = (articleId) => {
    if (activeQuestionId === null) return;
    const selected = selectedArticles[activeQuestionId] || [];
    if (selected.includes(articleId)) {
      setSelectedArticles({
        ...selectedArticles,
        [activeQuestionId]: selected.filter((id) => id !== articleId),
      });
    } else {
      setSelectedArticles({
        ...selectedArticles,
        [activeQuestionId]: [...selected, articleId],
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const answersArray = Object.keys(answers).map((questionId) => ({
        question_id: parseInt(questionId, 10),
        answer: answers[questionId].answer,
        referenced_articles: selectedArticles[questionId] || [],
      }));

      await axios.post('http://localhost:5000/save_checklist_answers', {
        checklist_id: checklistId,
        decision_name: decisionName,
        final_decision: finalDecision,
        user_id: 1,
        answers: answersArray,
      });

      console.log('Checklist answers saved successfully');
      navigate('/checklists');
    } catch (error) {
      console.error('Error saving checklist answers', error);
    }
  };

  return (
    <div className="checklist-detail" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Steps */}
      {step === 1 && (
        <div>
          <h2>Step 1: Enter Decision Name</h2>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              style={{ width: '100%', padding: '10px', fontSize: '16px' }}
              placeholder="Enter decision name"
              value={decisionName}
              onChange={(e) => setDecisionName(e.target.value)}
            />
          </div>
          <button onClick={handleNextStep} disabled={!decisionName} style={{ padding: '10px 20px' }}>
            Next
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2>Step 2: Answer Checklist Questions</h2>
          {questions.map((question, index) => (
            <div key={question.id} className="form-group" style={{ marginBottom: '20px' }}>
              <label>{`Question ${index + 1}: ${question.question}`}</label>
              <textarea
                style={{ width: '80%', padding: '10px', fontSize: '16px', height: '80px' }}
                value={answers[question.id]?.answer || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              />
              <button
                style={{ marginTop: '10px' }}
                onClick={() => handleReferenceArticles(question.id)}
              >
                Reference Mental Models
              </button>
              {selectedArticles[question.id] && selectedArticles[question.id].length > 0 && (
                <div>
                  <h4>Referenced Articles:</h4>
                  <div style={{ marginLeft: '15px' }}>
                    {selectedArticles[question.id].map((articleId) => {
                      const article = articles.find((art) => art.id === articleId);
                      return (
                        <div key={articleId} style={{ marginBottom: '5px' }}>
                          {article ? article.title : ''}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
          <div style={{ marginTop: '20px' }}>
            <button onClick={handlePreviousStep} style={{ marginRight: '10px', padding: '10px 20px' }}>
              Previous
            </button>
            <button
              onClick={handleNextStep}
              disabled={Object.keys(answers).length !== questions.length}
              style={{ padding: '10px 20px' }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2>Step 3: Enter Final Decision</h2>
          <div style={{ marginBottom: '20px' }}>
            <textarea
              style={{ width: '100%', height: '150px', padding: '10px', fontSize: '16px' }}
              placeholder="Enter final decision"
              value={finalDecision}
              onChange={(e) => setFinalDecision(e.target.value)}
            />
          </div>
          <div style={{ marginTop: '20px' }}>
            <button onClick={handlePreviousStep} style={{ marginRight: '10px', padding: '10px 20px' }}>
              Previous
            </button>
            <button onClick={handleSubmit} disabled={!finalDecision} style={{ padding: '10px 20px' }}>
              Submit
            </button>
          </div>
        </div>
      )}

      {/* 引用文章的弹出窗口 */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        style={{
          content: {
            width: '600px',
            margin: '0 auto',
            padding: '20px',
          },
          overlay: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          },
        }}
      >
        <h2>Select Articles to Reference</h2>
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ marginRight: '10px', padding: '5px' }}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        <div style={{ textAlign: 'center' }}>
          {articles.map((article) => (
            <div key={article.id} style={{ marginBottom: '10px', textAlign: 'left' }}>
              <input
                type="checkbox"
                checked={selectedArticles[activeQuestionId]?.includes(article.id)}
                onChange={() => handleSelectArticle(article.id)}
                style={{ marginRight: '5px' }}
              />
              {article.title}
            </div>
          ))}
        </div>
        <button onClick={() => setIsModalOpen(false)} style={{ marginTop: '20px' }}>Done</button>
      </Modal>
    </div>
  );
};

export default ChecklistDetail;
