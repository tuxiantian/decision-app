import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '@toast-ui/editor/dist/toastui-editor-viewer.css';
import { Viewer } from '@toast-ui/react-editor';
import { useParams, useNavigate } from 'react-router-dom';

const ArticleViewer = () => {
    const { id } = useParams();
    const navigate = useNavigate(); // 用于实现页面导航
    const [article, setArticle] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:5000/articles/${id}`)
            .then(response => {
                setArticle(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the article!', error);
            });
    }, [id]);

    if (!article) {
        return <p>Loading...</p>;
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2>{article.title}</h2>
            <p><strong>Author:</strong> {article.author}</p>
            <p><strong>Tags:</strong> {article.tags}</p>
            <p><strong>Keywords:</strong> {article.keywords}</p>
            <p><strong>Updated At:</strong> {new Date(article.updated_at).toLocaleString()}</p>
            <Viewer initialValue={article.content} />
            {/* 返回文章列表的按钮 */}
            <button onClick={() => navigate('/articles')} style={{ marginTop: '20px' }}>
                Back to Articles List
            </button>
        </div>
    );
};

export default ArticleViewer;
