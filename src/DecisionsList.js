import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const DecisionsList = () => {
  const [decisions, setDecisions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const fetchDecisions = async (page) => {
    try {
      const response = await axios.get(`http://localhost:5000/decisions?page=${page}&per_page=10&sort=desc`);
      setDecisions(response.data.decisions);
      setCurrentPage(response.data.current_page);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Error fetching decisions', error);
    }
  };

  useEffect(() => {
    fetchDecisions(currentPage);
  }, [currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const viewDetails = (decisionId) => {
    navigate(`/decision/${decisionId}`);
  };

  const viewReport = (decisionId) => {
    navigate(`/decision-report/${decisionId}`);
  };

  const deleteDecision = async (decisionId) => {
    if (window.confirm("确定要删除这个决策吗？")) {
      try {
        await axios.delete(`http://localhost:5000/delete_decision/${decisionId}`);
        alert('Decision deleted successfully!');
        fetchDecisions(currentPage);
      } catch (error) {
        console.error('Error deleting decision', error);
      }
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <nav style={{ marginBottom: '20px' }}>
      <Link className="nav-link" to="/">Home</Link>
        <Link  className="nav-link" to="/question-flow">QuestionFlow</Link>
        <Link  className="nav-link" to="/ahp">AHPAnalysis List</Link>
      </nav>
      <h2>Decisions List (Page {currentPage} of {totalPages})</h2>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <table style={{ textAlign: 'left' }}>
          <thead>
            <tr>
              <th>Decision Name</th>
              <th>Decision Result</th>
              <th>User ID</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {decisions.map((decision) => (
              <tr key={decision.id}>
                <td>{decision.decision_name}</td>
                <td>{decision.final_decision}</td>
                <td>{decision.user_id}</td>
                <td>{new Date(decision.created_at).toLocaleString()}</td>
                <td>
                  <button onClick={() => viewDetails(decision.id)}>详情</button>
                  <button onClick={() => viewReport(decision.id)} style={{ marginLeft: '10px' }}>报告</button>
                  <button onClick={() => deleteDecision(decision.id)} style={{ marginLeft: '10px' }}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: '20px' }}>
        <button onClick={handlePreviousPage} disabled={currentPage === 1}>Previous</button>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
      </div>
    </div>
  );
};

export default DecisionsList;