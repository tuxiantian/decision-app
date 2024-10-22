import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '@toast-ui/editor/dist/toastui-editor-viewer.css';
import { Viewer } from '@toast-ui/react-editor';
import { useParams, useNavigate } from 'react-router-dom';
import MarkdownViewer from './MarkdownViewer';
import { API_BASE_URL } from '../config'; 
import '../App.css';

const ArticleViewer = () => {
    const { id } = useParams();
    const navigate = useNavigate(); // 用于实现页面导航
    const [article, setArticle] = useState(null);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/articles/${id}`)
            .then(response => {
                setArticle(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the article!', error);
            });
    }, [id]);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // 平滑滚动到页面顶部
        });
    };

    if (!article) {
        return <p>Loading...</p>;
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2>{article.title}</h2>
            <p><strong>Author:</strong> {article.author} <strong>Reference Count:</strong> {article.reference_count} <strong>Tags:</strong> {article.tags} <strong>Updated At:</strong> {new Date(article.updated_at).toLocaleString()}</p>
            <p><strong>Keywords:</strong> {article.keywords}</p>
            {/* <Viewer initialValue={article.content}  plugins={[mathPlugin]}/> */}
            <MarkdownViewer markdownContent={article.content} />
            {/* 返回文章列表的按钮 */}
            <button onClick={() => navigate('/articles')} style={{ marginTop: '20px' }} className='green-button'>
                Back to Articles List
            </button>
            {/* 返回顶部的箭头按钮 */}
            <button onClick={scrollToTop} className="scroll-to-top-button">
                ↑
            </button>
        </div>
    );
};

export default ArticleViewer;
