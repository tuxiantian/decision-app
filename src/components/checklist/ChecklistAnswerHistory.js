import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config.js';
import api from '../api.js'
import '../../App.css'


const ChecklistAnswerHistory = () => {
  const [tab, setTab] = useState('my'); // 'my' or 'invited'
  const [myDecisions, setMyDecisions] = useState([]);
  const [invitedDecisions, setInvitedDecisions] = useState([]);
  const [checklistDecisions, setChecklistDecisions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState(null);
  const pageSize = 5;
  const navigate = useNavigate();

  const fetchMyDecisions = async (page) => {
    try {
      const response = await api.get(`${API_BASE_URL}/checklist_answers`, {
        params: {
          page: page,
          page_size: pageSize
        }
      });

      if (response.data) {
        const { checklistDecisions, total_pages } = response.data;
        setMyDecisions(checklistDecisions);
        setTotalPages(total_pages);
      }
    } catch (error) {
      console.error('Error fetching checklist decisions', error);
    }
  };

  const fetchInvitedDecisions = async (page) => {
    try {
      const response = await api.get(`/invited_checklist_decisions`, {
        params: {
          page: page,
          page_size: pageSize
        }
      });
      if (response.data) {
        setInvitedDecisions(response.data.invitedChecklistDecisions);
        setTotalPages(response.data.total_pages);
      }
    } catch (error) {
      console.error('Error fetching invited checklist decisions', error);
    }
  };

  useEffect(() => {
    if (tab === 'my') {
      fetchMyDecisions(currentPage);
    } else {
      fetchInvitedDecisions(currentPage);
    }
  }, [tab, currentPage]);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setCurrentPage(1);
  };

  const handleViewDetails = (decisionId, isMy) => {
    if (isMy)
      navigate(`/checklist_answers/details/${decisionId}`);
    else
      navigate(`/invited_checklist_answers/details/${decisionId}`);
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
      await fetchMyDecisions(currentPage);
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

  const renderMyDecisionItem = (decision) => (
    <li key={decision.decision_id} style={{ borderBottom: '1px solid #ccc', padding: '10px 0', marginBottom: '10px' }}>
      <div><strong>Decision Name:</strong> {decision.decision_name}</div>
      <div><strong>Version:</strong> {decision.version} <strong>Created At:</strong> {new Date(decision.created_at).toLocaleString()}</div>
      <div><strong>Final Decision:</strong> {decision.final_decision}</div>
      <button onClick={() => handleViewDetails(decision.decision_id,true)} style={{ marginRight: '10px' }} className='green-button'>查看</button>
      <button onClick={() => openConfirmModal(decision)} style={{ marginRight: '10px' }} className='red-button'>删除</button>
      <button onClick={() => navigate(`/checklist/${decision.decision_id}/review`)} className='green-button'>复盘</button>
    </li>
  );

  const renderInvitedDecisionItem = (decision) => (
    <li key={decision.decision_id} style={{ borderBottom: '1px solid #ccc', padding: '10px 0', marginBottom: '10px' }}>
      <div style={{ textAlign: 'left' }}>
        <div><strong>Decision Name:</strong> {decision.decision_name}</div>
        <div><strong>Description:</strong> {decision.description}</div>
        <div><strong>inviter username:</strong> {decision.owner_username}</div>
      </div>

      {/* Button container with centered alignment */}
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <button
          onClick={() => handleViewDetails(decision.decision_id,false)}
          style={{ marginRight: '10px' }}
          className='green-button'
        >
          查看
        </button>
      </div>
    </li>
  );

  return (
    <div className="checklist-answer-history" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2>Checklist Answer History</h2>
      {/* Tab System */}
      <div className="tab-container" style={{ marginBottom: '20px' }}>
        <button
          className={`tab-button ${tab === 'my' ? 'active' : ''}`}
          onClick={() => handleTabChange('my')}

        >
          My Decisions
        </button>
        <button
          className={`tab-button ${tab === 'invited' ? 'active' : ''}`}
          onClick={() => handleTabChange('invited')}

        >
          Invited Decisions
        </button>
      </div>

      <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
        {tab === 'my'
          ? myDecisions.map(renderMyDecisionItem)
          : invitedDecisions.map(renderInvitedDecisionItem)}
      </ul>
      <div style={{ display: 'flex', justifyContent: 'space-around', margin: '20px auto' }}>
        <button onClick={handlePrevPage} disabled={currentPage === 1} className='green-button'>Previous</button>
        <p style={{ margin: '0 10px', display: 'flex', alignItems: 'center' }}>Page {currentPage} of {totalPages}</p>
        <button onClick={handleNextPage} disabled={currentPage >= totalPages} className='green-button'>Next</button>
      </div>
      <nav style={{ margin: '20px auto' }}>
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