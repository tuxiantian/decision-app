import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config.js';
import api from '../api.js';
import '//at.alicdn.com/t/c/font_4955755_wck13l63429.js';
import './ChecklistList.css';


const ChecklistList = () => {
  const [tab, setTab] = useState('my');
  const [myChecklists, setMyChecklists] = useState([]);
  const [platformChecklists, setPlatformChecklists] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 5;
  const navigate = useNavigate();

  // 数据获取函数
  const fetchMyChecklists = async (page) => {
    const response = await api.get(`${API_BASE_URL}/checklists`, {
      params: { page, page_size: pageSize }
    });
    if (response.data) {
      setMyChecklists(response.data.checklists);
      setTotalPages(response.data.total_pages);
    }
  };

  const fetchPlatformChecklists = async (page) => {
    const response = await api.get(`${API_BASE_URL}/platform_checklists`, {
      params: { page, page_size: pageSize }
    });
    if (response.data) {
      setPlatformChecklists(response.data.checklists);
      setTotalPages(response.data.total_pages);
    }
  };

  useEffect(() => {
    if (tab === 'my') fetchMyChecklists(currentPage);
    else fetchPlatformChecklists(currentPage);
  }, [tab, currentPage]);

  // 共用处理函数
  const handleTabChange = (newTab) => {
    setTab(newTab);
    setCurrentPage(1);
  };

  const handleNextPage = () => currentPage < totalPages && setCurrentPage(p => p + 1);
  const handlePrevPage = () => currentPage > 1 && setCurrentPage(p => p - 1);

  // 我的清单相关操作
  const handleShareChecklist = async (checklistId) => {
    try {
      await api.post(`/checklists/${checklistId}/share`);
      alert('Checklist submitted for review successfully!');
      fetchMyChecklists(currentPage);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to share the checklist.');
    }
  };

  const handleDeleteChecklist = async (checklistId, isParent) => {
    if (!window.confirm("Are you sure you want to delete this checklist?")) return;
    try {
      const url = isParent 
        ? `${API_BASE_URL}/checklists/${checklistId}/delete-with-children`
        : `${API_BASE_URL}/checklists/${checklistId}`;
      await api.delete(url);
      fetchMyChecklists(currentPage);
    } catch (error) {
      alert('Failed to delete the checklist.');
    }
  };

  // 平台清单相关操作
  const handleCloneChecklist = async (checklistId) => {
    try {
      await api.post(`${API_BASE_URL}/checklists/clone`, { checklist_id: checklistId });
      alert('Checklist cloned successfully!');
      fetchMyChecklists(currentPage);
    } catch (error) {
      alert('Failed to clone the checklist.');
    }
  };

  // 导航函数
  const navigateTo = {
    update: (id) => navigate(`/checklist/update/${id}`),
    edit: (id) => navigate(`/checklist/edit/${id}`),
    decision: (id) => navigate(`/checklist/${id}`),
    view: (id, isPlatform) => navigate(`/checklist-view/${id}`, { state: { isPlatform } }),
    flowchart: (id, isPlatform) => navigate(`/checklist/flowchart/${id}`, { state: { isPlatform } })
  };

  // 渲染函数
  const renderMyChecklistItem = (checklist) => (
    <li key={checklist.id} className="checklist-item">
      <div className="checklist-info">
        <strong>{checklist.name}</strong>
        <div className="checklist-meta">
          <span>版本: {checklist.version}</span>
          <span className="separator">|</span>
          <span>决定数量: {checklist.decision_count}</span>
          <span className="separator">|</span>
          <span>分享状态: <strong>{getShareStatusText(checklist.share_status)}</strong></span>
        </div>
        {checklist.versions?.length > 0 && (
          <ul className="version-list">
            {checklist.versions.map(version => renderMyVersionItem(version))}
          </ul>
        )}
      </div>
      <div className="checklist-actions">
        {checklist.can_update && (
          <IconButton 
            icon="gengxinbanben" 
            text="更新版本" 
            onClick={() => navigateTo.update(checklist.id)} 
          />
        )}
        <IconButton 
          icon="chakan" 
          text="查看" 
          onClick={() => navigateTo.view(checklist.id, false)} 
        />
        <IconButton 
          icon="bianji" 
          text="编辑" 
          onClick={() => navigateTo.edit(checklist.id)} 
        />
        <IconButton 
          icon="jueding" 
          text="做决定" 
          onClick={() => navigateTo.decision(checklist.id)} 
        />
        {checklist.share_status === 'pending' && (
          <IconButton 
            icon="a-huaban1fuben37" 
            text="分享" 
            onClick={() => handleShareChecklist(checklist.id)} 
          />
        )}
        <IconButton 
          icon="shanchu" 
          text="删除" 
          onClick={() => handleDeleteChecklist(checklist.id, true)} 
        />
        <IconButton 
          icon="liuchengtu" 
          text="流程图" 
          onClick={() => navigateTo.flowchart(checklist.id, false)} 
        />
      </div>
    </li>
  );

  const renderMyVersionItem = (version) => (
    <li key={version.id} className="version-item">
      <div>
        <strong>{version.name}</strong>
        <div className="version-meta">
          <span>版本: {version.version}</span>
          <span className="separator">|</span>
          <span>决定数量: {version.decision_count}</span>
          <span className="separator">|</span>
          <span>分享状态: <strong>{getShareStatusText(version.share_status)}</strong></span>
        </div>
      </div>
      <div className="version-actions">
        {version.share_status === 'pending' && (
          <IconButton 
            icon="a-huaban1fuben37" 
            text="分享" 
            onClick={() => handleShareChecklist(version.id)} 
          />
        )}
        <IconButton 
          icon="shanchu" 
          text="删除" 
          onClick={() => handleDeleteChecklist(version.id, false)} 
        />
        <IconButton 
          icon="chakan" 
          text="查看" 
          onClick={() => navigateTo.view(version.id, false)} 
        />
        <IconButton 
          icon="bianji" 
          text="编辑" 
          onClick={() => navigateTo.edit(version.id)} 
        />
        <IconButton 
          icon="liuchengtu" 
          text="流程图" 
          onClick={() => navigateTo.flowchart(version.id, false)} 
        />
      </div>
    </li>
  );

  const renderPlatformChecklistItem = (checklist) => (
    <li key={checklist.id} className="checklist-item">
      <div className="checklist-info">
        <strong>{checklist.name}</strong>
        <div className="checklist-meta">
          <span>版本: {checklist.version}</span>         
        </div>
        <div>{checklist.description}</div>
        {checklist.versions?.length > 0 && (
          <ul className="version-list">
            {checklist.versions.map(version => renderPlatformVersionItem(version))}
          </ul>
        )}
      </div>
      <div className="checklist-actions">
        <IconButton 
          icon="chakan" 
          text="查看" 
          onClick={() => navigateTo.view(checklist.id, true)} 
        />
        <IconButton 
          icon="kelong" 
          text="克隆" 
          onClick={() => handleCloneChecklist(checklist.id)} 
        />
        <IconButton 
          icon="liuchengtu" 
          text="流程图" 
          onClick={() => navigateTo.flowchart(checklist.id, true)} 
        />
      </div>
    </li>
  );

  const renderPlatformVersionItem = (version) => (
    <li key={version.id} className="version-item">
      <div>
        <strong>{version.name}</strong>
        <div className="version-meta">
          <span>版本: {version.version}</span>
        </div>
      </div>
      <div className="version-actions">
        <IconButton 
          icon="chakan" 
          text="查看" 
          onClick={() => navigateTo.view(version.id, true)} 
        />
        <IconButton 
          icon="kelong" 
          text="克隆" 
          onClick={() => handleCloneChecklist(version.id)} 
        />
        <IconButton 
          icon="liuchengtu" 
          text="流程图" 
          onClick={() => navigateTo.flowchart(version.id, true)} 
        />
      </div>
    </li>
  );

  // 辅助组件
  const IconButton = ({ icon, text, onClick }) => (
    <button onClick={onClick} className="icon-button">
      <div className="icon-tooltip">
        <svg className="icon" aria-hidden="true">
          <use xlinkHref={`#icon-${icon}`}></use>
        </svg>
        <span className="tooltip-text">{text}</span>
      </div>
    </button>
  );

  const getShareStatusText = (status) => {
    return status === 'pending' ? '未分享' :
      status === 'review' ? '审核中' :
      status === 'approved' ? '通过' : '拒绝';
  };

  return (
    <div className="checklist-container">
      <h2>Checklist List</h2>
      <div className="tab-container">
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

      <ul className="checklist-list">
        {tab === 'my' 
          ? myChecklists.map(renderMyChecklistItem)
          : platformChecklists.map(renderPlatformChecklistItem)}
      </ul>

      <div className="pagination-controls">
        <button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={handleNextPage} disabled={currentPage >= totalPages}>Next</button>
      </div>
    </div>
  );
};

export default ChecklistList;