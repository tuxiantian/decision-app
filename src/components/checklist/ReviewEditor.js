import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import { API_BASE_URL } from '../../config';
import api from '../api.js'

const ReviewEditor = () => {
  const { decisionId } = useParams();
  const [content, setContent] = useState('');
  const [articles, setArticles] = useState([]);
  const [referencedArticles, setReferencedArticles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const fetchArticles = (search = '', page = 1) => {
    api.get(`${API_BASE_URL}/articles?search=${search}&page=${page}&page_size=10`)
      .then(response => {
        setArticles(response.data.articles);
        setTotalPages(response.data.total_pages);
        setCurrentPage(response.data.current_page);
      })
      .catch(error => console.error('Error fetching articles:', error));
  };

  useEffect(() => {
    // 初始获取文章数据
    fetchArticles();
  }, []);

  const handleSaveReview = () => {
    if (!content) {
      alert('Content is required');
      return;
    }

    const reviewData = {
      decision_id: decisionId,
      content,
      referenced_articles: referencedArticles.map(article => article.id) // 只保存文章的 id
    };

    api.post(`${API_BASE_URL}/reviews`, reviewData)
      .then(() => {
        alert('Review saved successfully');
        navigate(`/checklist/${decisionId}`);
      })
      .catch(error => console.error('Error saving review:', error));
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    fetchArticles(); // 打开弹窗时获取数据
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSearch = () => {
    fetchArticles(searchTerm, 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      fetchArticles(searchTerm, currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      fetchArticles(searchTerm, currentPage + 1);
    }
  };

  const handleSelectArticle = (article) => {
    if (referencedArticles.some((refArticle) => refArticle.id === article.id)) {
      // 如果已经引用，取消引用
      setReferencedArticles(referencedArticles.filter((refArticle) => refArticle.id !== article.id));
    } else {
      // 添加引用
      setReferencedArticles([...referencedArticles, article]);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2>Review Decision</h2>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        rows="10"
        style={{ width: '100%', marginBottom: '10px' }}
        placeholder="Enter your review here"
      />

      <button onClick={handleOpenModal} style={{ marginBottom: '10px' }} className='green-button'>Reference Cognitive Bias Articles</button>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        contentLabel="Select Articles"
        style={{
          content: {
            maxWidth: '600px',
            margin: '0 auto',
            height: '70vh',
            overflow: 'auto',
            top: '10%',
          }
        }}
      >
        <h2>Select Articles to Reference</h2>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search articles"
            style={{ width: '80%', marginRight: '10px' }}
          />
          <button onClick={handleSearch} className='green-button'>Search</button>
        </div>

        {articles.map(article => (
          <div key={article.id} style={{ marginBottom: '10px' }}>
            <input
              type="checkbox"
              checked={referencedArticles.some((refArticle) => refArticle.id === article.id)}
              onChange={() => handleSelectArticle(article)}
            />
            <label style={{ marginLeft: '5px' }}>{article.title}</label>
          </div>
        ))}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <button onClick={handlePreviousPage} disabled={currentPage <= 1} className='green-button'>Previous Page</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={handleNextPage} disabled={currentPage >= totalPages} className='green-button'>Next Page</button>
        </div>

        <button onClick={handleCloseModal} style={{ marginTop: '20px' }} className='green-button'>Done</button>
      </Modal>

      <div>
        <h4>Referenced Articles:</h4>
        {referencedArticles.length === 0 ? (
          <p>No articles referenced.</p>
        ) : (
          referencedArticles.map(article => (
            <div key={article.id}>
              <p>{article.title}</p>
            </div>
          ))
        )}
      </div>
      <div style={{ margin: '20px auto' }}>
        <button onClick={handleSaveReview} className='green-button'>Save Review</button>
        <button onClick={() => navigate('/history')} className='green-button'>
          Back to Checklist Answer History
        </button>
      </div>

    </div>
  );
};

export default ReviewEditor;
