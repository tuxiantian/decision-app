import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ChecklistDetail = () => {
  const { checklistId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [decisionName, setDecisionName] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [finalDecision, setFinalDecision] = useState('');

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
      [questionId]: value,
    });
  };

  const handleSubmit = async () => {
    try {
      const answersArray = Object.keys(answers).map((questionId) => ({
        question_id: parseInt(questionId, 10),
        answer: answers[questionId],
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
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              />
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
    </div>
  );
};

export default ChecklistDetail;
