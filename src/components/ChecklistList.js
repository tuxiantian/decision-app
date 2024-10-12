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

  const handleUpdateVersion = (checklistId) => {
    navigate(`/checklist/update/${checklistId}`);
  };

  return (
    <div>
      <h2>Checklists</h2>
      <ul className="no-bullets">
        {checklists.map(checklist => (
          <li key={checklist.id} style={{ marginBottom: '10px' }}>
            <Link to={`/checklist/${checklist.id}`}>{checklist.name} - Version {checklist.version}</Link>
            <button onClick={() => handleUpdateVersion(checklist.id)} style={{ marginLeft: '10px' }}>Update Version</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChecklistList;