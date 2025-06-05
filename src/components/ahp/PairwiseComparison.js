import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './PairwiseComparison.css'
import api from '../api.js'

function PairwiseComparison() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state?.data;
  // 加载传入的数据
  useEffect(() => {
    if (data) {
      // 解析请求数据和响应数据
      const requestData = JSON.parse(data.request_data);
      const responseData = JSON.parse(data.response_data);
      // 根据 data 加载数据
      setCriteriaNames(requestData.criteria_names);
      setAlternativeNames(requestData.alternative_names);
      setCriteriaMatrix(requestData.criteria_matrix);
      setAlternativesMatrices(requestData.alternative_matrices);
      setMatricesReady(true);
    }
  }, [data]);
  const [criteriaNames, setCriteriaNames] = useState([]);
  const [alternativeNames, setAlternativeNames] = useState([]);
  const [criteriaMatrix, setCriteriaMatrix] = useState([]);
  const [alternativesMatrices, setAlternativesMatrices] = useState([]);
  const [result, setResult] = useState(null);
  const [lastRequestData, setLastRequestData] = useState(null);
  // 在组件状态中添加
  const [matricesReady, setMatricesReady] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 添加检查矩阵是否完整的方法
  const checkMatricesComplete = () => {
    // 检查准则矩阵是否完整
    const criteriaComplete = criteriaMatrix.every(row =>
      row.every(cell => cell !== '' && !isNaN(parseFloat(cell)))
    );

    // 检查所有备选方案矩阵是否完整
    const alternativesComplete = alternativesMatrices.every(matrix =>
      matrix.every(row =>
        row.every(cell => cell !== '' && !isNaN(parseFloat(cell)))
      )
    );

    setMatricesReady(criteriaComplete && alternativesComplete);
  };

  const onBack = () => {
    navigate(-1); // 返回上一页面
  };

  const handleCriteriaChange = (index, value) => {
    const updatedCriteriaNames = [...criteriaNames];
    updatedCriteriaNames[index] = value;
    setCriteriaNames(updatedCriteriaNames);
  };

  const handleAlternativeChange = (index, value) => {
    const updatedAlternativeNames = [...alternativeNames];
    updatedAlternativeNames[index] = value;
    setAlternativeNames(updatedAlternativeNames);
  };

  const generateMatrices = () => {
    const criteriaCount = criteriaNames.length;
    const alternativesCount = alternativeNames.length;

    const newCriteriaMatrix = Array(criteriaCount).fill(null).map((_, i) =>
      Array(criteriaCount).fill(null).map((_, j) => (i === j ? '1' : ''))
    );
    setCriteriaMatrix(newCriteriaMatrix);

    const newAlternativesMatrices = Array(criteriaCount).fill(null).map(() =>
      Array(alternativesCount).fill(null).map((_, i) =>
        Array(alternativesCount).fill(null).map((_, j) => (i === j ? '1' : ''))
      )
    );
    setAlternativesMatrices(newAlternativesMatrices);
    setMatricesReady(false);
  };

  const reciprocalAsFraction = (value) => {
    if (value.includes('/')) {
      const [numerator, denominator] = value.split('/').map(Number);
      const reciprocal = denominator / numerator;
      return Number.isInteger(reciprocal) ? reciprocal.toString() : `${denominator}/${numerator}`;
    } else {
      const numValue = parseFloat(value);
      return numValue === 1 ? '1' : `1/${numValue}`;
    }
  };

  const updateCriteriaMatrix = (row, col, value) => {
    const reciprocal = reciprocalAsFraction(value);

    const newMatrix = criteriaMatrix.map((r, i) =>
      r.map((cell, j) => {
        if (i === row && j === col) return value;
        if (i === col && j === row) return reciprocal;
        return cell;
      })
    );
    setCriteriaMatrix(newMatrix);
    checkMatricesComplete();
  };

  const updateAlternativesMatrix = (criteriaIndex, row, col, value) => {
    const reciprocal = reciprocalAsFraction(value);

    const updatedMatrices = alternativesMatrices.map((matrix, idx) =>
      idx === criteriaIndex
        ? matrix.map((r, i) =>
          r.map((cell, j) => {
            if (i === row && j === col) return value;
            if (i === col && j === row) return reciprocal;
            return cell;
          })
        )
        : matrix
    );
    setAlternativesMatrices(updatedMatrices);
    checkMatricesComplete();
  };

  const submitMatrices = async () => {
    setError(null);
    setIsSubmitting(true);
    setResult(null); // 清除旧结果
    try {
      const data = {
        criteria_matrix: criteriaMatrix,
        alternative_matrices: alternativesMatrices,
        alternative_names: alternativeNames,
        criteria_names: criteriaNames
      };

      setLastRequestData(data);

      const response = await api.post('/ahp_analysis', data);

      if (response.data.error) {
        // 处理后端返回的错误
        throw new Error(`${response.data.error}: ${response.data.details || ''}`);
      }

      setResult(response.data);

    } catch (error) {
      let errorMessage = '提交分析时出错';

      // 根据错误类型提供更友好的提示
      if (error.response) {
        // 来自后端的错误响应
        const { data } = error.response;
        if (data && data.error) {
          errorMessage = `分析错误: ${data.error}`;
          if (data.details) errorMessage += ` (${data.details})`;
        } else {
          errorMessage = `服务器返回错误: ${error.response.status}`;
        }
      } else if (error.request) {
        // 请求已发出但没有收到响应
        errorMessage = '网络错误: 无法连接到服务器';
      } else {
        // 其他错误
        errorMessage = `错误: ${error.message}`;
      }

      setError(errorMessage);
      console.error('提交错误:', error);

    } finally {
      setIsSubmitting(false);
    }
  };

  const saveHistory = async () => {
    const data = {
      request_data: lastRequestData,
      response_data: result,
    };

    try {
      const response = await api.post('/save_history', data);
      alert(response.data.message || 'History saved successfully!');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <button className="back-button" onClick={onBack}>
          <span className="back-icon">←</span> 返回
        </button>
        <h1 className="page-title">我做过的AHP分析</h1>
      </div>

      <div className="section">
        <h3 className="section-title">输入准则和备选方案</h3>
        <div className="input-grid">
          <div>
            <h4>准则名称</h4>
            {[...Array(criteriaNames.length + 1)].map((_, index) => (
              index < 9 && (
                <input
                  key={index}
                  type="text"
                  placeholder={`准则 ${index + 1}`}
                  value={criteriaNames[index] || ''}
                  onChange={(e) => handleCriteriaChange(index, e.target.value)}
                  className="form-input"
                />
              )
            ))}
          </div>
          <div>
            <h4>备选方案名称</h4>
            {[...Array(alternativeNames.length + 1)].map((_, index) => (
              index < 9 && (
                <input
                  key={index}
                  type="text"
                  placeholder={`方案 ${index + 1}`}
                  value={alternativeNames[index] || ''}
                  onChange={(e) => handleAlternativeChange(index, e.target.value)}
                  className="form-input"
                />
              )
            ))}
          </div>
        </div>
        <button className="primary-btn" onClick={generateMatrices}>
          生成矩阵
        </button>
      </div>

      <div className="section instruction-section">
        <h3 className="section-title">矩阵输入指引</h3>
        <div className="instruction-content">
          <p>在每个层次中，将元素进行两两比较，构建成对比较矩阵。比较标度说明：</p>
          <div className="scale-container">
            <div className="scale-item">
              <span className="scale-value">1</span>
              <span className="scale-desc">同等重要</span>
            </div>
            <div className="scale-item">
              <span className="scale-value">3</span>
              <span className="scale-desc">稍微重要</span>
            </div>
            <div className="scale-item">
              <span className="scale-value">5</span>
              <span className="scale-desc">显著重要</span>
            </div>
            <div className="scale-item">
              <span className="scale-value">7</span>
              <span className="scale-desc">非常重要</span>
            </div>
            <div className="scale-item">
              <span className="scale-value">9</span>
              <span className="scale-desc">极其重要</span>
            </div>
            <div className="scale-item">
              <span className="scale-value">2,4,6,8</span>
              <span className="scale-desc">中间值</span>
            </div>
          </div>
        </div>
      </div>

      {criteriaNames.length > 0 && (
        <div className="section">
          <h3 className="section-title">准则两两比较矩阵</h3>
          <div className="centered-table-container">
            <table className="centered-table">
              <thead>
                <tr>
                  <th></th>
                  {criteriaNames.map((name, idx) => (
                    <th key={idx}>{name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {criteriaMatrix.map((row, i) => (
                  <tr key={i}>
                    <td className="row-header">{criteriaNames[i]}</td>
                    {row.map((cell, j) => (
                      <td key={j}>
                        <input
                          type="text"
                          value={j === i ? '1' : cell}
                          onChange={(e) => updateCriteriaMatrix(i, j, e.target.value)}
                          disabled={i === j}
                          className="matrix-input"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {alternativesMatrices.map((matrix, idx) => (
        <div className="section" key={idx}>
          <h3 className="section-title">备选方案比较矩阵 - {criteriaNames[idx]}</h3>
          <div className="centered-table-container">
            <table className="centered-table">
              <thead>
                <tr>
                  <th></th>
                  {alternativeNames.map((name, jdx) => (
                    <th key={jdx}>{name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row, i) => (
                  <tr key={i}>
                    <td className="row-header">{alternativeNames[i]}</td>
                    {row.map((cell, j) => (
                      <td key={j}>
                        <input
                          type="text"
                          value={j === i ? '1' : cell}
                          onChange={(e) => updateAlternativesMatrix(idx, i, j, e.target.value)}
                          disabled={i === j}
                          className="matrix-input"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      ))}

      {/* 只在矩阵完整时显示提交按钮 */}
      {matricesReady && criteriaNames.length > 0 && (
        <div className="section submit-section">
          <button
            className="primary-btn"
            onClick={submitMatrices}
            disabled={isSubmitting || !matricesReady}
          >
            提交分析
            {isSubmitting && <span className="loading-spinner"></span>}
          </button>
          <p className="submit-hint">所有矩阵已完整填写，可以提交分析</p>
        </div>
      )}

      {/* 矩阵不完整时的提示 */}
      {!matricesReady && criteriaNames.length > 0 && (
        <div className="section submit-section">
          <p className="submit-hint">
            请完成所有矩阵的填写后再提交（所有单元格都需要填写）
          </p>
        </div>
      )}

      {error && (
        <div className="error-alert">
          <div className="error-icon">⚠️</div>
          <div className="error-message">{error}</div>
          <button
            className="error-close"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}

      {result && result.status === 'success' && (
        <div className="section result-section">
          <h3 className="section-title">决策分析结果</h3>
          <div className="result-card">
            <div className="result-item">
              <span className="result-label">最佳选择：</span>
              <span className="result-value highlight">{result.best_choice_name}</span>
            </div>
            <div className="result-item">
              <span className="result-label">优先级向量：</span>
              <div className="priority-grid">
                {result.priority_vector.map((value, index) => (
                  <div key={index} className="priority-item">
                    <span className="alternative-name">{alternativeNames[index]}</span>
                    <span className="priority-value">{value.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button className="primary-btn" onClick={saveHistory}>
            保存到历史记录
          </button>
        </div>
      )}
    </div>
  );
}

export default PairwiseComparison;
