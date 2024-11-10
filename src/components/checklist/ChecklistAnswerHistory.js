import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config.js';
import api from '../api.js'
import '../../App.css'


const ChecklistAnswerHistory = () => {
  const [checklistDecisions, setChecklistDecisions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState(null);
  const pageSize = 5;
  const navigate = useNavigate();

  const fetchChecklistDecisions = async (page) => {
    try {
      const response = await api.get(`${API_BASE_URL}/checklist_answers`, {
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

  // 打开确认删除模态框
  const openConfirmModal = (decision) => {
    setSelectedDecision(decision);
    setIsModalOpen(true);
  };

  const closeConfirmModal = () => {
    setIsModalOpen(false);
    setSelectedDecision(null);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`${API_BASE_URL}/checklist_answers/${id}`);
      await fetchChecklistDecisions(currentPage);
      closeConfirmModal();
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

  // Modal Component defined within ChecklistAnswerHistory.js
  const Modal = ({ isOpen, onClose, onConfirm, decisionName }) => {
    const [inputValue, setInputValue] = useState("");

    const handleConfirm = () => {
      if (inputValue === decisionName) {
        onConfirm && onConfirm();  // 确保 onConfirm 存在并调用
      } else {
        alert("The entered name does not match.");
      }
    };

    if (!isOpen) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>Confirm Deletion</h3>
          <p>To confirm deletion, please enter the decision name: </p>
          <div><strong>{decisionName}</strong></div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter decision name"
          />
          <div className="modal-buttons">
            <button onClick={handleConfirm} className="confirm-button">Confirm</button>
            <button onClick={onClose} className="cancel-button">Cancel</button>
          </div>
        </div>
      </div>
    );
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
            <button onClick={() => openConfirmModal(decision)} style={{ marginRight: '10px' }} className='red-button'>Delete</button>
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
      {/* 模态框 */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeConfirmModal}
        onConfirm={selectedDecision ? () => handleDelete(selectedDecision.decision_id) : () => { }}  // 始终传递有效函数
        decisionName={selectedDecision ? selectedDecision.decision_name : ""}
      />
    </div>
  );
};

export default ChecklistAnswerHistory;