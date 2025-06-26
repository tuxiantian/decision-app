import './App.css';
import Home from './Home';
import api from './components/api';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import CustomMenu from './CustomMenu';

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
import DecisionDetails from './components/checklist/DecisionDetails';
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
import InspirationClub from './components/inspiration/InspirationClub';
import MyReflections from './components/inspiration/MyReflections';
import FlowTest from './components/checklist/FlowTest';
import MermaidTool from './components/checklist/MermaidTool';
import LandingPage from './LandingPage';
import ChecklistView from './components/checklist/ChecklistView';
import ChecklistEditor from './components/checklist/ChecklistEditor';
import InvitedDecisionDetails from './components/checklist/InvitedDecisionDetails';

function App() {
  const [username, setUsername] = useState(null); // 存储用户名
  const navigate = useNavigate();

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

  // 定义菜单结构
  const menuItems = [
    {
      title: '首页',
      path: '/home'
    }, {
      title: '流程图',
      path: '/flow'
    },
    {
      title: '平衡决策',
      children: [
        {
          title: '去做平衡决策',
          path: '/balanced-decisions'
        },
        {
          title: '平衡决策列表',
          path: '/balanced-decisions/list'
        }
      ]
    },
    {
      title: '决策清单',
      children: [
        {
          title: '我的决策清单列表',
          path: '/checklists'
        },
        {
          title: '新建决策清单',
          path: '/checklist-form'
        },
        {
          title: '我做的决定',
          path: '/history'
        }
      ]
    },
    {
      title: '文章',
      children: [
        {
          title: '文章列表',
          path: '/articles'
        },
        {
          title: '添加文章',
          path: '/add-article'
        }
      ]
    },
    {
      title: 'AHP分析',
      children: [
        {
          title: '我做过的AHP分析',
          path: '/ahp'
        },
        {
          title: '去做AHP分析',
          path: '/ahp-add'
        }
      ]
    },
    {
      title: '待办',
      children: [
        {
          title: '待办事项',
          path: '/todos'
        },
        {
          title: '完成的待办事项',
          path: '/history-todos'
        }
      ]
    },

    {
      title: '启发',
      children: [
        {
          title: '启发俱乐部',
          path: '/inspiration'
        },
        {
          title: '我的感想',
          path: '/reflections'
        }
      ]
    },
    {
      title: '更多',
      children: [
        {
          title: '事实-观点',
          children: [
            {
              title: '事实观点分析',
              path: '/argument-evaluator'
            },
            {
              title: '事实观点分析列表',
              path: '/argument-evaluator-list'
            }
          ]
        }, {
          title: '凯利计算器',
          path: '/kelly'
        }, {
          title: 'mermaid画图',
          path: '/mermaid'
        },
        {
          title: '反馈',
          path: '/feedback'
        },
        {
          title: '我的反馈',
          path: '/myfeedback'
        },
        {
          title: '关于我们',
          path: '/about-us'
        }
      ]
    }
  ];

  // useEffect(() => {
  //   // 检查用户登录状态，获取用户名
  //   const fetchUserInfo = async () => {
  //     try {
  //       const response = await api.get('/profile'); // 假设此端点返回用户信息
  //       setUsername(response.data.username);
  //       localStorage.setItem('username', response.data.username); // 同步用户名到 localStorage
  //     } catch (error) {
  //       console.log("用户未登录");
  //     }
  //   };
  //   // 如果 localStorage 中没有用户名，则重新获取
  //   if (!username) {
  //     fetchUserInfo();
  //   }
  // }, []);

  function PrivateLayout({ username, onLogout, menuItems }) {
    const navigate = useNavigate();

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const response = await api.get('/profile'); // 假设此端点返回用户信息
          setUsername(response.data.username);
          localStorage.setItem('username', response.data.username); // 同步用户名到 localStorage
        } catch (error) {
          navigate('/login'); // 未登录时跳转
        }
      };
      checkAuth();
    }, [navigate]);

    return (
      <>
        <CustomMenu menuItems={menuItems} username={username} onLogout={onLogout} />
        <Routes>
          {/* 所有需要登录的页面路由 */}
          <Route path="/flow" element={<FlowTest />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path='/kelly' element={<KellyCalculator />} />
          <Route path='/mermaid' element={<MermaidTool />} />
          <Route path="/about-us" element={<AboutUs />} />

          <Route path="/join-group/:groupId" element={<JoinGroupPage />} />
          <Route path="/questionnaire/:decisionId" element={<Questionnaire />} />
          <Route path="/balanced-decisions" element={<BalancedDecisionMaker />} />
          <Route path="/balanced-decisions/list" element={<BalancedDecisionList />} />
          <Route path="/balanced-decisions/:id" element={<BalancedDecisionDetail />} />
          <Route path="/ahp" element={<AHPAnalysis />} />
          <Route path="/ahp-add" element={<PairwiseComparison />} />
          <Route path="/checklist-form" element={<ChecklistForm />} />
          <Route path="/checklist-view/:checklistId" element={<ChecklistView />} />
          <Route path="/checklists" element={<ChecklistList />} />
          <Route path="/checklist/:checklistId" element={<ChecklistDetail />} />
          <Route path="/checklist/edit/:checklistId" element={<ChecklistEditor />} />
          <Route path='/invited_checklist_answers/details/:decisionId' element={<InvitedDecisionDetails/>}/>
          <Route path="/history" element={<ChecklistAnswerHistory />} />
          <Route path="/checklist_answers/details/:decisionId" element={<DecisionDetails />} />
          <Route path="/checklist/update/:checklistId" element={<ChecklistForm />} />
          <Route path="/todos" element={<TodoList />} />
          <Route path="/history-todos" element={<TodoHistory />} />
          <Route path='/inspiration' element={<InspirationClub />} />
          <Route path='/reflections' element={<MyReflections />} />
          <Route path="/articles" element={<ArticleList />} />
          <Route path="/add-article" element={<ArticleEditor />} />
          <Route path="/edit-article/:id" element={<ArticleEditor />} />
          <Route path="/view-article/:source/:id" element={<ArticleViewer />} />
          <Route path="/checklist/:decisionId/review" element={<ReviewEditor />} />
          <Route path="/checklist/flowchart/:checklistId" element={<FlowchartDetail />} />
          <Route path="/argument-evaluator" element={<FactOpinionAnalyzer />} />
          <Route path="/argument-evaluator-list" element={<AnalysisList />} />
          <Route path="/analysis-detail/:id" element={<AnalysisDetail />} />
          <Route path="/feedback" element={<FeedbackForm />} />
          <Route path="/myfeedback" element={<MyFeedback />} />
        </Routes>
      </>
    );
  }

  return (

    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage onLogin={setUsername} />} />
        <Route path="/home" element={<Home />} />

        {/* 需要登录的私有页面 */}
        <Route path="/*" element={
          <PrivateLayout username={username} onLogout={handleLogout} menuItems={menuItems} />
        } />
      </Routes>

    </div>

  );
}

export default App;
