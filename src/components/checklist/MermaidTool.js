import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import api from '../api.js'

// 初始化 Mermaid 配置
mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    themeCSS: `
        .nodeLabel  p {
          white-space: pre-wrap;         /* 强制长文本换行 */
        }
   `,
    flowchart: { curve: 'linear' },
    securityLevel: 'loose',
});

const MermaidTool = () => {
    const [mermaidCode, setMermaidCode] = useState('');
    const mermaidContainerRef = useRef(null);
    const [renderError, setRenderError] = useState(null);

    // 独立函数处理 Mermaid 渲染
    const renderMermaid = async () => {
        if (mermaidCode && mermaidCode.trim() && mermaidContainerRef.current) {
            try {
                setRenderError(null); // 清除之前的错误信息

                // Mermaid 渲染：对指定容器进行渲染
                const { svg } = await mermaid.render('generatedDiagram', mermaidCode);
                if (mermaidContainerRef.current) {
                    mermaidContainerRef.current.innerHTML = svg;
                }
            } catch (e) {
                console.error('Mermaid rendering error:', e);
                setRenderError('Mermaid rendering error: Unable to render the flowchart. Please check your syntax.');
            }
        }
    };

    const handlePreviewFlowchart = () => {
        if (mermaidCode && mermaidCode.trim()) {
            setRenderError(null); // 清除之前的错误信息
            renderMermaid(); // 触发渲染逻辑
        } else {
            setRenderError('Mermaid code cannot be empty');
        }
    };

    const handleDownload = async () => {
        try {
            const response = await api.post(`/generate-mermaid`, {
                mermaid_code: mermaidCode
            }, {
                responseType: 'blob'
            });

            // Create a link to download the generated PNG
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'mermaid-diagram.png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error generating Mermaid diagram:', error);
        }
    };

    return (
        <div className="tab-content">
            <h3>Mermaid Flowchart Editor</h3>
            <textarea
                value={mermaidCode}
                onChange={(e) => setMermaidCode(e.target.value)}
                rows="10"
                cols="50"
                style={{ width: '100%', marginBottom: '20px' }}
            />
            <button className="preview-btn" onClick={handlePreviewFlowchart}>Preview Flowchart</button>
            <button onClick={handleDownload} style={{ padding: '5px 20px', marginLeft:'20px',background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                Download Flowchart as PNG
            </button>
            {renderError && (
                <div style={{ color: 'red', marginTop: '10px' }}>
                    <strong>Error:</strong> {renderError}
                </div>
            )}
            <div
                className="mermaid-preview"
                ref={mermaidContainerRef}
                style={{ marginTop: '20px', minHeight: '200px', border: '1px solid #ccc', padding: '10px' }}
            ></div>
        </div>
    )
}

export default MermaidTool