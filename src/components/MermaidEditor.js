import React, { useState, useEffect } from 'react';
import mermaid from 'mermaid';

const MermaidEditor = ({ initialCode, onSave }) => {
  const [code, setCode] = useState(initialCode || '');

  useEffect(() => {
    if (code) {
      try {
        mermaid.init(undefined, '.mermaid-preview');
      } catch (e) {
        console.error('Mermaid rendering error:', e);
      }
    }
  }, [code]);

  const handleCodeChange = (event) => {
    setCode(event.target.value);
  };

  const handleSave = () => {
    if (typeof onSave === 'function') {
      onSave(code);
    }
  };

  return (
    <div>
      <h3>Mermaid Flowchart Editor</h3>
      <textarea
        value={code}
        onChange={handleCodeChange}
        rows="10"
        cols="50"
        style={{ width: '100%', marginBottom: '20px' }}
      />
      <button onClick={handleSave}>Save Flowchart</button>
      <div className="mermaid-preview" style={{ marginTop: '20px' }}>
        <div className="mermaid">
          {code}
        </div>
      </div>
    </div>
  );
};

export default MermaidEditor;
