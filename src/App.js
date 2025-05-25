import './App.css';
import Home from './Home';
import api from './components/api';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, NavDropdown} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import JoinGroupPage from './components/checklist/JoinGroupPage';
import Questionnaire from './components/checklist/Questionnaire';
import AHPAnalysis from './components/ahp/AHPAnalysis';
import PairwiseComparison from './components/ahp/PairwiseComparison';
import ChecklistList from './components/checklist/ChecklistList';
import ChecklistDetail from './components/checklist/ChecklistDetail';
import ChecklistForm from './components/checklist/ChecklistForm';
import ChecklistAnswerHistory from './components/checklist/ChecklistAnswerHistory';
import ChecklistDetails from './components/checklist/ChecklistDetails';
import TodoList from './components/todolist/TodoList';
import ArticleList from './components/article/ArticleList';
import ArticleEditor from './components/article/ArticleEditor';
import ArticleViewer from './components/article/ArticleViewer';
import ReviewEditor from './components/checklist/ReviewEditor';
import FlowchartDetail from './components/checklist/FlowchartDetail';
import BalancedDecisionMaker from './components/balanceddecision/BalancedDecisionMaker';
import BalancedDecisionDetail from './components/balanceddecision/BalancedDecisionDetail';
import BalancedDecisionList from './components/balanceddecision/BalancedDecisionList';
import FactOpinionAnalyzer from './components/factopinion/FactOpinionAnalyzer';
import AnalysisList from './components/factopinion/AnalysisList';
import AnalysisDetail from './components/factopinion/AnalysisDetail';
import AboutUs from './AboutUs';
import FeedbackForm from './components/FeedbackForm';
import MyFeedback from './components/MyFeedback';
import KellyCalculator from './components/KellyCalculator';
import TodoHistory from './components/todolist/TodoHistory';

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
              <Nav.Link as={Link} to="/">首页</Nav.Link>
              <NavDropdown title="平衡决策" id="balanced-decisions-dropdown">
                <NavDropdown.Item as={Link} to="/balanced-decisions" className="nav-dropdown-item">去做平衡决策</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/balanced-decisions/list" className="nav-dropdown-item">平衡决策列表</NavDropdown.Item>
              </NavDropdown>
              <NavDropdown title="决策清单" id="checklists-dropdown">
                <NavDropdown.Item as={Link} to="/checklists" className="nav-dropdown-item">我的决策清单列表</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/checklist-form" className="nav-dropdown-item">新建决策清单</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/history" className="nav-dropdown-item">我做的决定</NavDropdown.Item>
              </NavDropdown>
              <NavDropdown title="文章" id="articles-dropdown">
                <NavDropdown.Item as={Link} to="/articles" className="nav-dropdown-item">文章列表</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/add-article" className="nav-dropdown-item">添加文章</NavDropdown.Item>
              </NavDropdown>
              <NavDropdown title="AHP分析" id="ahp-analysis-dropdown">
                <NavDropdown.Item as={Link} to="/ahp" className="nav-dropdown-item">我做过的AHP分析</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/ahp-add" className="nav-dropdown-item">去做AHP分析</NavDropdown.Item>
              </NavDropdown>
              <NavDropdown title="待办" id="todos-dropdown">
                <Nav.Link as={Link} to="/todos" className="nav-dropdown-item">添加待办事项</Nav.Link>
                <Nav.Link as={Link} to="/history-todos" className="nav-dropdown-item">完成的待办事项</Nav.Link>
              </NavDropdown>

              <Nav.Link as={Link} to="/kelly">凯利计算器</Nav.Link>
              <NavDropdown title="事实-观点" id="argument-evaluator-dropdown">
                <NavDropdown.Item as={Link} to="/argument-evaluator" className="nav-dropdown-item">事实观点分析</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/argument-evaluator-list" className="nav-dropdown-item">事实观点分析列表</NavDropdown.Item>
              </NavDropdown>
              
              <NavDropdown title="更多" id="argument-evaluator-dropdown">
                <NavDropdown.Item as={Link} to="/feedback" className="nav-dropdown-item">反馈</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/myfeedback" className="nav-dropdown-item">我的反馈</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/about-us" className="nav-dropdown-item">关于我们</NavDropdown.Item>
              </NavDropdown>
            </Nav>
            <Nav className="ms-auto">
              {username ? (
                <>
                  <Nav.Link disabled>Welcome, {username}</Nav.Link>
                  <Nav.Link onClick={handleLogout}>退出</Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login">登陆</Nav.Link>
                  <Nav.Link as={Link} to="/register">注册</Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
      
      </Navbar>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage onLogin={setUsername} />} />
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
        <Route path="/history-todos" element={<TodoHistory />} />
        <Route path='/kelly' element={<KellyCalculator />} />
        <Route path="/articles" element={<ArticleList />} />
        <Route path="/add-article" element={<ArticleEditor />} />
        <Route path="/edit-article/:id" element={<ArticleEditor />} />
        <Route path="/view-article/:id" element={<ArticleViewer />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/checklist/:decisionId/review" element={<ReviewEditor />} />
        <Route path="/checklist/flowchart/:checklistId" element={<FlowchartDetail />} />
        <Route path="/argument-evaluator" element={<FactOpinionAnalyzer />} />
        <Route path="/argument-evaluator-list" element={<AnalysisList />} />
        <Route path="/analysis-detail/:id" element={<AnalysisDetail />} />
        <Route path="/feedback" element={<FeedbackForm />} />
        <Route path="/myfeedback" element={<MyFeedback />} />
      </Routes>
    </div>

  );
}

export default App;
