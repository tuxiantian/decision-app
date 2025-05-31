import React, { useState, useRef, useEffect } from 'react';

const DecisionFlowTool = () => {
    const [nodes, setNodes] = useState([]);
    const [connections, setConnections] = useState([]);
    const [activeNodeId, setActiveNodeId] = useState(null);
    const [draggingNodeId, setDraggingNodeId] = useState(null);
    const [connectingStart, setConnectingStart] = useState(null);
    const [selectedTool, setSelectedTool] = useState('select');
    const [hoveredAnchor, setHoveredAnchor] = useState(null);
    const stageRef = useRef(null);
    const textareaRefs = useRef({});

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

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* 工具栏 */}
            <div style={{ padding: '10px', backgroundColor: '#f0f0f0', display: 'flex', gap: '10px' }}>
                <button
                    style={{
                        padding: '8px 16px',
                        backgroundColor: selectedTool === 'select' ? '#4a90e2' : 'white',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                    onClick={() => setSelectedTool('select')}
                >
                    选择
                </button>
                <button
                    style={{
                        padding: '8px 16px',
                        backgroundColor: selectedTool === 'text' ? '#4a90e2' : 'white',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                    onClick={() => setSelectedTool('text')}
                >
                    文本
                </button>
                <button
                    style={{
                        padding: '8px 16px',
                        backgroundColor: selectedTool === 'arrow' ? '#4a90e2' : 'white',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                    onClick={() => setSelectedTool('arrow')}
                >
                    箭头
                </button>
            </div>

            {/* 画布 */}
            <div
                ref={stageRef}
                style={{
                    flex: 1,
                    border: '1px solid #ddd',
                    position: 'relative',
                    overflow: 'hidden',
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
                            border: activeNodeId === node.id ? '2px solid #4a90e2' : 'none',
                            borderRadius: '4px',
                            padding: '8px',
                            backgroundColor: 'white',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                            cursor: selectedTool === 'select' ? 'move' : 'default',
                            zIndex: activeNodeId === node.id ? 2 : 1,
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
                                    fontSize: 'inherit',
                                    backgroundColor: 'transparent',
                                    cursor: 'text',
                                }}
                                autoFocus // 确保自动获取焦点
                                onMouseDown={(e) => e.stopPropagation()} // 修复：阻止冒泡
                            />
                        ) : (
                            <div
                                style={{
                                    whiteSpace: 'pre-wrap',
                                    cursor: 'text',
                                    minHeight: '100%', // 确保整个区域可点击
                                    userSelect: 'none' // 防止双击选中文本
                                }}
                            >
                                {node.text}
                            </div>
                        )}

                        {/* 锚点 */}
                        {(selectedTool === 'select' || selectedTool === 'arrow') && (
                            <>
                                {['top', 'right', 'bottom', 'left'].map(position => (
                                    <div
                                        key={position}
                                        style={{
                                            position: 'absolute',
                                            width: '10px',
                                            height: '10px',
                                            borderRadius: '50%',
                                            backgroundColor: hoveredAnchor?.nodeId === node.id &&
                                                hoveredAnchor?.position === position
                                                ? '#ff6b6b' : '#4a90e2',
                                            cursor: 'crosshair',
                                            ...(position === 'top' && {
                                                left: '50%',
                                                top: '-5px',
                                                transform: 'translateX(-50%)',
                                            }),
                                            ...(position === 'right' && {
                                                right: '-5px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                            }),
                                            ...(position === 'bottom' && {
                                                left: '50%',
                                                bottom: '-5px',
                                                transform: 'translateX(-50%)',
                                            }),
                                            ...(position === 'left' && {
                                                left: '-5px',
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
            </div>
        </div>
    );
};

export default DecisionFlowTool;