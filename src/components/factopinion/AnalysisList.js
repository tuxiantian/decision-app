import React, { useState, useEffect } from 'react';
import api from '../api';
import './AnalysisList.css';

const AnalysisList = () => {
    const [analyses, setAnalyses] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // 获取分页数据
    const fetchAnalyses = async (page = 1) => {
        try {
            const response = await api.get(`/api/get_paged_analyses?page=${page}`);
            if (response.data.status === "success") {
                setAnalyses(response.data.data);
                setTotalPages(response.data.total_pages);
                setCurrentPage(response.data.current_page);
            }
        } catch (error) {
            console.error("Error fetching analyses:", error);
        }
    };

    // 点击查看按钮跳转到详情页面
    const handleViewDetails = (id) => {
        window.location.href = `/analysis-detail/${id}`; // 假设详情页路径
    };

    // 初始化加载
    useEffect(() => {
        fetchAnalyses(currentPage);
    }, [currentPage]);

    // 分页控制
    const goToPreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    return (

        <div className="analysis-list-container">
            <h2 className="title">分析列表</h2>
            <ul className="analysis-list">
                {analyses.map((analysis) => (
                    <li key={analysis.id} className="analysis-item">
                        <p style={{textAlign:'left'}}>{analysis.content}</p>
                        <button onClick={() => handleViewDetails(analysis.id)} className="green-button">查看</button>
                    </li>
                ))}
            </ul>
            <div className="pagination">
                <button onClick={goToPreviousPage} disabled={currentPage === 1}>上一页</button>
                <span>第 {currentPage} 页，共 {totalPages} 页</span>
                <button onClick={goToNextPage} disabled={currentPage === totalPages}>下一页</button>
            </div>
        </div>
    
    );
};

export default AnalysisList;
