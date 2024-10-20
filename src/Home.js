import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Welcome to Decision App</h1>
        <p>Make informed decisions by using our structured checklist and analysis tools.</p>
      </header>

      <div className="home-content" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }}>
        <section className="home-section" style={{ flex: '1 1 45%', margin: '20px', boxSizing: 'border-box' }}>
          <h2>Get Started with Your Decision</h2>
          <p>Answer guided questions to make the best decision for any situation.</p>
          <Link to="/question-flow" className="home-link-button">Start a New Decision</Link>
        </section>

        <section className="home-section" style={{ flex: '1 1 45%', margin: '20px', boxSizing: 'border-box' }}>
          <h2>View Your Decision History</h2>
          <p>Review the decisions you have made and the thought process behind them.</p>
          <Link to="/history" className="home-link-button">View Decision History</Link>
        </section>

        <section className="home-section" style={{ flex: '1 1 45%', margin: '20px', boxSizing: 'border-box' }}>
          <h2>Create and Manage Your Checklists</h2>
          <p>Customize your decision-making process by creating tailored checklists.</p>
          <Link to="/checklists" className="home-link-button">Manage Checklists</Link>
        </section>

        <section className="home-section" style={{ flex: '1 1 45%', margin: '20px', boxSizing: 'border-box' }}>
          <h2>Analyze Decisions Using AHP</h2>
          <p>Use the Analytical Hierarchy Process (AHP) to evaluate complex decisions systematically.</p>
          <Link to="/ahp" className="home-link-button">AHP Analysis</Link>
        </section>

        <section className="home-section" style={{ flex: '1 1 45%', margin: '20px', boxSizing: 'border-box' }}>
          <h2>Create and Manage Your Articles</h2>
          <p>Customize your decision-making process by creating tailored articles.</p>
          <Link to="/articles" className="home-link-button">Manage Articles</Link>
        </section>

        <section className="home-section" style={{ flex: '1 1 45%', margin: '20px', boxSizing: 'border-box' }}>
          <h2>Create and Manage Your TodoList</h2>
          <p>Customize your decision-making process by creating tailored todos.</p>
          <Link to="/todos" className="home-link-button">TodoList</Link>
        </section>

        <section className="home-section" style={{ flex: '1 1 45%', margin: '20px', boxSizing: 'border-box', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #ccc' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>BalancedDecisionMaker 组件功能介绍</h2>
          <p style={{ lineHeight: '1.6', color: '#555', marginBottom: '20px',textAlign:'left' }}>
            BalancedDecisionMaker 是一个帮助用户进行系统化决策的工具。它通过提供多步骤的决策制定流程，帮助用户评估不同条件的优缺点，以便做出更合理、更平衡的选择。该组件的主要功能如下：
          </p>
          <ul style={{ lineHeight: '1.8', color: '#555', paddingLeft: '20px',textAlign:'left' }}>
            <li><strong>添加条件</strong>：用户可以添加正面和负面的条件，描述各种影响决策的因素。</li>
            <li><strong>条件比较</strong>：系统会自动生成条件的对比组合，用户可以逐对选择哪个条件更重要，以此衡量各个条件的优先级。</li>
            <li><strong>排序条件</strong>：根据用户的比较结果，对正面和负面的条件进行排序，使得决策过程更清晰。</li>
            <li><strong>条件分组与赋权</strong>：将正面和负面的条件进行分组，并为每个分组设置权重，帮助用户直观地权衡每个因素的影响力。</li>
            <li><strong>分组比较与结果计算</strong>：用户对各个分组的影响力进行比较，最终系统将计算得出正面和负面的总得分，以帮助用户明确决策的方向。</li>
            <li><strong>保存决策</strong>：一旦决策流程完成，用户可以保存整个决策过程，以便后续参考或分享。</li>
          </ul>
          <p style={{ lineHeight: '1.6', color: '#555', marginTop: '20px',textAlign:'left' }}>
            BalancedDecisionMaker 通过这些功能，帮助用户在面对复杂选择时，系统地分析每一个影响因素，确保决策更加科学和公正。
          </p>
          <img src="/images/balanced_decision_decription.png" alt='BalancedDecisionMaker flowchart' style={{ display: 'block', margin: '20px auto', maxWidth: '100%', height: 'auto' }} />
          <Link to="/balanced-decisions/list" className="home-link-button" style={{ display: 'block', textAlign: 'center', marginTop: '20px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>BalancedDecisionList</Link>
        </section>
      </div>
    </div>
  );
};

export default Home;