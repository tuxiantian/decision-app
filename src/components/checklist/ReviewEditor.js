import React, { useState, useRef, useEffect } from 'react';
import '@toast-ui/editor/dist/toastui-editor.css';
import { Editor } from '@toast-ui/react-editor';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import api from '../api.js';
import '//at.alicdn.com/t/c/font_4955755_wck13l63429.js';

// 最大引用数量
const MAX_REFERENCE_COUNT = 10;

const ReviewEditor = () => {
  const { decisionId } = useParams();
  const [content, setContent] = useState('');
  const [articles, setArticles] = useState([]);
  const [platformArticles, setPlatformArticles] = useState([]);
  const [referencedArticles, setReferencedArticles] = useState([]);
  const [referencedPlatformArticles, setReferencedPlatformArticles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tab, setTab] = useState('my');
  const navigate = useNavigate();
  const editorRef = useRef();

  const fetchArticles = (search = '', page = 1) => {
    api.get(`/articles?search=${search}&page=${page}&page_size=10`)
      .then(response => {
        setArticles(response.data.articles);
        setTotalPages(response.data.total_pages);
        setCurrentPage(response.data.current_page);
      })
      .catch(error => console.error('Error fetching articles:', error));
  };

  // 获取平台推荐文章
  const fetchPlatformArticles = (search = '', page = 1) => {
    api.get(`/platform_articles?search=${search}&page=${page}&page_size=10`)
      .then(response => {
        setPlatformArticles(response.data.articles);
        setTotalPages(response.data.total_pages);
        setCurrentPage(response.data.current_page);
      })
      .catch(error => console.error('Error fetching platform articles:', error));
  };

  useEffect(() => {
    // 初始获取文章数据
    fetchArticles();
    editorRef.current.getInstance().setMarkdown('');
  }, []);

  const handleSaveReview = () => {
    if (!content) {
      alert('Content is required');
      return;
    }

    const reviewData = {
      decision_id: decisionId,
      content,
      referenced_articles: referencedArticles.map(article => article.id), // 只保存文章的 id
      referenced_platform_articles: referencedPlatformArticles.map(article => article.id)
    };

    api.post(`/reviews`, reviewData)
      .then(() => {
        alert('Review saved successfully');
        navigate(`/history`);
      })
      .catch(error => console.error('Error saving review:', error));
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    if (tab === 'my') {
      fetchArticles();
    } else {
      fetchPlatformArticles();
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };


  const handleSearch = () => {
    setCurrentPage(1);
    if (tab === 'my') {
      fetchArticles(searchTerm, 1);
    } else {
      fetchPlatformArticles(searchTerm, 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      if (tab === 'my') {
        fetchArticles(searchTerm, newPage);
      } else {
        fetchPlatformArticles(searchTerm, newPage);
      }
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      if (tab === 'my') {
        fetchArticles(searchTerm, newPage);
      } else {
        fetchPlatformArticles(searchTerm, newPage);
      }
    }
  };

  // 切换标签页
  const handleTabChange = (newTab) => {
    setTab(newTab);
    setCurrentPage(1);
    if (newTab === 'my') {
      fetchArticles();
    } else {
      fetchPlatformArticles();
    }
  };

  // 移除引用的文章
  const handleRemoveArticle = (articleId, isPlatformArticle = false) => {
    if (isPlatformArticle) {
      setReferencedPlatformArticles(referencedPlatformArticles.filter(article => article.id !== articleId));
    } else {
      setReferencedArticles(referencedArticles.filter(article => article.id !== articleId));
    }
  };

  const handleSelectArticle = (article) => {
    if (tab === 'my') {
      if (referencedArticles.some((refArticle) => refArticle.id === article.id)) {
        // 取消引用我的文章
        setReferencedArticles(referencedArticles.filter((refArticle) => refArticle.id !== article.id));
      } else if (referencedArticles.length < MAX_REFERENCE_COUNT) {
        setReferencedArticles([...referencedArticles, article]);
      } 
      // 如果超限
      else {
        alert(`最多只能引用 ${MAX_REFERENCE_COUNT} 篇我的文章！`);
      }
    } else {
      if (referencedPlatformArticles.some((refArticle) => refArticle.id === article.id)) {
        // 取消引用平台文章
        setReferencedPlatformArticles(referencedPlatformArticles.filter((refArticle) => refArticle.id !== article.id));
      } else if (referencedPlatformArticles.length < MAX_REFERENCE_COUNT) {
        setReferencedPlatformArticles([...referencedPlatformArticles, article]);
      } 
      else {
        alert(`最多只能引用 ${MAX_REFERENCE_COUNT} 篇平台推荐文章！`);
      }
    }
  };

  const handleImageUpload = async (blob, callback) => {
    // 创建 FormData 对象，将 blob 作为参数
    const formData = new FormData();
    formData.append('file', blob);
    formData.append('type', 'review');
    try {
      // 向 Flask 后端发送 POST 请求，将图片上传到 MinIO
      const response = await api.post(`/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // 使用回调函数，将生成的 URL 设置到编辑器中
      const imageUrl = response.data.url;
      callback(imageUrl, 'Uploaded Image');
    } catch (error) {
      console.error('There was an error uploading the image:', error);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2>Review Decision</h2>
      <Editor
        initialValue={content}
        previewStyle="vertical"
        height="600px"
        initialEditType="markdown"
        useCommandShortcut={true}
        ref={editorRef}
        onChange={() => setContent(editorRef.current.getInstance().getMarkdown())}
        hooks={{
          addImageBlobHook: (blob, callback) => handleImageUpload(blob, callback),
        }}
      />
      <button onClick={handleOpenModal} style={{ margin: '10px auto' }} className='green-button'>Reference Cognitive Bias Articles</button>

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
        <div className="tab-container">
          <button
            className={`tab-button ${tab === 'my' ? 'active' : ''}`}
            onClick={() => handleTabChange('my')}
          >
            我的
          </button>
          <button
            className={`tab-button ${tab === 'recommended' ? 'active' : ''}`}
            onClick={() => handleTabChange('recommended')}
          >
            推荐
          </button>
        </div>
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

        {(tab === 'my' ? articles : platformArticles).map(article => (
          <div key={article.id} style={{ marginBottom: '10px' }}>
            <input
              type="checkbox"
              checked={
                tab === 'my'
                  ? referencedArticles.some((refArticle) => refArticle.id === article.id)
                  : referencedPlatformArticles.some((refArticle) => refArticle.id === article.id)
              }
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

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h4>Referenced Articles:</h4>
        {referencedArticles.length === 0 && referencedPlatformArticles.length === 0 ? (
          <p>No articles referenced.</p>
        ) : (
          <>
            {referencedArticles.length > 0 && (
              <div>
                <h5>My Articles:</h5>
                {referencedArticles.map(article => (
                  <div key={article.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                    <span style={{ marginRight: '8px' }}>{article.title}</span>
                    <button
                      onClick={() => handleRemoveArticle(article.id, false)}
                      className="icon-button"
                    >
                      <svg className="icon" aria-hidden="true">
                        <use xlinkHref="#icon-shanchu"></use>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            {referencedPlatformArticles.length > 0 && (
              <div>
                <h5>Platform Recommended Articles:</h5>
                {referencedPlatformArticles.map(article => (
                  <div key={article.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                    <span style={{ marginRight: '8px' }}>{article.title}</span>
                    <button
                      onClick={() => handleRemoveArticle(article.id, true)}
                      className="icon-button"
                    >
                      <svg className="icon" aria-hidden="true">
                        <use xlinkHref="#icon-shanchu"></use>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <div className='button-container'>
        <button onClick={handleSaveReview} className='green-button'>Save Review</button>
        <button onClick={() => navigate('/history')} className='green-button'>
          Back to Checklist Answer History
        </button>
      </div>

    </div>
  );
};

export default ReviewEditor;
