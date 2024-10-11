import './App.css';
import Home from './Home';

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import QuestionFlow from './QuestionFlow'; 
import DecisionsList from './DecisionsList';
import DecisionDetails from './DecisionDetails';
import AHPAnalysis from './AHPAnalysis';
import DecisionReport from './DecisionReport';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/question-flow" element={<QuestionFlow />} />
          <Route path="/decisions" element={<DecisionsList />} />
          <Route path="/decision/:decisionId" element={<DecisionDetails />} />
          <Route path="/decision-report/:decisionId" element={<DecisionReport />} />
          <Route path="/ahp" element={<AHPAnalysis />} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;


