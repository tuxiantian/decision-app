// components/ModelList.jsx - 修复工具提示
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ModelList.css';

const API_BASE_URL = 'http://localhost:5000/api';

const ModelList = () => {
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [modelToDelete, setModelToDelete] = useState(null);
    const [hoveredModel, setHoveredModel] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const pageSize = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        fetchModels(currentPage);
    }, [currentPage]);

    const fetchModels = async (page) => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/models`, {
                params: {
                    page: page,
                    page_size: pageSize
                }
            });
            console.log('Fetched models:', response.data);
            setModels(response.data.models);
            setTotalPages(response.data.total_pages);
            setError('');
        } catch (err) {
            console.error('Error fetching models:', err);
            setError('Failed to load models');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (model, e) => {
        e.stopPropagation();
        setModelToDelete(model);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!modelToDelete) return;

        try {
            await axios.delete(`${API_BASE_URL}/models/${modelToDelete.id}`);
            setModels(models.filter(m => m.id !== modelToDelete.id));
            setShowDeleteModal(false);
            setModelToDelete(null);
        } catch (err) {
            setError('Failed to delete model');
            setShowDeleteModal(false);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setModelToDelete(null);
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

    const handleViewDetail = (modelId) => {
        navigate(`/minimax-regret-decision/detail/${modelId}`);
    };

    const handleCreateNew = () => {
        navigate('/minimax-regret-decision');
    };

    const handleMouseEnter = (modelId, e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipPosition({
            x: rect.left + window.scrollX,
            y: rect.top + window.scrollY - 10 // 稍微向上偏移
        });
        setHoveredModel(modelId);
    };

    const handleMouseLeave = () => {
        setHoveredModel(null);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // 获取当前悬停模型的描述
    const getHoveredModelDescription = () => {
        const model = models.find(m => m.id === hoveredModel);
        return model?.description;
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>加载中...</p>
            </div>
        );
    }

    return (
        <div className="model-list-container">
            <div className="list-header">
                <h2>决策模型列表</h2>
                <button
                    className="btn btn-primary"
                    onClick={handleCreateNew}
                >
                    新建模型
                </button>
            </div>

            {error && (
                <div className="error-alert">
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="close-btn">×</button>
                </div>
            )}

            {models.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📊</div>
                    <h3>暂无决策模型</h3>
                    <p>点击"新建模型"按钮创建您的第一个决策模型</p>
                    <button
                        className="btn btn-primary"
                        onClick={handleCreateNew}
                    >
                        开始创建
                    </button>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="models-table">
                        <colgroup>
                            <col style={{ width: '5%' }} />
                            <col style={{ width: '25%' }} />
                            <col style={{ width: '8%' }} />
                            <col style={{ width: '8%' }} />
                            <col style={{ width: '10%' }} />
                            <col style={{ width: '15%' }} />
                            <col style={{ width: '8%' }} />
                        </colgroup>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>模型名称</th>
                                <th>方案数</th>
                                <th>情景数</th>
                                <th>状态</th>
                                <th>创建时间</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {models.map(model => (
                                <tr
                                    key={model.id}
                                    onClick={() => handleViewDetail(model.id)}
                                    className="clickable-row"
                                >
                                    <td className="id-cell">{model.id}</td>
                                    <td
                                        className="name-cell"
                                        onMouseEnter={(e) => model.description && handleMouseEnter(model.id, e)}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <span className="model-name">{model.name}</span>
                                        {model.description && (
                                            <span className="description-indicator">📝</span>
                                        )}
                                    </td>
                                    <td className="number-cell">{model.alternatives_count}</td>
                                    <td className="number-cell">{model.scenarios_count}</td>
                                    <td>
                                        {model.has_result ? (
                                            <span className="status-badge status-success">已分析</span>
                                        ) : (
                                            <span className="status-badge status-warning">未分析</span>
                                        )}
                                    </td>
                                    <td className="date-cell">{formatDate(model.created_at)}</td>
                                    <td onClick={(e) => e.stopPropagation()}>
                                        <button
                                            className="action-btn delete-btn"
                                            onClick={(e) => handleDeleteClick(model, e)}
                                            title="删除"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ display: 'flex', justifyContent: 'space-around', margin: '20px auto' }}>
                        <button onClick={handlePrevPage} disabled={currentPage === 1} className='green-button'>Previous</button>
                        <p style={{ margin: '0 10px', display: 'flex', alignItems: 'center' }}>Page {currentPage} of {totalPages}</p>
                        <button onClick={handleNextPage} disabled={currentPage >= totalPages} className='green-button'>Next</button>
                    </div>
                </div>
            )}

            {/* 浮动提示 - 使用绝对定位，不影响表格布局 */}
            {hoveredModel && getHoveredModelDescription() && (
                <div
                    className="floating-tooltip"
                    style={{
                        position: 'absolute',
                        left: `${tooltipPosition.x}px`,
                        top: `${tooltipPosition.y}px`,
                    }}
                >
                    <div className="tooltip-arrow"></div>
                    <div className="tooltip-content">
                        {getHoveredModelDescription()}
                    </div>
                </div>
            )}

            {/* 删除确认弹窗 */}
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>确认删除</h3>
                            <button className="modal-close" onClick={handleDeleteCancel}>×</button>
                        </div>
                        <div className="modal-body">
                            <p>确定要删除模型 <strong>“{modelToDelete?.name}”</strong> 吗？</p>
                            <p className="warning-text">此操作不可恢复，所有相关数据都将被永久删除！</p>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-outline"
                                onClick={handleDeleteCancel}
                            >
                                取消
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={handleDeleteConfirm}
                            >
                                确认删除
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModelList;