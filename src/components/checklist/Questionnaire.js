import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import api from '../api.js'
import '//at.alicdn.com/t/c/font_4955755_wck13l63429.js';
import './Questionnaire.css';  // 新增样式文件导入

const Questionnaire = () => {
    const { decisionId } = useParams();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [answers, setAnswers] = useState({});
    const [step, setStep] = useState(1); // 新增步骤控制
    const [userPath, setUserPath] = useState([]);
    // 新增状态管理展开/折叠
    const [expandedQuestions, setExpandedQuestions] = useState({});
    // New state for article references
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [articles, setArticles] = useState([]);
    const [platformArticles, setPlatformArticles] = useState([]);
    const [selectedArticles, setSelectedArticles] = useState({});
    const [selectedPlatformArticles, setSelectedPlatformArticles] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [tab, setTab] = useState('my');
    const [activeQuestionId, setActiveQuestionId] = useState(null);

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
    // 获取问题列表
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await api.get(`/get_checklist_questions/${decisionId}`);
                setQuestions(response.data);
                // 设置第一个根问题
                const rootQuestion = response.data.find(q => !q.parent_id);
                setCurrentQuestion(rootQuestion);
            } catch (error) {
                console.error('Error fetching questions:', error);
            }
        };
        fetchQuestions();
    }, [decisionId]);

    // Fetch articles
    const fetchArticles = async (page = 1) => {
        try {
            const response = await api.get(`/articles`, {
                params: { search: searchTerm, page, page_size: 10 },
            });
            setArticles(response.data.articles);
            setTotalPages(response.data.total_pages);
            setCurrentPage(page);
        } catch (error) {
            console.error('Error fetching articles', error);
        }
    };

    // Fetch platform articles
    const fetchPlatformArticles = async (page = 1) => {
        try {
            const response = await api.get(`/platform_articles`, {
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
            fetchArticles(currentPage);
        } else if (tab === 'recommended') {
            fetchPlatformArticles(currentPage);
        }
    }, [tab, currentPage]);

    const handleTabChange = (newTab) => {
        setTab(newTab);
        setCurrentPage(1);
    };

    const handleSearch = () => {
        setCurrentPage(1);
        if (tab === 'my') {
            fetchArticles(1);
        } else if (tab === 'recommended') {
            fetchPlatformArticles(1);
        }
    };

    // Open article reference modal
    const handleReferenceArticles = (questionId) => {
        setActiveQuestionId(questionId);
        setIsModalOpen(true);
        if (tab === 'my') {
            fetchArticles(1);
        } else {
            fetchPlatformArticles(1);
        }
    };

    // Select/deselect article
    const handleSelectArticle = (articleId) => {
        if (activeQuestionId === null) return;

        if (tab === 'my') {
            const selected = selectedArticles[activeQuestionId] || [];
            const selectedArticle = articles.find((art) => art.id === articleId);

            if (selected.some((art) => art.id === articleId)) {
                setSelectedArticles({
                    ...selectedArticles,
                    [activeQuestionId]: selected.filter((art) => art.id !== articleId),
                });
            } else {
                if (selected.length < 5 && selectedArticle) {
                    setSelectedArticles({
                        ...selectedArticles,
                        [activeQuestionId]: [...selected, selectedArticle],
                    });
                } else {
                    alert("You can reference up to 5 articles only.");
                }
            }
        }

        if (tab === 'recommended') {
            const selected = selectedPlatformArticles[activeQuestionId] || [];
            const selectedArticle = platformArticles.find((art) => art.id === articleId);

            if (selected.some((art) => art.id === articleId)) {
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

    useEffect(() => { console.log(JSON.stringify(userPath)) }, [step]);

    // 获取下一个问题
    const getNextQuestion = (currentQuestion, answer) => {
        if (currentQuestion.type === 'choice' && answer == undefined) {
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
        if (currentQuestion.type === 'choice' && answer != undefined) {
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
            return getNextQuestion(parent, null);
        }

        // 没有更多问题，返回null表示结束
        return null;
    };

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
                referenced_articles: selectedArticles[question.id] || [],
                referenced_platform_articles: selectedPlatformArticles[question.id] || []
            }
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
        } else {
            // 没有更多问题，进入下一步
            setStep(3);
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
    };

    // 提交所有答案
    const submitAllAnswers = async () => {
        try {
            const answersArray = Object.keys(answers).map(questionId => ({
                question_id: parseInt(questionId, 10),
                answer: answers[questionId]?.answer ?? '',
                referenced_articles: answers[questionId]?.referenced_articles?.map(a => a.id) || [],
                referenced_platform_articles: answers[questionId]?.referenced_platform_articles?.map(a => a.id) || []
            }));
            await api.post(`/checklist_answers/decision/${decisionId}`, {
                answers: answersArray
            });
            alert('所有答案已成功提交');
            navigate('/history');
        } catch (error) {
            console.error('Error submitting answers:', error);
            if (error.response && error.response.data.error) {
                alert(error.response.data.error); // 显示后端返回的错误信息
            }
        }
    };

    // 渲染当前问题
    const renderCurrentQuestion = () => {
        if (!currentQuestion) return null;

        return (
            <div className="questionnaire-question">
                <h2>{currentQuestion.question}</h2>

                {currentQuestion.type === 'text' ? (
                    <>
                        <textarea
                            className="answer-textarea"
                            value={answers[currentQuestion.id]?.answer || ''}
                            onChange={(e) => {
                                setAnswers(prev => ({
                                    ...prev,
                                    [currentQuestion.id]: {
                                        ...prev[currentQuestion.id],
                                        answer: e.target.value
                                    }
                                }));
                            }}
                            placeholder={currentQuestion.description}
                        />
                        <button
                            className="green-button"
                            onClick={() => handleReferenceArticles(currentQuestion.id)}
                        >
                            Reference Articles
                        </button>

                        {/* Show referenced articles */}
                        {(selectedArticles[currentQuestion.id]?.length > 0 ||
                            selectedPlatformArticles[currentQuestion.id]?.length > 0) && (
                                <div className="referenced-articles">
                                    <h4>Referenced Articles:</h4>
                                    {selectedArticles[currentQuestion.id]?.length > 0 && (
                                        <div>
                                            <h5>My Articles:</h5>
                                            {selectedArticles[currentQuestion.id].map(article => (
                                                <div key={article.id} className="article-item">
                                                    {article.title}
                                                    <button
                                                        onClick={() => {
                                                            const updated = selectedArticles[currentQuestion.id]
                                                                .filter(a => a.id !== article.id);
                                                            setSelectedArticles({
                                                                ...selectedArticles,
                                                                [currentQuestion.id]: updated
                                                            });
                                                        }}
                                                        className="icon-button"
                                                    >
                                                        <svg className="icon" aria-hidden="true">
                                                            <use xlinkHref="#icon-shanchu"></use>
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {selectedPlatformArticles[currentQuestion.id]?.length > 0 && (
                                        <div>
                                            <h5>Platform Articles:</h5>
                                            {selectedPlatformArticles[currentQuestion.id].map(article => (
                                                <div key={article.id} className="article-item">
                                                    {article.title}
                                                    <button
                                                        onClick={() => {
                                                            const updated = selectedPlatformArticles[currentQuestion.id]
                                                                .filter(a => a.id !== article.id);
                                                            setSelectedPlatformArticles({
                                                                ...selectedPlatformArticles,
                                                                [currentQuestion.id]: updated
                                                            });
                                                        }}
                                                        className="icon-button"
                                                    >
                                                        <svg className="icon" aria-hidden="true">
                                                            <use xlinkHref="#icon-shanchu"></use>
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        <div className="navigation-buttons">
                            {userPath.length > 1 && (
                                <button className="primary-button" onClick={goBackToPreviousQuestion}>上一题</button>
                            )}
                            <button
                                className="primary-button"
                                onClick={() => handleAnswerChange(currentQuestion, answers[currentQuestion.id]?.answer || '')}
                            >
                                下一题
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="choice-question">
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
                                            setAnswers(prev => ({
                                                ...prev,
                                                [currentQuestion.id]: {
                                                    ...prev[currentQuestion.id],
                                                    answer: optIndex
                                                }
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
                            className="green-button"
                            onClick={() => handleReferenceArticles(currentQuestion.id)}
                        >
                            Reference Articles
                        </button>

                        {/* Show referenced articles for choice questions */}
                        {(selectedArticles[currentQuestion.id]?.length > 0 ||
                            selectedPlatformArticles[currentQuestion.id]?.length > 0) && (
                                <div className="referenced-articles">
                                    <h4>Referenced Articles:</h4>
                                    {selectedArticles[currentQuestion.id]?.length > 0 && (
                                        <div>
                                            <h5>My Articles:</h5>
                                            {selectedArticles[currentQuestion.id].map(article => (
                                                <div key={article.id} className="article-item">
                                                    {article.title}
                                                    <button
                                                        onClick={() => {
                                                            const updated = selectedArticles[currentQuestion.id]
                                                                .filter(a => a.id !== article.id);
                                                            setSelectedArticles({
                                                                ...selectedArticles,
                                                                [currentQuestion.id]: updated
                                                            });
                                                        }}
                                                        className="icon-button"
                                                    >
                                                        <svg className="icon" aria-hidden="true">
                                                            <use xlinkHref="#icon-shanchu"></use>
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {selectedPlatformArticles[currentQuestion.id]?.length > 0 && (
                                        <div>
                                            <h5>Platform Articles:</h5>
                                            {selectedPlatformArticles[currentQuestion.id].map(article => (
                                                <div key={article.id} className="article-item">
                                                    {article.title}
                                                    <button
                                                        onClick={() => {
                                                            const updated = selectedPlatformArticles[currentQuestion.id]
                                                                .filter(a => a.id !== article.id);
                                                            setSelectedPlatformArticles({
                                                                ...selectedPlatformArticles,
                                                                [currentQuestion.id]: updated
                                                            });
                                                        }}
                                                        className="icon-button"
                                                    >
                                                        <svg className="icon" aria-hidden="true">
                                                            <use xlinkHref="#icon-shanchu"></use>
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        <div className="navigation-buttons">
                            {userPath.length > 1 && (
                                <button className="primary-button" onClick={goBackToPreviousQuestion}>上一题</button>
                            )}
                            <button
                                className="primary-button"
                                onClick={() => {
                                    if (answers[currentQuestion.id]?.answer === undefined) {
                                        alert('请选择一个选项');
                                    } else {
                                        handleAnswerChange(currentQuestion, answers[currentQuestion.id].answer);
                                    }
                                }}
                            >
                                下一题
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Article reference modal
    const renderArticleModal = () => (
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
                <button className="green-button" onClick={handleSearch}>Search</button>
            </div>
            <div style={{ textAlign: 'center' }}>
                {(tab === 'my' ? articles : platformArticles).map((article) => (
                    <div key={article.id} style={{ marginBottom: '10px', textAlign: 'left' }}>
                        <input
                            type="checkbox"
                            checked={
                                tab === 'my'
                                    ? selectedArticles[activeQuestionId]?.some(a => a.id === article.id)
                                    : selectedPlatformArticles[activeQuestionId]?.some(a => a.id === article.id) || false
                            }
                            onChange={() => handleSelectArticle(article.id)}
                            style={{ marginRight: '5px' }}
                        />
                        {article.title}
                    </div>
                ))}
            </div>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <button
                    className="green-button"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                >
                    Previous Page
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                    className="green-button"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                >
                    Next Page
                </button>
            </div>
            <button
                onClick={() => setIsModalOpen(false)}
                style={{ marginTop: '20px' }}
                className="green-button"
            >
                Done
            </button>
        </Modal>
    );

    // 控制不同步骤的渲染
    if (step === 1) {
        return (
            <div className="questionnaire-step">
                <h2>Step 1: 问题概览</h2>
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
                <button
                    className="primary-button"
                    onClick={() => setStep(2)}
                    style={{ marginTop: '20px' }}
                >
                    开始回答问题
                </button>

            </div>
        );
    }

    if (step === 2) {
        return (
            <div className="questionnaire-step">
                {renderCurrentQuestion()}
                {renderArticleModal()}
            </div>
        );
    }

    if (step === 3) {
        return (
            <div className="questionnaire-step">
                <h2>Step 3: Review and Submit</h2>
                <div className="questionnaire-review">
                    {
                        userPath.map((step, index) => {
                            const question = questions.find(q => q.id === step.questionId);
                            const answer = answers[step.questionId];
                            return (
                                <div key={index} className="review-item">
                                    <h3>{question.question}</h3>
                                    <p>
                                        <strong>Answer: </strong>
                                        {question.type === 'choice'
                                            ? question.options[answer?.answer]
                                            : answer?.answer}
                                    </p>
                                    {/* 引用的文章 */}
                                    {answer?.referenced_articles?.length > 0 && (
                                        <div style={{ marginTop: '10px' }}>
                                            <strong>Referenced Articles:</strong>
                                            <ul style={{ listStyleType: 'none', paddingLeft: '0' }}>
                                                {answer.referenced_articles.map((article) => (
                                                    <li key={article.id}>
                                                        <a
                                                            href={`${window.location.origin}/view-article/my/${article.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{
                                                                textDecoration: 'underline',
                                                                color: '#007bff'
                                                            }}
                                                        >
                                                            {article.title}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {answer?.referenced_platform_articles?.length > 0 && (
                                        <div style={{ marginTop: '10px' }}>
                                            <strong>Referenced Platform Recommended Articles:</strong>
                                            <ul style={{ listStyleType: 'none', paddingLeft: '0' }}>
                                                {answer.referenced_platform_articles.map((article) => (
                                                    <li key={article.id}>
                                                        <a
                                                            href={`${window.location.origin}/view-article/recommended/${article.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{
                                                                textDecoration: 'underline',
                                                                color: '#007bff'
                                                            }}
                                                        >
                                                            {article.title}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                </div>
                <button className="primary-button" onClick={() => setStep(2)}>返回修改答案</button>
                <button className="primary-button" onClick={submitAllAnswers}>提交所有答案</button>
            </div>
        );
    }

    return null;
};

export default Questionnaire;
