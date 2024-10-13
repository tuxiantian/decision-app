import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ArticleList = () => {
    const [articles, setArticles] = useState([]);
    const [filteredArticles, setFilteredArticles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10; // 页大小为10

    const navigate = useNavigate();

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = () => {
        axios.get('http://localhost:5000/articles')
            .then(response => {
                setArticles(response.data);
                setFilteredArticles(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the articles!', error);
            });
    };

    const handleDelete = (id) => {
        axios.delete(`http://localhost:5000/articles/${id}`)
            .then(() => {
                const updatedArticles = articles.filter(article => article.id !== id);
                setArticles(updatedArticles);
                setFilteredArticles(updatedArticles);
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

    const handleView = (id) => {
        navigate(`/view-article/${id}`);
    };

    // 搜索框的 onChange 事件处理函数
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
    };

    // 点击“搜索”按钮时的处理函数
    const handleSearchButton = () => {
        axios.get(`http://localhost:5000/articles`, {
            params: {
                search: searchTerm
            }
        })
        .then(response => {
            setFilteredArticles(response.data);
            setCurrentPage(1); // 搜索时重置为第一页
        })
        .catch(error => {
            console.error('There was an error fetching the search results!', error);
        });
    };

    const currentPageArticles = filteredArticles.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleNextPage = () => {
        if (currentPage < Math.ceil(filteredArticles.length / pageSize)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2>Articles List</h2>
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    placeholder="Search by title, tags, or keywords"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    style={{ flex: 1, padding: '10px' }}
                />
                <button onClick={handleSearchButton} style={{ padding: '10px' }}>Search</button>
                <button onClick={handleAdd} style={{ marginLeft: '10px', padding: '10px' }}>Add New Article</button>
            </div>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
                {currentPageArticles.map(article => (
                    <li key={article.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: '1px solid #ccc',
                        padding: '10px',
                        marginBottom: '10px'
                    }}>
                        <div style={{ flex: 3 }}>
                            {/* 第一行：标题和作者 */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: '20px',
                                marginBottom: '5px'
                            }}>
                                <h3 style={{ margin: 0 }}>{article.title}</h3>
                                <p style={{ margin: 0 }}>Author: {article.author}</p>
                            </div>
                            {/* 第二行：标签、关键词和更新时间 */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: '20px'
                            }}>
                                <p style={{ margin: 0 }}>Tags: {article.tags}</p>
                                <p style={{ margin: 0 }}>Keywords: {article.keywords}</p>
                                <p style={{ margin: 0 }}>Updated At: {new Date(article.updated_at).toLocaleString()}</p>
                            </div>
                        </div>
                        <div style={{ flex: 1, textAlign: 'right' }}>
                            <button onClick={() => handleView(article.id)} style={{ marginRight: '10px' }}>View</button>
                            <button onClick={() => handleEdit(article.id)} style={{ marginRight: '10px' }}>Edit</button>
                            <button onClick={() => handleDelete(article.id)}>Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
                <p>Page {currentPage} of {Math.ceil(filteredArticles.length / pageSize)}</p>
                <button onClick={handleNextPage} disabled={currentPage === Math.ceil(filteredArticles.length / pageSize)}>Next</button>
            </div>
        </div>
    );
};

export default ArticleList;
