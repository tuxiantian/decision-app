import './App.css';
import Home from './Home';

import React from 'react';
import { Link } from 'react-router-dom';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import QuestionFlow from './QuestionFlow'; 
import DecisionsList from './DecisionsList';
import DecisionDetails from './DecisionDetails';
import AHPAnalysis from './AHPAnalysis';
import DecisionReport from './DecisionReport';
import ChecklistList from './components/ChecklistList';
import ChecklistDetail from './components/ChecklistDetail';
import ChecklistForm from './components/ChecklistForm';
import ChecklistAnswerHistory from './components/ChecklistAnswerHistory';
import ChecklistDetails from './components/ChecklistDetails';

function App() {
  return (
    <Router>
      <div className="App">
      <nav style={{ marginBottom: '20px' }}>
          <Link className="nav-link" to="/">Home</Link>
          <Link className="nav-link" to="/checklists">Checklists</Link>
          <Link className="nav-link" to="/history">Answer History</Link>
          <Link className="nav-link" to="/checklist-form">Checklist Form</Link>
          <Link className="nav-link" to="/decisions">Decisions List</Link>
          <Link  className="nav-link" to="/question-flow">QuestionFlow</Link>
          <Link  className="nav-link" to="/ahp">AHPAnalysis List</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/question-flow" element={<QuestionFlow />} />
          <Route path="/decisions" element={<DecisionsList />} />
          <Route path="/decision/:decisionId" element={<DecisionDetails />} />
          <Route path="/decision-report/:decisionId" element={<DecisionReport />} />
          <Route path="/ahp" element={<AHPAnalysis />} /> 
          <Route path="/checklist-form" element={<ChecklistForm />} />
          <Route path="/checklists" element={<ChecklistList />} />
          <Route path="/checklist/:checklistId" element={<ChecklistDetail />} />
          <Route path="/history" element={<ChecklistAnswerHistory />} />
          <Route path="/checklist_answers/details/:decisionId" element={<ChecklistDetails />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;


