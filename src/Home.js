import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {

  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('.home-section');
      let currentSection = '';

      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= sectionTop - 100) {
          currentSection = section.getAttribute('id');
        }
      });

      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  };

  // 导航项数据
  const navItems = [
    { id: 'checklist', label: '决策清单' },
    { id: 'ahp', label: 'AHP分析' },
    { id: 'articles', label: '知识文章' },
    { id: 'argument', label: '观点分析' },
    { id: 'todos', label: '待办事项' },
    { id: 'balanced', label: '平衡决策' },
    { id: 'inspiration', label: '启发俱乐部' }
  ];


  return (

    <div className="home-container">
      {/* 固定导航栏 */}
      <nav className="sticky-nav">
        <ul>
          {navItems.map(item => (
            <li
              key={item.id}
              className={activeSection === item.id ? 'active' : ''}
              onClick={() => scrollToSection(item.id)}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </nav>
      <header className="home-header">
        <h1>欢迎来到 Decision App</h1>
        <p>通过我们结构化的清单和分析工具，做出明智决策。</p>
      </header>

      <section id="checklist" className="home-section" >
        <h2 >决策清单功能介绍</h2>
        <p className='home-text-paragraph'>
          决策清单是我们 Decision App 的核心功能，帮助用户规划决策过程。在决策清单里面列举了人们在做决定之前要考虑到的重大问题，每当人们要做决定前要按照决策清单中的问题思考一遍，这样能避免人们做出拍脑袋的决定，关键时刻可以避免重大损失。
          它的主要功能包括：
        </p>
        <ul className='home-feature-list'>
          <li><strong>创建和管理决策清单</strong>：用户可以通过简单的表单来创建新的 Checklist，定义决策的名称、描述、以及一系列需要考虑的问题，确保在决策过程中没有遗漏任何关键因素。
          平台会提供一些精选的决策清单(部分来自用户的分享),如果你有需要可以克隆到自己的决策清单列表中。你也可以将自己的决策清单分享出去,平台审核后,会到推荐列表中,这样你的智慧将能够帮助更多的人。</li>
          <li><strong>图文并茂</strong>：借助内置的在线流程图画图工具，用户可以将决策清单里的问题按步骤转换为直观的流程图。在可视化的基础上，用户能更好地理解每一步之间的关系，并进行更合理的决策。</li>
          <li><strong>版本管理和更新</strong>：每个 Checklist 都支持多版本管理。用户可以轻松地创建新的版本、更新现有清单的问题，以适应不断变化的决策需求，同时保留所有历史版本，方便参考和回顾。</li>
          <li><strong>状态检测与决策支持</strong>：在用户每次按照决策清单做决定之前，系统提供决策状态检查工具，帮助用户在最理性和最平静的状态下做出决定。通过逐步检测用户的状态，如是否感到疲惫、当前的情绪等，确保用户在最佳心理状态下做决定。
          同时，用户在按照决策清单做决定回答每个问题的时候，可以引用系统知识库和自己创建的知识库里的思维模型方面的文章来作为支撑自己决策的依据。</li>
          <li><strong>可视化流程与下载</strong>：用户还可以查看并下载决策的流程图，以便在团队会议、项目汇报中展示决策思路。通过这种方式，用户可以轻松地与他人分享决策过程，获得更多的支持和建议。</li>
          <li><strong>邀请朋友决策</strong>：自己按照某个决策清单做出决定后,可以查看决定详情,在那里新建决策组,生成邀请链接,邀请朋友、家人来决策,看他们面对同样的问题是如何考虑的。
          个人看问题常常存在局限性,通过对比自己和家人、朋友的想法能大大减少犯盲人摸象的错误。</li>
          <li><strong>事后复盘功能</strong>：在做出决定后，用户可以添加当初做决定的复盘，记录决策过程中的经验和教训，方便未来参考和改进。</li>
        </ul>
        <p className='home-text-paragraph top-margin'>
          通过 Checklist，用户可以在纷繁复杂的决策中理清思路，系统化地分析各个因素的影响，以最科学的方式达成目标。这不仅是一个工具，更是用户科学决策的有力助手。
        </p>
        <div className='home-button-container'>
          <Link to="/checklists" className="home-link-button" >
            管理决策清单
          </Link>

          <Link to="/checklist-form" className="home-link-button" >
            添加决策清单
          </Link>
        </div>
      </section>


      <section id="ahp" className="home-section" >
        <h2 >AHPAnalysis 功能介绍</h2>
        <p className='home-text-paragraph'>
          AHP分析是一个基于层次分析法（AHP）的工具，用于帮助用户做出多准则和多备选方案的决策。以下是AHP分析工具的主要功能：
        </p>
        <ul className='home-feature-list'>
          <li><strong>新增决策分析</strong>：用户可以通过点击“新增”按钮来创建一个新的决策分析，并添加自定义的决策准则和备选方案。点击生成矩阵按钮,生成准则比较矩阵和单一准则下备选方案比较矩阵。
          将准则两两比较的结果以分数的形式填写到准则比较矩阵表格里,然后再将各个单一准则下备选方案两两比较的结果以分数的形式填写到备选方案比较矩阵里,最后系统将根据用户输入的评分计算出每个备选方案的最终得分,给出最优候选方案，并显示在页面上。
          </li>
          <li><strong>历史决策存档</strong>：完整保存每次分析的过程数据和结果，便于后续参考和管理。</li>
        </ul>
        <p className='home-text-paragraph top-margin'>
          AHP分析帮助用户在同样的准则考量下从多个备选方案里选出最优的方案。
        </p>
        <div className='home-button-container'>
          <Link to="/ahp" className="home-link-button" >
            我做的AHP分析
          </Link>
          <Link to="/ahp-add" className="home-link-button" >
            去做AHP分析
          </Link>
        </div>
      </section>


      <section id="articles" className="home-section" >
        <h2 >Article 模块功能介绍</h2>
        <p className='home-text-paragraph'>
          Article 模块是 Decision App 中的重要组成部分，旨在帮助用户创建、管理和查看与决策相关的文章。这些文章可以作为决策过程中的背景资料、思维框架或知识支撑，帮助用户更全面地了解每一个决策的影响因素。以下是 Article 模块的主要功能：
        </p>
        <ul className='home-feature-list'>
          <li><strong>创建与编辑文章</strong>：用户可以通过 ArticleEditor 页面轻松创建或编辑文章。在编辑过程中，用户可以添加标题、内容、作者、标签和关键字，使每篇文章都能完整描述特定的主题。文章内容支持markdown格式的富文本编辑器，并可以嵌入图片，方便用户图文并茂地阐述决策内容。</li>
          <li><strong>标签与关键字分类</strong>：每篇文章都可以附加标签（如“思维模型”或“认知偏误”）和多个关键字，便于用户根据主题快速搜索相关内容。这些标签和关键字不仅让文章更易于管理，也可以在搜索时提高查找的效率。</li>
          <li><strong>文章列表管理</strong>：在 ArticleList 页面，用户可以查看所有创建的文章。通过搜索框和标签筛选，用户可以迅速找到与特定主题相关的文章。列表页面还支持文章的删除、编辑和查看操作，确保用户能够随时管理自己的知识库。</li>
          <li><strong>跨模块引用与决策支撑</strong>：Article 模块不仅是一个独立的知识管理工具，更是 Decision App 的重要知识支撑部分。用户在使用其他模块（如 Checklist）进行决策时，可以引用 Article 中的内容来支持决策依据，使得每个决策步骤都有详尽的背景资料。</li>
        </ul>
        <p className='home-text-paragraph top-margin'>
          通过这些功能，Article 模块帮助用户建立一个强大的知识库，方便用户在面对复杂决策时，能够依据已有的知识进行深入分析和推理。这不仅提升了决策的科学性和严谨性，也让用户能够更加自信地面对每一个决策挑战。
        </p>
        <div className='home-button-container'>
          <Link to="/articles" className="home-link-button" >
            管理文章
          </Link>
          <Link to="/add-article" className="home-link-button" >
            添加文章
          </Link>
        </div>
      </section>

      {/* 事实、观点分析功能介绍部分 */}
      <section id="argument" className="home-section" >
        <h2>事实、观点分析功能</h2>
        <p style={{ textAlign: 'left', lineHeight: '1.6', color: '#555' }}>
          通过“事实、观点分析”功能，您可以标记和分类不同的事实和观点，并识别潜在的逻辑错误。该功能帮助您更清晰地理解信息的结构和逻辑关系，
          为您的决策提供可靠依据。
        </p>
        <div className='home-button-container'>
          <Link to="/argument-evaluator" className="home-link-button" >去做观点-事实分析</Link>
          <Link to="/argument-evaluator-list" className="home-link-button" >我做的观点-事实分析</Link>
        </div>

      </section>

      <section id="todos" className="home-section" >
        <h2 >TodoList 组件功能介绍</h2>
        <p className='home-text-paragraph'>
          TodoList 组件是一个全面的任务管理工具，帮助用户创建、组织和跟踪待办事项。它具有直观的用户界面，支持多种任务分类和优先级管理。以下是 TodoList 组件的主要功能：
        </p>
        <ul className='home-feature-list'>
          <li><strong>添加新的待办事项</strong>：用户可以轻松添加新的待办事项，并为每个任务设置名称、到期时间、重要性和紧急性。</li>
          <li><strong>任务状态管理</strong>：用户可以标记任务为“已完成”，并将完成的任务从当前待办列表中移除。</li>
          <li><strong>分页浏览完成任务</strong>：支持分页浏览已完成的待办事项，用户可以通过“上一页”和“下一页”按钮在分页中进行切换，快速查找已完成的任务。</li>
          <li><strong>删除任务</strong>：用户可以从待办列表和已完成列表中删除不再需要的任务，保持任务列表整洁。</li>
        </ul>
        <p className='home-text-paragraph top-margin'>
          TodoList 组件通过以上功能，帮助用户系统化地管理日常任务，确保他们能够根据任务的重要性和紧急性进行优先级处理，从而更加有效率地完成任务和管理时间。
        </p>
        <div className='home-button-container'>
          <Link to="/todos" className="home-link-button" >
            待办任务
          </Link>

          <Link to="/history-todos" className="home-link-button" >
            完成的待办事项
          </Link>
        </div>

      </section>

      <section id="balanced" className="home-section" >
        <h2 >平衡决策工具功能介绍</h2>
        <p className='home-text-paragraph'>
          平衡决策工具帮助人们在面临两难选择时，列出有利条件和不利条件，比较条件、排序组合、设置权重，权衡利弊做出最适合自己的理性选择。
          该工具的使用步骤如下：
        </p>
        <ul className='home-feature-list'>
          <li><strong>1添加条件</strong>：用户可以添加正面和负面的条件，描述各种影响决策的因素。</li>
          <li><strong>2条件比较</strong>：系统会自动生成条件的对比组合，用户可以逐对选择哪个条件更重要，以此衡量各个条件的优先级。</li>
          <li><strong>3排序条件</strong>：根据用户的比较结果，对正面和负面的条件进行排序，使得决策过程更清晰。</li>
          <li><strong>4条件分组与赋权</strong>：将正面和负面的条件进行分组，并为每个分组设置权重，帮助用户直观地权衡每个因素的影响力。</li>
          <li><strong>5分组比较与结果计算</strong>：用户对各个分组的影响力进行比较，最终系统将计算得出正面和负面的总得分，以帮助用户明确决策的方向。</li>
          <li><strong>6保存决策</strong>：一旦决策流程完成，用户可以保存整个决策过程，以便后续参考或分享。</li>
        </ul>
        <p className='home-text-paragraph top-margin'>
          平衡决策工具帮助用户在面对复杂选择时，从正反两个方面考虑问题，确保决策更加科学明智。
        </p>
        {/* <img src="/images/balanced_decision_decription.png" alt='BalancedDecisionMaker flowchart' style={{ display: 'block', margin: '20px auto', maxWidth: '100%', height: 'auto' }} /> */}
        <div className='home-button-container'>
          <Link to="/balanced-decisions/list" className="home-link-button" >我做的平衡决策</Link>
          <Link to="/balanced-decisions" className="home-link-button" >去做平衡决策</Link>
        </div>
      </section>

      <section id="inspiration" className="home-section" >
        <h2 >启发俱乐部功能介绍</h2>
        <p className='home-text-paragraph'>
          启发俱乐部是一个知识分享和灵感激发平台，旨在帮助用户收集、整理和分享有价值的启发内容。通过这个功能，用户可以：
        </p>
        <ul className='home-feature-list'>
          <li><strong>记录启发内容</strong>：随时记录来自书籍、文章、对话或生活中的灵感片段，形成个人启发库。</li>
          <li><strong>分类整理</strong>：为每个启发内容添加标签和分类，便于后续检索和回顾。</li>
          <li><strong>添加个人感想</strong>：针对每个启发内容，可以记录自己的理解和应用场景，随时随地记录下自己的灵感。</li>
        </ul>
        <p className='home-text-paragraph top-margin'>
          启发俱乐部不仅是一个记录工具，更是一个促进持续学习和深度思考的平台。通过系统地收集和反思启发内容，用户可以不断扩展认知边界，提升决策质量。
        </p>
        <div className='home-button-container'>
          <Link to="/inspiration" className="home-link-button" >
            查看启发内容
          </Link>
          <Link to="/reflections" className="home-link-button" >
            我的感想
          </Link>
        </div>
      </section>
    </div>

  );
}

export default Home;