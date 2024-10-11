import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const QuestionFlow = () => {
  const questions = [
    ["必须做出选择，还是可以忽略？", "请描述为什么必须做出选择，或者为什么可以忽略。"],
    ["deadline是什么时候？", "请提供事情的截止时间。"],
    ["事情的反面是什么？有没有可能事与愿违，事情走向反面？", "请思考事情的可能反面和可能的坏结果。"],
    ["现象是什么？本质又是什么？有没有一个合适的模型来认识这件事？", "请描述事情的表象和本质，并考虑一个合适的模型。"],
    ["还有没有其他的可能性？", "请考虑是否有其他可能的解决方案或选项。"],
    ["他说的是真的吗？", "请判断这件事的真实性。"],
    ["我的偏好是什么呢？最重要的是什么？", "请描述你的个人偏好，以及你认为最重要的是什么。"],
    ["这个选择真的适合我吗？", "请思考这个选择是否真的适合你。"],
    ["是否符合我一贯以来的原则？", "请判断这个选择是否符合你的一贯原则。"],
    ["在我的能力范围里吗？我能承受决策的后果吗？", "请思考你是否有能力执行这个选择，以及能否承担后果。"],
    ["是否全面理解事情？我真的渴望这样选择吗？", "请判断你是否已经全面理解了这件事，以及你是否真心渴望这样选择。"],
    ["1天、一周、一个月、一年以后，我会如何看现在的决定？", "请考虑从不同时间点来看这个决定的影响。"],
    ["如果这个决定将产生不可逆转的重大影响，将来我是否会后悔？", "请思考如果这个决定会产生不可逆的影响，你是否会后悔。"]
  ];

  const [decisionName, setDecisionName] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [finalDecision, setFinalDecision] = useState(""); // 新增决策结果输入
  const navigate = useNavigate();

  const handleAnswerSubmit = () => {
    if (currentAnswer.trim() === "") {
      alert("请输入答案再继续");
      return;
    }
    setAnswers([...answers, { question: questions[currentQuestionIndex][0], answer: currentAnswer }]);
    setCurrentAnswer("");
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // 进入决策结果输入
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const submitDecision = async () => {
    if (finalDecision.trim() === "") {
      alert("请输入决策结果");
      return;
    }

    try {
      await axios.post('http://localhost:5000/save_decision', {
        user_id: 1,  // replace with actual user_id
        decision_name: decisionName,
        answers: answers,
        final_decision: finalDecision
      });
      alert('Decision saved successfully!');
      navigate('/decisions'); // Redirect to Decisions List after successful submission
    } catch (error) {
      console.error('Error saving decision', error);
    }
  };

  return (
    <div>
      <h2>决策名称</h2>
      <input
        type="text"
        value={decisionName}
        onChange={(e) => setDecisionName(e.target.value)}
        maxLength={100}
        placeholder="请输入决策名称 (最多100字符)"
        style={{ width: '60%', marginBottom: '20px' }}
      />
      {currentQuestionIndex < questions.length ? (
        <>
          <h2>问题 {currentQuestionIndex + 1}/{questions.length}</h2>
          <p>{questions[currentQuestionIndex][0]}</p>
          <textarea
            style={{ width: '60%', height: '150px' }}
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder={questions[currentQuestionIndex][1]}
          ></textarea>
          <br />
          <button onClick={handleAnswerSubmit} disabled={currentAnswer.trim() === "" || decisionName.trim() === ""}>确定</button>
        </>
      ) : (
        <>
          <h2>请输入最终的决策结果</h2>
          <textarea
            style={{ width: '60%', height: '150px' }}
            value={finalDecision}
            onChange={(e) => setFinalDecision(e.target.value)}
            placeholder="请输入您的最终决策结果..."
          ></textarea>
          <br />
          <button onClick={submitDecision} disabled={finalDecision.trim() === "" || decisionName.trim() === ""}>提交决策</button>
        </>
      )}
    </div>
  );
};

export default QuestionFlow;
