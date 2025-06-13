import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api.js'
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
            [question.id]: value
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
                answer: answers[questionId] ?? ''
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

    useEffect(() => {
        console.log(JSON.stringify(answers));
    }, [answers]);
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
                            value={answers[currentQuestion.id] || ''}
                            onChange={(e) => {
                                // 只更新答案状态，不触发导航
                                setAnswers(prev => ({
                                    ...prev,
                                    [currentQuestion.id]: e.target.value
                                }));
                            }}
                            placeholder={currentQuestion.description}
                        />
                        <div className="navigation-buttons">
                            {userPath.length > 1 && (
                                <button className="primary-button" onClick={goBackToPreviousQuestion}>上一题</button>
                            )}
                            <button
                                className="primary-button"
                                onClick={() => handleAnswerChange(currentQuestion, answers[currentQuestion.id] || '')}
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
                                        checked={answers[currentQuestion.id] === optIndex}
                                        onChange={() => {
                                            setAnswers(prev => ({
                                                ...prev,
                                                [currentQuestion.id]: optIndex
                                            }));
                                        }}
                                    />
                                    <label
                                        htmlFor={`option-${currentQuestion.id}-${optIndex}`}
                                        className={`option-label ${answers[currentQuestion.id] === optIndex ? 'selected' : ''}`}
                                    >
                                        {option}
                                    </label>
                                </div>
                            ))}
                        </div>
                        <div className="navigation-buttons">
                            {userPath.length > 1 && (
                                <button className="primary-button" onClick={goBackToPreviousQuestion}>上一题</button>
                            )}
                            <button
                                className="primary-button"
                                onClick={() => {
                                    if (answers[currentQuestion.id] === undefined) {
                                        alert('请选择一个选项');
                                    } else {
                                        handleAnswerChange(currentQuestion, answers[currentQuestion.id]);
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
                            return (
                                <div key={index} className="review-item">
                                    <h3>{question.question}</h3>
                                    <p>
                                        <strong>Answer: </strong>
                                        {question.type === 'choice'
                                            ? question.options[step.answer]
                                            : step.answer}
                                    </p>
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
