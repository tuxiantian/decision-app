import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api.js'
import './Questionnaire.css';  // 新增样式文件导入

const Questionnaire = () => {
    const { decisionId } = useParams();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [step, setStep] = useState(1); // 新增步骤控制

    // 获取问题列表
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await api.get(`/get_checklist_questions/${decisionId}`);
                setQuestions(response.data);
            } catch (error) {
                console.error('Error fetching questions:', error);
            }
        };
        fetchQuestions();
    }, [decisionId]);

    // 处理回答的变化
    const handleAnswerChange = (questionId, value) => {
        setAnswers(prevAnswers => ({
            ...prevAnswers,
            [questionId]: value
        }));
    };

    // 跳转到下一个问题
    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        }
    };

    // 跳转到上一个问题
    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prevIndex => prevIndex - 1);
        }
    };

    // 提交所有答案
    const submitAllAnswers = async () => {
        try {
            const answersArray = questions.map(question => ({
                question_id: question.id,
                answer: answers[question.id] || ''
            }));
            await api.post(`/checklist_answers/decision/${decisionId}`, {
                answers: answersArray
            });
            alert('所有答案已成功提交');
            navigate('/history');
        } catch (error) {
            console.error('Error submitting answers:', error);
        }
    };

    // 控制不同步骤的渲染
    if (step === 1) {
        return (
            <div className="questionnaire-step">
                <h2>Step 1: Overview of Questions</h2>
                <ul className="questionnaire-overview">
                    {questions.map((question, index) => (
                        <li key={index}>{question.question}</li>
                    ))}
                </ul>
                <button className="primary-button" onClick={() => setStep(2)}>开始回答问题</button>
            </div>
        );
    }

    if (step === 2) {
        const currentQuestion = questions[currentQuestionIndex];

        return (
            <div className="questionnaire-step">
                <h2>{`Question ${currentQuestionIndex + 1}: ${currentQuestion.question}`}</h2>
                <textarea
                    className="answer-textarea"
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    placeholder={currentQuestion.description}
                />
                <div className="navigation-buttons">
                    {currentQuestionIndex > 0 && (
                        <button className="primary-button" onClick={handlePreviousQuestion}>上一题</button>
                    )}
                    {currentQuestionIndex < questions.length - 1 ? (
                        <button className="primary-button" onClick={handleNextQuestion}>下一题</button>
                    ) : (
                        <button className="primary-button" onClick={() => setStep(3)}>完成所有问题</button>
                    )}
                </div>
            </div>
        );
    }

    if (step === 3) {
        return (
            <div className="questionnaire-step">
                <h2>Step 3: Review and Submit</h2>
                <ul className="questionnaire-review">
                    {questions.map((question, index) => (
                        <li key={index}>
                            <strong>{`Question ${index + 1}: ${question.question}`}</strong>
                            <p>{`Answer: ${answers[question.id] || '未回答'}`}</p>
                        </li>
                    ))}
                </ul>
                <button className="primary-button" onClick={() => setStep(2)}>返回修改答案</button>
                <button className="primary-button" onClick={submitAllAnswers}>提交所有答案</button>
            </div>
        );
    }

    return null;
};

export default Questionnaire;
