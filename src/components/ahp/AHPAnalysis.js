import React, { useState, useEffect } from 'react';
import PairwiseComparison from './PairwiseComparison.js';
import { Link, useNavigate } from 'react-router-dom';
import './AHPAnalysis.css';
import { API_BASE_URL } from '../../config.js';
import api from '../api.js'

function AHPAnalysis() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [isNew, setIsNew] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const fetchHistory = (page) => {
    api.get(`${API_BASE_URL}/ahp_history`, {
      params: {
        page: page,
        page_size: pageSize
      },
    })
      .then(response => {
        setHistory(response.data.history_list);
        setTotalPages(response.data.total_pages);
      })
      .catch(error => console.error('Error:', error));
  };

  useEffect(() => {
    fetchHistory(currentPage);
  }, [currentPage]);

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
  return (
    <div className="ahp-container">
      <h1>层次分析决策法（AHP）</h1>
      {!isNew ? (
        <div>
          <div className="table-controls">
            <h2>历史记录</h2>
            <button className="green-button add-button" onClick={handleNewClick}>新增</button>
          </div>

          <table className="ahp-table">
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
              {history.map((record, index) => (
                <tr key={index}>
                  <td>{record.id}</td>
                  <td>{record.criteria_names}</td>
                  <td>{record.alternative_names}</td>
                  <td>{record.best_choice_name}</td>
                  <td>{new Date(record.created_at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="green-button" onClick={() => handleDetailsClick(record)}>详情</button>
                      <button className="red-button" onClick={() => handleDelete(record.id)}>删除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination-controls">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="green-button"
            >
              上一页
            </button>
            <span className="page-info">
              第 {currentPage} 页 / 共 {totalPages} 页
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="green-button"
            >
              下一页
            </button>
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
