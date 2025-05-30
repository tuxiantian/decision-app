import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import './FactOpinionAnalyzer.css';

function FactOpinionAnalyzer() {
    const [text, setText] = useState('');
    const [facts, setFacts] = useState([]);
    const [opinions, setOpinions] = useState([]);
    const [selectedFacts, setSelectedFacts] = useState([]);
    const [selectedOpinion, setSelectedOpinion] = useState(null);
    const [logicalErrors, setLogicalErrors] = useState([]);
    const [selectedLogicalError, setSelectedLogicalError] = useState(null);
    const [analysisTable, setAnalysisTable] = useState([]);
    const [tooltip, setTooltip] = useState({ visible: false, content: '', x: 0, y: 0 });
    const [isButtonEnabled, setIsButtonEnabled] = useState(false);


    const navigate = useNavigate();
    useEffect(() => {
        api.get('/api/logic-errors')
            .then(response => setLogicalErrors(response.data))
            .catch(error => console.error('Error fetching logic errors:', error));

    }, []);

    useEffect(() => {
        // 检查所有必需条件是否满足，如果满足则启用按钮，否则禁用
        if (selectedFacts.length > 0 && selectedOpinion && selectedLogicalError) {
            setIsButtonEnabled(true);
        } else {
            setIsButtonEnabled(false);
        }
    }, [selectedFacts, selectedOpinion, selectedLogicalError]);
    // 添加逻辑错误匹配
    const handleAddLogicalError = () => {
        if (selectedFacts.length > 0 && selectedOpinion && selectedLogicalError) {
            // 检查该 selectedOpinion 和 selectedLogicalError 的组合是否已经存在于 analysisTable 中
            const isDuplicate = analysisTable.some(item =>
                item.opinion === selectedOpinion && item.error === selectedLogicalError
            );

            if (isDuplicate) {
                // 如果已存在，弹出提示
                alert("该组合的逻辑错误已经添加过了！");
            } else {
                setAnalysisTable([...analysisTable, {
                    facts: selectedFacts,
                    opinion: selectedOpinion,
                    error: selectedLogicalError
                }]);
            }
        }
    };

    // 处理事实点击逻辑
    const handleFactClick = (fact) => {
        if (selectedFacts.includes(fact)) {
            // 如果已选中，则取消选中
            setSelectedFacts(selectedFacts.filter(f => f !== fact));
        } else {
            // 如果未选中，则添加到选中列表
            setSelectedFacts([...selectedFacts, fact]);
        }
    };
    // 文本标记函数
    const handleMark = (type) => {
        const selection = window.getSelection().toString().trim();
        if (selection) {
            if (type === 'fact') {
                setFacts([...facts, selection]);
            } else if (type === 'opinion') {
                setOpinions([...opinions, selection]);
            }
        }
    };

    // 处理提交数据
    const handleSubmit = async () => {
        if (isButtonEnabled) {
            const requestData = {
                'analysisTable': analysisTable,
                'content': text
            }

            await api.post(`/api/save_fact_opinion_analysis`, requestData);

            console.log('save_fact_opinion_analysis successfully');
            navigate('/argument-evaluator-list');
        }

    };

    // 显示工具提示
    const showTooltip = (error, event) => {
        const tooltipWidth = 500;  // 假设 tooltip 宽度是 300px，可以根据实际情况调整
        const screenWidth = window.innerWidth;

        // 判断鼠标位置是否靠近屏幕右边缘，如果是，则调整 tooltip 到左侧
        const isNearRightEdge = event.pageX + tooltipWidth > screenWidth;

        const tooltipX = isNearRightEdge
            ? event.pageX - tooltipWidth  // 如果靠近右边缘，显示到左边
            : event.pageX;  // 否则，保持鼠标位置
        setTooltip({
            visible: true,
            content: `
        <h2>${error.name}</h2>
        <h3>${error.term}</h3>
        <p>${error.description}<p />
        <em>例子: ${error.example}</em>
      `,
            x: tooltipX,
            y: event.pageY
        });
    };

    // 处理点击逻辑错误
    const handleLogicalErrorClick = (error) => {
        if (selectedLogicalError === error) {
            // 如果已选中，再次点击取消选中
            setSelectedLogicalError(null);
        } else {
            // 否则设置为选中
            setSelectedLogicalError(error);
        }
    };

    // 隐藏工具提示
    const hideTooltip = () => {
        setTooltip({ visible: false, content: '', x: 0, y: 0 });
    };

    // 处理鼠标悬停事件以显示工具提示
    const handleMouseEnter = (error, event) => {
        showTooltip(error, event);
    };

    // 处理鼠标移开事件以隐藏工具提示
    const handleMouseLeave = () => {
        hideTooltip();
    };

    return (
        <div className="fact-opinion-analyzer">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="在这里输入文本..."
            />

            <div className="button-group">
                <button onClick={() => handleMark('fact')} className='blue-button'>标记事实</button>
                <button onClick={() => handleMark('opinion')} className='green-button'>标记观点</button>
            </div>

            <div className="facts-opinions-container">
                <div className="facts-column">
                    <h3>事实</h3>
                    {facts.map((fact, index) => (
                        <p
                            key={index}
                            className={selectedFacts.includes(fact) ? 'selected' : ''}
                            onClick={() => handleFactClick(fact)}
                        >
                            {fact}
                        </p>
                    ))}
                </div>
                <div className="opinions-column">
                    <h3>观点</h3>
                    {opinions.map((opinion, index) => (
                        <p
                            key={index}
                            className={selectedOpinion === opinion ? 'selected' : ''}
                            onClick={() => setSelectedOpinion(selectedOpinion === opinion ? null : opinion)}
                        >
                            {opinion}
                        </p>
                    ))}
                </div>
            </div>

            <div className="logical-errors-container">
                {logicalErrors.map((error, index) => (
                    <div
                        key={error.id}
                        className={`logical-error ${selectedLogicalError === error ? 'selected' : ''}`}
                        onMouseEnter={(event) => handleMouseEnter(error, event)}
                        onMouseLeave={() => handleMouseLeave()}
                        onClick={() => handleLogicalErrorClick(error)}
                    >
                        {error.name}
                    </div>
                ))}
            </div>

            {/* 工具提示卡片 */}
            {tooltip.visible && (
                <div
                    className="tooltip2"
                    style={{ top: `${tooltip.y + 10}px`, left: `${tooltip.x + 10}px` }}
                    dangerouslySetInnerHTML={{ __html: tooltip.content }}
                />
            )}

            <button onClick={handleAddLogicalError} disabled={!isButtonEnabled} style={{ margin: '10px auto' }}
                className={`red-button add-logical-error-button ${isButtonEnabled ? '' : 'disabled-button'}`}>添加逻辑错误</button>

            <table className="analysis-table">
                <thead>
                    <tr>
                        <th>事实</th>
                        <th>观点</th>
                        <th>逻辑错误</th>
                    </tr>
                </thead>
                <tbody>
                    {analysisTable.map((entry, index) =>
                        entry.facts.map((fact, factIndex) => (
                            <tr key={`${index}-${factIndex}`}>
                                <td>{fact}</td>
                                {factIndex === 0 && (
                                    <>
                                        <td rowSpan={entry.facts.length}>{entry.opinion}</td>
                                        <td rowSpan={entry.facts.length}>{entry.error.name}</td>
                                    </>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            <button onClick={handleSubmit} className='green-button'>提交</button>
        </div>
    );
}

export default FactOpinionAnalyzer;
