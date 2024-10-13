import React from 'react';
import './AboutUs.css'; // 可以单独创建一个 CSS 文件，控制页面样式
import { type } from '@testing-library/user-event/dist/type';

const AboutUs = () => {
  return (
    <div className="about-us-container">
      <h1>Decision App - 让决策更科学、更智慧！</h1>
      <p>
        你是否曾为重要的决定而犹豫不决？是否渴望拥有一种工具，帮助你从多角度评估所有可能的选项？Decision App 为你提供一站式的决策辅助平台，帮助你从容应对每一个关键决策。
      </p>
      
      <h2>主要功能</h2>
      <ul>
        <li><strong>思维模型与认知偏误文章管理</strong>：提供丰富的思维模型和认知偏误文章库，助你做出明智的决策。</li>
        <li><strong>待办事项与四象限管理</strong>：通过四象限管理待办事项，轻松掌握优先级。</li>
        <li><strong>引用思维模型助力决策</strong>：引用相关的思维模型支持你的决策，结合理论与实践。</li>
        <li><strong>决策历史与回顾</strong>：保存每一次决策的过程，方便回顾和总结经验。</li>
        <li><strong>多人协作与讨论</strong>：支持团队协作，做出科学的团队决策。</li>
        <li><strong>搜索与个性化文章管理</strong>：关键词搜索与分页浏览，快速获取决策所需的信息。</li>
      </ul>

      <h2>为什么选择 Decision App？</h2>
      <p>科学理论加持，轻松管理待办事项，支持学习与成长。我们的应用界面简洁，功能实用，让你专注于核心的决策任务。</p>

      <h2>来体验一下吧！</h2>
      <p>无论是日常生活中的选择，还是工作中的复杂决策，Decision App 都能为你提供强大的支持。立即加入，开启更高效、更智慧的决策之旅！</p>
    </div>
  );
};

export default AboutUs;
