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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

  const handleNextQuestion = () => {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const handlePreviousQuestion = () => {
    setCurrentQuestionIndex(currentQuestionIndex - 1);
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
    fetchArticles(searchTerm, 1); // 初始加载文章数据
  };

  const fetchArticles = async (search = '', page = 1) => {
    try {
      const response = await axios.get('http://localhost:5000/articles', {
        params: { search, page, page_size: 10 },
      });
      setArticles(response.data.articles);
      setTotalPages(response.data.total_pages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching articles', error);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1); // 重置为第一页
    fetchArticles(searchTerm, 1);
  };

  const handleSelectArticle = (articleId) => {
    if (activeQuestionId === null) return;

    const selected = selectedArticles[activeQuestionId] || [];
    
    // 限制引用的文章数量最多为 10
    if (selected.includes(articleId)) {
      setSelectedArticles({
        ...selectedArticles,
        [activeQuestionId]: selected.filter((id) => id !== articleId),
      });
    } else {
      if (selected.length < 10) {
        setSelectedArticles({
          ...selectedArticles,
          [activeQuestionId]: [...selected, articleId],
        });
      } else {
        alert("You can reference up to 10 articles only.");
      }
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

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      fetchArticles(searchTerm, currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      fetchArticles(searchTerm, currentPage - 1);
    }
  };

  return (
    <div className="checklist-detail" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* 步骤逻辑保持不变 */}
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
          <button onClick={() => setStep(2)} disabled={!decisionName} style={{ padding: '10px 20px' }}>
            Next
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2>Step 2: Answer Checklist Questions</h2>
          {questions.length > 0 && (
            <div key={questions[currentQuestionIndex].id} className="form-group" style={{ marginBottom: '20px' }}>
              <label>{`Question ${currentQuestionIndex + 1}: ${questions[currentQuestionIndex].question}`}</label>
              <textarea
                style={{ width: '80%', padding: '10px', fontSize: '16px', height: '80px' }}
                value={answers[questions[currentQuestionIndex].id]?.answer || ''}
                onChange={(e) => handleAnswerChange(questions[currentQuestionIndex].id, e.target.value)}
              />
              <button
                style={{ marginTop: '10px' }}
                onClick={() => handleReferenceArticles(questions[currentQuestionIndex].id)}
              >
                Reference Mental Models
              </button>
            </div>
          )}
          {/* 流程控制按钮保持不变 */}
          <div style={{ marginTop: '20px' }}>
            {currentQuestionIndex > 0 && (
              <button onClick={handlePreviousQuestion} style={{ marginRight: '10px', padding: '10px 20px' }}>
                Previous Question
              </button>
            )}
            {currentQuestionIndex < questions.length - 1 && (
              <button onClick={handleNextQuestion} style={{ marginRight: '10px', padding: '10px 20px' }}>
                Next Question
              </button>
            )}
          </div>
          <div style={{ marginTop: '20px' }}>
            <button onClick={() => setStep(1)} style={{ marginRight: '10px', padding: '10px 20px' }}>
              Previous Step
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={Object.keys(answers).length !== questions.length}
              style={{ padding: '10px 20px' }}
            >
              Next Step
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
            <button onClick={() => setStep(2)} style={{ marginRight: '10px', padding: '10px 20px' }}>
              Previous Step
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
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={handlePreviousPage} disabled={currentPage === 1}>
            Previous Page
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={handleNextPage} disabled={currentPage === totalPages}>
            Next Page
          </button>
        </div>
        <button onClick={() => setIsModalOpen(false)} style={{ marginTop: '20px' }}>Done</button>
      </Modal>
    </div>
  );
};

export default ChecklistDetail;
