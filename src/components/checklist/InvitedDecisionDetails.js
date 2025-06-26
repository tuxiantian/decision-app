import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import '@toast-ui/editor/dist/toastui-editor-viewer.css';
import { Viewer } from '@toast-ui/react-editor';
import api from '../api.js';
import './DecisionDetails.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faTimes } from '@fortawesome/free-solid-svg-icons';

const InvitedDecisionDetails = () => {
  const { decisionId } = useParams();
  const [decisionDetails, setDecisionDetails] = useState(null);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [expandedQuestions, setExpandedQuestions] = useState({ 0: true });
  const [allExpanded, setAllExpanded] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDecisionDetails = async () => {
      try {
        const response = await api.get(`/invited_checklist_answers/details/${decisionId}`);
        const r = response.data;
        r.answers = filterAndFormatAnswers(r.answers);
        setDecisionDetails(r);
      } catch (error) {
        console.error('Error fetching invited decision details', error);
      }
    };

    fetchDecisionDetails();
  }, [decisionId]);

  const filterAndFormatAnswers = (answers) => {
    return answers
      .filter(answer => {
        // Filter out questions without answers
        if (!answer.response) return false;

        // For choice questions, ensure answer value is valid
        if (answer.type === 'choice') {
          const selectedOption = answer.response.answer;
          return selectedOption !== undefined && selectedOption !== null && selectedOption !== '';
        }

        return true;
      })
      .map(answer => {
        // Format the answer for display
        if (answer.type === 'choice') {
          const selectedOptionIndex = parseInt(answer.response.answer);
          const selectedOption = answer.options[selectedOptionIndex];
          return {
            ...answer,
            formattedAnswer: selectedOption || 'Unknown option',
            isChoice: true
          };
        }
        return {
          ...answer,
          formattedAnswer: answer.response.answer,
          isChoice: false
        };
      });
  };

  const handleViewArticle = async (articleId, isPlatformArticle = false) => {
    try {
      const endpoint = isPlatformArticle
        ? `/platform_articles/${articleId}`
        : `/articles/${articleId}`;
      const response = await api.get(endpoint);
      setSelectedArticle(response.data);
      setShowArticleModal(true);
    } catch (error) {
      console.error('Error fetching article details', error);
    }
  };

  const toggleQuestion = (questionIndex) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [questionIndex]: !prev[questionIndex],
    }));
  };

  const toggleAllQuestions = () => {
    if (allExpanded) {
      // Collapse all questions
      const collapsedState = {};
      decisionDetails.answers.forEach((_, index) => {
        collapsedState[index] = false;
      });
      setExpandedQuestions(collapsedState);
    } else {
      // Expand all questions
      const expandedState = {};
      decisionDetails.answers.forEach((_, index) => {
        expandedState[index] = true;
      });
      setExpandedQuestions(expandedState);
    }
    setAllExpanded(!allExpanded);
  };

  if (!decisionDetails) return <div>Loading...</div>;

  return (
    <div className="checklist-details" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2>{decisionDetails.decision_name}</h2>
      <div style={{ textAlign: 'left' }}>
        <strong>Decision description:</strong> {decisionDetails.description}
      </div>
      <div style={{ textAlign: 'left', marginBottom: '20px' }}>
        <strong>Owner:</strong> {decisionDetails.owner_username}
      </div>
     
      <div className="answers-header">
        <h3>Your Answers:</h3>
        <button
          onClick={toggleAllQuestions}
          className="toggle-button"
          style={{
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <FontAwesomeIcon icon={allExpanded ? faChevronUp : faChevronDown} />
          {allExpanded ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      {decisionDetails.answers.map((answerData, index) => (
        <div key={index} className="question-section">
          <div className="question-header">
            <strong>Q:</strong> {answerData.question}
            <button
              onClick={() => toggleQuestion(index)}
              className="toggle-button"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '5px',
                fontSize: '1.2em',
                color: '#007bff'
              }}
            >
              {expandedQuestions[index] ? (
                <FontAwesomeIcon icon={faChevronUp} />
              ) : (
                <FontAwesomeIcon icon={faChevronDown} />
              )}
            </button>
          </div>

          {expandedQuestions[index] && (
            <div className="answer-item">
              <p>{answerData.isChoice ? answerData.formattedAnswer : answerData.response.answer}</p>

              {/* Show referenced articles if they exist */}
              {(answerData.response.referenced_articles.length > 0 || 
               answerData.response.referenced_platform_articles.length > 0) && (
                <div className="referenced-articles">
                  <strong>Referenced Articles:</strong>
                  <ul>
                    {/* User's own articles */}
                    {answerData.response.referenced_articles.map((article) => (
                      <li key={article.id}>
                        <span
                          className="article-link"
                          onClick={() => handleViewArticle(article.id, false)}
                        >
                          {article.title}
                        </span>
                      </li>
                    ))}

                    {/* Platform recommended articles */}
                    {answerData.response.referenced_platform_articles.map((article) => (
                      <li key={article.id}>
                        <span
                          className="article-link"
                          onClick={() => handleViewArticle(article.id, true)}
                        >
                          {article.title} (Platform)
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      <button 
        onClick={() => navigate('/history')} 
        className="green-button" 
        style={{ margin: '20px 10px' }}
      >
        Back to Checklist Answer History
      </button>

      {/* Article Modal */}
      <Modal
        isOpen={showArticleModal}
        onRequestClose={() => setShowArticleModal(false)}
        contentLabel="Article Details"
        style={{
          content: {
            maxWidth: '800px',
            width: '80%',
            height: '88vh',
            margin: '10px auto',
            padding: '20px',
            overflowY: 'auto',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
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
            <button 
              onClick={() => setShowArticleModal(false)} 
              style={{ marginTop: '20px' }} 
              className='green-button'
            >
              Close
            </button>
          </div>
        ) : (
          <div>Loading article details...</div>
        )}
      </Modal>
    </div>
  );
};

export default InvitedDecisionDetails;