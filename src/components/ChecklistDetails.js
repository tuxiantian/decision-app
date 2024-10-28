import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from 'react-modal';
import '@toast-ui/editor/dist/toastui-editor-viewer.css';
import { Viewer } from '@toast-ui/react-editor';
import { API_BASE_URL } from '../config';
import api from './api.js'

const ChecklistDetails = () => {
  const { decisionId } = useParams();
  const [decisionDetails, setDecisionDetails] = useState(null);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const navigate = useNavigate();

  // 配置决策组的状态
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupId, setGroupId] = useState(null);
  const [inviteLink, setInviteLink] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

  useEffect(() => {
    const fetchDecisionDetails = async () => {
      try {
        const response = await api.get(`${API_BASE_URL}/checklist_answers/1/details/${decisionId}`);
        setDecisionDetails(response.data);
        // 如果存在决策组信息，设置相关变量
        if (response.data.has_group && response.data.group) {
          setGroupId(response.data.group.id);
          setGroupName(response.data.group.name);
        }
      } catch (error) {
        console.error('Error fetching decision details', error);
      }
    };

    fetchDecisionDetails();
  }, [decisionId]);

  const [reviews, setReviews] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const fetchReviews = () => {
    api.get(`${API_BASE_URL}/reviews/${decisionId}`)
      .then(response => setReviews(response.data))
      .catch(error => console.error('Error fetching reviews:', error));
  };

  const openReviewModal = () => {
    setIsReviewModalOpen(true);
    fetchReviews();
  };

  const handleViewArticle = async (articleId) => {
    try {
      const response = await api.get(`${API_BASE_URL}/articles/${articleId}`);
      setSelectedArticle(response.data);
      setShowArticleModal(true);
    } catch (error) {
      console.error('Error fetching article details', error);
    }
  };

  const openGroupModal = () => {
    setIsGroupModalOpen(true);
  };

  const closeGroupModal = () => {
    setIsGroupModalOpen(false);
    setGroupName('');
  };

  const handleGroupSubmit = async () => {
    try {
      const response = await api.post(`${API_BASE_URL}/decision_groups`, {
        name: groupName,
        owner_id: 1,  // 这里用实际用户 ID 替换
        checklist_decision_id: decisionId,
      });
      setGroupId(response.data.group_id);
      setDecisionDetails((prev) => ({
        ...prev,
        has_group: true,  // 更新本地状态
        group: {
          id: response.data.group_id,
          name: groupName
        }
      }));
      closeGroupModal();
    } catch (error) {
      console.error('Error creating decision group', error);
    }
  };

  // 生成邀请链接
  const generateInviteLink = () => {
    if (groupId) {
      const link = `${window.location.origin}/join-group/${groupId}`;
      setInviteLink(link);
      setIsInviteModalOpen(true);
    } else {
      console.error('Group ID not found');
    }
  };

  // 获取决策组成员
  const fetchGroupMembers = async () => {
    try {
      const response = await api.get(`/decision_groups/${groupId}/members`);
      setGroupMembers(response.data.members);
      setIsMembersModalOpen(true);
    } catch (error) {
      console.error('Error fetching group members', error);
    }
  };

  if (!decisionDetails) return <div>Loading...</div>;

  return (
    <div className="checklist-details" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2>{decisionDetails.decision_name} - Details</h2>
      <div><strong>Final Decision:</strong> {decisionDetails.final_decision}</div>

      <h3>Answers:</h3>
      <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
        {decisionDetails.answers.map((answer, index) => (
          <li key={index} style={{ borderBottom: '1px solid #ccc', padding: '10px 0', marginBottom: '10px' }}>
            <div style={{ textAlign: 'left' }}><strong>Q:</strong> <strong>{answer.question}</strong></div>
            <div style={{ textAlign: 'left' }}><strong>A:</strong> {answer.answer}</div>
            {answer.referenced_articles && answer.referenced_articles.length > 0 && (
              <div style={{ textAlign: 'left', marginTop: '10px' }}>
                <strong>Referenced Articles:</strong>
                <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                  {answer.referenced_articles.map((article) => (
                    <li key={article.id}>
                      <button
                        onClick={() => handleViewArticle(article.id)}
                        style={{ textDecoration: 'underline', color: 'blue', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        {article.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
      
      
      {/* 显示决策组信息 */}
      {decisionDetails.has_group && (
        <div>
          <h3>Decision Group: {decisionDetails.group.name}</h3>
          <p>Members Count: {decisionDetails.group.members_count}</p>
        </div>
      )}

      {/* 配置决策组按钮，仅在没有组的情况下显示 */}
      {!decisionDetails.has_group && (
        <button onClick={openGroupModal} className='green-button'>Configure Decision Group</button>
      )}

      {/* 配置决策组弹窗 */}
      <Modal
        isOpen={isGroupModalOpen}
        onRequestClose={closeGroupModal}
        contentLabel="Configure Decision Group"
        style={{
          content: {
            top: '10%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, 0)',
            width: '50%',
          },
        }}
      >
        <h2>Configure Decision Group</h2>
        <div className="form-group">
          <label>Group Name</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
        </div>
        <button onClick={handleGroupSubmit} className='green-button'>Submit</button>
        <button onClick={closeGroupModal} className='gray-button' style={{ marginLeft: '10px' }}>Cancel</button>
      </Modal>

      {/* 邀请链接和查看成员按钮 */}
      {groupId && (
        <>
          <button onClick={generateInviteLink} className="green-button">Generate Invite Link</button>
          <button onClick={fetchGroupMembers} className="green-button">View Group Members</button>
        </>
      )}

      {/* 邀请链接弹窗 */}
      <Modal
        isOpen={isInviteModalOpen}
        onRequestClose={() => setIsInviteModalOpen(false)}
        contentLabel="Invite Link"
      >
        <h2>Invite Link</h2>
        <p>Copy this link to invite others to the decision group:</p>
        <input
          type="text"
          value={inviteLink}
          readOnly
          style={{ width: '100%', padding: '8px' }}
        />
        <button onClick={() => navigator.clipboard.writeText(inviteLink)} className="green-button">Copy Link</button>
        <button onClick={() => setIsInviteModalOpen(false)} className="gray-button" style={{ marginLeft: '10px' }}>Close</button>
      </Modal>

      {/* 查看成员弹窗 */}
      <Modal
        isOpen={isMembersModalOpen}
        onRequestClose={() => setIsMembersModalOpen(false)}
        contentLabel="Group Members"
      >
        <h2>Group Members</h2>
        <ul>
          {groupMembers.map((member) => (
            <li key={member.id}>{member.username}</li>
          ))}
        </ul>
        <button onClick={() => setIsMembersModalOpen(false)} className="gray-button">Close</button>
      </Modal>

      <button onClick={openReviewModal} className='green-button'>View Reviews</button>
      <Modal
        isOpen={isReviewModalOpen}
        onRequestClose={() => setIsReviewModalOpen(false)}
        contentLabel="Review Modal"
        style={{
          content: {
            top: '10%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, 0)',
            width: '60%',
            maxHeight: '80%',
            overflow: 'auto'
          }
        }}
      >
        <h2>Reviews</h2>
        {reviews.length === 0 ? (
          <p>No reviews available.</p>
        ) : (
          reviews.map((review, index) => (
            <div key={index}>
              <p>{review.content}</p>
              <div style={{ textAlign: 'left', marginTop: '10px' }}>
                <strong>Referenced Articles:</strong>
                <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                  {review.referenced_articles.map((article) => (
                    <li key={article.id}>
                      <a href={`http://localhost:3000/view-article/${article.id}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'blue' }}>
                        {article.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <hr />
            </div>
          ))
        )}
        <button onClick={() => setIsReviewModalOpen(false)} className='green-button'>Close</button>
      </Modal>
      <nav style={{ marginTop: '20px' }}>
        <Link to="/history" style={{ padding: '10px 20px' }}>Back to Checklist Answer History</Link>
      </nav>

      {/* Article Modal */}
      <Modal
        isOpen={showArticleModal}
        onRequestClose={() => setShowArticleModal(false)}
        contentLabel="Article Details"
        style={{
          content: {
            maxWidth: '800px', // 设置弹窗的最大宽度
            width: '80%',
            height: '80vh', // 使用视口高度
            margin: '20px auto', // 在弹窗上下方添加适当的边距，避免紧贴顶部
            padding: '20px',
            overflowY: 'auto', // 使弹窗内容超出时出现滚动条
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center', // 使弹窗垂直居中
            justifyContent: 'center' // 使弹窗水平居中
          }
        }}
      >
        {selectedArticle ? (
          <div>
            <h2 style={{ marginTop: '0' }}>{selectedArticle.title}</h2>
            <p><strong>Author:</strong> {selectedArticle.author}</p>
            <p><strong>Tags:</strong> {selectedArticle.tags}</p>
            <p><strong>Keywords:</strong> {selectedArticle.keywords}</p>
            <Viewer initialValue={selectedArticle.content} />
            <button onClick={() => setShowArticleModal(false)} style={{ marginTop: '20px' }} className='green-button'>Close</button>
          </div>
        ) : (
          <div>Loading article details...</div>
        )}
      </Modal>

    </div>
  );
};

export default ChecklistDetails;
