import React, { useEffect, useState } from 'react';
import mermaid from 'mermaid';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const FlowchartDetail = () => {
  const { checklistId } = useParams(); // 获取 checklistId 参数
  const [checklist, setChecklist] = useState(null);

  useEffect(() => {
    // 获取清单详情，包括流程图代码
    const fetchChecklist = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/checklists/${checklistId}`);
        setChecklist(response.data);
      } catch (error) {
        console.error('Error fetching checklist:', error);
      }
    };

    fetchChecklist();
  }, [checklistId]);

  useEffect(() => {
    // 在页面元素加载后延迟执行 mermaid 的渲染
    if (checklist && checklist.mermaid_code) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        flowchart: { curve: 'linear' },
        securityLevel: 'loose',
      });

      try {
        // 确保 DOM 元素加载完成后，调用 mermaid 的渲染函数
        mermaid.run();

      } catch (e) {
        console.error('Mermaid rendering error:', e);
      }
    }
  }, [checklist]);

  if (!checklist) {
    return <div>Loading flowchart...</div>;
  }

  return (
    <div className="flowchart-detail" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '20px' }}>
      <h2>{checklist.name} - Flowchart</h2>
      {checklist.mermaid_code && (
        <div
          id="mermaid-flowchart"
          className="mermaid"
          style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '5px', marginTop: '20px' }}
        >
          {checklist.mermaid_code}
        </div>
      )}
      <nav style={{ marginTop: '20px' }}>
        <Link
          to="/checklists"
          style={{ padding: '10px 20px', textDecoration: 'none', color: 'white', background: '#007bff', borderRadius: '5px' }}
        >
          Back to Checklist List
        </Link>
      </nav>
    </div>
  );
};

export default FlowchartDetail;
