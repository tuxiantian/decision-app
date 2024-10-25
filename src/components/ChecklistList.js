import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const ChecklistList = () => {
  const [checklists, setChecklists] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 5;
  const navigate = useNavigate();

  const fetchChecklists = async (page) => {
    const response = await axios.get(`${API_BASE_URL}/checklists`, {
      params: {
        page: page,
        page_size: pageSize
      }
    });

    if (response.data) {
      const { checklists, total_pages } = response.data;
      setChecklists(checklists);
      setTotalPages(total_pages);
    }
  }

  useEffect(() => {
    fetchChecklists(currentPage);
  }, [currentPage]);

  const handleUpdateClick = (checklistId) => {
    navigate(`/checklist/update/${checklistId}`);
  };

  const handleMakeDecisionClick = (checklistId) => {
    navigate(`/checklist/${checklistId}`);
  };

  const handleViewFlowchartClick = (checklistId) => {
    navigate(`/checklist/flowchart/${checklistId}`);
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
      <ul style={{ listStyle: 'none', padding: 0, width: '80%' }}>
        {checklists.map(checklist => (
          <li key={checklist.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #ccc' }}>
            <div style={{textAlign:'left',maxWidth:'600px'}}>
              <strong>{checklist.name}</strong> - Version: {checklist.version}
              <div>{checklist.description}</div>
              {checklist.versions && checklist.versions.length > 0 && (
                <ul style={{ marginLeft: '20px', listStyle: 'circle' }}>
                  {checklist.versions.map(version => (
                    <li key={version.id} style={{ marginBottom: '5px' }}>
                      <strong>{version.name}</strong> - Version: {version.version}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {checklist.can_update && (
                <button onClick={() => handleUpdateClick(checklist.id)} className='green-button'>Update Version</button>
              )}
              <button onClick={() => handleMakeDecisionClick(checklist.id)} className='green-button'>Make Decision</button>
              <button onClick={() => handleViewFlowchartClick(checklist.id)} className='green-button'>View Flowchart</button>
            </div>
          </li>
        ))}
      </ul>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        <button onClick={handlePrevPage} disabled={currentPage === 1} className='green-button'>Previous</button>
        <p>Page {currentPage} of {totalPages}</p>
        <button onClick={handleNextPage} disabled={currentPage >= totalPages} className='green-button'>Next</button>
      </div>
    </div>
  );
};

export default ChecklistList;
