import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams , useNavigate } from 'react-router-dom';
import api from '../api';
import './AnalysisDetail.css';

const AnalysisDetail = () => {
    const { id } = useParams();  // 从 URL 获取分析 ID
    const navigate = useNavigate(); 
    const [analysis, setAnalysis] = useState(null);

    // 获取分析详情
    useEffect(() => {
        const fetchAnalysisDetail = async () => {
            try {
                const response = await api.get(`/api/analysis/${id}`);
                if (response.data.status === "success") {
                    setAnalysis(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching analysis detail:", error);
            }
        };

        fetchAnalysisDetail();
    }, [id]);

    if (!analysis) return <p>加载中...</p>;

    return (
        <div className="analysis-detail-container">
            <h2 className="title">分析详情</h2>
            <div className="content-section">
                <p><strong>内容：</strong></p>
                <div className="content-text">{analysis.content}</div>
                <p className="date"><strong>创建时间：</strong> {new Date(analysis.created_at).toLocaleString()}</p>
            </div>
            <h3 className="sub-title">标记的事实、观点和逻辑错误：</h3>
            <div className="data-list">
                {analysis.data.map((item, index) => (
                    <div className="data-item" key={index}>
                        <p><strong>事实：</strong></p>
                        <ul className="facts-list">
                            {item.facts.map((fact, i) => (
                                <li key={i}>{fact}</li>
                            ))}
                        </ul>
                        <p><strong>观点：</strong> {item.opinion}</p>
                        <p><strong>逻辑错误：</strong> {item.error}</p>
                    </div>
                ))}
            </div>
            <button onClick={() => navigate('/argument-evaluator-list')} style={{ marginTop: '20px' }} className='green-button'>
                Back to AnalysisList
            </button>
        </div>


    );
};

export default AnalysisDetail;
