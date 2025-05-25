import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import api from '../api';
import './InspirationClub.css';

const inspirationData = [
    { id: 1, type: 'text', content: "真正的发现之旅不在于寻找新大陆，而在于用新的眼光看待事物。" },
    { id: 2, type: 'image', content: "http://192.168.10.105:64253/api/v1/download-shared-object/aHR0cDovLzEyNy4wLjAuMTo5MDAwL2RlY2lzaW9uLWFpZC1idWNrZXQvJUU0JUJBJUJBJUU5JTk5JTg1JUU0JUJBJUE0JUU1JUJFJTgwJUU3JTlBJTg0JUU1JTg3JTg2JUU1JTg4JTk5LmpwZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUtLVUxPSU1KOFozNlVKT1YyVzRDJTJGMjAyNTA1MjUlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwNTI1VDAyNDgzMFomWC1BbXotRXhwaXJlcz00MzIwMCZYLUFtei1TZWN1cml0eS1Ub2tlbj1leUpoYkdjaU9pSklVelV4TWlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKaFkyTmxjM05MWlhraU9pSkxTMVZNVDBsTlNqaGFNelpWU2s5V01sYzBReUlzSW1WNGNDSTZNVGMwT0RFNE5ETTFNaXdpY0dGeVpXNTBJam9pYldsdWFXOWhaRzFwYmlKOS5sT0NPaEJmYWJvQ3NGOUlvOXgyb2RtZnJZYkVIRGRsUzFCZUZMLXMwTlNJYUlWcW11dDF2d3dacEFzLXJuTkRSNnJFeEJMaE9PS2gtRk5yeE1kenpFZyZYLUFtei1TaWduZWRIZWFkZXJzPWhvc3QmdmVyc2lvbklkPW51bGwmWC1BbXotU2lnbmF0dXJlPThiM2QzZTFkMDc3NmUzOWJhMmZjZDBjZWNkMmFmNWRkMTQzZWM1M2YwMjNlYjdhY2Y5Y2M1NzJhMjUwOTEzMjg" },
    { id: 3, type: 'text', content: "当你改变看待世界的方式时，你所看到的世界也会改变。" },
    { id: 4, type: 'image', content: "http://192.168.10.105:64253/api/v1/download-shared-object/aHR0cDovLzEyNy4wLjAuMTo5MDAwL2RlY2lzaW9uLWFpZC1idWNrZXQvJUU1JUI4JTgyJUU1JTlDJUJBJUU1JTkxJUE4JUU2JTlDJTlGLmpwZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUtLVUxPSU1KOFozNlVKT1YyVzRDJTJGMjAyNTA1MjUlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwNTI1VDAyNDkzOFomWC1BbXotRXhwaXJlcz00MzE5OCZYLUFtei1TZWN1cml0eS1Ub2tlbj1leUpoYkdjaU9pSklVelV4TWlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKaFkyTmxjM05MWlhraU9pSkxTMVZNVDBsTlNqaGFNelpWU2s5V01sYzBReUlzSW1WNGNDSTZNVGMwT0RFNE5ETTFNaXdpY0dGeVpXNTBJam9pYldsdWFXOWhaRzFwYmlKOS5sT0NPaEJmYWJvQ3NGOUlvOXgyb2RtZnJZYkVIRGRsUzFCZUZMLXMwTlNJYUlWcW11dDF2d3dacEFzLXJuTkRSNnJFeEJMaE9PS2gtRk5yeE1kenpFZyZYLUFtei1TaWduZWRIZWFkZXJzPWhvc3QmdmVyc2lvbklkPW51bGwmWC1BbXotU2lnbmF0dXJlPTI0OGVmMWFjNDRjMjMzNzFjMmRlZmY1MmRiNWIxODgwODg5ZjRhYzFmOWJmMWRjYjE0ODU2YzUxYzY2M2QxNjM" },
    { id: 5, type: 'text', content: "创新就是把不同的事物连接起来。" }
];

export default function InspirationClub() {
    const [currentPage, setCurrentPage] = useState(0);
    const [activeCard, setActiveCard] = useState(null);
    const [reflections, setReflections] = useState({});
    const [inspirations, setInspirations] = useState([]);

    const [showTimeline, setShowTimeline] = useState(false);
    // 在组件顶部新增状态
    const [hoveredImage, setHoveredImage] = useState(null);

    const cardsPerPage = 2; // 每页显示2张卡片
    const [totalPages, setTotalPages] = useState(1);
    const currentCards = inspirationData.slice(
        currentPage * cardsPerPage,
        (currentPage + 1) * cardsPerPage
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
    const fetchReflections = async (inspirationId) => {
        try {
            const response = await api.get(`${API_BASE_URL}/api/inspirations/${inspirationId}/reflections`);
            const data = await response.data;
            // 转换为本地状态格式 {id: reflection}
            const reflectionsMap = data.reflections.reduce((acc, curr) => {
                acc[curr.inspiration_id] = curr.content;
                return acc;
            }, {});
            setReflections(reflectionsMap);
        } catch (err) {
            setError(err.message);
        }
    };

    // 保存感想
    const handleSaveReflection = async (id, text) => {
        try {
            const method = reflections[id] ? 'PUT' : 'POST';
            const url = reflections[id] 
                ? `${API_BASE_URL}/api/reflections/${id}`
                : `${API_BASE_URL}/api/reflections`;
            
            const response = await api(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: text,
                    inspiration_id: id
                })
            });
            
            // 更新本地状态
            setReflections({ ...reflections, [id]: text });
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
    const timelineData = Object.entries(reflections)
        .map(([id, text]) => {
            const inspiration = inspirations.find(item => item.id === Number(id));
            return {
                id: Number(id),
                text,
                date: new Date().toLocaleString(), // 实际应从API获取
                content: inspiration?.content,
                type: inspiration?.type
            };
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));

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
                                <p className="quote">{card.content}</p>
                            )}
                            <div className="card-buttons">
                                <button className="write-btn" onClick={() => setActiveCard(card.id)}>
                                    ✏️ 写感想
                                </button>
                                {reflections[card.id] && (
                                    <button className="view-btn" onClick={() => setShowTimeline(true)}>
                                        📅 查看感想
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="card-back">
                            <textarea
                                placeholder="写下你的启发或感想..."
                                value={reflections[card.id] || ''}
                                onChange={(e) => setReflections({ ...reflections, [card.id]: e.target.value })}
                            />
                            <div className="button-group">
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
                <button disabled={currentPage === 1} onClick={() => fetchInspirations(currentPage - 1)}>
                    ◀ 上一批
                </button>
                <span>第 {currentPage + 1} 页 / 共 {totalPages} 页</span>
                <button disabled={currentPage >= totalPages} onClick={() => fetchInspirations(currentPage + 1)}>
                    下一批 ▶
                </button>
            </div>

            {showTimeline && (
                <div className="timeline-modal">
                    <div className="modal-content">
                        <h3>我的启发记录 ⏳</h3>
                        <button className="close-btn" onClick={() => setShowTimeline(false)}>×</button>
                        <div className="timeline">
                            {timelineData.map(item => (
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