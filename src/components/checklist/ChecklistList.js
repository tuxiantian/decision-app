import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config.js';
import api from '../api.js'
import '../../App.css'

const ChecklistList = () => {
  const [tab, setTab] = useState('my'); // 新增：用于管理选中的标签
  const [myChecklists, setMyChecklists] = useState([]);
  const [platformChecklists, setPlatformChecklists] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 5;
  const navigate = useNavigate();

  const fetchMyChecklists = async (page) => {
    const response = await api.get(`${API_BASE_URL}/checklists`, {
      params: {
        page: page,
        page_size: pageSize
      }
    });

    if (response.data) {
      const { checklists, total_pages } = response.data;
      setMyChecklists(checklists);
      setTotalPages(total_pages);
    }
  }

  // 获取“平台推荐的Checklist”的数据
  const fetchPlatformChecklists = async (page) => {
    const response = await api.get(`${API_BASE_URL}/platform_checklists`, {
      params: {
        page: page,
        page_size: pageSize,
      },
    });

    if (response.data) {
      const { checklists, total_pages } = response.data;
      setPlatformChecklists(checklists);
      setTotalPages(total_pages);
    }
  };

  useEffect(() => {
    if (tab === 'my') {
      fetchMyChecklists(currentPage);
    } else if (tab === 'platform') {
      fetchPlatformChecklists(currentPage);
    }
  }, [tab, currentPage]);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setCurrentPage(1); // 切换标签时重置页码
  };

  const handleUpdateClick = (checklistId) => {
    navigate(`/checklist/update/${checklistId}`);
  };

  const handleMakeDecisionClick = (checklistId) => {
    navigate(`/checklist/${checklistId}`);
  };

  const handleViewFlowchartClick = (checklistId, isPlatform) => {
    navigate(`/checklist/flowchart/${checklistId}`, { state: { isPlatform } });
  };

  const handleCloneChecklist = async (checklistId) => {
    try {
      await api.post(`${API_BASE_URL}/checklists/clone`, { checklist_id: checklistId });
      alert('Checklist cloned successfully!');
      fetchMyChecklists(currentPage); // 重新加载“我的Checklist”
    } catch (error) {
      console.error('Error cloning checklist:', error);
      alert('Failed to clone the checklist.');
    }
  };

  // 删除 Checklist 的函数
  const handleDeleteChecklist = async (checklistId, isParent) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this checklist?");
    if (!confirmDelete) return;

    try {
      const url = isParent
        ? `${API_BASE_URL}/checklists/${checklistId}/delete-with-children`
        : `${API_BASE_URL}/checklists/${checklistId}`;
      await api.delete(url);

      // 删除后刷新列表
      fetchMyChecklists(currentPage);
    } catch (error) {
      console.error('Error deleting checklist:', error);
      alert('Failed to delete the checklist.');
    }
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2>Checklist List</h2>
      {/* Tab Navigation */}
      <div className="tab-container" style={{ width: '600px' }}>
        <button
          className={`tab-button ${tab === 'my' ? 'active' : ''}`}
          onClick={() => handleTabChange('my')}
        >
          My Checklists
        </button>
        <button
          className={`tab-button ${tab === 'platform' ? 'active' : ''}`}
          onClick={() => handleTabChange('platform')}
        >
          Platform Recommended
        </button>
      </div>

      <ul style={{ listStyle: 'none', padding: 0, width: '80%' }}>
        {(tab === 'my' ? myChecklists : platformChecklists).map(checklist => (
          <li key={checklist.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #ccc' }}>
            <div style={{ textAlign: 'left', maxWidth: '600px' }}>
              <strong>{checklist.name}</strong> - Version: {checklist.version} -Decision Count: {checklist.decision_count}
              <div>{checklist.description}</div>
              {checklist.versions && checklist.versions.length > 0 && (
                <ul style={{ marginLeft: '20px', listStyle: 'circle' }}>
                  {checklist.versions.map(version => (
                    <li key={version.id} style={{ marginBottom: '5px' }}>
                      <strong>{version.name}</strong> - Version: {version.version} -Decision Count: {checklist.decision_count}
                      {tab === 'my' && (
                        <button
                          onClick={() => handleDeleteChecklist(version.id, false)}
                          style={{ marginLeft: '10px', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          <FontAwesomeIcon icon={faTrash} style={{ color: '#ff4444', fontSize: '1.2rem' }} />
                        </button>
                      )}

                      {tab === 'platform' && (
                        <><button
                          onClick={() => handleCloneChecklist(version.id)}
                          className='green-button'
                        >
                          克隆
                        </button><button onClick={() => handleViewFlowchartClick(checklist.id)} className='green-button'>查看流程图</button>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {tab === 'my' && checklist.can_update && (
                <button onClick={() => handleUpdateClick(checklist.id)} className='green-button'>
                  更新版本
                </button>
              )}
              {tab === 'my' && (
                <><button onClick={() => handleMakeDecisionClick(checklist.id)} className='green-button'>
                  做决定
                </button><button
                  onClick={() => handleDeleteChecklist(checklist.id, true)}
                  style={{ marginLeft: '10px', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    <FontAwesomeIcon icon={faTrash} style={{ color: '#ff4444', fontSize: '1.2rem' }} />
                  </button>
                  <button onClick={() => handleViewFlowchartClick(checklist.id,false)} className='green-button'>查看流程图</button>
                  </>
              )}
              
              {tab === 'platform' && (
                <><button
                  onClick={() => handleCloneChecklist(checklist.id)}
                  className='green-button'
                >
                  克隆
                </button><button onClick={() => handleViewFlowchartClick(checklist.id, true)} className='green-button'>查看流程图</button>
                </>
              )}

            </div>
          </li>
        ))}
      </ul>

      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px auto' }}>
        <button onClick={handlePrevPage} disabled={currentPage === 1} className='green-button'>Previous</button>
        <p style={{ margin: '0 10px', display: 'flex', alignItems: 'center' }}>Page {currentPage} of {totalPages}</p>
        <button onClick={handleNextPage} disabled={currentPage >= totalPages} className='green-button'>Next</button>
      </div>
    </div>
  );
};

export default ChecklistList;
