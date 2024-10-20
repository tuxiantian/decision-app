import React, { useEffect, useState } from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config'; 
import './BalancedDecisionDetail.css';

function BalancedDecisionDetail() {
  const { id } = useParams();
  const [decision, setDecision] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDecisionDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/get_decision/${id}`);
        setDecision(response.data);
      } catch (error) {
        console.error('Error fetching decision details:', error);
      }
    };
    fetchDecisionDetails();
  }, [id]);

  const goBack=()=>{
    navigate('/balanced-decisions/list');
  }

  if (!decision) {
    return <div>Loading...</div>;
  }

  return (
    <div className="detail-container">
      <h1 className="title">Decision Details: {decision.decision_name}</h1>

      <div className="section">
        <h2 className="section-title">Conditions</h2>
        <div className="conditions-container">
          <div className="conditions-column">
            <h3 className="column-title">Positive Conditions</h3>
            <ul className="condition-list">
              {decision.conditions.positive.map((condition, index) => (
                <li key={index} className="condition-item">
                  <span>{condition.description}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="conditions-column">
            <h3 className="column-title">Negative Conditions</h3>
            <ul className="condition-list">
              {decision.conditions.negative.map((condition, index) => (
                <li key={index} className="condition-item">
                  <span>{condition.description}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Conditions Comparisons</h2>
        <ul className="condition-comparison-list">
          {decision.comparisons.map((comparison, index) => (
            <li key={index} className="condition-comparison-item">
              <div className="condition-comparison-details">
                <p>Comparison {index + 1}:</p>
                <p>Condition A: {comparison.conditionA.description}</p>
                <p>Condition B: {comparison.conditionB.description}</p>
                <p>More Important: {comparison.moreImportant.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="section">
        <h2 className="section-title">Groups</h2>
        <ul className="group-list">
          {decision.groups.map((group, index) => (
            <li key={index} className="group-item">
              <div className="group-details">
                <p>Group {index + 1}:</p>
                <p>Positive Conditions: {group.positive.map((item) => item.description).join(', ')}</p>
                <p>Negative Conditions: {group.negative.map((item) => item.description).join(', ')}</p>
              </div>
              <p>Weight: {group.weight}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="section">
        <h2 className="section-title">Group Comparisons and Results</h2>
        <ul className="comparison-list">
          {decision.groups.map((group, index) => (
            <li key={index} className="comparison-item">
              <div className="comparison-details">
                <p>Group {index + 1} Comparison:</p>
                <p>More Important: {group.moreImportant === 'positive' ? 'Positive Conditions' : 'Negative Conditions'}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="result-container">
        <p>Final Decision: {decision.result}</p>
      </div>
      <div>
      <button
                  className="button details-button"
                  onClick={() => goBack()}
                >
                  Go Back
                </button>
      </div>
    </div>
  );
}

export default BalancedDecisionDetail;
