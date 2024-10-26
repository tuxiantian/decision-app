import React, { useState, useEffect } from 'react';
import axios from 'axios';
import mermaid from 'mermaid';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import PersonalStateCheck from './PersonalStateCheck';
import { API_BASE_URL } from '../config'; 

// 在组件加载前设置应用程序元素，通常设置为根元素
Modal.setAppElement('#root');

const ChecklistDetail = () => {
  const { checklistId } = useParams();
  const navigate = useNavigate();
  const [assessmentComplete, setAssessmentComplete] = useState(false); // 增加一个状态来判断评估是否完成
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
  const [mermaidCode, setMermaidCode] = useState(''); // 流程图代码
  const [renderFlowchart, setRenderFlowchart] = useState(false); // 控制流程图渲染的状态


  useEffect(() => {
    const fetchChecklistDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/checklists/${checklistId}`);
        setQuestions(response.data.questions);
        setMermaidCode(response.data.mermaid_code); // 获取流程图代码

      } catch (error) {
        console.error('Error fetching checklist details', error);
      }
    };
    fetchChecklistDetails();
  }, [checklistId]);

  // 监听步骤的变化，确保流程图在正确的步骤显示
  useEffect(() => {
    if (renderFlowchart && mermaidCode) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        themeCSS: `
        .nodeLabel  p {
          white-space: pre-wrap;         /* 强制长文本换行 */
        }
        `,
        flowchart: { curve: 'linear' },
        securityLevel: 'loose',
      });

      // 渲染流程图
      mermaid.run();
    }
  }, [renderFlowchart, mermaidCode]);

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
    fetchArticles(1); // 初始加载文章数据
  };

  const fetchArticles = async (page = 1) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/articles`, {
        params: { search: searchTerm, page, page_size: 10 },
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
    fetchArticles(1);
  };

  const handleSelectArticle = (articleId) => {
    if (activeQuestionId === null) return;

    const selected = selectedArticles[activeQuestionId] || [];
    const selectedArticle = articles.find((art) => art.id === articleId);

    if (selected.some((art) => art.id === articleId)) {
      // 如果已经引用，取消引用（即反选）
      setSelectedArticles({
        ...selectedArticles,
        [activeQuestionId]: selected.filter((art) => art.id !== articleId),
      });
    } else {
      if (selected.length < 5 && selectedArticle) {
        // 如果引用数少于 5，允许添加引用
        setSelectedArticles({
          ...selectedArticles,
          [activeQuestionId]: [...selected, selectedArticle],
        });
      } else {
        alert("You can reference up to 5 articles only.");
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const answersArray = Object.keys(answers).map((questionId) => ({
        question_id: parseInt(questionId, 10),
        answer: answers[questionId]?.answer || '',
        referenced_articles: selectedArticles[questionId] 
        ? selectedArticles[questionId].map(article => article.id): [],
      }));

      const response = await axios.post(`${API_BASE_URL}/save_checklist_answers`, {
        checklist_id: checklistId,
        decision_name: decisionName,
        final_decision: finalDecision,
        user_id: 1,
        answers: answersArray,
      });

      if (response.status === 200) {
        console.log('Checklist answers saved successfully');
        navigate('/checklists');
      } else {
        console.error('Unexpected response code:', response.status);
      }
    } catch (error) {
      console.error('Error saving checklist answers', error);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      fetchArticles(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      fetchArticles(currentPage - 1);
    }
  };

  const handleAssessmentComplete = () => {
    setAssessmentComplete(true);
    setRenderFlowchart(true); // 状态检测完成后，允许渲染流程图
  };

  return (
    <div className="checklist-detail" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {!assessmentComplete ? (
        <PersonalStateCheck onAssessmentComplete={handleAssessmentComplete} />
      ) : (
        <>

         {/* 新增步骤 - 全局预览，包括流程图和问题列表 */}
         {step === 1 && (
            <div>
              <h2>Step 1: Overview of Checklist</h2>
              {mermaidCode && (
                <div style={{ marginBottom: '20px' }}>
                  <h3>Flowchart:</h3>
                  <div
                    id="mermaid-flowchart"
                    className="mermaid"
                    style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '5px', marginTop: '20px' }}
                  >
                    {mermaidCode}
                  </div>
                </div>
              )}
              <div>
                <h3>Checklist Questions:</h3>
                <ul>
                  {questions.map((question) => (
                    <li key={question.id} style={{ marginBottom: '10px' }}>
                      {question.question}
                    </li>
                  ))}
                </ul>
              </div>
              <button onClick={() => setStep(2)} className="green-button" style={{ marginTop: '20px' }}>
                已读，前去做决定
              </button>
            </div>
          )}


          {step === 2 && (
            <div>
              <h2>Step 2: Enter Decision Name</h2>
              <div style={{ marginBottom: '20px' }}>
                <input
                  type="text"
                  style={{ width: '100%', padding: '10px', fontSize: '16px' }}
                  placeholder="Enter decision name"
                  value={decisionName}
                  onChange={(e) => setDecisionName(e.target.value)}
                />
              </div>
              <button onClick={() => setStep(3)} disabled={!decisionName} className='green-button'>
                Next
              </button>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2>Step 3: Answer Checklist Questions</h2>
              {questions.length > 0 && (
                <div key={questions[currentQuestionIndex].id} className="form-group" style={{ marginBottom: '20px' }}>
                  <label>{`Question ${currentQuestionIndex + 1}: ${questions[currentQuestionIndex].question}`}</label>
                  <textarea
                    style={{ width: '80%', padding: '10px', fontSize: '16px', height: '80px' }}
                    value={answers[questions[currentQuestionIndex].id]?.answer || ''}
                    onChange={(e) => handleAnswerChange(questions[currentQuestionIndex].id, e.target.value)}
                  />
                  <button
                    style={{ marginTop: '10px' }} className='green-button'
                    onClick={() => handleReferenceArticles(questions[currentQuestionIndex].id)}
                  >
                    Reference Mental Models
                  </button>
                  {selectedArticles[questions[currentQuestionIndex].id] &&
                    selectedArticles[questions[currentQuestionIndex].id].length > 0 && (
                      <div>
                        <h4>Referenced Articles:</h4>
                        <div style={{ marginLeft: '15px' }}>
                          {selectedArticles[questions[currentQuestionIndex].id].map((article) => (
                            <div key={article.id} style={{ marginBottom: '5px' }}>
                              {article.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}
              <div style={{ marginTop: '20px' }}>
                {currentQuestionIndex > 0 && (
                  <button onClick={handlePreviousQuestion} style={{ marginRight: '10px', padding: '10px 20px' }} className='green-button'>
                    Previous Question
                  </button>
                )}
                {currentQuestionIndex < questions.length - 1 && (
                  <button onClick={handleNextQuestion} style={{ marginRight: '10px', padding: '10px 20px' }} className='green-button'>
                    Next Question
                  </button>
                )}
              </div>
              <div style={{ marginTop: '20px' }}>
                <button onClick={() => setStep(1)} style={{ marginRight: '10px', padding: '10px 20px' }} className='green-button'>
                  Previous Step
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={Object.keys(answers).length !== questions.length}
                  style={{ padding: '10px 20px' }}
                  className='green-button'
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2>Step 4: Enter Final Decision</h2>
              <div style={{ marginBottom: '20px' }}>
                <textarea
                  style={{ width: '100%', height: '150px', padding: '10px', fontSize: '16px' }}
                  placeholder="Enter final decision"
                  value={finalDecision}
                  onChange={(e) => setFinalDecision(e.target.value)}
                />
              </div>
              <div style={{ marginTop: '20px' }}>
                <button onClick={() => setStep(2)} style={{ marginRight: '10px', padding: '10px 20px' }} className='green-button'>
                  Previous Step
                </button>
                <button onClick={handleSubmit} disabled={!finalDecision} style={{ padding: '10px 20px' }} className='green-button'>
                  Submit
                </button>
              </div>
            </div>
          )}
        </>
      )}

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
          <button className='green-button' onClick={handleSearch}>Search</button>
        </div>
        <div style={{ textAlign: 'center' }}>
          {articles.map((article) => (
            <div key={article.id} style={{ marginBottom: '10px', textAlign: 'left' }}>
              <input
                type="checkbox"
                checked={selectedArticles[activeQuestionId]?.some((art) => art.id === article.id) || false}
                onChange={() => handleSelectArticle(article.id)}
                style={{ marginRight: '5px' }}
              />
              {article.title}
            </div>
          ))}
        </div>
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
          <button className='green-button' onClick={handlePreviousPage} disabled={currentPage === 1}>
            Previous Page
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button className='green-button' onClick={handleNextPage} disabled={currentPage === totalPages}>
            Next Page
          </button>
        </div>
        <button onClick={() => setIsModalOpen(false)} style={{ marginTop: '20px' }} className='green-button'>Done</button>
      </Modal>
    </div>
  );
};

export default ChecklistDetail;
