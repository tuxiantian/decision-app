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
  const [exporting, setExporting] = useState(false);

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

  // 导出PDF - 调用后端接口
  const exportToPDF = async (simple = false) => {
    setExporting(true);

    try {
      const endpoint = simple
        ? `${API_BASE_URL}/models/${modelId}/export-simple-pdf`
        : `${API_BASE_URL}/models/${modelId}/export-pdf`;

      // 使用 fetch 或 axios 获取PDF文件
      const response = await axios.get(endpoint, {
        responseType: 'blob', // 重要：设置为blob类型
        // 重要：告诉 axios 获取所有响应头
        headers: {
          'Accept': 'application/pdf',
        },
        // 确保能获取到自定义头
        withCredentials: true,
      });

      // 创建下载链接
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // 从响应头中获取文件名，或使用默认名
      const contentDisposition = response.headers['content-disposition'];
      let filename = simple ? '决策摘要.pdf' : '决策报告.pdf';

      if (contentDisposition) {
        // 尝试解析 filename* 参数 (RFC 5987)
        
        const filenameStarMatch = contentDisposition.match(/filename\*=(?:UTF-8|utf-8)''(.+)/);
        if (filenameStarMatch && filenameStarMatch[1]) {
          filename = decodeURIComponent(filenameStarMatch[1]);
        } else {
          // 尝试解析普通 filename 参数
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1];
          } else {
            // 尝试另一种格式
            const simpleFilenameMatch = contentDisposition.match(/filename=([^;]+)/);
            if (simpleFilenameMatch && simpleFilenameMatch[1]) {
              filename = simpleFilenameMatch[1].replace(/['"]/g, '');
            }
          }
        }
        console.log(filename);
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // 清理URL对象
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error('PDF导出失败:', err);
      setError('PDF导出失败：' + (err.response?.data?.error || err.message));
    } finally {
      setExporting(false);
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
              className="btn btn-primary"
              onClick={() => exportToPDF(false)}
              disabled={exporting}
            >
              {exporting ? '生成中...' : '导出完整PDF报告'}
            </button>
            <button
              className="btn btn-outline"
              onClick={() => exportToPDF(true)}
              disabled={exporting}
            >
              {exporting ? '生成中...' : '导出简洁PDF'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ModelDetail;