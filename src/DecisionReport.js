import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const DecisionReport = () => {
  const navigate = useNavigate();
  const { decisionId } = useParams();
  const [decisionDetails, setDecisionDetails] = useState(null);

  useEffect(() => {
    const fetchDecisionDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/decision_details/${decisionId}`);
        setDecisionDetails(response.data);
      } catch (error) {
        console.error('Error fetching decision details', error);
      }
    };
    fetchDecisionDetails();
  }, [decisionId]);

  if (!decisionDetails) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '60%', margin: '0 auto' }}>
      <nav style={{ marginBottom: '20px' }}>
        <button className='green-button' onClick={() => navigate(-1)}>Go Back</button>
      </nav>
      <h1 style={{ textAlign: 'center' }}>{decisionDetails.decision_name}</h1>
      <div style={{ marginTop: '20px' }}>
        {Object.entries(decisionDetails.modules).map(([moduleName, questions], index) => (
          <div key={index} style={{ marginBottom: '30px', textAlign: 'left' }}> 
            <h2 style={{ textAlign: 'center' }}>{moduleName}</h2>
            {questions.map((q, qIndex) => (
              <div key={qIndex} style={{ marginBottom: '10px' }}>
                <p style={{ textAlign: 'left', fontWeight: 'bold' }}><strong>Q:</strong> {q.question}</p>
                <p style={{ textAlign: 'left' }}><strong>A:</strong> {q.answer}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <h2>决策结果</h2>
        <p>{decisionDetails.result ? decisionDetails.result : '无结果'}</p>
      </div>
    </div>
  );
};

export default DecisionReport;