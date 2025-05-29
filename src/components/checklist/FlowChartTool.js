import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Line, Arrow, Text, Group, Transformer, Circle } from 'react-konva';
import styled from 'styled-components';

const ToolContainer = styled.div`
  position: relative;
  width: 100%;
  height: 600px;
  border: 1px solid #ddd;
  background-color: #f9f9f9;
  overflow: hidden;
`;

const Toolbar = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 100;
  background: white;
  padding: 8px;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  display: flex;
  gap: 8px;
`;

const ToolButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background: #f0f0f0;
  }
  &.active {
    background: #e0e0e0;
  }
`;

const AnchorPoint = styled(Circle)`
    &:hover {
        fill: #2af;
        stroke: #fff;
        stroke-width: 2;
        cursor: crosshair;
`;

const FlowChartTool = () => {
    const [tool, setTool] = useState('select'); // 'select', 'arrow', 'line', 'text'
    const [elements, setElements] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [isTextToolActive, setIsTextToolActive] = useState(false);
    const stageRef = useRef();
    const textRefs = useRef({});
    const transformerRef = useRef();
    useEffect(() => {
        if (selectedId && transformerRef.current) {
            const selectedNode = stageRef.current.findOne(`#${selectedId}`);
            if (selectedNode) {
                transformerRef.current.nodes([selectedNode]);
                transformerRef.current.getLayer().batchDraw();
            }
        }
    }, [selectedId]);

    // Add this useEffect hook near your other hooks
    useEffect(() => {
        // Update dimensions for all text elements
        const updatedElements = elements.map(element => {
            if (element.type === 'text' && textRefs.current[element.id]) {
                const node = textRefs.current[element.id];
                node.cache();
                const rect = node.getClientRect();
                return {
                    ...element,
                    width: rect.width,
                    height: rect.height
                };
            }
            return element;
        });
        setElements(updatedElements);
    }, [elements.length]); // Only run when number of elements changes

    const handleStageClick = (e) => {
        if (e.target === e.currentTarget) {
            // 点击空白处
            if (tool === 'text' && isTextToolActive) {
                // 获取点击位置
                const pos = e.target.getPointerPosition();
                const newText = {
                    id: `text-${Date.now()}`,
                    type: 'text',
                    x: pos.x,
                    y: pos.y,
                    text: '双击编辑文字',
                    fontSize: 16,
                    fill: '#000',
                    draggable: true,
                };
                setElements([...elements, newText]);
                setSelectedId(newText.id);
                setIsTextToolActive(false); // 创建后立即禁用文字工具
                setTool('select'); // 自动切换回选择工具
            }
            setSelectedId(null);
            return;
        } else {
            const id = e.target.attrs.id || e.target.parent.attrs.id;
            // Only update if selection changed
            if (id !== selectedId) {
                setSelectedId(id);
            }
        }
    };

    const handleAddArrow = () => {
        const newArrow = {
            id: `arrow-${Date.now()}`,
            type: 'arrow',
            points: [50, 50, 150, 50],
            stroke: '#000',
            strokeWidth: 2,
            pointerLength: 10,
            pointerWidth: 10,
        };
        setElements([...elements, newArrow]);
        setSelectedId(newArrow.id);
    };

    const handleAddLine = () => {
        const newLine = {
            id: `line-${Date.now()}`,
            type: 'line',
            points: [50, 100, 150, 100],
            stroke: '#000',
            strokeWidth: 2,
        };
        setElements([...elements, newLine]);
        setSelectedId(newLine.id);
    };

    const handleAddText = () => {
        setTool('text');
        setIsTextToolActive(true);
    };

    const handleTextDoubleClick = (e, id) => {
        e.cancelBubble = true; // 阻止事件冒泡到锚点
        const textNode = e.target;
        const stage = textNode.getStage(); // 获取 stage 引用

        // 进入编辑模式时改变文本样式
        textNode.setAttrs({
            draggable: false,
            editing: true,
            fill: '#0000FF',
            fontStyle: 'italic'
        });

        // 存储原始文本和样式
        if (!textNode.getAttr('originalText')) {
            textNode.setAttr('originalText', textNode.text());
            textNode.setAttr('originalFill', textNode.fill());
            textNode.setAttr('originalFontStyle', textNode.fontStyle());
        }

        // 清空文本并显示光标
        textNode.text('|');
        if (stage) {
            stage.container().style.cursor = 'text';
            stage.container().focus();
        }

        // 临时禁用所有锚点的交互
        stage.find('Circle').forEach(anchor => {
            anchor.listening(false);
        });

        const finishEditing = () => {
            if (!textNode || !stage) return;

            const currentText = textNode.text().replace(/\|$/, '').trim();
            const originalText = textNode.getAttr('originalText');
            const newText = currentText || originalText;

            // 恢复原始样式
            textNode.setAttrs({
                text: newText,
                draggable: true,
                fill: textNode.getAttr('originalFill'),
                fontStyle: textNode.getAttr('originalFontStyle'),
                editing: false
            });

            // 恢复锚点交互
            stage.find('Circle').forEach(anchor => {
                anchor.listening(true);
            });

            // 更新状态
            setElements(elements.map(el =>
                el.id === id ? { ...el, text: newText } : el
            ));

            // 清理事件监听
            document.removeEventListener('keydown', handleKeyDown);
            stage.container().style.cursor = 'default';
        };

        const handleKeyDown = (e) => {
            if (!textNode || !stage) {
                document.removeEventListener('keydown', handleKeyDown);
                return;
            }

            e.preventDefault();

            if (e.key === 'Enter') {
                finishEditing();
                return;
            }

            if (e.key === 'Backspace') {
                const current = textNode.text().replace(/\|$/, '');
                textNode.text(current.slice(0, -1) + '|');
                return;
            }

            if (e.key.length === 1) {
                const current = textNode.text().replace(/\|$/, '');
                textNode.text(current + e.key + '|');
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        // 点击其他地方完成编辑
        const handleStageClick = (e) => {
            if (e.target !== textNode) {
                finishEditing();
                stage.off('click', handleStageClick);
            }
        };

        if (stage) {
            stage.on('click', handleStageClick);
        }
    };

    const handleExport = () => {
        const uri = stageRef.current.toDataURL();
        const link = document.createElement('a');
        link.download = 'decision-flow.png';
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getAnchorPosition = (element, position) => {
        // 注意：这里需要确保 element.width 和 element.height 是有效的
        // 你可能需要在 Text 组件上使用 ref 来获取实际尺寸
        const width = element.width || 100; // 默认值
        const height = element.height || 30; // 默认值

        switch (position) {
            case 'top':
                return { x: element.x + width / 2, y: element.y };
            case 'right':
                return { x: element.x + width, y: element.y + height / 2 };
            case 'bottom':
                return { x: element.x + width / 2, y: element.y + height };
            case 'left':
                return { x: element.x, y: element.y + height / 2 };
            default:
                return { x: element.x, y: element.y };
        };
    }

    const handleAnchorMouseDown = (e, textId, position) => {
        e.cancelBubble = true; // 阻止事件冒泡

        // 开始创建连线
        const textElement = elements.find(el => el.id === textId);
        if (!textElement) return;

        const anchorPos = getAnchorPosition(textElement, position);

        // 创建临时连线
        const tempLine = {
            id: `temp-line-${Date.now()}`,
            type: 'line',
            points: [anchorPos.x, anchorPos.y, anchorPos.x, anchorPos.y],
            stroke: '#000',
            strokeWidth: 2,
            isTemp: true
        };

        setElements([...elements, tempLine]);

        // 监听鼠标移动和松开事件
        const stage = e.target.getStage();
        let lastPos = { x: anchorPos.x, y: anchorPos.y };

        const handleMouseMove = (e) => {
            const pos = stage.getPointerPosition();
            if (!pos) return;

            // 更新临时连线的终点
            setElements(prevElements =>
                prevElements.map(el =>
                    el.id === tempLine.id
                        ? { ...el, points: [anchorPos.x, anchorPos.y, pos.x, pos.y] }
                        : el
                )
            );

            lastPos = { x: pos.x, y: pos.y };
        };

        const handleMouseUp = () => {
            // 检查是否悬停在另一个锚点上
            const targetAnchor = findNearestAnchor(lastPos);

            if (targetAnchor && targetAnchor.textId !== textId) {
                // 创建永久连线
                const newLine = {
                    id: `line-${Date.now()}`,
                    type: 'line',
                    points: [anchorPos.x, anchorPos.y, targetAnchor.pos.x, targetAnchor.pos.y],
                    stroke: '#000',
                    strokeWidth: 2,
                    from: { textId, position },
                    to: { textId: targetAnchor.textId, position: targetAnchor.position }
                };

                setElements(prevElements =>
                    [...prevElements.filter(el => el.id !== tempLine.id), newLine]
                );
            } else {
                // 移除临时连线
                setElements(prevElements =>
                    prevElements.filter(el => el.id !== tempLine.id)
                );
            }

            // 清理事件监听
            stage.off('mousemove', handleMouseMove);
            stage.off('mouseup', handleMouseUp);
        };

        stage.on('mousemove', handleMouseMove);
        stage.on('mouseup', handleMouseUp);
    };

    const findNearestAnchor = (pos) => {
        const threshold = 10; // 吸附阈值

        for (const element of elements) {
            if (element.type === 'text') {
                const positions = ['top', 'right', 'bottom', 'left'];

                for (const position of positions) {
                    const anchorPos = getAnchorPosition(element, position);
                    const distance = Math.sqrt(
                        Math.pow(pos.x - anchorPos.x, 2) +
                        Math.pow(pos.y - anchorPos.y, 2)
                    );

                    if (distance < threshold) {
                        return {
                            textId: element.id,
                            position,
                            pos: anchorPos
                        };
                    }
                }
            }
        }

        return null;
    };

    return (
        <ToolContainer>
            <Toolbar>
                <ToolButton
                    className={tool === 'select' ? 'active' : ''}
                    onClick={() => setTool('select')}
                >
                    选择
                </ToolButton>
                <ToolButton onClick={handleAddArrow}>箭头</ToolButton>
                <ToolButton onClick={handleAddLine}>连接线</ToolButton>
                <ToolButton className={tool === 'text' ? 'active' : ''} onClick={handleAddText}>文字</ToolButton>
                <ToolButton onClick={handleExport}>导出图片</ToolButton>
            </Toolbar>
            <div style={{ width: '100%', height: '600px', border: '1px solid #ddd' }}>
                <Stage
                    width={window.innerWidth - 40}
                    height={580}
                    ref={stageRef}
                    onClick={handleStageClick}
                    onTap={handleStageClick}
                >
                    <Layer>
                        {elements.map((element) => {
                            if (element.type === 'arrow') {
                                return (
                                    <Arrow
                                        key={element.id}
                                        id={element.id}
                                        points={element.points}
                                        stroke={element.stroke}
                                        strokeWidth={element.strokeWidth}
                                        pointerLength={element.pointerLength}
                                        pointerWidth={element.pointerWidth}
                                        draggable
                                        onDragEnd={(e) => {
                                            setElements(
                                                elements.map((el) => {
                                                    if (el.id === element.id) {
                                                        return {
                                                            ...el,
                                                            points: [
                                                                e.target.x(),
                                                                e.target.y(),
                                                                e.target.x() + (element.points[2] - element.points[0]),
                                                                e.target.y() + (element.points[3] - element.points[1]),
                                                            ],
                                                        };
                                                    }
                                                    return el;
                                                })
                                            );
                                        }}
                                        onTransformEnd={(e) => {
                                            const node = e.target;
                                            const scaleX = node.scaleX();
                                            const scaleY = node.scaleY();

                                            node.scaleX(1);
                                            node.scaleY(1);

                                            setElements(
                                                elements.map((el) => {
                                                    if (el.id === element.id) {
                                                        return {
                                                            ...el,
                                                            points: [
                                                                node.x(),
                                                                node.y(),
                                                                node.x() + (element.points[2] - element.points[0]) * scaleX,
                                                                node.y() + (element.points[3] - element.points[1]) * scaleY,
                                                            ],
                                                        };
                                                    }
                                                    return el;
                                                })
                                            );
                                        }}
                                    />
                                );
                            }

                            if (element.type === 'line') {
                                return (
                                    <Group key={element.id} id={element.id}>
                                        <Line
                                            points={element.points}
                                            stroke={element.stroke}
                                            strokeWidth={element.strokeWidth}
                                            draggable
                                            onDragEnd={(e) => {
                                                const offsetX = e.target.x() - element.points[0];
                                                const offsetY = e.target.y() - element.points[1];
                                                setElements(
                                                    elements.map((el) => {
                                                        if (el.id === element.id) {
                                                            return {
                                                                ...el,
                                                                points: [
                                                                    element.points[0] + offsetX,
                                                                    element.points[1] + offsetY,
                                                                    element.points[2] + offsetX,
                                                                    element.points[3] + offsetY,
                                                                ],
                                                            };
                                                        }
                                                        return el;
                                                    })
                                                );
                                            }}
                                            onTransformEnd={(e) => {
                                                const node = e.target;
                                                const scaleX = node.scaleX();
                                                const scaleY = node.scaleY();

                                                node.scaleX(1);
                                                node.scaleY(1);

                                                setElements(
                                                    elements.map((el) => {
                                                        if (el.id === element.id) {
                                                            return {
                                                                ...el,
                                                                points: [
                                                                    el.points[0],
                                                                    el.points[1],
                                                                    el.points[0] + (el.points[2] - el.points[0]) * scaleX,
                                                                    el.points[1] + (el.points[3] - el.points[1]) * scaleY,
                                                                ],
                                                            };
                                                        }
                                                        return el;
                                                    })
                                                );
                                            }}
                                        />
                                    </Group>
                                );
                            }

                            if (element.type === 'text') {
                                return (
                                    <Group key={element.id} id={element.id}>
                                        <Text
                                            x={element.x}
                                            y={element.y}
                                            text={element.text}
                                            fontSize={element.fontSize}
                                            fill={element.editing ? '#0000FF' : element.fill}
                                            draggable={!element.editing}
                                            onDblClick={(e) => {
                                                if (!element.editing) {
                                                    handleTextDoubleClick(e, element.id);
                                                }
                                            }}
                                            onDblTap={(e) => {
                                                if (!element.editing) {
                                                    handleTextDoubleClick(e, element.id);
                                                }
                                            }}
                                            onDragEnd={(e) => {
                                                const node = e.target;
                                                setElements(
                                                    elements.map((el) => {
                                                        if (el.id === element.id) {
                                                            return {
                                                                ...el,
                                                                x: node.x(),
                                                                y: node.y(),
                                                            };
                                                        }
                                                        return el;
                                                    })
                                                );
                                            }}

                                            ref={(node) => {
                                                if (node) {
                                                    textRefs.current[element.id] = node;
                                                }
                                            }}
                                        />
                                        {['top', 'right', 'bottom', 'left'].map((position) => (
                                            <Circle
                                                key={position}
                                                x={getAnchorPosition(element, position).x}
                                                y={getAnchorPosition(element, position).y}
                                                radius={5}
                                                fill="#4af"
                                                stroke="#fff"
                                                strokeWidth={1}
                                                draggable={false}
                                                visible={tool === 'select' && selectedId === element.id}
                                                onMouseDown={(e) => {
                                                    if (tool === 'select') {
                                                        handleAnchorMouseDown(e, element.id, position);
                                                    }
                                                }}
                                                onTap={(e) => {
                                                    if (tool === 'select') {
                                                        handleAnchorMouseDown(e, element.id, position);
                                                    }
                                                }}
                                            />
                                        ))}

                                        {selectedId === element.id && (
                                            <Line
                                                points={[
                                                    element.x - 5,
                                                    element.y - 5,
                                                    element.x + element.width + 5,
                                                    element.y - 5,
                                                    element.x + element.width + 5,
                                                    element.y + element.height + 5,
                                                    element.x - 5,
                                                    element.y + element.height + 5,
                                                    element.x - 5,
                                                    element.y - 5,
                                                ]}
                                                stroke="#999"
                                                strokeWidth={1}
                                                dash={[5, 5]}
                                            />
                                        )}
                                    </Group>
                                );
                            }

                            return null;
                        })}

                        {selectedId && (
                            <Transformer
                                ref={transformerRef}
                                boundBoxFunc={(oldBox, newBox) => {
                                    // 限制最小尺寸
                                    if (newBox.width < 5 || newBox.height < 5) {
                                        return oldBox;
                                    }
                                    return newBox;
                                }}
                            />
                        )}
                    </Layer>
                </Stage>
            </div>
        </ToolContainer>
    );
};


export default FlowChartTool;