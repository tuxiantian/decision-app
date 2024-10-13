import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from 'react-modal';
import '@toast-ui/editor/dist/toastui-editor-viewer.css';
import { Viewer } from '@toast-ui/react-editor';

const ChecklistDetails = () => {
  const { decisionId } = useParams();
  const [decisionDetails, setDecisionDetails] = useState(null);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDecisionDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/checklist_answers/1/details/${decisionId}`);
        setDecisionDetails(response.data);
      } catch (error) {
        console.error('Error fetching decision details', error);
      }
    };

    fetchDecisionDetails();
  }, [decisionId]);

  const [reviews, setReviews] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const fetchReviews = () => {
    axios.get(`http://localhost:5000/reviews/${decisionId}`)
      .then(response => setReviews(response.data))
      .catch(error => console.error('Error fetching reviews:', error));
  };

  const openReviewModal = () => {
    setIsReviewModalOpen(true);
    fetchReviews();
  };

  const handleViewArticle = async (articleId) => {
    try {
      const response = await axios.get(`http://localhost:5000/articles/${articleId}`);
      setSelectedArticle(response.data);
      setShowArticleModal(true);
    } catch (error) {
      console.error('Error fetching article details', error);
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
      <button onClick={openReviewModal}>View Reviews</button>
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
        <button onClick={() => setIsReviewModalOpen(false)}>Close</button>
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
            <button onClick={() => setShowArticleModal(false)} style={{ marginTop: '20px' }}>Close</button>
          </div>
        ) : (
          <div>Loading article details...</div>
        )}
      </Modal>
    </div>
  );
};

export default ChecklistDetails;
