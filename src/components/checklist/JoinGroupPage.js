import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api.js'
import '../../App.css'

const JoinGroupPage = () => {
  const { groupId } = useParams();
  const [groupDetails, setGroupDetails] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

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

  const handleAcceptInvitation = async () => {
    try {
      await api.post(`/join-group/${groupId}`);
      alert('You have successfully joined the decision group');
      navigate(`/questionnaire/${groupDetails.decision_id}`);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to join the decision group');
    }
  };

  if (loading) return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh'
    }}>
      <div style={{
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite'
      }}></div>
    </div>
  );

  if (error) return (
    <div style={{
      maxWidth: '800px',
      margin: '1rem auto',
      padding: '1rem',
      backgroundColor: '#f8d7da',
      color: '#721c24',
      borderRadius: '8px',
      textAlign: 'center'
    }}>
      {error}
    </div>
  );

  return (
    <div className="join-group-page" style={{
      maxWidth: '800px',
      margin: '1rem auto',
      padding: '1rem',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
    }}>
      <h2 style={{
        color: '#333',
        textAlign: 'center',
        marginBottom: '1.5rem',
        borderBottom: '1px solid #eee',
        paddingBottom: '0.5rem'
      }}>Join Decision Group</h2>

      {groupDetails ? (
        <>
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '1rem',
            borderRadius: '6px',
            marginBottom: '1.5rem',
            display: 'grid',
            gridTemplateColumns: 'max-content 1fr',
            gap: '1rem 0.5rem',
            alignItems: 'baseline',
            textAlign: 'left'
          }}>
            <strong style={{ color: '#555' }}>Group Name:</strong>
            <span style={{ color: '#333' }}>{groupDetails.group_name}</span>

            <strong style={{ color: '#555' }}>Decision Name:</strong>
            <span style={{ color: '#333' }}>{groupDetails.decision_name}</span>

            <strong style={{ color: '#555', alignSelf: 'start' }}>Decision Description:</strong>
            <div style={{ color: '#666', lineHeight: '1.5' }}>{groupDetails.description}</div>

            <strong style={{ color: '#555' }}>Invited By:</strong>
            <span style={{ color: '#333' }}>{groupDetails.inviter_username}</span>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button
              onClick={handleAcceptInvitation}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'background-color 0.3s',
                fontWeight: '500'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
            >
              Accept Invitation
            </button>
          </div>
        </>
      ) : (
        <p style={{ color: '#dc3545', textAlign: 'center' }}>Unable to load group details.</p>
      )}

      {errorMessage && (
        <p style={{
          color: '#dc3545',
          backgroundColor: '#f8d7da',
          padding: '0.75rem',
          borderRadius: '4px',
          border: '1px solid #f5c6cb',
          textAlign: 'center',
          marginTop: '1.5rem'
        }}>
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default JoinGroupPage;