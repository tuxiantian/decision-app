import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config'; 
import api from './api'; 
import './BalancedDecisionMaker.css';

function DecisionList() {
  const [decisions, setDecisions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all decisions
    const fetchDecisions = async () => {
      try {
        const response = await api.get(`${API_BASE_URL}/api/get_decisions`);
        setDecisions(response.data);
      } catch (error) {
        console.error('Error fetching decisions:', error);
      }
    };

    fetchDecisions();
  }, []);

  const viewDecisionDetails = (id) => {
    navigate(`/balanced-decisions/${id}`);
  };

  return (
    <div className="decision-list-container">
      <h2 className="title">Saved Decisions</h2>
      <table className="decision-table">
        <thead>
          <tr>
            <th>Decision Name</th>
            <th>Result</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {decisions.map((decision) => (
            <tr key={decision.id}>
              <td>{decision.decision_name}</td>
              <td>{decision.result}</td>
              <td>{new Date(decision.created_at).toLocaleString()}</td>
              <td>
                <button
                  className="button details-button"
                  onClick={() => viewDecisionDetails(decision.id)}
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DecisionList;
