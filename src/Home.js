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
      </div>
    </div>
  );
};

export default Home;