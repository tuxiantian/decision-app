import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../App.css';  // 引入 CSS 文件
import { API_BASE_URL } from '../config.js';
import api from './api.js'

// 封装 fetch 请求
const fetchWithPrefix = (endpoint, options = {}) => {
  return fetch(`${API_BASE_URL}${endpoint}`, options);
};

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
    }
  }, [data]);
  const [criteriaNames, setCriteriaNames] = useState([]);
  const [alternativeNames, setAlternativeNames] = useState([]);
  const [criteriaMatrix, setCriteriaMatrix] = useState([]);
  const [alternativesMatrices, setAlternativesMatrices] = useState([]);
  const [result, setResult] = useState(null);
  const [lastRequestData, setLastRequestData] = useState(null);

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
  };

  const submitMatrices =async () => {
    const data = {
      criteria_matrix: criteriaMatrix,
      alternative_matrices: alternativesMatrices,
      alternative_names: alternativeNames,
      criteria_names: criteriaNames
    };

    setLastRequestData(data);


    try {
      const response = await api.post('/ahp_analysis', data);
      setResult(response.data);
    } catch (error) {
      console.error('Error:', error);
      setResult('Error submitting data');
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
      <button className="green-button" onClick={onBack}>返回</button>
      <h3>Enter Criteria Names</h3>
      {[...Array(criteriaNames.length + 1)].map((_, index) => (
        index < 9 && (
          <input
            key={index}
            type="text"
            placeholder={`Criterion ${index + 1}`}
            value={criteriaNames[index] || ''}
            onChange={(e) => handleCriteriaChange(index, e.target.value)}
          />
        )

      ))}

      <h3>Enter Alternative Names</h3>
      {[...Array(alternativeNames.length + 1)].map((_, index) => (
        index < 9 && (
          <input
            key={index}
            type="text"
            placeholder={`Alternative ${index + 1}`}
            value={alternativeNames[index] || ''}
            onChange={(e) => handleAlternativeChange(index, e.target.value)}
          />
        )
      ))}
      <br></br>
      <button className="green-button" style={{marginTop:'15px'}} onClick={generateMatrices}>Generate Matrices</button>

      <div className="matrix-instructions">
        {'矩阵表格输入提示'}
        <div className="matrix-instructions-content">
          <pre>
            在每个层次中，将元素进行两两比较，构建成对比较矩阵。比较的依据是元素相对重要性的判断，通常使用1到9的标度表示。常见的标度如下：
            <br />
            - 1：两者同等重要<br />
            - 3：一方稍微重要<br />
            - 5：一方显著重要<br />
            - 7：一方非常重要<br />
            - 9：一方极其重要<br />
            - 2, 4, 6, 8：上述判断的中间值
          </pre>
        </div>
      </div>

      {criteriaNames.length > 0 && (
        <>
          <div className="centered-table-container">
            <h3>Criteria Pairwise Comparison Matrix</h3>
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
                    <td>{criteriaNames[i]}</td>
                    {row.map((cell, j) => (
                      <td key={j}>
                        <input
                          type="text"
                          value={j === i ? '1' : cell}
                          onChange={(e) => updateCriteriaMatrix(i, j, e.target.value)}
                          disabled={i === j}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {alternativesMatrices.map((matrix, idx) => (
        <div className="centered-table-container" key={idx}>
          <h3>Alternatives Pairwise Comparison Matrix for Criterion: {criteriaNames[idx]}</h3>
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
                  <td>{alternativeNames[i]}</td>
                  {row.map((cell, j) => (
                    <td key={j}>
                      <input
                        type="text"
                        value={j === i ? '1' : cell}
                        onChange={(e) => updateAlternativesMatrix(idx, i, j, e.target.value)}
                        disabled={i === j}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <button className="green-button" onClick={submitMatrices}>Submit</button>

      {result && (
        <div className="result-container">
          <h3>决策分析结果:</h3>
          <div className="result-content">
            <div className="result-field">
              <strong>最佳选择：</strong> {result.best_choice_name}
            </div>
            <div className="result-field">
              <strong>优先级向量：</strong>
              <ul className="priority-list">
                {result.priority_vector.map((value, index) => (
                  <li key={index}>{alternativeNames[index]}: {value.toFixed(4)}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}


      {result && <button className="green-button" onClick={saveHistory}>Save to History</button>}
    </div>
  );
}

export default PairwiseComparison;
