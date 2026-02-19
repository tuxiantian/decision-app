// components/ModelDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ModelDetail.css';

const API_BASE_URL = 'http://localhost:5000/api';

const ModelDetail = () => {
  const { modelId } = useParams();
  const navigate = useNavigate();
  
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reanalyzing, setReanalyzing] = useState(false);

  useEffect(() => {
    console.log('ModelDetail mounted with modelId:', modelId);
    if (modelId) {
      fetchModelDetail();
    }
  }, [modelId]);

  const fetchModelDetail = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/models/${modelId}/detail`);
      console.log('Fetched model detail:', response.data);
      setModel(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching model detail:', err);
      setError('Failed to load model details');
    } finally {
      setLoading(false);
    }
  };

  const handleReanalyze = async () => {
    setReanalyzing(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/models/${modelId}/reanalyze`);
      setModel({
        ...model,
        result: {
          ...response.data,
          created_at: new Date().toISOString()
        }
      });
      setError('');
    } catch (err) {
      setError('Reanalysis failed');
    } finally {
      setReanalyzing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const handleBack = () => {
    navigate('/minimax-regret-decision/list');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="error-container">
        <p>模型不存在或已被删除</p>
        <button className="btn btn-primary" onClick={handleBack}>
          返回列表
        </button>
      </div>
    );
  }

  return (
    <div className="model-detail-container">
      {/* 头部 */}
      <div className="detail-header">
        <button className="back-btn" onClick={handleBack}>
          ← 返回列表
        </button>
        <div className="header-title">
          <h1>{model.name}</h1>
          <span className="model-id">ID: {model.id}</span>
        </div>
       
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="error-alert">
          <span>{error}</span>
          <button onClick={() => setError('')} className="close-btn">×</button>
        </div>
      )}

      {/* 模型信息 */}
      <div className="model-info">
        <div className="info-item">
          <span className="info-label">创建时间</span>
          <span className="info-value">{formatDate(model.created_at)}</span>
        </div>
        <div className="info-item">
          <span className="info-label">最后更新</span>
          <span className="info-value">{formatDate(model.updated_at)}</span>
        </div>
        {model.description && (
          <div className="info-item description">
            <span className="info-label">描述</span>
            <span className="info-value">{model.description}</span>
          </div>
        )}
      </div>

      {/* 方案和情景概览 */}
      <div className="detail-section">
        <h2>方案与情景</h2>
        <div className="overview-grid">
          {/* 备选方案 */}
          <div className="overview-card">
            <h3>备选方案 ({model.alternatives.length})</h3>
            <div className="items-list">
              {model.alternatives.map((alt, index) => (
                <div key={alt.id} className="list-item">
                  <span className="item-index">{index + 1}.</span>
                  <span className="item-name">{alt.name}</span>
                  {alt.description && (
                    <span className="item-desc">{alt.description}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 情景状态 */}
          <div className="overview-card">
            <h3>情景状态 ({model.scenarios.length})</h3>
            <div className="items-list">
              {model.scenarios.map((scen, index) => (
                <div key={scen.id} className="list-item">
                  <span className="item-index">{index + 1}.</span>
                  <span className="item-name">{scen.name}</span>
                  {scen.probability && (
                    <span className="item-prob">概率: {scen.probability}</span>
                  )}
                  {scen.description && (
                    <span className="item-desc">{scen.description}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 收益矩阵 */}
      <div className="detail-section">
        <h2>收益矩阵</h2>
        <div className="table-responsive">
          <table className="payoff-table">
            <thead>
              <tr>
                <th>方案 / 情景</th>
                {model.scenarios.map(scen => (
                  <th key={scen.id}>{scen.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {model.alternatives.map((alt, altIndex) => (
                <tr key={alt.id}>
                  <td className="alternative-name">{alt.name}</td>
                  {model.scenarios.map((scen, scenIndex) => (
                    <td key={`${alt.id}-${scen.id}`}>
                      {model.payoff_matrix[altIndex]?.[scenIndex]?.toFixed(2) || '0.00'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 分析结果 - 如果有的话 */}
      {model.result && (
        <div className="detail-section">
          <h2>分析结果</h2>
          <div className="result-time">
            分析时间: {formatDate(model.result.created_at)}
          </div>

          {/* 遗憾矩阵 */}
          <h3>遗憾矩阵</h3>
          <div className="table-responsive">
            <table className="result-table">
              <thead>
                <tr>
                  <th>方案 / 情景</th>
                  {model.scenarios.map(scen => (
                    <th key={scen.id}>{scen.name}</th>
                  ))}
                  <th>最大遗憾值</th>
                </tr>
              </thead>
              <tbody>
                {model.result.regret_matrix.map((row, altIndex) => {
                  const isBest = model.result.max_regrets[altIndex] === model.result.min_max_regret;
                  return (
                    <tr key={altIndex} className={isBest ? 'best-row' : ''}>
                      <td className="alternative-name">
                        {isBest && <span className="best-badge">最优</span>}
                        {model.alternatives[altIndex]?.name}
                      </td>
                      {row.map((value, scenIndex) => (
                        <td key={scenIndex}>{value.toFixed(2)}</td>
                      ))}
                      <td className="max-regret">
                        {model.result.max_regrets[altIndex].toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 决策建议卡片 */}
          <div className="decision-card">
            <h3>决策建议</h3>
            <p className="decision-text">
              根据最小化最大遗憾值原则，建议选择：
              <strong>{model.result.best_alternative_name}</strong>
            </p>
            <p className="regret-value">
              最小最大遗憾值：{model.result.min_max_regret.toFixed(2)}
            </p>
          </div>

          {/* 导出按钮 */}
          <div className="export-actions">
            <button 
              className="btn btn-outline"
              onClick={() => {
                const dataStr = JSON.stringify(model.result, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                const exportFileDefaultName = `result_${model.name}_${new Date().toISOString()}.json`;
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();
              }}
            >
              导出结果 (JSON)
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ModelDetail;