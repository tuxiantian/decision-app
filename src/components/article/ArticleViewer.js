import React, { useEffect, useState } from 'react';
import '@toast-ui/editor/dist/toastui-editor-viewer.css';
import MarkdownViewer from './MarkdownViewer.js';
import './ArticleViewer.css';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api.js'


const ArticleViewer = () => {
    const { source,id } = useParams();
    const navigate = useNavigate(); // 用于实现页面导航
    const [article, setArticle] = useState(null);

    useEffect(() => {
        const url = source==='my' ? `/articles/${id}` : `/platform_articles/${id}`
        api.get(url)
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
            <p>
                {article.author && (
                    <>
                        <strong>Author: </strong>
                        {article.author}   
                        {" "}
                    </>
                )}
                <strong>Reference Count: </strong>
                {article.reference_count}
                {" "}
                <strong>Tags: </strong>
                {article.tags}
                {" "}
                <strong>Updated At: </strong>
                {new Date(article.updated_at).toLocaleString()}
            </p>
            <p><strong>Keywords:</strong> {article.keywords}</p>
            {/* <Viewer initialValue={article.content}  plugins={[mathPlugin]}/> */}
            <MarkdownViewer markdownContent={article.content} />
            {/* 返回文章列表的按钮 */}
            <button onClick={() => navigate('/articles')} style={{ margin: '20px auto' }} className='green-button'>
                Back to Articles List
            </button>
            {/* 返回顶部和返回文章列表的按钮 */}
            <div>
                {/* 返回文章列表的按钮 */}
                <button onClick={() => navigate('/articles')} className='floating-action-button go-to-list-button'>
                    📄
                </button>
                {/* 返回顶部的箭头按钮 */}
                <button onClick={scrollToTop} className="floating-action-button scroll-to-top-button">
                    ↑
                </button>
            </div>
        </div >
    );
};

export default ArticleViewer;
