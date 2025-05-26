import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import api from '../api';
import QuoteContent from './QuoteContent';
import './MyReflections.css';

export default function MyReflections() {
    const [currentPage, setCurrentPage] = useState(1);
    const [cardState, setCardState] = useState({}); // {cardId: 'front'|'back'|'inspiration'}
    const [reflections, setReflections] = useState([]);
    const [allReflections, setAllReflections] = useState({}); // {inspirationId: [reflections]}
    const [showTimeline, setShowTimeline] = useState(null); // inspirationId or null
    const [hoveredImage, setHoveredImage] = useState(null);
    // 新增状态
    const [newReflectionContent, setNewReflectionContent] = useState('');
    const [editingInspiration, setEditingInspiration] = useState(null);
    const [totalPages, setTotalPages] = useState(1);
    const [isRandomMode, setIsRandomMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 获取我的感想（分页）
    const fetchMyReflections = async (page) => {
        try {
            setLoading(true);
            const response = await api.get(`${API_BASE_URL}/api/my-reflections?page=${page}&per_page=2`);
            const data = response.data;

            setReflections(data.reflections);
            setTotalPages(data.pages);
            setCurrentPage(page);

            // 初始化卡片状态
            const initialState = {};
            data.reflections.forEach(ref => {
                initialState[ref.id] = 'front'; // 默认显示感想面
            });
            setCardState(initialState);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 获取随机感想
    const fetchRandomReflections = async () => {
        try {
            setLoading(true);
            setIsRandomMode(true);
            const response = await api.get(`${API_BASE_URL}/api/my-reflections/random`);
            const data = response.data;

            setReflections(data.reflections);
            setTotalPages(1);

            const initialState = {};
            data.reflections.forEach(ref => {
                initialState[ref.id] = 'front';
            });
            setCardState(initialState);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 获取某个启发下的所有感想（用于时间轴）
    const fetchAllReflections = async (inspirationId) => {
        try {
            const response = await api.get(`${API_BASE_URL}/api/inspirations/${inspirationId}/reflections`);
            setAllReflections(prev => ({
                ...prev,
                [inspirationId]: response.data.reflections
            }));
        } catch (err) {
            setError(err.message);
        }
    };

    // 更新感想
    const handleUpdateReflection = async (reflectionId, content) => {
        try {
            await api.put(`${API_BASE_URL}/api/reflections/${reflectionId}`, {
                content
            });

            // 更新本地状态
            setReflections(prev => prev.map(ref =>
                ref.id === reflectionId ? { ...ref, content } : ref
            ));
        } catch (err) {
            setError(err.message);
        }
    };

    // 新增感想处理函数
    const handleCreateReflection = async () => {
        if (!editingInspiration || !newReflectionContent.trim()) return;

        try {
            setLoading(true);
            const response = await api.post(`${API_BASE_URL}/api/reflections`, {
                content: newReflectionContent,
                inspiration_id: editingInspiration.id
            });

        // 更新本地状态（先移除旧的，再添加新的）
        setReflections(prev => {
            // 过滤掉与当前编辑的启发相关的旧感想
            const filtered = prev.filter(ref => 
                ref.inspiration.id !== editingInspiration.id
            );
            
            // 添加新感想
            return [
                {
                    ...response.data,
                    inspiration: editingInspiration
                },
                ...filtered
            ];
        });

            // 重置状态
            setNewReflectionContent('');
            flipCard(response.data.id, 'front');

        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    // 初始化加载数据
    useEffect(() => {
        fetchMyReflections(1);
    }, []);

    // 处理卡片翻转
    const flipCard = (reflectionId, side) => {
        setCardState(prev => ({
            ...prev,
            [reflectionId]: side
        }));

        // 切换到新增面时设置当前启发
        if (side === 'new') {
            const reflection = reflections.find(r => r.id === reflectionId);
            setEditingInspiration(reflection?.inspiration);
            setNewReflectionContent('');
        }
    };

    // 处理显示时间轴
    const handleShowTimeline = (inspirationId) => {
        fetchAllReflections(inspirationId);
        setShowTimeline(inspirationId);
    };

    if (loading && currentPage === 1) return <div className="loading">加载中...</div>;
    if (error) return <div className="error">错误: {error}</div>;

    return (
        <div className="my-reflections">
            <h2>我的感想 ✍️</h2>

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
                {reflections.map(reflection => (
                    <div
                        key={reflection.id}
                        className={`card ${cardState[reflection.id] ? 'flipped-' + cardState[reflection.id] : ''}`}
                    >
                        {/* 感想面 (默认) */}
                        <div className="card-front">
                            <div className="reflection-content">
                                <p>{reflection.content}</p>
                                <div className="reflection-date">
                                    最后更新: {new Date(reflection.updated_at).toLocaleString()}
                                </div>
                            </div>
                            <div className="card-buttons">
                                <button
                                    className="write-btn"
                                    onClick={() => flipCard(reflection.id, 'back')}
                                >
                                    ✏️ 编辑
                                </button>
                                <button
                                    className="view-btn"
                                    onClick={() => handleShowTimeline(reflection.inspiration.id)}
                                >
                                    📅 查看历史
                                </button>
                                <button
                                    className="flip-btn"
                                    onClick={() => flipCard(reflection.id, 'inspiration')}
                                >
                                    🔄 查看启发
                                </button>
                            </div>
                        </div>

                        {/* 编辑面 */}
                        <div className="card-back">
                            <textarea
                                value={reflection.content}
                                onChange={(e) => setReflections(prev =>
                                    prev.map(ref =>
                                        ref.id === reflection.id
                                            ? { ...ref, content: e.target.value }
                                            : ref
                                    )
                                )}
                            />
                            <div className="button-group">
                                <button
                                    className="cancel-btn"
                                    onClick={() => flipCard(reflection.id, 'front')}
                                >
                                    取消
                                </button>
                                <button
                                    className="save-btn"
                                    onClick={() => {
                                        handleUpdateReflection(reflection.id, reflection.content);
                                        flipCard(reflection.id, 'front');
                                    }}
                                >
                                    保存
                                </button>
                            </div>
                        </div>

                        {/* 启发面 */}
                        <div className="card-inspiration">
                            {reflection.inspiration.type === 'image' ? (
                                <div
                                    className="image-container"
                                    onClick={() => setHoveredImage(reflection.inspiration.content)}
                                >
                                    <img
                                        src={reflection.inspiration.content}
                                        alt="启发图片"
                                    />
                                </div>
                            ) : (
                                <QuoteContent content={reflection.inspiration.content} />
                            )}
                            <div className="card-buttons">
                                <button
                                    className="new-btn"
                                    onClick={() => flipCard(reflection.id, 'new')}
                                >
                                    ✍️ 新增感想
                                </button>
                                <button
                                    className="flip-btn"
                                    onClick={() => flipCard(reflection.id, 'front')}
                                >
                                    ↩ 返回感想
                                </button>
                            </div>
                        </div>

                        <div className="card-new">
                            <textarea
                                placeholder="写下你的新感想..."
                                value={newReflectionContent}
                                onChange={(e) => setNewReflectionContent(e.target.value)}
                                autoFocus
                            />
                            <div className="button-group">
                                <button
                                    className="cancel-btn"
                                    onClick={() => flipCard(reflection.id, 'inspiration')}
                                >
                                    取消
                                </button>
                                <button
                                    className="save-btn"
                                    onClick={handleCreateReflection}
                                    disabled={!newReflectionContent.trim()}
                                >
                                    保存
                                </button>
                            </div>
                        </div>


                    </div>
                ))}
            </div>

            {/* 分页控制 */}
            <div className="pagination">
                {isRandomMode ? (
                    <>
                        <button
                            className="random-btn"
                            onClick={fetchRandomReflections}
                        >
                            🔄 随机换一批
                        </button>
                        <button
                            className="back-btn"
                            onClick={() => {
                                setIsRandomMode(false);
                                fetchMyReflections(1);
                            }}
                        >
                            ↩ 返回常规浏览
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            disabled={currentPage === 1}
                            onClick={() => fetchMyReflections(currentPage - 1)}
                        >
                            ◀ 上一批
                        </button>
                        <span>第 {currentPage} 页 / 共 {totalPages} 页</span>
                        <button
                            disabled={currentPage >= totalPages}
                            onClick={() => fetchMyReflections(currentPage + 1)}
                        >
                            下一批 ▶
                        </button>
                        <button
                            className="random-btn"
                            onClick={fetchRandomReflections}
                        >
                            🔄 随机看看
                        </button>
                    </>
                )}
            </div>

            {/* 时间轴弹窗 */}
            {showTimeline && (
                <div className="timeline-modal">
                    <div className="modal-content">
                        <h3>感想历史记录 ⏳</h3>
                        <button
                            className="close-btn"
                            onClick={() => setShowTimeline(null)}
                        >
                            ×
                        </button>
                        <div className="timeline">
                            {allReflections[showTimeline]?.map(reflection => (
                                <div key={reflection.id} className="timeline-item">
                                    <div className="timeline-date">
                                        {new Date(reflection.created_at).toLocaleString()}
                                    </div>
                                    <div className="timeline-content">
                                        <p className="reflection">{reflection.content}</p>
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