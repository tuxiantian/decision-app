import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ChecklistList = () => {
  const [checklists, setChecklists] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/checklists')
      .then(response => {
        setChecklists(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the checklists!', error);
      });
  }, []);

  const handleUpdateClick = (checklistId) => {
    navigate(`/checklist/update/${checklistId}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2>Checklist List</h2>
      <ul style={{ listStyle: 'none', padding: 0, width: '80%' }}>
        {checklists.map(checklist => (
          <li key={checklist.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #ccc' }}>
            <div>
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
            {checklist.can_update && (
              <button onClick={() => handleUpdateClick(checklist.id)} style={{ backgroundColor: '#007bff', color: 'white', padding: '5px 10px', border: 'none', cursor: 'pointer' }}>Update Version</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChecklistList;