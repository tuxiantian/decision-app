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
import ChecklistUpdate from './components/ChecklistUpdate';
import TodoList from './components/TodoList';
import ArticleList from './components/ArticleList';
import ArticleEditor from './components/ArticleEditor';
import ArticleViewer from './components/ArticleViewer';
import ReviewEditor from './components/ReviewEditor';
import AboutUs from './AboutUs';

function App() {
  return (
    <Router>
      <div className="App">
        <nav style={{
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'center', // 导航栏项居中对齐
          backgroundColor: '#333',  // 导航栏背景颜色
          padding: '10px 0',        // 导航栏内填充
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' // 添加阴影效果
        }}>
          <Link className="nav-link" to="/">Home</Link>
          <Link className="nav-link" to="/articles">Article</Link>
          <Link className="nav-link" to="/checklists">Checklists</Link>
          <Link className="nav-link" to="/history">Answer History</Link>
          <Link className="nav-link" to="/checklist-form">Checklist Form</Link>
          <Link className="nav-link" to="/decisions">Decisions List</Link>
          <Link className="nav-link" to="/question-flow">QuestionFlow</Link>
          <Link className="nav-link" to="/ahp">AHPAnalysis List</Link>
          <Link className="nav-link" to="/todos">Todo List</Link>
          <Link className="nav-link" to="/about-us">AboutUs</Link>
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
          <Route path="/checklist/update/:checklistId" element={<ChecklistUpdate />} />
          <Route path="/todos" element={<TodoList />} />
          <Route path="/articles" element={<ArticleList />} />
          <Route path="/add-article" element={<ArticleEditor />} />
          <Route path="/edit-article/:id" element={<ArticleEditor />} />
          <Route path="/view-article/:id" element={<ArticleViewer />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/checklist/:decisionId/review" element={<ReviewEditor />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


