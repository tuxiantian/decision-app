import React, { useState, useRef, useEffect } from 'react';

const DecisionFlowTool = () => {
    const [nodes, setNodes] = useState(() => {
        // 尝试从localStorage加载保存的数据
        const savedData = localStorage.getItem('decisionFlowData');
        return savedData ? JSON.parse(savedData).nodes : [];
    });
    const [connections, setConnections] = useState(() => {
        const savedData = localStorage.getItem('decisionFlowData');
        return savedData ? JSON.parse(savedData).connections : [];
    });
    const [activeNodeId, setActiveNodeId] = useState(null);
    const [draggingNodeId, setDraggingNodeId] = useState(null);
    const [connectingStart, setConnectingStart] = useState(null);
    const [selectedTool, setSelectedTool] = useState('select');
    const [hoveredAnchor, setHoveredAnchor] = useState(null);
    const [notification, setNotification] = useState(null);
    const stageRef = useRef(null);
    const textareaRefs = useRef({});
    const fileInputRef = useRef(null);

    // 显示通知
    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // 保存数据到localStorage
    const saveData = () => {
        try {
            const flowData = { nodes, connections };
            localStorage.setItem('decisionFlowData', JSON.stringify(flowData));
            showNotification('数据保存成功！');
        } catch (error) {
            showNotification('保存失败: ' + error.message, 'error');
        }
    };

    // 加载本地数据
    const loadLocalData = () => {
        try {
            const savedData = localStorage.getItem('decisionFlowData');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                setNodes(parsedData.nodes || []);
                setConnections(parsedData.connections || []);
                showNotification('数据加载成功！');
            } else {
                showNotification('没有找到保存的数据', 'info');
            }
        } catch (error) {
            showNotification('加载失败: ' + error.message, 'error');
        }
    };

    // 重置画布
    const resetCanvas = () => {
        if (window.confirm('确定要重置画布吗？所有未保存的数据将会丢失！')) {
            setNodes([]);
            setConnections([]);
            setActiveNodeId(null);
            localStorage.removeItem('decisionFlowData');
            showNotification('画布已重置', 'info');
        }
    };

    // 导出为JSON文件
    const exportData = () => {
        try {
            const flowData = { nodes, connections };
            const dataStr = JSON.stringify(flowData, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = '决策流程图.json';
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            
            showNotification('数据导出成功！');
        } catch (error) {
            showNotification('导出失败: ' + error.message, 'error');
        }
    };

    // 导入JSON文件
    const importData = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target.result;
                const importedData = JSON.parse(content);
                
                // 简单验证数据格式
                if (!Array.isArray(importedData.nodes)) {
                    throw new Error('无效的数据格式: 缺少节点数据');
                }
                
                setNodes(importedData.nodes || []);
                setConnections(importedData.connections || []);
                setActiveNodeId(null);
                
                // 保存到本地存储
                localStorage.setItem('decisionFlowData', JSON.stringify(importedData));
                
                showNotification('数据导入成功！');
            } catch (error) {
                showNotification('导入失败: ' + error.message, 'error');
            }
            
            // 重置文件输入
            e.target.value = null;
        };
        
        reader.readAsText(file);
    };

    // 创建新节点
    const addNode = (e) => {
        // 修复：点击节点时不要创建新节点
        if (e.target !== stageRef.current) return;
        // 修复：如果当前有激活节点，点击画布空白处先退出编辑
        if (activeNodeId) {
            setActiveNodeId(null);
            return;
        }
        
        if (selectedTool !== 'text') return;

        const rect = stageRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const newNode = {
            id: `node-${Date.now()}`,
            x,
            y,
            width: 200,
            height: 100,
            text: '双击编辑内容',
        };

        setNodes([...nodes, newNode]);
        setActiveNodeId(newNode.id);
    };

    // 开始连接
    const startConnection = (nodeId, anchorPosition) => {
        if (selectedTool !== 'arrow') return;
        setConnectingStart({ nodeId, anchorPosition });
    };

    // 完成连接
    const endConnection = (e) => {
        if (!connectingStart || selectedTool !== 'arrow') return;

        if (hoveredAnchor && hoveredAnchor.nodeId !== connectingStart.nodeId) {
            const newConnection = {
                id: `conn-${Date.now()}`,
                from: connectingStart,
                to: { nodeId: hoveredAnchor.nodeId, anchorPosition: hoveredAnchor.position },
            };
            setConnections([...connections, newConnection]);
        }

        setConnectingStart(null);
        setHoveredAnchor(null);
    };

    // 处理节点拖拽
    const handleNodeDrag = (e, nodeId) => {
        if (selectedTool !== 'select') return;

        const rect = stageRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setNodes(nodes.map(node =>
            node.id === nodeId ? { ...node, x, y } : node
        ));
    };

    // 更新节点文本
    const updateNodeText = (nodeId, newText) => {
        setNodes(nodes.map(node =>
            node.id === nodeId ? { ...node, text: newText } : node
        ));
    };

    // 计算锚点位置
    const getAnchorPosition = (node, position) => {
        switch (position) {
            case 'top': return { x: node.x + node.width / 2, y: node.y };
            case 'right': return { x: node.x + node.width, y: node.y + node.height / 2 };
            case 'bottom': return { x: node.x + node.width / 2, y: node.y + node.height };
            case 'left': return { x: node.x, y: node.y + node.height / 2 };
            default: return { x: node.x, y: node.y };
        }
    };

    // 聚焦文本输入框
    useEffect(() => {
        if (activeNodeId && textareaRefs.current[activeNodeId]) {
            const textarea = textareaRefs.current[activeNodeId];

            // 使用requestAnimationFrame确保DOM更新完成
            requestAnimationFrame(() => {
                textarea.focus();
                const length = textarea.value.length;
                textarea.setSelectionRange(length, length);
            });
        }
    }, [activeNodeId]);

    // 查找鼠标位置附近的锚点
    const findAnchorAtPosition = (x, y) => {
        const threshold = 10;

        for (const node of nodes) {
            for (const position of ['top', 'right', 'bottom', 'left']) {
                const anchorPos = getAnchorPosition(node, position);
                const distance = Math.sqrt(
                    Math.pow(anchorPos.x - x, 2) +
                    Math.pow(anchorPos.y - y, 2)
                );

                if (distance < threshold) {
                    return { nodeId: node.id, position };
                }
            }
        }

        return null;
    };

    // 处理节点双击事件
    const handleNodeDoubleClick = (e, nodeId) => {
        e.stopPropagation();
        e.preventDefault(); // 关键：阻止默认双击行为
        setSelectedTool('select');
        setActiveNodeId(nodeId);
        setDraggingNodeId(null); // 修复：防止双击时节点移动
    };

    // 保存按钮样式
    const getButtonStyle = (isActive = false) => ({
        padding: '8px 16px',
        backgroundColor: isActive ? '#4a90e2' : 'white',
        border: '1px solid #ddd',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.2s',
        ':hover': {
            backgroundColor: isActive ? '#3a7bc8' : '#f5f5f5'
        }
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
            {/* 顶部操作栏 */}
            <div style={{ 
                padding: '10px 15px', 
                backgroundColor: '#2c3e50', 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                color: 'white',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                    <i className="fas fa-project-diagram" style={{ marginRight: '10px' }}></i>
                    决策流程图工具
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        style={getButtonStyle()}
                        onClick={saveData}
                    >
                        <i className="fas fa-save"></i>
                        保存
                    </button>
                    <button
                        style={getButtonStyle()}
                        onClick={loadLocalData}
                    >
                        <i className="fas fa-folder-open"></i>
                        加载
                    </button>
                    <button
                        style={getButtonStyle()}
                        onClick={exportData}
                    >
                        <i className="fas fa-file-export"></i>
                        导出
                    </button>
                    <button
                        style={getButtonStyle()}
                        onClick={() => fileInputRef.current.click()}
                    >
                        <i className="fas fa-file-import"></i>
                        导入
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            style={{ display: 'none' }} 
                            accept=".json"
                            onChange={importData}
                        />
                    </button>
                    <button
                        style={{ ...getButtonStyle(), backgroundColor: '#e74c3c', color: 'white' }}
                        onClick={resetCanvas}
                    >
                        <i className="fas fa-trash-alt"></i>
                        重置
                    </button>
                </div>
            </div>

            {/* 工具栏 */}
            <div style={{ padding: '10px', backgroundColor: '#f0f0f0', display: 'flex', gap: '10px', borderBottom: '1px solid #ddd' }}>
                <button
                    style={{
                        padding: '8px 16px',
                        backgroundColor: selectedTool === 'select' ? '#4a90e2' : 'white',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                    onClick={() => setSelectedTool('select')}
                >
                    <i className="fas fa-mouse-pointer"></i>
                    选择
                </button>
                <button
                    style={{
                        padding: '8px 16px',
                        backgroundColor: selectedTool === 'text' ? '#4a90e2' : 'white',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                    onClick={() => setSelectedTool('text')}
                >
                    <i className="fas fa-font"></i>
                    文本
                </button>
                <button
                    style={{
                        padding: '8px 16px',
                        backgroundColor: selectedTool === 'arrow' ? '#4a90e2' : 'white',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                    onClick={() => setSelectedTool('arrow')}
                >
                    <i className="fas fa-arrow-right"></i>
                    箭头
                </button>
                
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', color: '#555', fontSize: '14px' }}>
                    <i className="fas fa-info-circle" style={{ marginRight: '6px' }}></i>
                    当前节点: {nodes.length} | 连接: {connections.length}
                </div>
            </div>

            {/* 画布 */}
            <div
                ref={stageRef}
                style={{
                    flex: 1,
                    border: '1px solid #ddd',
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundColor: '#f9f9f9',
                    backgroundImage: 'linear-gradient(#eee 1px, transparent 1px), linear-gradient(90deg, #eee 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    cursor: connectingStart ? 'crosshair' : selectedTool === 'text' ? 'text' : 'default'
                }}
                onClick={addNode}
                onMouseMove={(e) => {
                    const rect = stageRef.current.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    if (draggingNodeId) {
                        handleNodeDrag(e, draggingNodeId);
                    }

                    if (connectingStart) {
                        setConnectingStart(prev => ({ ...prev, currentX: x, currentY: y }));
                        const foundAnchor = findAnchorAtPosition(x, y);
                        setHoveredAnchor(foundAnchor);
                    }
                }}
                onMouseUp={(e) => {
                    setDraggingNodeId(null);
                    if (connectingStart) {
                        endConnection(e);
                    }
                }}
            >
                {/* 通知消息 */}
                {notification && (
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        padding: '10px 20px',
                        backgroundColor: notification.type === 'error' ? '#e74c3c' : 
                                        notification.type === 'info' ? '#3498db' : '#2ecc71',
                        color: 'white',
                        borderRadius: '4px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                        zIndex: 100,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        {notification.type === 'error' && <i className="fas fa-exclamation-circle"></i>}
                        {notification.type === 'info' && <i className="fas fa-info-circle"></i>}
                        {notification.type === 'success' && <i className="fas fa-check-circle"></i>}
                        {notification.message}
                    </div>
                )}
                
                {/* 箭头标记定义 */}
                <svg style={{ height: 0, width: 0 }}>
                    <defs>
                        <marker
                            id="arrowhead"
                            markerWidth="10"
                            markerHeight="7"
                            refX="9"
                            refY="3.5"
                            orient="auto"
                        >
                            <polygon points="0 0, 10 3.5, 0 7" fill="#333" />
                        </marker>
                    </defs>
                </svg>

                {/* 渲染连接线 */}
                {connections.map(conn => {
                    const fromNode = nodes.find(n => n.id === conn.from.nodeId);
                    const toNode = nodes.find(n => n.id === conn.to.nodeId);

                    if (!fromNode || !toNode) return null;

                    const start = getAnchorPosition(fromNode, conn.from.anchorPosition);
                    const end = getAnchorPosition(toNode, conn.to.anchorPosition);

                    return (
                        <svg
                            key={conn.id}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                pointerEvents: 'none',
                            }}
                        >
                            <line
                                x1={start.x}
                                y1={start.y}
                                x2={end.x}
                                y2={end.y}
                                stroke="#333"
                                strokeWidth="2"
                                markerEnd="url(#arrowhead)"
                            />
                        </svg>
                    );
                })}

                {/* 正在创建的连接线 */}
                {connectingStart && (
                    <svg
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            pointerEvents: 'none',
                            zIndex: 10,
                        }}
                    >
                        <line
                            x1={getAnchorPosition(
                                nodes.find(n => n.id === connectingStart.nodeId),
                                connectingStart.anchorPosition
                            ).x}
                            y1={getAnchorPosition(
                                nodes.find(n => n.id === connectingStart.nodeId),
                                connectingStart.anchorPosition
                            ).y}
                            x2={connectingStart.currentX || 0}
                            y2={connectingStart.currentY || 0}
                            stroke="#333"
                            strokeWidth="2"
                            markerEnd="url(#arrowhead)"
                        />
                    </svg>
                )}

                {/* 渲染节点 */}
                {nodes.map(node => (
                    <div
                        key={node.id}
                        style={{
                            position: 'absolute',
                            left: `${node.x}px`,
                            top: `${node.y}px`,
                            width: `${node.width}px`,
                            minHeight: `${node.height}px`,
                            border: activeNodeId === node.id ? '2px solid #4a90e2' : '1px solid #bbb',
                            borderRadius: '8px',
                            padding: '12px',
                            backgroundColor: '#ffffff',
                            boxShadow: '0 3px 8px rgba(0,0,0,0.1)',
                            cursor: selectedTool === 'select' ? 'move' : 'default',
                            zIndex: activeNodeId === node.id ? 2 : 1,
                            transition: 'box-shadow 0.2s, border-color 0.2s',
                            ':hover': {
                                boxShadow: '0 5px 15px rgba(0,0,0,0.15)',
                                borderColor: activeNodeId === node.id ? '#4a90e2' : '#999'
                            }
                        }}
                        onMouseDown={(e) => {
                            // 修复：编辑状态下阻止拖拽
                            if (selectedTool !== 'select' || activeNodeId === node.id) {
                                return;
                            }
                            e.stopPropagation();
                            setDraggingNodeId(node.id);
                            setActiveNodeId(node.id);
                        }}
                        onDoubleClick={(e) => handleNodeDoubleClick(e, node.id)} // 修复：在节点容器上处理双击
                    >
                        {/* 文本编辑区域 */}
                        {activeNodeId === node.id ? (
                            <textarea
                                ref={(el) => {
                                    textareaRefs.current[node.id] = el;
                                    if (el && activeNodeId === node.id) {
                                        // 立即尝试聚焦
                                        requestAnimationFrame(() => {
                                            el.focus();
                                            const length = el.value.length;
                                            el.setSelectionRange(length, length);
                                        });
                                    }
                                }}
                                value={node.text}
                                onChange={(e) => updateNodeText(node.id, e.target.value)}
                                onBlur={() => setActiveNodeId(null)}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                    outline: 'none',
                                    resize: 'none',
                                    fontFamily: 'inherit',
                                    fontSize: '16px',
                                    backgroundColor: 'transparent',
                                    cursor: 'text',
                                    lineHeight: '1.5'
                                }}
                                autoFocus // 确保自动获取焦点
                                onMouseDown={(e) => e.stopPropagation()} // 修复：阻止冒泡
                            />
                        ) : (
                            <div
                                style={{
                                    whiteSpace: 'pre-wrap',
                                    cursor: 'text',
                                    minHeight: '100%',
                                    userSelect: 'none',
                                    fontSize: '16px',
                                    lineHeight: '1.5'
                                }}
                            >
                                {node.text}
                            </div>
                        )}

                        {/* 节点ID标签 */}
                        <div style={{
                            position: 'absolute',
                            top: '4px',
                            right: '8px',
                            fontSize: '10px',
                            color: '#888',
                            userSelect: 'none'
                        }}>
                            {node.id.slice(0, 6)}
                        </div>

                        {/* 锚点 */}
                        {(selectedTool === 'select' || selectedTool === 'arrow') && (
                            <>
                                {['top', 'right', 'bottom', 'left'].map(position => (
                                    <div
                                        key={position}
                                        style={{
                                            position: 'absolute',
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '50%',
                                            backgroundColor: hoveredAnchor?.nodeId === node.id &&
                                                hoveredAnchor?.position === position
                                                ? '#ff6b6b' : '#4a90e2',
                                            cursor: 'crosshair',
                                            border: '1px solid white',
                                            boxShadow: '0 0 3px rgba(0,0,0,0.3)',
                                            transition: 'transform 0.2s',
                                            ':hover': {
                                                transform: 'scale(1.3)'
                                            },
                                            ...(position === 'top' && {
                                                left: '50%',
                                                top: '-6px',
                                                transform: 'translateX(-50%)',
                                            }),
                                            ...(position === 'right' && {
                                                right: '-6px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                            }),
                                            ...(position === 'bottom' && {
                                                left: '50%',
                                                bottom: '-6px',
                                                transform: 'translateX(-50%)',
                                            }),
                                            ...(position === 'left' && {
                                                left: '-6px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                            }),
                                        }}
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            startConnection(node.id, position);
                                        }}
                                    />
                                ))}
                            </>
                        )}
                    </div>
                ))}
                
                {/* 空状态提示 */}
                {nodes.length === 0 && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                        color: '#888',
                        maxWidth: '500px',
                        padding: '20px'
                    }}>
                        <i className="fas fa-project-diagram" style={{ fontSize: '48px', marginBottom: '20px' }}></i>
                        <h2>欢迎使用决策流程图工具</h2>
                        <p style={{ margin: '15px 0', lineHeight: '1.6' }}>
                            请选择上方的"文本"工具开始创建节点，或使用"箭头"工具连接节点。<br />
                            您也可以点击"加载"按钮恢复之前保存的工作。
                        </p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                            <button style={getButtonStyle()} onClick={() => setSelectedTool('text')}>
                                <i className="fas fa-font"></i> 创建节点
                            </button>
                            <button style={getButtonStyle()} onClick={loadLocalData}>
                                <i className="fas fa-folder-open"></i> 加载数据
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            {/* 页脚信息 */}
            <div style={{
                padding: '8px 15px',
                backgroundColor: '#2c3e50',
                color: '#ecf0f1',
                fontSize: '12px',
                textAlign: 'center',
                borderTop: '1px solid #34495e'
            }}>
                <div>
                    提示：数据会自动保存到浏览器本地存储。使用"导出"功能可将数据备份到文件。
                </div>
                <div style={{ marginTop: '5px', opacity: 0.7 }}>
                    决策流程图工具 v1.0 &copy; {new Date().getFullYear()}
                </div>
            </div>
            
            {/* Font Awesome 图标 */}
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
        </div>
    );
};

export default DecisionFlowTool;