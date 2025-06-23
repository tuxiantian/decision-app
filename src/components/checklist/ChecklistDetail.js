import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import PersonalStateCheck from './PersonalStateCheck.js';
import { API_BASE_URL } from '../../config.js';
import api from '../api.js'
import DecisionFlowTool from './DecisionFlowTool';
import './ChecklistDetail.css';

// 在组件加载前设置应用程序元素，通常设置为根元素
Modal.setAppElement('#root');

const ChecklistDetail = () => {
  const { checklistId } = useParams();
  const navigate = useNavigate();
  const [assessmentComplete, setAssessmentComplete] = useState(false); // 增加一个状态来判断评估是否完成
  const [step, setStep] = useState(1);
  const [latestChecklistId, setLatestChecklistId] = useState(null);
  const [decisionName, setDecisionName] = useState('');
  const [description, setDescription] = useState('');
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
  const [renderFlowchart, setRenderFlowchart] = useState(false); // 控制流程图渲染的状态
  const [platformArticles, setPlatformArticles] = useState([]); // 新增状态，用于存储平台推荐的文章
  const [tab, setTab] = useState('my'); // 新增状态，用于管理标签页
  const [flowchartData, setFlowchartData] = useState('');
  const [flowData, setFlowData] = useState({});
  const flowchartRef = useRef(null);
  const flowchartToolRef = useRef(null);
  const [userPath, setUserPath] = useState([]); // 新增：记录用户的选择路径
  const [currentQuestion, setCurrentQuestion] = useState(null); // 修改：当前问题对象
  // 新增状态管理展开/折叠
  const [expandedQuestions, setExpandedQuestions] = useState({});

  // 切换问题展开状态
  const toggleQuestion = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  // 获取问题的子问题
  const getChildQuestions = (question, optionIndex) => {
    if (!question.follow_up_questions) return [];
    const childIds = question.follow_up_questions[optionIndex] || [];
    return questions.filter(q => childIds.includes(q.id));
  };

  useEffect(() => {
    const fetchChecklistDetails = async () => {
      try {
        const response = await api.get(`${API_BASE_URL}/checklists/${checklistId}`);
        const questions = response.data.questions;
        setQuestions(questions);
        if (questions.length > 0) {
          // 找到第一个根问题（没有父问题的问题）
          const rootQuestion = questions.find(q => !q.parent_id);
          setCurrentQuestion(rootQuestion);
          setCurrentQuestionIndex(0);
        }
        setFlowchartData(response.data.mermaid_code);
        // 尝试解析mermaid_code字段，它现在存储的是流程图数据的JSON字符串
        if (response.data.mermaid_code) {
          try {
            const parsedFlowData = JSON.parse(response.data.mermaid_code);
            setFlowData(parsedFlowData);
          } catch (e) {
            console.error('Failed to parse flow data', e);
            // 如果解析失败，使用空数据
            setFlowData({ nodes: [], connections: [] });
          }
        } else {
          setFlowData({ nodes: [], connections: [] });
        }
        setLatestChecklistId(response.data.id);
      } catch (error) {
        console.error('Error fetching checklist details', error);
      }
    };
    fetchChecklistDetails();
  }, [checklistId]);

  // useEffect(() => {
  //   console.log(JSON.stringify(userPath));
  // }, [userPath]);

  // 获取下一个问题
  const getNextQuestion = (currentQuestion, answer) => {
    if (currentQuestion.type === 'choice' && answer === undefined) {
      // 直接查找下一个根问题（parent_id为null）
      const rootQuestions = questions.filter(q => !q.parent_id);

      // 找到当前根问题在列表中的位置
      let currentRootQuestion = currentQuestion;
      while (currentRootQuestion.parent_id) {
        const parent = questions.find(q => q.id === currentRootQuestion.parent_id);
        if (parent) currentRootQuestion = parent;
        else break;
      }

      const currentIndex = rootQuestions.findIndex(q => q.id === currentRootQuestion.id);

      // 返回下一个根问题
      if (currentIndex < rootQuestions.length - 1) {
        return rootQuestions[currentIndex + 1];
      }

      return null;
    }
    // 如果是选择题且用户选择了选项
    if (currentQuestion.type === 'choice' && answer !== undefined) {
      const followUpIds = currentQuestion.follow_up_questions?.[answer] || [];

      // 如果有后续问题，返回第一个后续问题
      if (followUpIds.length > 0) {
        const nextQuestionId = followUpIds[0];
        return questions.find(q => q.id === nextQuestionId);
      }
    }
    // 没有后续问题，则找下一个兄弟问题
    const parent = questions.find(q => q.id === currentQuestion.parent_id);
    if (parent) {
      // 找到当前问题在父问题中的位置
      const optionIndex = Object.entries(parent.follow_up_questions || {}).find(
        ([_, ids]) => ids.includes(currentQuestion.id)
      )?.[0];

      if (optionIndex) {
        const siblings = parent.follow_up_questions[optionIndex];
        const currentIndex = siblings.indexOf(currentQuestion.id);

        // 如果还有下一个兄弟问题
        if (currentIndex < siblings.length - 1) {
          const nextSiblingId = siblings[currentIndex + 1];
          return questions.find(q => q.id === nextSiblingId);
        }
      }
    }

    // 没有兄弟问题，则回到父问题的下一个问题
    if (parent) {
      return getNextQuestion(parent);
    }

    // 没有更多问题，返回null表示结束
    return null;
  };

  // 计算并居中所有节点的视图
  const centerView = useCallback(() => {
    if (!flowchartToolRef.current || flowData.nodes.length === 0) return;

    // 计算所有节点的边界
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    flowData.nodes.forEach(node => {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + node.width);
      maxY = Math.max(maxY, node.y + node.height);
    });

    // 添加边距
    const padding = 100;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    // 计算需要的缩放比例
    const containerWidth = flowchartRef.current?.clientWidth || 800;
    const containerHeight = flowchartRef.current?.clientHeight || 600;
    const scaleX = containerWidth / (maxX - minX);
    const scaleY = containerHeight / (maxY - minY);
    const scale = Math.min(scaleX, scaleY, 1); // 不超过100%缩放

    // 计算居中位置
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const translateX = containerWidth / 2 - centerX * scale;
    const translateY = containerHeight / 2 - centerY * scale;

    // 应用变换
    flowchartToolRef.current.setCanvasTransformTool({
      translateX,
      translateY,
      scale
    });

  }, [flowData]);

  // 处理用户答案
  const handleAnswerChange = (question, value) => {
    // 检查是否已经回答过当前问题
    const isAlreadyAnswered = userPath.some(step =>
      step.questionId === question.id
    );
    // 保存答案
    setAnswers(prev => ({
      ...prev,
      [question.id]: {
        ...prev[question.id],
        answer: value,
      },
    }));


    // 如果已经回答过，替换最后一步而不是新增
    if (isAlreadyAnswered) {
      setUserPath(prev => [
        ...prev.slice(0, -1),
        { questionId: question.id, answer: value }
      ]);
    } else {
      setUserPath(prev => [...prev, {
        questionId: question.id,
        answer: value
      }]);
    }
    // 获取下一个问题
    const nextQuestion = getNextQuestion(question, value);
    if (nextQuestion) {
      setCurrentQuestion(nextQuestion);
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // 没有更多问题，进入下一步
      setStep(4);
    }
  };

  // 回溯到上一个问题
  const goBackToPreviousQuestion = () => {
    if (userPath.length <= 1) return;

    // 获取上一个问题和答案
    const lastStep = userPath[userPath.length - 2];
    const prevQuestion = questions.find(q => q.id === lastStep.questionId);

    // 从路径中移除最后一步
    setUserPath(prev => prev.slice(0, -1));

    // 设置当前问题
    setCurrentQuestion(prevQuestion);
    setCurrentQuestionIndex(prev => prev - 1);
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
        answer: String(answers[questionId]?.answer ?? ''),
        referenced_articles: selectedArticles[questionId]
          ? selectedArticles[questionId].map(article => article.id) : [],
        referenced_platform_articles: selectedPlatformArticles[questionId]?.map((article) => article.id) || [],
      }));

      const response = await api.post(`${API_BASE_URL}/save_checklist_answers`, {
        checklist_id: latestChecklistId,
        decision_name: decisionName,
        description: description,
        final_decision: finalDecision,
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
    setTimeout(() => {
      if (flowData.nodes?.length > 0 && flowchartToolRef.current) {
        centerView();
      }
    }, 100);
  };

  // 渲染当前问题
  const renderCurrentQuestion = () => {
    if (!currentQuestion) return null;

    return (
      <div key={currentQuestion.id} className="checklist-form-group" style={{ marginBottom: '20px' }}>
        <label>{`Question ${currentQuestionIndex + 1}: ${currentQuestion.question}`}</label>

        {currentQuestion.type === 'text' ? (
          <>
            <textarea
              style={{ width: '80%', padding: '10px', fontSize: '16px', height: '240px' }}
              value={answers[currentQuestion.id]?.answer ?? ''}
              placeholder={currentQuestion.description}
              onChange={(e) => {
                // 只更新答案状态，不触发导航
                setAnswers(prev => ({
                  ...prev,
                  [currentQuestion.id]: {
                    ...prev[currentQuestion.id],
                    answer: e.target.value,
                  },
                }));
              }}
            />
            <button
              onClick={() => handleAnswerChange(currentQuestion, answers[currentQuestion.id]?.answer ?? '')}
              style={{ marginTop: '10px' }}
              className='green-button'
            >
              下一题
            </button>
          </>
        ) : (
          <div>
            <div className="options-container">
              {currentQuestion.options.map((option, optIndex) => (
                <div key={optIndex} className="option-item">
                  <input
                    type="radio"
                    id={`option-${currentQuestion.id}-${optIndex}`}
                    name={`question-${currentQuestion.id}`}
                    value={optIndex}
                    checked={answers[currentQuestion.id]?.answer === optIndex}
                    onChange={() => {
                      // 只更新选择状态，不触发导航
                      setAnswers(prev => ({
                        ...prev,
                        [currentQuestion.id]: {
                          ...prev[currentQuestion.id],
                          answer: optIndex,
                        },
                      }));
                    }}
                  />
                  <label
                    htmlFor={`option-${currentQuestion.id}-${optIndex}`}
                    className={`option-label ${answers[currentQuestion.id]?.answer === optIndex ? 'selected' : ''}`}
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                if (answers[currentQuestion.id]?.answer === undefined) {
                  alert('请选择一个选项');
                } else {
                  handleAnswerChange(currentQuestion, answers[currentQuestion.id].answer);
                }
              }}
              className='green-button'
              style={{ marginTop: '10px' }}
            >
              下一题
            </button>
          </div>
        )}

        <button
          style={{ marginTop: '10px' }} className='green-button'
          onClick={() => handleReferenceArticles(currentQuestion?.id)}
        >
          Reference Mental Models
        </button>

        {/* 显示已引用的文章... */}
        {(selectedArticles[currentQuestion?.id] &&
          selectedArticles[currentQuestion?.id].length > 0) ||
          (selectedPlatformArticles[currentQuestion?.id] &&
            selectedPlatformArticles[currentQuestion?.id].length > 0) ? (
          <div>
            <h4>Referenced Articles:</h4>

            {/* 显示用户自己的文章 */}
            {selectedArticles[currentQuestion?.id] &&
              selectedArticles[currentQuestion?.id].length > 0 && (
                <div style={{ marginLeft: '15px' }}>
                  <h5>My Articles:</h5>
                  {selectedArticles[currentQuestion?.id].map((article) => (
                    <div key={article.id} style={{ marginBottom: '5px' }}>
                      {article.title}
                    </div>
                  ))}
                </div>
              )}

            {/* 显示平台推荐文章 */}
            {selectedPlatformArticles[currentQuestion?.id] &&
              selectedPlatformArticles[currentQuestion?.id].length > 0 && (
                <div style={{ marginLeft: '15px', marginTop: '10px' }}>
                  <h5>Platform Recommended Articles:</h5>
                  {selectedPlatformArticles[currentQuestion?.id].map((article) => (
                    <div key={article.id} style={{ marginBottom: '5px' }}>
                      {article.title}
                    </div>
                  ))}
                </div>
              )}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="checklist-detail">
      {!assessmentComplete ? (
        <PersonalStateCheck onAssessmentComplete={handleAssessmentComplete} />
      ) : (
        <>

          {/* 新增步骤 - 全局预览，包括流程图和问题列表 */}
          {step === 1 && (
            <div>
              <h2>Step 1: Overview of Checklist</h2>

              {flowchartData && flowData.nodes?.length > 0 && renderFlowchart && (
                <>
                  <h3>Flowchart:</h3>
                  <div ref={flowchartRef}
                    style={{
                      height: '700px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      overflow: 'auto',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      position: 'relative'
                    }}>

                    <DecisionFlowTool
                      ref={flowchartToolRef}
                      readOnly={true}
                      initialNodes={flowData.nodes}
                      initialConnections={flowData.connections}
                    />

                  </div>
                </>
              )}
              <div>
                <h3 style={{ margin: '20px auto' }}>Checklist Questions:</h3>
                <div className="question-tree">
                  {questions
                    .filter(q => !q.parent_id) // 只显示根问题
                    .map((question) => (
                      <div key={question.id} className="question-node">
                        <div
                          className="question-header"
                          onClick={() => toggleQuestion(question.id)}
                        >
                          <span className="toggle-icon">
                            {expandedQuestions[question.id] ? '▼' : '▶'}
                          </span>
                          {question.question}
                          {question.type === 'choice' && (
                            <span className="question-type">(选择题)</span>
                          )}
                        </div>

                        {expandedQuestions[question.id] && (
                          <div className="question-details">
                            {question.type === 'choice' ? (
                              <div className="options-container">
                                {question.options.map((option, optIndex) => (
                                  <div key={optIndex} className="option-branch">
                                    <div className="option-header">
                                      {option}
                                    </div>
                                    <div className="child-questions">
                                      {getChildQuestions(question, optIndex).map(child => (
                                        <div key={child.id} className="child-question">
                                          {child.question}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-question-desc">
                                {question.description}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
              <button onClick={() => setStep(2)} className="green-button" style={{ margin: '20px auto' }}>
                已读，前去做决定
              </button>
            </div>
          )}


          {step === 2 && (
            <div className='checklist-step'>
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
                <textarea type="text" style={{ width: '100%', padding: '10px', fontSize: '16px',minHeight:'200px' }}
                  placeholder="Enter decision description"
                  maxLength={800}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}></textarea>
              </div>
              <button onClick={() => setStep(3)} disabled={!decisionName} className='green-button'>
                Next
              </button>
            </div>
          )}

          {step === 3 && (
            <div className='checklist-step'>
              <h2>Step 3: Answer Checklist Questions</h2>
              {renderCurrentQuestion()}
              <div style={{ marginTop: '20px' }}>
                {userPath.length > 1 && (
                  <button onClick={goBackToPreviousQuestion} style={{ marginRight: '10px', padding: '10px 20px' }} className='green-button'>
                    Previous Question
                  </button>
                )}

                <button onClick={() => setStep(2)} style={{ marginRight: '10px', padding: '10px 20px' }} className='green-button'>
                  Previous Step
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className='checklist-step'>
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
                <button onClick={() => setStep(3)} style={{ marginRight: '10px', padding: '10px 20px' }} className='green-button'>
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
