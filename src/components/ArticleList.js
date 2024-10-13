import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ArticleList = () => {
  const [articles, setArticles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = () => {
    axios.get('http://localhost:5000/articles')
      .then(response => {
        setArticles(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the articles!', error);
      });
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:5000/articles/${id}`)
      .then(() => {
        setArticles(articles.filter(article => article.id !== id));
      })
      .catch(error => {
        console.error('There was an error deleting the article!', error);
      });
  };

  const handleEdit = (id) => {
    navigate(`/edit-article/${id}`);
  };

  const handleAdd = () => {
    navigate('/add-article');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2>Articles List</h2>
      <button onClick={handleAdd}>Add New Article</button>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {articles.map(article => (
          <li key={article.id} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid #ccc',
            padding: '10px',
            marginBottom: '10px'
          }}>
            <div style={{
              flex: 3,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '20px' // 设置元素之间的间距
            }}>
              <h3 style={{ margin: 0 }}>{article.title}</h3>
              <p style={{ margin: 0 }}>Author: {article.author}</p>
              <p style={{ margin: 0 }}>Tags: {article.tags}</p>
              <p style={{ margin: 0 }}>Keywords: {article.keywords}</p>
            </div>
            <div style={{ flex: 1, textAlign: 'right' }}>
              <button onClick={() => handleEdit(article.id)} style={{ marginRight: '10px' }}>Edit</button>
              <button onClick={() => handleDelete(article.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ArticleList;
