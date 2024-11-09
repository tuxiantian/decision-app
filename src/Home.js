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

      <section className="home-section" style={{ width: '90%', margin: '20px auto', boxSizing: 'border-box', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #ccc' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Checklist 组件功能介绍</h2>
        <p style={{ lineHeight: '1.6', color: '#555', marginBottom: '20px', textAlign: 'left' }}>
          Checklist 是我们 Decision App 的核心功能，帮助用户系统化地规划和执行复杂的决策过程。在决策清单里面列举了人们在做决定之前要考虑到的重大问题，每当人们要做决定前要按照决策清单中的问题思考一遍，这样能避免人们做出临时随性的决定，可以避免重大损失。
          它的主要功能包括：
        </p>
        <ul style={{ lineHeight: '1.8', color: '#555', paddingLeft: '20px', textAlign: 'left' }}>
          <li><strong>创建和管理决策清单</strong>：用户可以通过简单的表单来创建新的 Checklist，定义决策的名称、描述、以及一系列需要考虑的问题，确保在决策过程中没有遗漏任何关键因素。</li>
          <li><strong>对决策清单里的问题生成按步骤决策的流程图</strong>：借助内置的 Mermaid 工具，用户可以将决策清单里的问题按步骤转换为直观的流程图。在可视化的基础上，用户能更好地理解每一步之间的关系，并进行更合理的决策。</li>
          <li><strong>版本管理和更新</strong>：每个 Checklist 都支持多版本管理。用户可以轻松地创建新的版本、更新现有清单的问题，以适应不断变化的决策需求，同时保留所有历史版本，方便参考和回顾。</li>
          <li><strong>状态检测与决策支持</strong>：在用户每次按照决策清单做决定之前，系统提供决策状态检查工具，帮助用户在最理性和最平静的状态下做出决定。通过逐步检测用户的状态，如是否感到疲惫、当前的情绪等，确保用户在最佳心理状态下执行 Checklist。同时，用户在按照决策清单做决定回答每个问题的时候，可以引用系统知识库和自己创建的知识库里的思维模型方面的文章来作为支撑自己决策的依据。</li>
          <li><strong>可视化流程与下载</strong>：用户还可以查看并下载决策的流程图，以便在团队会议、项目汇报中展示决策思路。通过这种方式，用户可以轻松地与他人分享决策过程，获得更多的支持和建议。</li>
          <li><strong>交互和评估</strong>：Checklist 的交互设计友好，用户可以轻松地添加、移除或编辑每个问题。通过对决策清单里的问题的不断调整，用户能够进一步细化决策流程，确保所有重要细节都得到有效考虑。</li>
          <li><strong>事后复盘功能</strong>：在做出决定后，用户可以添加当初做决定的复盘，记录决策过程中的经验和教训，方便未来参考和改进。</li>
        </ul>
        <p style={{ lineHeight: '1.6', color: '#555', marginTop: '20px', textAlign: 'left' }}>
          通过 Checklist，用户可以在纷繁复杂的决策中理清思路，系统化地分析各个因素的影响，以最科学的方式达成目标。这不仅是一个工具，更是用户科学决策的有力助手。
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
          <Link to="/checklists" className="home-link-button" style={{ display: 'block', textAlign: 'center', marginTop: '20px', padding: '10px 20px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
            Manage Checklists
          </Link>

          <Link to="/checklist-form" className="home-link-button" style={{ display: 'block', textAlign: 'center', marginTop: '20px', padding: '10px 20px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
            Add Checklist
          </Link>
        </div>
      </section>


      <section className="home-section" style={{ width: '90%', margin: '20px auto', boxSizing: 'border-box', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #ccc' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>AHPAnalysis 功能介绍</h2>
        <p style={{ lineHeight: '1.6', color: '#555', marginBottom: '20px', textAlign: 'left' }}>
          AHPAnalysis 是一个基于层次分析法（AHP）的工具组件，用于帮助用户系统地做出复杂的多准则决策。该组件提供了用户友好的界面，允许用户添加和比较不同的决策准则和备选方案。以下是 AHPAnalysis 组件的主要功能：
        </p>
        <ul style={{ lineHeight: '1.8', color: '#555', paddingLeft: '20px', textAlign: 'left' }}>
          <li><strong>历史记录管理</strong>：用户可以查看和管理过去的决策分析记录，包括查看详情和删除无用的记录。</li>
          <li><strong>新增决策分析</strong>：用户可以通过点击“新增”按钮来创建一个新的决策分析，并添加自定义的决策准则和备选方案。</li>
          <li><strong>成对比较准则与备选方案</strong>：用户可以对所有准则和备选方案进行成对比较，系统会生成准则的成对比较矩阵，并根据评分衡量每个因素的优先级。</li>
          <li><strong>自动计算和显示结果</strong>：系统将根据用户输入的评分计算出每个备选方案的最终得分，并显示在页面上。</li>
          <li><strong>保存历史</strong>：用户可以将分析结果保存为历史记录，便于后续参考和管理。</li>
        </ul>
        <p style={{ lineHeight: '1.6', color: '#555', marginTop: '20px', textAlign: 'left' }}>
          AHPAnalysis 通过这些功能，帮助用户系统化地分析每个影响因素，确保决策过程科学透明，是一个非常有用的决策辅助工具。
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
          <Link to="/ahp" className="home-link-button" style={{ display: 'block', textAlign: 'center', marginTop: '20px', padding: '10px 20px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
            AHP Analysis
          </Link>
          <Link to="/ahp-add" className="home-link-button" style={{ display: 'block', textAlign: 'center', marginTop: '20px', padding: '10px 20px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
            Add AHP Analysis
          </Link>
        </div>
      </section>


      <section className="home-section" style={{ width: '90%', margin: '20px auto', boxSizing: 'border-box', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #ccc' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Article 模块功能介绍</h2>
        <p style={{ lineHeight: '1.6', color: '#555', marginBottom: '20px', textAlign: 'left' }}>
          Article 模块是 Decision App 中的重要组成部分，旨在帮助用户创建、管理和查看与决策相关的文章。这些文章可以作为决策过程中的背景资料、思维框架或知识支撑，帮助用户更全面地了解每一个决策的影响因素。以下是 Article 模块的主要功能：
        </p>
        <ul style={{ lineHeight: '1.8', color: '#555', paddingLeft: '20px', textAlign: 'left' }}>
          <li><strong>创建与编辑文章</strong>：用户可以通过 ArticleEditor 页面轻松创建或编辑文章。在编辑过程中，用户可以添加标题、内容、作者、标签和关键字，使每篇文章都能完整描述特定的主题。文章内容支持富文本编辑器，并可以嵌入图片，方便用户图文并茂地阐述决策内容。</li>
          <li><strong>标签与关键字分类</strong>：每篇文章都可以附加标签（如“思维模型”或“认知偏误”）和多个关键字，便于用户根据主题快速搜索相关内容。这些标签和关键字不仅让文章更易于管理，也可以在搜索时提高查找的效率。</li>
          <li><strong>文章列表管理</strong>：在 ArticleList 页面，用户可以查看所有创建的文章。通过搜索框和标签筛选，用户可以迅速找到与特定主题相关的文章。列表页面还支持文章的删除、编辑和查看操作，确保用户能够随时管理自己的知识库。</li>
          <li><strong>文章内容展示</strong>：ArticleViewer 模块提供了文章内容的详细展示。用户可以通过点击文章列表中的查看按钮来进入文章详细页面，文章内容以富文本的形式展示。用户能够清晰地浏览文章的每一部分，包括作者、标签和关键字等详细信息。</li>
          <li><strong>文件上传与富文本支持</strong>：文章编辑器支持图片上传功能，用户可以将相关的图示添加到文章中，这些图片通过后端存储在 MinIO 中，并嵌入文章内容里。这让用户的决策依据更加丰富和直观，增强了文章的可读性和说服力。</li>
          <li><strong>跨模块引用与决策支撑</strong>：Article 模块不仅是一个独立的知识管理工具，更是 Decision App 的重要知识支撑部分。用户在使用其他模块（如 Checklist）进行决策时，可以引用 Article 中的内容来支持决策依据，使得每个决策步骤都有详尽的背景资料。</li>
        </ul>
        <p style={{ lineHeight: '1.6', color: '#555', marginTop: '20px', textAlign: 'left' }}>
          通过这些功能，Article 模块帮助用户建立一个强大的知识库，方便用户在面对复杂决策时，能够依据已有的知识进行深入分析和推理。这不仅提升了决策的科学性和严谨性，也让用户能够更加自信地面对每一个决策挑战。
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
          <Link to="/articles" className="home-link-button" style={{ display: 'block', textAlign: 'center', marginTop: '20px', padding: '10px 20px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
            Manage Articles
          </Link>
          <Link to="/add-article" className="home-link-button" style={{ display: 'block', textAlign: 'center', marginTop: '20px', padding: '10px 20px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
            Add Article
          </Link>
        </div>
      </section>

      {/* 事实、观点分析功能介绍部分 */}
      <section className="home-section" style={{ width: '90%', margin: '20px auto', boxSizing: 'border-box', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #ccc' }}>
        <h2>事实、观点分析功能</h2>
        <p>
          通过“事实、观点分析”功能，您可以标记和分类不同的事实和观点，并识别潜在的逻辑错误。该功能帮助您更清晰地理解信息的结构和逻辑关系，
          为您的决策提供可靠依据。
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
          <Link to="/argument-evaluator" className="home-link-button" style={{ display: 'block', textAlign: 'center', marginTop: '20px', padding: '10px 20px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>Do ArgumentEvaluator</Link>
          <Link to="/argument-evaluator-list" className="home-link-button" style={{ display: 'block', textAlign: 'center', marginTop: '20px', padding: '10px 20px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>ArgumentEvaluator List</Link>
        </div>
        
      </section>

      <section className="home-section" style={{ width: '90%', margin: '20px auto', boxSizing: 'border-box', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #ccc' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>TodoList 组件功能介绍</h2>
        <p style={{ lineHeight: '1.6', color: '#555', marginBottom: '20px', textAlign: 'left' }}>
          TodoList 组件是一个全面的任务管理工具，帮助用户组织、创建和跟踪待办事项。它具有直观的用户界面，支持多种任务分类和优先级管理。以下是 TodoList 组件的主要功能：
        </p>
        <ul style={{ lineHeight: '1.8', color: '#555', paddingLeft: '20px', textAlign: 'left' }}>
          <li><strong>添加新的待办事项</strong>：用户可以轻松添加新的待办事项，并为每个任务设置名称、到期时间、重要性和紧急性。</li>
          <li><strong>管理任务的重要性和紧急性</strong>：任务可标记为重要、紧急，或两者皆为，方便用户根据任务的优先级来组织工作。</li>
          <li><strong>任务状态管理</strong>：用户可以标记任务为“已完成”，并将完成的任务从当前待办列表中移除。</li>
          <li><strong>分页浏览完成任务</strong>：支持分页浏览已完成的待办事项，用户可以通过“上一页”和“下一页”按钮在分页中进行切换，快速查找已完成的任务。</li>
          <li><strong>删除任务</strong>：用户可以从待办列表和已完成列表中删除不再需要的任务，保持任务列表整洁。</li>
          <li><strong>实时更新任务列表</strong>：添加、完成、删除任务后，系统会自动刷新任务列表，确保用户总能看到最新的任务状态。</li>
        </ul>
        <p style={{ lineHeight: '1.6', color: '#555', marginTop: '20px', textAlign: 'left' }}>
          TodoList 组件通过以上功能，帮助用户系统化地管理日常任务和目标，确保他们能够根据任务的重要性和紧急性进行优先级处理，从而更加有效率地完成任务和管理时间。
        </p>
        <Link to="/todos" className="home-link-button" style={{ display: 'block', textAlign: 'center', marginTop: '20px', padding: '10px 20px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
          TodoList
        </Link>
      </section>

      <section className="home-section" style={{ width: '90%', margin: '20px auto', boxSizing: 'border-box', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #ccc' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>BalancedDecisionMaker 组件功能介绍</h2>
        <p style={{ lineHeight: '1.6', color: '#555', marginBottom: '20px', textAlign: 'left' }}>
          BalancedDecisionMaker帮助人们在面临两难选择时，列出有利条件和不利条件，比较条件、排序组合、设置权重，权衡利弊做出最适合自己的理性选择。
          该组件的主要功能如下：
        </p>
        <ul style={{ lineHeight: '1.8', color: '#555', paddingLeft: '20px', textAlign: 'left' }}>
          <li><strong>添加条件</strong>：用户可以添加正面和负面的条件，描述各种影响决策的因素。</li>
          <li><strong>条件比较</strong>：系统会自动生成条件的对比组合，用户可以逐对选择哪个条件更重要，以此衡量各个条件的优先级。</li>
          <li><strong>排序条件</strong>：根据用户的比较结果，对正面和负面的条件进行排序，使得决策过程更清晰。</li>
          <li><strong>条件分组与赋权</strong>：将正面和负面的条件进行分组，并为每个分组设置权重，帮助用户直观地权衡每个因素的影响力。</li>
          <li><strong>分组比较与结果计算</strong>：用户对各个分组的影响力进行比较，最终系统将计算得出正面和负面的总得分，以帮助用户明确决策的方向。</li>
          <li><strong>保存决策</strong>：一旦决策流程完成，用户可以保存整个决策过程，以便后续参考或分享。</li>
        </ul>
        <p style={{ lineHeight: '1.6', color: '#555', marginTop: '20px', textAlign: 'left' }}>
          BalancedDecisionMaker 通过这些功能，帮助用户在面对复杂选择时，系统地分析每一个影响因素，确保决策更加科学和公正。
        </p>
        <img src="/images/balanced_decision_decription.png" alt='BalancedDecisionMaker flowchart' style={{ display: 'block', margin: '20px auto', maxWidth: '100%', height: 'auto' }} />
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
          <Link to="/balanced-decisions/list" className="home-link-button" style={{ display: 'block', textAlign: 'center', marginTop: '20px', padding: '10px 20px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>BalancedDecisionList</Link>
          <Link to="/balanced-decisions" className="home-link-button" style={{ display: 'block', textAlign: 'center', marginTop: '20px', padding: '10px 20px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>Balanced Decision Maker</Link>
        </div>
      </section>
    </div>

  );
};

export default Home;