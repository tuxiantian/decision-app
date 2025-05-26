import { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../../config';
import api from '../api';
import QuoteContent from './QuoteContent';
import './InspirationClub.css';

export default function InspirationClub() {
    const [currentPage, setCurrentPage] = useState(0);
    const [activeCard, setActiveCard] = useState(null);
    const [reflections, setReflections] = useState({});
    const [inspirations, setInspirations] = useState([]);

    const [showTimeline, setShowTimeline] = useState(false);
    // 在组件顶部新增状态
    const [hoveredImage, setHoveredImage] = useState(null);

    // 修改时间轴状态，存储当前展示的启发ID
    const [timelineInspirationId, setTimelineInspirationId] = useState(null);
    const cardsPerPage = 2; // 每页显示2张卡片
    const [totalPages, setTotalPages] = useState(1);
    const [isRandomMode, setIsRandomMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 新增获取随机启发内容的函数
    const fetchRandomInspirations = async () => {
        try {
            setLoading(true);
            setIsRandomMode(true); // 进入随机模式
            const response = await api.get(`${API_BASE_URL}/api/inspirations/random`);
            const data = await response.data;
            setInspirations(data.inspirations);
            setTotalPages(1); // 随机模式下不显示分页
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 获取启发内容
    const fetchInspirations = async (page) => {
        try {
            setLoading(true);
            const response = await api.get(`${API_BASE_URL}/api/inspirations?page=${page}&per_page=${cardsPerPage}`);
            const data = await response.data;
            setInspirations(data.inspirations);
            setTotalPages(data.pages);
            setCurrentPage(page);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 获取感想内容
    // 获取感想内容并存储为 {inspiration_id: reflectionsArray} 的映射
    const fetchReflections = async (inspirationId) => {
        try {
            const response = await api.get(`/api/inspirations/${inspirationId}/reflections`);
            const { reflections, inspiration_id } = response.data;

            // 直接构建 {inspiration_id: reflections数组} 的映射
            setReflections(prev => ({
                ...prev,
                [inspiration_id]: reflections // 存储完整的感想数组
            }));

            return reflections; // 可选：返回原始数据
        } catch (err) {
            console.error('获取感想失败:', err);
            setError(err.response?.data?.error || err.message);
            throw err;
        }
    };

    // 保存感想
    const handleSaveReflection = async (id, text) => {
        try {
            const response = await api(`${API_BASE_URL}/api/reflections`, {
                method: 'POST',
                data: {
                    content: text,
                    inspiration_id: id
                }
            });
            setActiveCard(null);
            fetchReflections(id); // 刷新感想列表
        } catch (err) {
            setError(err.message);
        }
    };

    // 初始化加载数据
    useEffect(() => {
        fetchInspirations(1);
    }, []);

    // 加载当前页的感想
    useEffect(() => {
        if (inspirations.length > 0) {
            inspirations.forEach(insp => {
                fetchReflections(insp.id);
            });
        }
    }, [inspirations]);
    // 在组件中添加
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setHoveredImage(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // 生成时间轴数据
    const getTimelineData = (inspirationId) => {
        if (!inspirationId || !reflections[inspirationId]) return [];
        
        const inspiration = inspirations.find(item => item.id === inspirationId);
        
        return reflections[inspirationId]
            .map(reflection => ({
                id: reflection.id,
                text: reflection.content,
                date: new Date(reflection.updated_at).toLocaleString(),
                content: inspiration?.content,
                type: inspiration?.type
            }))
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    };

    if (loading && currentPage === 1) return <div className="loading">加载中...</div>;
    if (error) return <div className="error">错误: {error}</div>;

    return (
        <div className="inspiration-club">
            <h2>启发俱乐部 ✨</h2>
            {/* 图片预览层 */}
            {hoveredImage && (
                <div className="image-preview-overlay" onClick={() => setHoveredImage(null)}>
                    <div className="image-preview-container">
                        <img src={hoveredImage} alt="预览大图" />
                        <div className="image-preview-tooltip">点击任意位置关闭</div>
                    </div>
                </div>
            )}
            <div className="card-container">
                {inspirations.map(card => (
                    <div key={card.id} className={`card ${activeCard === card.id ? 'flipped' : ''}`}>
                        <div className="card-front">


                            {/* 卡片容器部分修改图片渲染 */}
                            {card.type === 'image' ? (
                                <div
                                    className="image-container"
                                    onClick={() => setHoveredImage(card.content)}
                                >
                                    <img src={card.content} alt="启发图片" />
                                </div>
                            ) : (
                                <QuoteContent content={card.content} />
                            )}
                            <div className="card-buttons">
                                <button className="write-btn" onClick={() => setActiveCard(card.id)}>
                                    ✏️ 写感想
                                </button>
                                {reflections[card.id] && reflections[card.id].length > 0 && (
                                    <button className="view-btn" onClick={() => {setTimelineInspirationId(card.id);setShowTimeline(true);}}>
                                        📅 查看感想
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="card-back">
                            <textarea
                                placeholder="写下你的启发或感想..."
                            />
                            <div className="inspiration-button-group">
                                <button className="cancel-btn" onClick={() => setActiveCard(null)}>
                                    取消
                                </button>
                                <button className="save-btn" onClick={() => handleSaveReflection(card.id, reflections[card.id] || '')}>
                                    保存
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pagination">
                {isRandomMode ? (
                    <>
                        <button
                            className="random-btn"
                            onClick={fetchRandomInspirations}
                        >
                            🔄 随机换一批
                        </button>
                        <button
                            className="back-btn"
                            onClick={() => {
                                setIsRandomMode(false);
                                fetchInspirations(1);
                            }}
                        >
                            ↩ 返回常规浏览
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            disabled={currentPage === 1}
                            onClick={() => fetchInspirations(currentPage - 1)}
                        >
                            ◀ 上一批
                        </button>
                        <span>第 {currentPage} 页 / 共 {totalPages} 页</span>
                        <button
                            disabled={currentPage >= totalPages}
                            onClick={() => fetchInspirations(currentPage + 1)}
                        >
                            下一批 ▶
                        </button>
                        <button
                            className="random-btn"
                            onClick={fetchRandomInspirations}
                        >
                            🔄 随机看看
                        </button>
                    </>
                )}
            </div>

            {showTimeline && (
                <div className="timeline-modal">
                    <div className="modal-content">
                        <h3>我的启发记录 ⏳</h3>
                        <button className="close-btn" onClick={() => setShowTimeline(false)}>×</button>
                        <div className="timeline">
                            {getTimelineData(timelineInspirationId).map(item => (
                                <div key={item.id} className="timeline-item">
                                    <div className="timeline-date">{item.date}</div>
                                    <div className="timeline-content">

                                        <p className="reflection">{item.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}