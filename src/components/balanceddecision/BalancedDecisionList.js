import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import api from '../api';
import './BalancedDecisionList.css';

function DecisionList() {
  const [decisions, setDecisions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const navigate = useNavigate();

  // Fetch all decisions
  const fetchDecisions = async (page) => {
    try {
      const response = await api.get(`${API_BASE_URL}/api/get_decisions`, {
        params: {
          page: page,
          page_size: pageSize
        },
      });
      setDecisions(response.data.decisions_list);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error('Error fetching decisions:', error);
    }
  };

  useEffect(() => {

    fetchDecisions(currentPage);
  }, [currentPage]);

  const viewDecisionDetails = (id) => {
    navigate(`/balanced-decisions/${id}`);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1);
    }
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
      <div className="pagination-container">
        <button 
          onClick={handlePrevPage} 
          disabled={currentPage === 1} 
          className="green-button"
        >
          Previous
        </button>
        <span className="page-indicator">
          Page {currentPage} of {totalPages}
        </span>
        <button 
          onClick={handleNextPage} 
          disabled={currentPage >= totalPages} 
          className="green-button"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default DecisionList;
