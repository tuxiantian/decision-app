import React, { useEffect, useState } from 'react';
import './MyFeedback.css';
import api from './api';

const MyFeedback = () => {
    const [feedbackList, setFeedbackList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchFeedback = async (page) => {
        try {
            const response = await api.get(`/api/my_feedback?page=${page}`);
            setFeedbackList(response.data.data);
            setTotalPages(response.data.total_pages);
        } catch (error) {
            console.error("Failed to fetch feedback:", error);
        }
    };

    useEffect(() => {

        fetchFeedback(currentPage);
    }, [currentPage]);

    // 分页控制
    const goToPreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    return (
        <div className="user-feedback-container">
            <h2 className="title">我的反馈</h2>
            <ul className="feedback-list">
                {feedbackList.map(fb => (
                    <li key={fb.id} className="feedback-item">
                        <p className="feedback-content"><strong>反馈内容:</strong> {fb.description}</p>
                        <p className="feedback-date"><strong>反馈时间:</strong> {new Date(fb.created_at).toLocaleString()}</p>
                        <p className={`status ${fb.status === "已回复" ? "replied" : "waiting"}`}>
                            <strong>状态:</strong> {fb.status}
                        </p>
                        {fb.response ? (
                            <>
                                <p className="feedback-response"><strong>运营回复:</strong> {fb.response}</p>
                                <p className="response-date"><strong>回复时间:</strong> {new Date(fb.responded_at).toLocaleString()}</p>
                            </>
                        ) : (
                            <p className="waiting-response">等待回复中...</p>
                        )}
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

export default MyFeedback;
