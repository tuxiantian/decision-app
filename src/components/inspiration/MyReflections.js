import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import api from '../api';
import QuoteContent from './QuoteContent';
import './MyReflections.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
export default function MyReflections() {
    const [currentPage, setCurrentPage] = useState(1);
    const [cardState, setCardState] = useState({}); // {cardId: 'front'|'back'|'inspiration'}
    const [reflections, setReflections] = useState([]);
    const [allReflections, setAllReflections] = useState({}); // {inspirationId: [reflections]}
    const [showTimeline, setShowTimeline] = useState(null); // inspirationId or null
    const [hoveredImage, setHoveredImage] = useState(null);
    // 新增状态
    const [reflectionText, setReflectionText] = useState({});
    const [editingInspiration, setEditingInspiration] = useState(null);
    const [totalPages, setTotalPages] = useState(1);
    const [isRandomMode, setIsRandomMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [uploadedImages, setUploadedImages] = useState({}); // 存储每张卡片上传后的图片URL {cardId: url}
    const [isUploading, setIsUploading] = useState(false); // 上传状态
    const [reflectionMode, setReflectionMode] = useState({}); // 存储每张卡片的输入模式 {cardId: 'text' | 'image'}
    const [searchQuery, setSearchQuery] = useState('');

    // 获取我的感想（分页）
    const fetchMyReflections = async (page) => {
        try {
            setLoading(true);
            const response = await api.get(`${API_BASE_URL}/api/my-reflections?page=${page}&per_page=2&search=${searchQuery}`);
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
            let type = uploadedImages[reflectionId] ? 'image' : 'text';
            content = uploadedImages[reflectionId] ? uploadedImages[reflectionId] : content;
            const response = await api.put(`${API_BASE_URL}/api/reflections/${reflectionId}`, {
                content, type
            });
            let updated_at = response.data.updated_at;
            // 更新本地状态
            setReflections(prev => prev.map(ref =>
                ref.id === reflectionId ? { ...ref, content, type, updated_at } : ref
            ));
            setUploadedImages(prev => {
                const newState = { ...prev }; // 浅拷贝原对象
                delete newState[reflectionId]; // 删除指定键
                return newState; // 返回新对象
            });
        } catch (err) {
            setError(err.message);
        }
    };

    const handleImageUpload = async (e, cardId) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setIsUploading(true);
            // 2. 实际上传
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'reflection');

            const response = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // 3. 保存服务器返回的URL
            setUploadedImages(prev => ({ ...prev, [cardId]: response.data.url }));
        } catch (err) {
            setError('图片上传失败');
        } finally {
            setIsUploading(false);
        }
    };

    // 新增感想处理函数
    const handleCreateReflection = async (id) => {
        if (!editingInspiration || (!uploadedImages[id] && !reflectionText[id])) return;

        try {
            let content, type;
            if (!reflectionMode[id]) {
                alert('请选则文字感想或图片感想');
                return;
            }
            if (reflectionMode[id] === 'text') {
                content = reflectionText[id];
                type = 'text';
            } else {
                if (!uploadedImages[id]) {
                    alert('请先上传图片');
                    return;
                }
                content = uploadedImages[id];
                type = 'image';
            }
            setLoading(true);
            const response = await api.post(`${API_BASE_URL}/api/reflections`, {
                content: content,
                inspiration_id: editingInspiration.id,
                type: type
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
            setReflectionMode(prev => {
                const newState = { ...prev }; // 浅拷贝原对象
                delete newState[id]; // 删除指定键
                return newState; // 返回新对象
            });
            if (type === 'text') {
                setReflectionText(prev => {
                    const newState = { ...prev }; // 浅拷贝原对象
                    delete newState[id]; // 删除指定键
                    return newState; // 返回新对象
                });
            } else {
                setUploadedImages(prev => {
                    const newState = { ...prev }; // 浅拷贝原对象
                    delete newState[id]; // 删除指定键
                    return newState; // 返回新对象
                });
            }

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
            <span>我的感想 ✍️</span>
            <div className="search-container" style={{ position: 'relative', display: 'inline-block' }}>

                <input
                    style={{ width: '400px', paddingRight: '30px' }}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索感想内容..."
                    onKeyDown={(e) => e.key === 'Enter' && fetchMyReflections(1)}
                />
                {searchQuery && ( // 只有有内容时才显示清空图标
                    <FontAwesomeIcon
                        icon={faTimes}
                        className="clear-icon"
                        onClick={() => {
                            setSearchQuery(''); 
                        }}
                    />
                )}
            </div>
            <button onClick={() => fetchMyReflections(1)} className='green-button'>
                搜索
            </button>
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
                                {reflection.type === 'image' ? (
                                    <div
                                        className="image-container"
                                        onClick={() => setHoveredImage(reflection.content)}
                                    >
                                        <img src={reflection.content} alt="感想图片" />
                                    </div>
                                ) : (
                                    <QuoteContent content={reflection.content} />
                                )}
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
                            {/* 模式选择单选按钮 */}
                            <div className="reflection-mode-selector">
                                <label>
                                    <input
                                        type="radio"
                                        name={`mode-edit-${reflection.id}`}
                                        checked={reflection.type !== 'image'}
                                    />
                                    文字感想
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name={`mode-edit-${reflection.id}`}
                                        checked={reflection.type === 'image'}
                                    />
                                    图片感想
                                </label>
                            </div>

                            {/* 动态渲染输入区域 */}
                            {reflection.type === 'image' ? (
                                <div className="image-upload-container">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, reflection.id)}
                                        disabled={isUploading}
                                    />
                                    {reflection.content && (
                                        <div className="image-preview">
                                            {/* 优先显示新上传的图片，避免编辑时更换图片时预览不到新的图片 */}
                                            <img src={uploadedImages[reflection.id] || reflection.content} alt="预览" />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <textarea
                                    autoFocus
                                    value={uploadedImages[reflection.id] || reflection.content}
                                    onChange={(e) => setReflections(prev =>
                                        prev.map(ref =>
                                            ref.id === reflection.id
                                                ? { ...ref, content: e.target.value }
                                                : ref
                                        )
                                    )}
                                />
                            )}

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
                            {/* 模式选择单选按钮 */}
                            <div className="reflection-mode-selector">
                                <label>
                                    <input
                                        type="radio"
                                        name={`mode-${reflection.id}`}
                                        checked
                                        onChange={() => setReflectionMode(prev => ({ ...prev, [reflection.id]: 'text' }))}
                                    />
                                    文字感想
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name={`mode-${reflection.id}`}                                   
                                        onChange={() => setReflectionMode(prev => ({ ...prev, [reflection.id]: 'image' }))}
                                    />
                                    图片感想
                                </label>
                            </div>

                            {reflectionMode[reflection.id] === 'image' ? (
                                <div className="image-upload-container">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, reflection.id)}
                                        disabled={isUploading}
                                    />
                                    {uploadedImages[reflection.id] && (
                                        <div className="image-preview">
                                            <img src={uploadedImages[reflection.id]} alt="预览" />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <textarea
                                    autoFocus
                                    value={reflectionText[reflection.id] || ''}
                                    onChange={(e) => setReflectionText(prev => ({
                                        ...prev,
                                        [reflection.id]: e.target.value
                                    }))}
                                    placeholder="写下你的感想..."
                                />
                            )}

                            <div className="button-group">
                                <button
                                    className="cancel-btn"
                                    onClick={() => flipCard(reflection.id, 'inspiration')}
                                >
                                    取消
                                </button>
                                <button
                                    className="save-btn"
                                    onClick={() => handleCreateReflection(reflection.id)}
                                    disabled={(reflectionMode[reflection.id] === 'text' && !reflectionText[reflection.id]) ||
                                        (reflectionMode[reflection.id] === 'image' && !uploadedImages[reflection.id]) ||
                                        isUploading}
                                >
                                    {isUploading ? '保存中...' : '保存'}
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
                            onClick={() => fetchRandomReflections}
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
                                        {reflection.type === 'image' ? (
                                            <div className="image-reflection">
                                                <img
                                                    src={reflection.content}
                                                    alt="感想图片"
                                                    onClick={() => setHoveredImage(reflection.content)} // 点击可放大预览
                                                />
                                            </div>
                                        ) : (
                                            <p className="text-reflection">{reflection.content}</p>
                                        )}
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