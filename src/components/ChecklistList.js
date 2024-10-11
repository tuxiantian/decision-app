import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ChecklistList = () => {
  const [checklists, setChecklists] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/checklists')
      .then(response => {
        setChecklists(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the checklists!', error);
      });
  }, []);

  return (
    <div>
      <h2>Checklists</h2>
      <ul className="no-bullets">
        {checklists.map(checklist => (
          <li key={checklist.id}>
            <Link to={`/checklist/${checklist.id}`}>{checklist.name} - Version {checklist.version}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChecklistList;
