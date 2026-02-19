// components/MinimaxRegretDecision.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MinimaxRegretDecision.css'; // 我们将在下面创建这个CSS文件

const API_BASE_URL = 'http://localhost:5000/api';

const steps = ['定义问题', '添加备选方案', '添加情景状态', '输入收益值', '分析结果'];

const MinimaxRegretDecision = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [modelId, setModelId] = useState(null);
  const [modelName, setModelName] = useState('');
  const [modelDescription, setModelDescription] = useState('');
  const [alternatives, setAlternatives] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [payoffMatrix, setPayoffMatrix] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newAltName, setNewAltName] = useState('');
  const [newAltDesc, setNewAltDesc] = useState('');
  const [newScenName, setNewScenName] = useState('');
  const [newScenDesc, setNewScenDesc] = useState('');
  const [newScenProb, setNewScenProb] = useState('');

  // 初始化或加载模型
  useEffect(() => {
    if (modelId) {
      loadModelData();
    }
  }, [modelId]);

  // 更新收益矩阵维度
  useEffect(() => {
    if (alternatives.length > 0 && scenarios.length > 0) {
      const newMatrix = Array(alternatives.length)
        .fill(0)
        .map(() => Array(scenarios.length).fill(0));
      setPayoffMatrix(newMatrix);
    } else {
      setPayoffMatrix([]);
    }
  }, [alternatives, scenarios]);

  const loadModelData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/models/${modelId}`);
      const data = response.data;
      
      setAlternatives(data.alternatives || []);
      setScenarios(data.scenarios || []);
      setModelName(data.name);
      setModelDescription(data.description);
    } catch (err) {
      setError('Failed to load model data');
    }
  };

  const handleCreateModel = async () => {
    if (!modelName.trim()) {
      setError('Please enter model name');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/models`, {
        name: modelName,
        description: modelDescription,
      });
      setModelId(response.data.id);
      setActiveStep(1);
      setError('');
    } catch (err) {
      setError('Failed to create model');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAlternative = async () => {
    if (!newAltName.trim() || !modelId) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/models/${modelId}/alternatives`, {
        name: newAltName,
        description: newAltDesc,
      });
      setAlternatives([...alternatives, response.data]);
      setNewAltName('');
      setNewAltDesc('');
    } catch (err) {
      setError('Failed to add alternative');
    }
  };

  const handleAddScenario = async () => {
    if (!newScenName.trim() || !modelId) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/models/${modelId}/scenarios`, {
        name: newScenName,
        description: newScenDesc,
        probability: newScenProb ? parseFloat(newScenProb) : null,
      });
      setScenarios([...scenarios, response.data]);
      setNewScenName('');
      setNewScenDesc('');
      setNewScenProb('');
    } catch (err) {
      setError('Failed to add scenario');
    }
  };

  const handlePayoffChange = (altIndex, scenIndex, value) => {
    const newMatrix = [...payoffMatrix];
    newMatrix[altIndex][scenIndex] = parseFloat(value) || 0;
    setPayoffMatrix(newMatrix);
  };

  const handleSavePayoffs = async () => {
    if (!modelId) return;

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/models/${modelId}/payoffs`, payoffMatrix);
      setError('');
      return true;
    } catch (err) {
      setError('Failed to save payoffs');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!modelId) return;

    const saved = await handleSavePayoffs();
    if (!saved) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/models/${modelId}/analyze`);
      setAnalysisResult(response.data);
      setActiveStep(4);
      setError('');
    } catch (err) {
      setError('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <div className="step-content">
            <div className="form-group">
              <label htmlFor="modelName">模型名称 *</label>
              <input
                id="modelName"
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="输入模型名称"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="modelDescription">模型描述</label>
              <textarea
                id="modelDescription"
                value={modelDescription}
                onChange={(e) => setModelDescription(e.target.value)}
                placeholder="输入模型描述（可选）"
                rows="3"
                className="form-textarea"
              />
            </div>
            
            <button
              onClick={handleCreateModel}
              disabled={loading || !modelName.trim()}
              className="btn btn-primary"
            >
              {loading ? '创建中...' : '创建模型'}
            </button>
          </div>
        );

      case 1:
        return (
          <div className="step-content">
            <h3>备选方案</h3>
            
            {/* 方案列表 */}
            {alternatives.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>名称</th>
                    <th>描述</th>
                  </tr>
                </thead>
                <tbody>
                  {alternatives.map((alt) => (
                    <tr key={alt.id}>
                      <td>{alt.name}</td>
                      <td>{alt.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="empty-message">暂无备选方案，请添加</p>
            )}

            {/* 添加新方案 */}
            <div className="add-form">
              <h4>添加新方案</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>方案名称</label>
                  <input
                    type="text"
                    value={newAltName}
                    onChange={(e) => setNewAltName(e.target.value)}
                    placeholder="输入方案名称"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>方案描述</label>
                  <input
                    type="text"
                    value={newAltDesc}
                    onChange={(e) => setNewAltDesc(e.target.value)}
                    placeholder="输入方案描述"
                    className="form-input"
                  />
                </div>
              </div>
              <button
                onClick={handleAddAlternative}
                disabled={!newAltName.trim()}
                className="btn btn-secondary"
              >
                添加方案
              </button>
            </div>

            <div className="step-navigation">
              <button onClick={() => setActiveStep(0)} className="btn btn-outline">
                上一步
              </button>
              <button
                onClick={() => setActiveStep(2)}
                disabled={alternatives.length === 0}
                className="btn btn-primary"
              >
                下一步
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h3>情景状态</h3>
            
            {/* 情景列表 */}
            {scenarios.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>名称</th>
                    <th>描述</th>
                    <th>概率</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarios.map((scen) => (
                    <tr key={scen.id}>
                      <td>{scen.name}</td>
                      <td>{scen.description}</td>
                      <td>{scen.probability || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="empty-message">暂无情景状态，请添加</p>
            )}

            {/* 添加新情景 */}
            <div className="add-form">
              <h4>添加新情景</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>情景名称</label>
                  <input
                    type="text"
                    value={newScenName}
                    onChange={(e) => setNewScenName(e.target.value)}
                    placeholder="输入情景名称"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>情景描述</label>
                  <input
                    type="text"
                    value={newScenDesc}
                    onChange={(e) => setNewScenDesc(e.target.value)}
                    placeholder="输入情景描述"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>概率 (0-1)</label>
                  <input
                    type="number"
                    value={newScenProb}
                    onChange={(e) => setNewScenProb(e.target.value)}
                    placeholder="可选"
                    step="0.01"
                    min="0"
                    max="1"
                    className="form-input"
                  />
                </div>
              </div>
              <button
                onClick={handleAddScenario}
                disabled={!newScenName.trim()}
                className="btn btn-secondary"
              >
                添加情景
              </button>
            </div>

            <div className="step-navigation">
              <button onClick={() => setActiveStep(1)} className="btn btn-outline">
                上一步
              </button>
              <button
                onClick={() => setActiveStep(3)}
                disabled={scenarios.length === 0}
                className="btn btn-primary"
              >
                下一步
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h3>输入收益值</h3>
            
            {alternatives.length > 0 && scenarios.length > 0 ? (
              <div className="table-responsive">
                <table className="payoff-table">
                  <thead>
                    <tr>
                      <th>方案 / 情景</th>
                      {scenarios.map((scen) => (
                        <th key={scen.id}>{scen.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {alternatives.map((alt, altIndex) => (
                      <tr key={alt.id}>
                        <td className="alternative-name">{alt.name}</td>
                        {scenarios.map((scen, scenIndex) => (
                          <td key={`${alt.id}-${scen.id}`}>
                            <input
                              type="number"
                              value={payoffMatrix[altIndex]?.[scenIndex] || 0}
                              onChange={(e) => handlePayoffChange(altIndex, scenIndex, e.target.value)}
                              step="0.01"
                              className="payoff-input"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>请先添加方案和情景</p>
            )}

            <div className="step-navigation">
              <button onClick={() => setActiveStep(2)} className="btn btn-outline">
                上一步
              </button>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="btn btn-success"
              >
                {loading ? '分析中...' : '分析决策'}
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h2 className="result-title">分析结果</h2>

            {analysisResult && (
              <>
                {/* 遗憾矩阵 */}
                <h3>遗憾矩阵</h3>
                <div className="table-responsive">
                  <table className="result-table">
                    <thead>
                      <tr>
                        <th>方案 / 情景</th>
                        {analysisResult.scenario_names?.map((name, idx) => (
                          <th key={idx}>{name}</th>
                        ))}
                        <th>最大遗憾值</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysisResult.regret_matrix?.map((row, altIdx) => {
                        const isBest = analysisResult.best_alternatives?.some(
                          (best) => best.index === altIdx
                        );
                        return (
                          <tr key={altIdx} className={isBest ? 'best-alternative' : ''}>
                            <td className="alternative-name">
                              {isBest && <span className="best-badge">最优</span>}
                              {alternatives[altIdx]?.name}
                            </td>
                            {row.map((value, scenIdx) => (
                              <td key={scenIdx}>{value.toFixed(2)}</td>
                            ))}
                            <td className="max-regret">{analysisResult.max_regrets[altIdx].toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* 决策建议 */}
                <div className="decision-card">
                  <h3>决策建议</h3>
                  <p className="decision-text">
                    根据最小化最大遗憾值原则，建议选择：
                    <strong>
                      {analysisResult.best_alternatives
                        ?.map((best) => best.name)
                        .join(' 或 ')}
                    </strong>
                  </p>
                  <p className="regret-value">
                    最小最大遗憾值为：{analysisResult.min_max_regret.toFixed(2)}
                  </p>
                </div>

                <div className="action-buttons">
                  <button
                    onClick={() => {
                      // 导出功能
                      const dataStr = JSON.stringify(analysisResult, null, 2);
                      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                      const exportFileDefaultName = `decision_result_${new Date().toISOString()}.json`;
                      const linkElement = document.createElement('a');
                      linkElement.setAttribute('href', dataUri);
                      linkElement.setAttribute('download', exportFileDefaultName);
                      linkElement.click();
                    }}
                    className="btn btn-outline"
                  >
                    导出结果
                  </button>
                </div>
              </>
            )}

            <div className="step-navigation">
              <button onClick={() => setActiveStep(3)} className="btn btn-outline">
                上一步
              </button>
              <button
                onClick={() => {
                  setActiveStep(0);
                  setModelId(null);
                  setModelName('');
                  setModelDescription('');
                  setAlternatives([]);
                  setScenarios([]);
                  setAnalysisResult(null);
                }}
                className="btn btn-primary"
              >
                新建分析
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>最小化最大遗憾值决策模型</h1>
        <p className="description">
          该模型通过计算各方案在不同情景下的遗憾值，选择最大遗憾值最小的方案，帮助您在不确定性下做出稳健决策。
        </p>
      </div>

      {/* 步骤指示器 */}
      <div className="stepper">
        {steps.map((label, index) => (
          <div key={label} className="step-item">
            <div className={`step-indicator ${index <= activeStep ? 'active' : ''} ${index < activeStep ? 'completed' : ''}`}>
              {index + 1}
            </div>
            <div className={`step-label ${index <= activeStep ? 'active' : ''}`}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="error-alert">
          <span>{error}</span>
          <button onClick={() => setError('')} className="close-btn">×</button>
        </div>
      )}

      {/* 主要内容 */}
      <div className="main-content">
        {renderStepContent(activeStep)}
      </div>
    </div>
  );
};

export default MinimaxRegretDecision;