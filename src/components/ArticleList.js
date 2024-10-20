import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';  // 需要安装 react-icons 包
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config'; 
import '../App.css'

const ArticleList = () => {
    const [articles, setArticles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedTag, setSelectedTag] = useState('');
    const pageSize = 10;

    const navigate = useNavigate();

    useEffect(() => {
        fetchArticles(currentPage);
    }, [currentPage]);

    const fetchArticles = (page) => {
        axios.get(`${API_BASE_URL}/articles`, {
            params: {
                page: page,
                page_size: pageSize,
                search: searchTerm,
                tag: selectedTag,
            },
        })
            .then(response => {
                if (response.data) {
                    const { articles, total_pages } = response.data;
                    setArticles(articles);
                    setTotalPages(total_pages);
                }
            })
            .catch(error => {
                console.error('There was an error fetching the articles!', error);
            });
    };

    const handleDelete = (id) => {
        axios.delete(`${API_BASE_URL}/articles/${id}`)
            .then(() => {
                const updatedArticles = articles.filter(article => article.id !== id);
                setArticles(updatedArticles);
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

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
    };

    const handleSearchButton = () => {
        setCurrentPage(1);
        fetchArticles(1);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setCurrentPage(1);
        fetchArticles(1);
    };

    // 添加键盘事件的处理函数，回车键触发搜索
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearchButton();
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

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2>Articles List</h2>
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <input
                        type="text"
                        placeholder="Search by title, tags, or keywords"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onKeyDown={handleKeyDown}  // 监听键盘事件
                        style={{ width: '100%', padding: '10px', paddingRight: '40px' }}
                    />
                    {searchTerm && (
                        <FaTimes
                            onClick={handleClearSearch}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                cursor: 'pointer',
                                color: '#999'
                            }}
                        />
                    )}
                </div>
                <select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)} style={{ padding: '10px' }}>
                    <option value="">Select Tag</option>
                    <option value="ThinkingModel">Thinking Model</option>
                    <option value="CognitiveBias">Cognitive Bias</option>
                </select>
                <button onClick={handleSearchButton} style={{ padding: '10px' }} className='green-button'>Search</button>
                <button onClick={handleAdd} style={{ marginLeft: '10px', padding: '10px' }} className='green-button'>Add New Article</button>
            </div>
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
                        <div style={{ flex: 3 }}>
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
                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: '20px'
                            }}>
                                <p style={{ margin: 0 }}>Tags: {article.tags}</p>
                                <p style={{ margin: 0 }}>Updated At: {new Date(article.updated_at).toLocaleString()}</p>
                            </div>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: '20px'
                            }}>
                                <p style={{ margin: 0 }}>Keywords: {article.keywords}</p>
                            </div>
                        </div>
                        <div style={{ flex: 1, textAlign: 'right' }}>
                            <button onClick={() => handleView(article.id)} style={{ marginRight: '10px' }} className='green-button'>View</button>
                            <button onClick={() => handleEdit(article.id)} style={{ marginRight: '10px' }} className='green-button'>Edit</button>
                            <button onClick={() => handleDelete(article.id)} className='green-button'>Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <button onClick={handlePrevPage} disabled={currentPage === 1} className='green-button'>Previous</button>
                <p>Page {currentPage} of {totalPages}</p>
                <button onClick={handleNextPage} disabled={currentPage >= totalPages} className='green-button'>Next</button>
            </div>
        </div>
    );
};

export default ArticleList;
