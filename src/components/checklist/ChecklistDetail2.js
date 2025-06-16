import React, { useState, useEffect } from 'react';
import mermaid from 'mermaid';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import PersonalStateCheck from './PersonalStateCheck.js';
import { API_BASE_URL } from '../../config.js';
import api from '../api.js'

// 在组件加载前设置应用程序元素，通常设置为根元素
Modal.setAppElement('#root');

const ChecklistDetail = () => {
  const { checklistId } = useParams();
  const navigate = useNavigate();
  const [assessmentComplete, setAssessmentComplete] = useState(false); // 增加一个状态来判断评估是否完成
  const [step, setStep] = useState(1);
  const [latestChecklistId, setLatestChecklistId] = useState(null);
  const [decisionName, setDecisionName] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [finalDecision, setFinalDecision] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [articles, setArticles] = useState([]);
  const [selectedArticles, setSelectedArticles] = useState({});
  const [selectedPlatformArticles, setSelectedPlatformArticles] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mermaidCode, setMermaidCode] = useState(''); // 流程图代码
  const [renderFlowchart, setRenderFlowchart] = useState(false); // 控制流程图渲染的状态
  const [platformArticles, setPlatformArticles] = useState([]); // 新增状态，用于存储平台推荐的文章
  const [tab, setTab] = useState('my'); // 新增状态，用于管理标签页


  useEffect(() => {
    const fetchChecklistDetails = async () => {
      try {
        const response = await api.get(`${API_BASE_URL}/checklists/${checklistId}`);
        setQuestions(response.data.questions);
        setMermaidCode(response.data.mermaid_code); // 获取流程图代码
        setLatestChecklistId(response.data.id);
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
    if (tab === 'my') {
      fetchArticles(1);
    } else {
      fetchPlatformArticles(1);
    }
  };

  const fetchArticles = async (page = 1) => {
    try {
      const response = await api.get(`${API_BASE_URL}/articles`, {
        params: { search: searchTerm, page, page_size: 10 },
      });
      setArticles(response.data.articles);
      setTotalPages(response.data.total_pages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching articles', error);
    }
  };

  // Function to fetch platform recommended articles
  const fetchPlatformArticles = async (page = 1) => {
    try {
      const response = await api.get(`${API_BASE_URL}/platform_articles`, {
        params: { search: searchTerm, page, page_size: 10 },
      });
      setPlatformArticles(response.data.articles);
      setTotalPages(response.data.total_pages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching platform articles', error);
    }
  };

  useEffect(() => {
    if (tab === 'my') {
      fetchArticles(1);
    } else if (tab === 'recommended') {
      fetchPlatformArticles(1);
    }
  }, [tab]);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setCurrentPage(1); // Reset to the first page
    setSearchTerm(''); // Clear search term
  };

  const handleSearch = () => {
    setCurrentPage(1); // 重置为第一页
    if (tab === 'my') {
      fetchArticles(1);
    } else if (tab === 'recommended') {
      fetchPlatformArticles(1);
    }
  };

  const handleSelectArticle = (articleId) => {
    if (activeQuestionId === null) return;
    // Handle "My Articles"
    if (tab === 'my') {
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
    }


    // Handle "Platform Articles"
    if (tab === 'recommended') {
      const selected = selectedPlatformArticles[activeQuestionId] || [];
      const selectedArticle = platformArticles.find((art) => art.id === articleId);

      if (selected.some((art) => art.id === articleId)) {
        // Unselect the article if it is already selected
        setSelectedPlatformArticles({
          ...selectedPlatformArticles,
          [activeQuestionId]: selected.filter((art) => art.id !== articleId),
        });
      } else {
        if (selected.length < 5 && selectedArticle) {
          setSelectedPlatformArticles({
            ...selectedPlatformArticles,
            [activeQuestionId]: [...selected, selectedArticle],
          });
        } else {
          alert("You can reference up to 5 articles only.");
        }
      }
    }

  };

  const handleSubmit = async () => {
    try {
      const answersArray = Object.keys(answers).map((questionId) => ({
        question_id: parseInt(questionId, 10),
        answer: answers[questionId]?.answer || '',
        referenced_articles: selectedArticles[questionId]
          ? selectedArticles[questionId].map(article => article.id) : [],
        referenced_platform_articles: selectedPlatformArticles[questionId]?.map((article) => article.id) || [],
      }));

      const response = await api.post(`${API_BASE_URL}/save_checklist_answers`, {
        checklist_id: latestChecklistId,
        decision_name: decisionName,
        final_decision: finalDecision,
        user_id: 1,
        answers: answersArray,
      });

      if (response.status === 200) {
        console.log('Checklist answers saved successfully');
        navigate('/history');
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
              <button onClick={() => setStep(2)} className="green-button" style={{ margin: '20px auto' }}>
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
                  maxLength={100}
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
                <div key={questions[currentQuestionIndex].id} className="checklist-form-group" style={{ marginBottom: '20px' }}>
                  <label>{`Question ${currentQuestionIndex + 1}: ${questions[currentQuestionIndex].question}`}</label>
                  <textarea
                    style={{ width: '80%', padding: '10px', fontSize: '16px', height: '80px' }}
                    value={answers[questions[currentQuestionIndex].id]?.answer || ''}
                    placeholder={questions[currentQuestionIndex].description}
                    onChange={(e) => handleAnswerChange(questions[currentQuestionIndex].id, e.target.value)}
                  />
                  <button
                    style={{ marginTop: '10px' }} className='green-button'
                    onClick={() => handleReferenceArticles(questions[currentQuestionIndex].id)}
                  >
                    Reference Mental Models
                  </button>
                  {(selectedArticles[questions[currentQuestionIndex].id] &&
                    selectedArticles[questions[currentQuestionIndex].id].length > 0) ||
                    (selectedPlatformArticles[questions[currentQuestionIndex].id] &&
                      selectedPlatformArticles[questions[currentQuestionIndex].id].length > 0) ? (
                    <div>
                      <h4>Referenced Articles:</h4>

                      {/* 显示用户自己的文章 */}
                      {selectedArticles[questions[currentQuestionIndex].id] &&
                        selectedArticles[questions[currentQuestionIndex].id].length > 0 && (
                          <div style={{ marginLeft: '15px' }}>
                            <h5>My Articles:</h5>
                            {selectedArticles[questions[currentQuestionIndex].id].map((article) => (
                              <div key={article.id} style={{ marginBottom: '5px' }}>
                                {article.title}
                              </div>
                            ))}
                          </div>
                        )}

                      {/* 显示平台推荐文章 */}
                      {selectedPlatformArticles[questions[currentQuestionIndex].id] &&
                        selectedPlatformArticles[questions[currentQuestionIndex].id].length > 0 && (
                          <div style={{ marginLeft: '15px', marginTop: '10px' }}>
                            <h5>Platform Recommended Articles:</h5>
                            {selectedPlatformArticles[questions[currentQuestionIndex].id].map((article) => (
                              <div key={article.id} style={{ marginBottom: '5px' }}>
                                {article.title}
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  ) : null}

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
        <div className="tab-container">
          <button
            className={`tab-button ${tab === 'my' ? 'active' : ''}`}
            onClick={() => handleTabChange('my')}
          >
            我的
          </button>
          <button
            className={`tab-button ${tab === 'recommended' ? 'active' : ''}`}
            onClick={() => handleTabChange('recommended')}
          >
            推荐
          </button>
        </div>
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
          {(tab === 'my' ? articles : platformArticles).map((article) => (
            <div key={article.id} style={{ marginBottom: '10px', textAlign: 'left' }}>
              <input
                type="checkbox"
                checked={tab === 'my'
                  ? selectedArticles[activeQuestionId]?.some((art) => art.id === article.id)
                  : selectedPlatformArticles[activeQuestionId]?.some((art) => art.id === article.id) || false}
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
