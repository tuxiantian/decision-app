import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>Welcome to Decision App</h1>
      <p>Make better decisions with structured guidance and analysis tools.</p>
      
      <div style={{ margin: '30px 0', display: 'flex', justifyContent: 'center', gap: '20px' }}>
        {/* 新建决策按钮 */}
        <Link to="/question-flow" style={buttonStyle}>
          <div style={{ ...iconStyle, backgroundColor: '#3498db' }}>📝</div>
          <span>Start New Decision</span>
        </Link>

        {/* 查看决策列表按钮 */}
        <Link to="/decisions" style={buttonStyle}>
          <div style={{ ...iconStyle, backgroundColor: '#2ecc71' }}>📋</div>
          <span>View Saved Decisions</span>
        </Link>

        {/* AHP工具按钮 */}
        <Link to="/ahp" style={buttonStyle}>
          <div style={{ ...iconStyle, backgroundColor: '#e67e22' }}>⚖️</div>
          <span>AHP Analysis</span>
        </Link>
      </div>

      <footer style={{ marginTop: '40px' }}>
        <p>&copy; 2024 Decision App. Helping you make informed decisions.</p>
      </footer>
    </div>
  );
};

// 通用样式
const buttonStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textDecoration: 'none',
  padding: '20px',
  width: '150px',
  borderRadius: '8px',
  boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
  transition: 'transform 0.2s',
  color: '#333',
};

const iconStyle = {
  width: '60px',
  height: '60px',
  marginBottom: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  color: 'white',
  fontSize: '2rem',
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
};

export default Home;
