import './App.css';
import Home from './Home';
import React from 'react';
import { Link } from 'react-router-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import AHPAnalysis from './AHPAnalysis';
import PairwiseComparison from './PairwiseComparison';
import ChecklistList from './components/ChecklistList';
import ChecklistDetail from './components/ChecklistDetail';
import ChecklistForm from './components/ChecklistForm';
import ChecklistAnswerHistory from './components/ChecklistAnswerHistory';
import ChecklistDetails from './components/ChecklistDetails';
import TodoList from './components/TodoList';
import ArticleList from './components/ArticleList';
import ArticleEditor from './components/ArticleEditor';
import ArticleViewer from './components/ArticleViewer';
import ReviewEditor from './components/ReviewEditor';
import FlowchartDetail from './components/FlowchartDetail';
import BalancedDecisionMaker from './components/BalancedDecisionMaker';
import BalancedDecisionDetail from './components/BalancedDecisionDetail';
import BalancedDecisionList from './components/BalancedDecisionList';
import AboutUs from './AboutUs';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar bg="dark" variant="dark" expand="lg" style={{ marginBottom: '20px' }}>
          <Navbar.Brand as={Link} to="/">Dicision App</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <NavDropdown title="Balanced Decisions" id="balanced-decisions-dropdown">
                <NavDropdown.Item as={Link} to="/balanced-decisions"  className="nav-dropdown-item">Balanced Decision Maker</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/balanced-decisions/list"  className="nav-dropdown-item">Balanced Decision List</NavDropdown.Item>
              </NavDropdown>
              <NavDropdown title="Checklists" id="checklists-dropdown">
                <NavDropdown.Item as={Link} to="/checklists"  className="nav-dropdown-item">Checklist List</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/checklist-form"  className="nav-dropdown-item">Checklist Form</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/history"  className="nav-dropdown-item">Answer History</NavDropdown.Item>
              </NavDropdown>
              <NavDropdown title="Articles" id="articles-dropdown">
                <NavDropdown.Item as={Link} to="/articles"  className="nav-dropdown-item">Article List</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/add-article"  className="nav-dropdown-item">Add Article</NavDropdown.Item>
              </NavDropdown>
              <NavDropdown title="AHP Analysis" id="ahp-analysis-dropdown">
                <NavDropdown.Item as={Link} to="/ahp"  className="nav-dropdown-item">AHP Analysis</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/ahp-add"  className="nav-dropdown-item">Add AHP Analysis</NavDropdown.Item>
              </NavDropdown>
              <Nav.Link as={Link} to="/todos">Todo List</Nav.Link>
              <Nav.Link as={Link} to="/about-us">About Us</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/balanced-decisions" element={<BalancedDecisionMaker />} />
          <Route path="/balanced-decisions/list" element={<BalancedDecisionList />} />
          <Route path="/balanced-decisions/:id" element={<BalancedDecisionDetail />} />
          <Route path="/ahp" element={<AHPAnalysis />} />
          <Route path="/ahp-add" element={<PairwiseComparison />} />
          <Route path="/checklist-form" element={<ChecklistForm />} />
          <Route path="/checklists" element={<ChecklistList />} />
          <Route path="/checklist/:checklistId" element={<ChecklistDetail />} />
          <Route path="/history" element={<ChecklistAnswerHistory />} />
          <Route path="/checklist_answers/details/:decisionId" element={<ChecklistDetails />} />
          <Route path="/checklist/update/:checklistId" element={<ChecklistForm />} />
          <Route path="/todos" element={<TodoList />} />
          <Route path="/articles" element={<ArticleList />} />
          <Route path="/add-article" element={<ArticleEditor />} />
          <Route path="/edit-article/:id" element={<ArticleEditor />} />
          <Route path="/view-article/:id" element={<ArticleViewer />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/checklist/:decisionId/review" element={<ReviewEditor />} />
          <Route path="/checklist/flowchart/:checklistId" element={<FlowchartDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
