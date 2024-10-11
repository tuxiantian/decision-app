import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ChecklistAnswerHistory = () => {
  const [checklistDecisions, setChecklistDecisions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChecklistDecisions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/checklist_answers/1');
        setChecklistDecisions(response.data);
      } catch (error) {
        console.error('Error fetching checklist decisions', error);
      }
    };

    fetchChecklistDecisions();
  }, []);

  const handleViewDetails = (decisionId) => {
    navigate(`/checklist_answers/details/${decisionId}`);
  };

  return (
    <div className="checklist-answer-history" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2>Checklist Answer History</h2>
      <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
        {checklistDecisions.map((decision) => (
          <li key={decision.decision_id} style={{ borderBottom: '1px solid #ccc', padding: '10px 0', marginBottom: '10px' }}>
            <div><strong>Decision Name:</strong> {decision.decision_name}</div>
            <div><strong>Version:</strong> {decision.version}</div>
            <div><strong>Created At:</strong> {new Date(decision.created_at).toLocaleString()}</div>
            <div><strong>Final Decision:</strong> {decision.final_decision}</div>
            <button onClick={() => handleViewDetails(decision.decision_id)} style={{ marginTop: '10px', padding: '10px 20px' }}>
              View Details
            </button>
          </li>
        ))}
      </ul>
      <nav style={{ marginTop: '20px' }}>
        <Link to="/">Back to Home</Link>
      </nav>
    </div>
  );
};

export default ChecklistAnswerHistory;