import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from './api.js'
import '../App.css'

const JoinGroupPage = () => {
  const { groupId } = useParams();  // 获取链接中的 groupId 参数
  const [groupDetails, setGroupDetails] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);  // 用于显示失败信息
  const navigate = useNavigate();

  // 获取决策组详情
  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const response = await api.get(`/decision_groups/${groupId}/details`);
        setGroupDetails(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to load group details');
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [groupId]);

  // 接受邀请处理
  const handleAcceptInvitation = async () => {
    try {
      await api.post(`/join-group/${groupId}`);
      alert('You have successfully joined the decision group');
      navigate(`/questionnaire/${groupDetails.decision_id}`);  // 加入成功后重定向到仪表盘或其他页面
    } catch (error) {
      // 捕获错误信息并设置到 errorMessage 状态
      setErrorMessage(error.response?.data?.message || 'Failed to join the decision group');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="join-group-page" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2>Join Decision Group</h2>
      {groupDetails ? (
        <>
          <div style={{ marginBottom: '10px' }}><strong>Group Name:</strong> {groupDetails.group_name}</div>
          <div style={{ marginBottom: '10px' }}><strong>Decision Name:</strong> {groupDetails.decision_name}</div>
          <div style={{ marginBottom: '20px' }}><strong>Invited By:</strong> {groupDetails.inviter_username}</div>
          <button onClick={handleAcceptInvitation} className="green-button">Accept Invitation</button>
        </>
      ) : (
        <p>Unable to load group details.</p>
      )}

      {/* 显示错误信息 */}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

export default JoinGroupPage;
