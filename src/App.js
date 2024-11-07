import './App.css';
import Home from './Home';
import api from './components/api'; 
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes,Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import JoinGroupPage from './components/JoinGroupPage';
import Questionnaire from './components/Questionnaire';
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
import FactOpinionAnalyzer from './components/FactOpinionAnalyzer';
import AboutUs from './AboutUs';

function App() {
  const [username, setUsername] = useState(null); // 存储用户名
  const navigate = useNavigate();

  useEffect(() => {
    // 检查用户登录状态，获取用户名
    const fetchUserInfo = async () => {
      try {
        const response = await api.get('/profile'); // 假设此端点返回用户信息
        setUsername(response.data.username);
        localStorage.setItem('username', response.data.username); // 同步用户名到 localStorage
      } catch (error) {
        console.log("用户未登录");
      }
    };
    // 如果 localStorage 中没有用户名，则重新获取
    if (!username) {
      fetchUserInfo();
    }
  }, []);

  // 处理用户退出逻辑
  const handleLogout = async () => {
    try {
      await api.post('/logout'); // 假设此端点处理退出逻辑
      setUsername(null); // 清除用户名状态
      localStorage.removeItem('username'); // 清除 localStorage 中的用户名
      navigate('/login'); // 跳转到登录页面
    } catch (error) {
      console.log("退出失败", error);
    }
  };

  return (
   
      <div className="App">
        <Navbar bg="dark" variant="dark" expand="lg" style={{ marginBottom: '20px' }}>
          <Navbar.Brand as={Link} to="/">Dicision App</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <NavDropdown title="Balanced Decisions" id="balanced-decisions-dropdown">
                <NavDropdown.Item as={Link} to="/balanced-decisions" className="nav-dropdown-item">Balanced Decision Maker</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/balanced-decisions/list" className="nav-dropdown-item">Balanced Decision List</NavDropdown.Item>
              </NavDropdown>
              <NavDropdown title="Checklists" id="checklists-dropdown">
                <NavDropdown.Item as={Link} to="/checklists" className="nav-dropdown-item">Checklist List</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/checklist-form" className="nav-dropdown-item">Checklist Form</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/history" className="nav-dropdown-item">Answer History</NavDropdown.Item>
              </NavDropdown>
              <NavDropdown title="Articles" id="articles-dropdown">
                <NavDropdown.Item as={Link} to="/articles" className="nav-dropdown-item">Article List</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/add-article" className="nav-dropdown-item">Add Article</NavDropdown.Item>
              </NavDropdown>
              <NavDropdown title="AHP Analysis" id="ahp-analysis-dropdown">
                <NavDropdown.Item as={Link} to="/ahp" className="nav-dropdown-item">AHP Analysis</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/ahp-add" className="nav-dropdown-item">Add AHP Analysis</NavDropdown.Item>
              </NavDropdown>
              <Nav.Link as={Link} to="/todos">Todo List</Nav.Link>
              <Nav.Link as={Link} to="/argument-evaluator">ArgumentEvaluator</Nav.Link>
              <Nav.Link as={Link} to="/about-us">About Us</Nav.Link>
            </Nav>
            <Nav className="ms-auto">
              {username ? (
                <>
                  <Nav.Link disabled>Welcome, {username}</Nav.Link>
                  <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login">Login</Nav.Link>
                  <Nav.Link as={Link} to="/register">Register</Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <Routes>
         
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage  onLogin={setUsername} />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/join-group/:groupId" element={<JoinGroupPage />} />
            <Route path="/questionnaire/:decisionId" element={<Questionnaire />} />
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
            <Route path="/argument-evaluator" element={<FactOpinionAnalyzer />} />
        </Routes>
      </div>
    
  );
}

export default App;
