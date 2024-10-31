import React, { useState, useEffect } from 'react';
import PairwiseComparison from './PairwiseComparison';
import { Link, useNavigate } from 'react-router-dom';
import './App.css';
import { API_BASE_URL } from './config'; 
import api from './components/api.js'

function AHPAnalysis() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [isNew, setIsNew] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const fetchHistory = () => {
    api.get(`${API_BASE_URL}/ahp_history`)
      .then(response => setHistory(response.data))
      .catch(error => console.error('Error:', error));
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleNewClick = () => {
    navigate('/ahp-add');
  };

  const handleDetailsClick = (data) => {
    navigate('/ahp-add', { state: { data } });
  };

  const handleDelete = (id) => {
    api.get(`${API_BASE_URL}/ahp_delete`, { params: { id } })
      .then(response => {
        if (response.data.success) {
          fetchHistory(); // 重新获取历史记录，更新列表
        } else {
          alert('删除失败');
        }
      })
      .catch(error => console.error('Error:', error));
  };

  const handleBack = () => {
    setIsNew(false);
    fetchHistory();  // 返回到列表页时重新加载数据
  };

  return (
    <div className="App">
      <h1>AHP Decision System</h1>
      {!isNew ? (
        <div className="centered-table-container">

          <div className="table-container">
            <div className="table-controls">
              <h2>历史记录</h2>
              <button className="green-button add-button" onClick={handleNewClick}>新增</button>
            </div>
            <table border="1" className="centered-table">
              <thead>
                <tr>
                  <th>记录 ID</th>
                  <th>准则</th>
                  <th>备选方案</th>
                  <th>最佳选择</th>
                  <th>创建时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record, index) => {
                  return (
                    <tr key={index}>
                      <td>{record.id}</td>
                      <td>{record.criteria_names}</td>
                      <td>{record.alternative_names}</td>
                      <td>{record.best_choice_name}</td>
                      <td>{new Date(record.created_at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}</td>
                      <td>
                        <button className="green-button" onClick={() => handleDetailsClick(record)}>详情</button>
                        <button className="red-button" onClick={() => handleDelete(record.id)}>删除</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <PairwiseComparison
          data={selectedData}
          onBack={handleBack}
        />
      )}
    </div>
  );
}

export default AHPAnalysis;
