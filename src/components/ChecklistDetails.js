import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ChecklistDetails = () => {
  const { decisionId } = useParams();
  const [decisionDetails, setDecisionDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDecisionDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/checklist_answers/1/details/${decisionId}`);
        setDecisionDetails(response.data);
      } catch (error) {
        console.error('Error fetching decision details', error);
      }
    };

    fetchDecisionDetails();
  }, [decisionId]);

  if (!decisionDetails) return <div>Loading...</div>;

  return (
    <div className="checklist-details" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2>{decisionDetails.decision_name} - Details</h2>
      <div><strong>Version:</strong> {decisionDetails.version}</div>
      <div><strong>Created At:</strong> {new Date(decisionDetails.created_at).toLocaleString()}</div>
      <div><strong>Final Decision:</strong> {decisionDetails.final_decision}</div>

      <h3>Answers:</h3>
      <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
        {decisionDetails.answers.map((answer, index) => (
          <li key={index} style={{ borderBottom: '1px solid #ccc', padding: '10px 0', marginBottom: '10px' }}>
            <div style={{ textAlign: 'left' }}><strong>Q:</strong> <strong>{answer.question}</strong></div>
            <div style={{ textAlign: 'left' }}><strong>A:</strong> {answer.answer}</div>
          </li>
        ))}
      </ul>

      <nav style={{ marginTop: '20px' }}>
        <Link to="/history" style={{ padding: '10px 20px' }}>Back to Checklist Answer History</Link>
      </nav>
    </div>
  );
};

export default ChecklistDetails;