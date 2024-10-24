import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const ChecklistAnswerHistory = () => {
  const [checklistDecisions, setChecklistDecisions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 5;
  const navigate = useNavigate();

  const fetchChecklistDecisions = async (page) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/checklist_answers/1`, {
        params: {
          page: page,
          page_size: pageSize
        }
      });

      if (response.data) {
        const { checklistDecisions, total_pages } = response.data;
        setChecklistDecisions(checklistDecisions);
        setTotalPages(total_pages);
      }
    } catch (error) {
      console.error('Error fetching checklist decisions', error);
    }
  };

  useEffect(() => {
    fetchChecklistDecisions(currentPage);
  }, [currentPage]);

  const handleViewDetails = (decisionId) => {
    navigate(`/checklist_answers/details/${decisionId}`);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/checklist_answers/${id}`);
      await fetchChecklistDecisions(currentPage);
    } catch (error) {
      console.error('Error deleting checklist decision', error);
    }
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
    <div className="checklist-answer-history" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2>Checklist Answer History</h2>
      <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
        {checklistDecisions.map((decision) => (
          <li key={decision.decision_id} style={{ borderBottom: '1px solid #ccc', padding: '10px 0', marginBottom: '10px' }}>
            <div><strong>Decision Name:</strong> {decision.decision_name}</div>
            <div><strong>Version:</strong> {decision.version} <strong>Created At:</strong> {new Date(decision.created_at).toLocaleString()}</div>
            <div><strong>Final Decision:</strong> {decision.final_decision}</div>
            <button onClick={() => handleViewDetails(decision.decision_id)} style={{ marginRight: '10px' }} className='green-button'>View Details</button>
            <button onClick={() => handleDelete(decision.decision_id)} style={{ marginRight: '10px' }} className='red-button'>Delete</button>
            <button onClick={() => navigate(`/checklist/${decision.decision_id}/review`)} className='green-button'>Add Review</button>

          </li>
        ))}
      </ul>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        <button onClick={handlePrevPage} disabled={currentPage === 1} className='green-button'>Previous</button>
        <p>Page {currentPage} of {totalPages}</p>
        <button onClick={handleNextPage} disabled={currentPage >= totalPages} className='green-button'>Next</button>
      </div>
      <nav style={{ marginTop: '20px' }}>
        <Link to="/checklists">Back to Checklists</Link>
      </nav>
    </div>
  );
};

export default ChecklistAnswerHistory;