import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config.js';
import api from '../api.js'
import '//at.alicdn.com/t/c/font_4955755_wck13l63429.js';
import '../../App.css';

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

  const handleShareChecklist = async (checklistId) => {
    try {
      await api.post(`/checklists/${checklistId}/share`);
      alert('Checklist submitted for review successfully!');
      fetchMyChecklists(currentPage);
    } catch (error) {
      console.error('Error sharing checklist:', error);
      alert(error.response?.data?.error || 'Failed to share the checklist.');
    }
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setCurrentPage(1); // 切换标签时重置页码
  };

  const handleUpdateClick = (checklistId) => {
    navigate(`/checklist/update/${checklistId}`);
  };

  const handleEditClick = (checklistId) => {
    navigate(`/checklist/edit/${checklistId}`);
  };

  const handleMakeDecisionClick = (checklistId) => {
    navigate(`/checklist/${checklistId}`);
  };

  const handleViewClick = (checklistId, isPlatform) => {
    navigate(`/checklist-view/${checklistId}`, { state: { isPlatform } });
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
          Recommended
        </button>
      </div>

      <ul style={{ listStyle: 'none', padding: 0, width: '80%' }}>
        {(tab === 'my' ? myChecklists : platformChecklists).map(checklist => (
          <li key={checklist.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #ccc' }}>
            <div style={{ textAlign: 'left', maxWidth: '600px' }}>
              <strong>{checklist.name}</strong> - Version: {checklist.version} -Decision Count: {checklist.decision_count}
              {/* 新增分享状态显示 */}
              {tab === 'my' && (
                <>
                  -Status:  <strong>
                    {checklist.share_status === 'pending' ? 'Not Shared' :
                      checklist.share_status === 'review' ? 'Under Review' :
                        checklist.share_status === 'approved' ? 'Approved' : 'Rejected'}</strong>
                </>
              )}
              <div>{checklist.description}</div>
              {checklist.versions && checklist.versions.length > 0 && (
                <ul style={{ marginLeft: '20px', listStyle: 'circle' }}>
                  {checklist.versions.map(version => (
                    <li key={version.id} style={{ marginBottom: '5px' }}>
                      <strong>{version.name}</strong> - Version: {version.version} -Decision Count: {checklist.decision_count}
                      {tab === 'my' && (
                        <>
                          {checklist.share_status === 'pending' && (
                            <button
                              onClick={() => handleShareChecklist(checklist.id)}
                              className='icon-button'
                            >
                              <div className="icon-tooltip">
                                <svg className="icon" aria-hidden="true">
                                  <use xlinkHref="#icon-a-huaban1fuben37"></use>
                                </svg>
                                <span className="tooltip-text">分享</span>

                              </div>
                            </button>

                          )}
                          <button
                            onClick={() => handleDeleteChecklist(version.id, false)}
                            className='icon-button'
                          >
                            <div className="icon-tooltip">
                              <svg className="icon" aria-hidden="true">
                                <use xlinkHref="#icon-shanchu"></use>
                              </svg>
                              <span className="tooltip-text">删除</span>

                            </div>
                          </button>
                          <button onClick={() => handleViewClick(checklist.id, false)} className='icon-button'>
                            <div className="icon-tooltip">
                              <svg className="icon" aria-hidden="true">
                                <use xlinkHref="#icon-chakan"></use>
                              </svg>
                              <span className="tooltip-text">查看</span>
                            </div></button>
                          <button onClick={() => handleViewFlowchartClick(checklist.id, false)} className='icon-button'>
                            <div className="icon-tooltip">
                              <svg className="icon" aria-hidden="true" aria-label='流程图' title="流程图">
                                <use xlinkHref="#icon-liuchengtu"></use>
                              </svg>
                              <span className="tooltip-text">流程图</span>
                            </div>
                          </button>
                        </>
                      )}



                      {tab === 'platform' && (
                        <>
                          <button onClick={() => handleViewClick(checklist.id, true)} className='icon-button'>
                            <div className="icon-tooltip">
                              <svg className="icon" aria-hidden="true">
                                <use xlinkHref="#icon-chakan"></use>
                              </svg>
                              <span className="tooltip-text">查看</span>
                            </div>

                          </button>

                          <button
                            onClick={() => handleCloneChecklist(version.id)}
                            className='icon-button'
                          >
                            <div className="icon-tooltip">
                              <svg className="icon" aria-hidden="true" aria-label='克隆' title="克隆">
                                <use xlinkHref="#icon-kelong"></use>
                              </svg>
                              <span className="tooltip-text">克隆</span>
                            </div>
                          </button>
                          <button onClick={() => handleViewFlowchartClick(checklist.id, true)} className='icon-button'>
                            <div className="icon-tooltip">
                              <svg className="icon" aria-hidden="true" aria-label='流程图' title="流程图">
                                <use xlinkHref="#icon-liuchengtu"></use>
                              </svg>
                              <span className="tooltip-text">流程图</span>
                            </div>
                          </button>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {tab === 'my' && checklist.can_update && (
                <button onClick={() => handleUpdateClick(checklist.id)} className='icon-button'>
                  <div className="icon-tooltip">
                    <svg className="icon" aria-hidden="true">
                      <use xlinkHref="#icon-gengxinbanben"></use>
                    </svg>
                    <span className="tooltip-text">更新版本</span>
                  </div>
                </button>
              )}
              {tab === 'my' && (
                <>
                  <button onClick={() => handleViewClick(checklist.id, false)} className='icon-button'>
                    <div className="icon-tooltip">
                      <svg className="icon" aria-hidden="true">
                        <use xlinkHref="#icon-chakan"></use>
                      </svg>
                      <span className="tooltip-text">查看</span>
                    </div>
                  </button>
                  <button onClick={() => handleEditClick(checklist.id, false)} className='icon-button'>
                    <div className="icon-tooltip">
                      <svg className="icon" aria-hidden="true">
                        <use xlinkHref="#icon-bianji"></use>
                      </svg>
                      <span className="tooltip-text">编辑</span>
                    </div>
                  </button>
                  <button onClick={() => handleMakeDecisionClick(checklist.id)} className='icon-button'>
                    <div className="icon-tooltip">
                      <svg className="icon" aria-hidden="true">
                        <use xlinkHref="#icon-jueding"></use>
                      </svg>
                      <span className="tooltip-text">做决定</span>

                    </div>
                  </button>
                  {checklist.share_status === 'pending' && (
                    <button
                      onClick={() => handleShareChecklist(checklist.id)}
                      className='icon-button'
                    >
                      <div className="icon-tooltip">
                        <svg className="icon" aria-hidden="true">
                          <use xlinkHref="#icon-a-huaban1fuben37"></use>
                        </svg>
                        <span className="tooltip-text">分享</span>

                      </div>
                    </button>

                  )}
                  <button
                    onClick={() => handleDeleteChecklist(checklist.id, true)}
                    className='icon-button'
                  >
                    <div className="icon-tooltip">
                      <svg className="icon" aria-hidden="true">
                        <use xlinkHref="#icon-shanchu"></use>
                      </svg>
                      <span className="tooltip-text">删除</span>

                    </div>
                  </button>
                  <button onClick={() => handleViewFlowchartClick(checklist.id, false)} className='icon-button'>
                    <div className="icon-tooltip">
                      <svg className="icon" aria-hidden="true" aria-label='流程图' title="流程图">
                        <use xlinkHref="#icon-liuchengtu"></use>
                      </svg>
                      <span className="tooltip-text">流程图</span>
                    </div>
                  </button>
                </>
              )}

              {tab === 'platform' && (
                <>
                  <button onClick={() => handleViewClick(checklist.id, true)} className='icon-button'>
                    <div className="icon-tooltip">
                      <svg className="icon" aria-hidden="true">
                        <use xlinkHref="#icon-chakan"></use>
                      </svg>
                      <span className="tooltip-text">查看</span>
                    </div>

                  </button>
                  <button
                    onClick={() => handleCloneChecklist(checklist.id)}
                    className='icon-button'
                  >
                    <div className="icon-tooltip">
                      <svg className="icon" aria-hidden="true" aria-label='克隆' title="克隆">
                        <use xlinkHref="#icon-kelong"></use>
                      </svg>
                      <span className="tooltip-text">克隆</span>
                    </div>
                  </button>
                  <button onClick={() => handleViewFlowchartClick(checklist.id, true)} className='icon-button'>
                    <div className="icon-tooltip">
                      <svg className="icon" aria-hidden="true" aria-label='流程图' title="流程图">
                        <use xlinkHref="#icon-liuchengtu"></use>
                      </svg>
                      <span className="tooltip-text">流程图</span>
                    </div>
                  </button>
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
    </div >
  );
};

export default ChecklistList;
