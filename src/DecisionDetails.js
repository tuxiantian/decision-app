import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const DecisionDetails = () => {
  const { decisionId } = useParams();
  const [decisionDetails, setDecisionDetails] = useState(null);

  const fetchDecisionDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/decision_details/${decisionId}`);
      setDecisionDetails(response.data);
    } catch (error) {
      console.error('Error fetching decision details', error);
    }
  };

  useEffect(() => {
    fetchDecisionDetails();
  }, [decisionId]);

  if (!decisionDetails) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <nav style={{ marginBottom: '20px' }}>
      <Link className="nav-link" to="/">Home</Link>
        <Link  className="nav-link" to="/question-flow">QuestionFlow</Link> | <Link to="/decisions">Decisions List</Link>
      </nav>
      <h2>{decisionDetails.decision_name} - Details</h2>
      <p>Created at: {new Date(decisionDetails.created_at).toLocaleString()}</p>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        {Object.entries(decisionDetails.modules).map(([moduleName, questions], moduleIndex) => (
          <React.Fragment key={moduleName}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: '20px', width: '100%' }}>
              <h3 style={{ width: '100px', marginRight: '10px', flexShrink: 0 }}>{moduleName}</h3>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flexGrow: 1 }}>
                {questions.map((q, index) => (
                  <React.Fragment key={index}>
                    <div style={{ margin: '0 10px', border: '1px solid black', padding: '10px', borderRadius: '5px', textAlign: 'left' }}>
                      <p><strong>Q:{q.question}</strong> </p>
                      <p><strong>A:</strong> {q.answer}</p>
                    </div>
                    {index < questions.length - 1 && <span style={{ margin: '0 5px', alignSelf: 'center' }}>➡️</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
            {moduleIndex < Object.entries(decisionDetails.modules).length - 1 && (
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ marginLeft: '75px' }}>⬇️</span>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default DecisionDetails;