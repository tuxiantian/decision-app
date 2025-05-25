import React, { useState } from 'react';
import { API_BASE_URL } from '../../config';
import api from '../api';
import './BalancedDecisionMaker.css';

function BalancedDecisionMaker() {
  const [conditions, setConditions] = useState({ positive: [], negative: [] });
  const [comparisons, setComparisons] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupComparisons, setGroupComparisons] = useState([]);
  const [decisionResult, setDecisionResult] = useState(null);
  const [decisionName, setDecisionName] = useState(""); // 新增状态用于存储决策名称
  const [showCompareGroups, setShowCompareGroups] = useState(false); // 新增状态


  // 检测条件是否重复
  const isConditionDuplicate = (type, condition) => {
    return conditions[type].some(
      (existingCondition) => existingCondition.description === condition
    );
  };
  // Step 1: Add conditions (positive or negative)
  const addCondition = (type, condition) => {
    if (condition.trim() !== "") {
      if (isConditionDuplicate(type, condition)) {
        alert(`${type === 'positive' ? 'Positive' : 'Negative'} 条件${condition}已经存在！`);
        return;
      }
      setConditions((prev) => ({
        ...prev,
        [type]: [...prev[type], { description: condition, id: prev[type].length + 1 }],
      }));
    }
  };

  // Step 2: Generate pairs for comparison
  const generateComparisons = () => {
    // 生成新的比较对
    const positivePairs = generatePairs(conditions.positive);
    const negativePairs = generatePairs(conditions.negative);
    const newComparisons = [...positivePairs, ...negativePairs];

    // 创建一个映射来保存现有的比较对及其 moreImportant 属性
    const comparisonMap = new Map();
    comparisons.forEach((comp) => {
      const key1 = `${comp.conditionA.description}-${comp.conditionB.description}`;
      const key2 = `${comp.conditionB.description}-${comp.conditionA.description}`;
      comparisonMap.set(key1, comp.moreImportant);
      comparisonMap.set(key2, comp.moreImportant);
    });

    // 合并新生成的比较对，并保留原有的 moreImportant 属性
    const updatedComparisons = newComparisons.map((newComparison) => {
      const key = `${newComparison.conditionA.description}-${newComparison.conditionB.description}`;

      // 检查是否存在对应的比较对并保留状态
      const moreImportant = comparisonMap.get(key) || null;

      return {
        ...newComparison,
        moreImportant,
      };
    });

    // 更新 comparisons 状态
    setComparisons(updatedComparisons);
  };





  // Helper function to generate pairs from a list of conditions
  const generatePairs = (conditionsList) => {
    const pairs = [];
    for (let i = 0; i < conditionsList.length; i++) {
      for (let j = i + 1; j < conditionsList.length; j++) {
        pairs.push({
          conditionA: conditionsList[i],
          conditionB: conditionsList[j],
          moreImportant: null,
        });
      }
    }
    return pairs;
  };

  // Step 3: Set the more important condition for each pair
  const setMoreImportant = (index, moreImportant) => {
    setComparisons((prevComparisons) => {
      const updatedComparisons = [...prevComparisons];
      updatedComparisons[index].moreImportant = moreImportant;
      return updatedComparisons;
    });
  };

  // 新增：矛盾检测函数
  function hasLogicalContradiction(data) {
    const graph = new Map();
    const conditions = new Set();

    // 构建图
    data.forEach(item => {
      const { conditionA, conditionB, moreImportant } = item;
      if (!moreImportant) return;
      const greater = moreImportant.description;
      const lesser = greater === conditionA.description ? conditionB.description : conditionA.description;

      if (!graph.has(greater)) graph.set(greater, []);
      graph.get(greater).push(lesser);

      conditions.add(greater);
      conditions.add(lesser);
    });

    const nodes = Array.from(conditions);
    let index = 0;
    const indices = new Map();
    const lowLink = new Map();
    const onStack = new Map();
    const stack = [];
    let hasCycle = false;

    function tarjan(node) {
      // 初始化当前节点的 index 和 low-link 值
      indices.set(node, index);
      lowLink.set(node, index);
      index++;
      stack.push(node);
      onStack.set(node, true);

      // 遍历当前节点的邻接节点
      if (graph.has(node)) {
        for (const neighbor of graph.get(node)) {
          if (!indices.has(neighbor)) {
            // 如果邻接节点没有被访问过，递归调用 Tarjan
            tarjan(neighbor);
            // 更新当前节点的 low-link 值
            lowLink.set(node, Math.min(lowLink.get(node), lowLink.get(neighbor)));
          } else if (onStack.get(neighbor)) {
            // 如果邻接节点在栈中，更新当前节点的 low-link 值
            lowLink.set(node, Math.min(lowLink.get(node), indices.get(neighbor)));
          }
        }
      }

      // 如果当前节点的 low-link 值等于它的 index 值，说明找到了一个强连通分量
      if (lowLink.get(node) === indices.get(node)) {
        const scc = [];
        let w;
        do {
          w = stack.pop();
          onStack.set(w, false);
          scc.push(w);
        } while (w !== node);

        // 如果强连通分量包含多个节点，则存在矛盾
        if (scc.length > 1) {
          hasCycle = true;
        }
      }
    }

    // 对每个节点执行 Tarjan 算法
    for (const node of nodes) {
      if (!indices.has(node)) {
        tarjan(node);
      }
    }

    return hasCycle;
  }

  // 检查是否完成所有条件比较
  const areComparisonsComplete = () => {
    console.log(JSON.stringify(comparisons));
    return comparisons.every((comparison) => comparison.moreImportant !== null);
  };

  // Step 4: Sort conditions based on comparisons
  const sortConditions = () => {
    if (!areComparisonsComplete()) {
      alert('请完成所有条件比较之后再进行排序！');
      return;
    }
    // 在排序之前检查是否有矛盾
    if (hasLogicalContradiction(comparisons)) {
      alert('存在矛盾的条件对比，无法继续排序。请检查正面和负面的条件比较。');
      return;
    }
    const positiveConditions = [...conditions.positive];
    const negativeConditions = [...conditions.negative];

    const sortedPositive = sortByImportance(positiveConditions, comparisons.filter(c => conditions.positive.includes(c.conditionA) && conditions.positive.includes(c.conditionB)));
    const sortedNegative = sortByImportance(negativeConditions, comparisons.filter(c => conditions.negative.includes(c.conditionA) && conditions.negative.includes(c.conditionB)));

    setConditions({ positive: sortedPositive, negative: sortedNegative });
    generateGroups(sortedPositive, sortedNegative);
  };

  // Helper function to sort conditions by importance
  const sortByImportance = (conditionsList, comparisons) => {
    return conditionsList.sort((a, b) => {
      const aWins = comparisons.filter(c => c.moreImportant === a).length;
      const bWins = comparisons.filter(c => c.moreImportant === b).length;
      return bWins - aWins;
    });
  };

  // Step 5: Generate groups of positive and negative conditions
  const generateGroups = (sortedPositive, sortedNegative) => {
    const groups = [];
    const minLength = Math.min(sortedPositive.length, sortedNegative.length);

    // Group the same length conditions together
    for (let i = 0; i < minLength; i++) {
      groups.push({
        positive: [sortedPositive[i]],
        negative: [sortedNegative[i]],
        weight: 0,
      });
    }

    // Handle remaining conditions if the lists have different lengths
    if (sortedPositive.length > minLength) {
      // Update the last group to add the remaining positive conditions
      groups[groups.length - 1].positive.unshift(...sortedPositive.slice(minLength));
    } else if (sortedNegative.length > minLength) {
      // Update the last group to add the remaining negative conditions
      groups[groups.length - 1].negative.unshift(...sortedNegative.slice(minLength));
    }

    setGroups(groups);
  };

  // 检查每个组是否都设置了权重
  const areGroupWeightsComplete = () => {
    return groups.every(group => group.weight !== undefined && group.weight !== 0);
  };

  // 检查 Compare Groups 是否都完成了
  const areGroupComparisonsComplete = () => {
    return groups.every(group => group.moreImportant !== null);
  };

  // Step 6: Set the weight for each group
  const setGroupWeight = (index, weight) => {
    setGroups((prevGroups) => {
      const updatedGroups = [...prevGroups];
      updatedGroups[index].weight = weight;
      return updatedGroups;
    });
  };

  // Step 7: Generate comparisons between groups
  const generateGroupComparisons = () => {
    if (!areGroupWeightsComplete()) {
      alert('请完成所有组的权重设置后再生成组比较！');
      return;
    }
    setShowCompareGroups(true); // 点击后显示 Compare Groups
    const updatedGroups = groups.map((group) => ({
      ...group,
      moreImportant: null, // Add moreImportant property to store which condition is more important
    }));
    setGroups(updatedGroups);
  };


  // Step 8: Set the more important group for each pair
  const setMoreImportantGroup = (index, value) => {
    const updatedGroups = [...groups];
    updatedGroups[index].moreImportant = value;
    setGroups(updatedGroups);
  };


  // Step 9: Calculate final decision result
  const calculateDecisionResult = () => {
    if (!areGroupComparisonsComplete()) {
      alert('请完成所有组的比较后再计算决策结果！');
      return;
    }
    let positiveScore = 0;
    let negativeScore = 0;

    // 遍历所有分组并根据 moreImportant 属性累加相应得分
    groups.forEach((group) => {
      if (group.moreImportant === 'positive') {
        positiveScore += group.weight;
      } else if (group.moreImportant === 'negative') {
        negativeScore += group.weight;
      }
    });

    if (positiveScore > negativeScore) {
      setDecisionResult('Positive Wins');
    } else if (negativeScore > positiveScore) {
      setDecisionResult('Negative Wins');
    } else {
      setDecisionResult(`It's a Tie`);
    }
  };

  const saveDecisionData = async () => {
    // 检查条件是否为空
    if (
      conditions.positive.length === 0 ||
      conditions.negative.length === 0 ||
      comparisons.length === 0 ||
      groups.length === 0
    ) {
      alert('Cannot save decision data. Please complete all the steps.');
      return;
    }
    const decisionData = {
      decisionName, // Include decision name
      conditions,
      comparisons,
      groups,
      decisionResult,
    };

    try {
      await api.post(`${API_BASE_URL}/api/save_decision`, decisionData);
      alert('Decision data saved successfully!');
    } catch (error) {
      console.error('Error saving decision data:', error);
      alert('Failed to save decision data.');
    }
  };


  return (
    <div className="decision-container">
      <h1 className="title">Balanced Decision Maker</h1>
      <div className="decision-name">
        <label>Decision Name:</label>
        <input
          type="text"
          value={decisionName}
          onChange={(e) => setDecisionName(e.target.value)}
          placeholder="Enter decision name"
          className='decision-name-input'
        />
      </div>
      <div className="section">
        <h2 className="section-title">Add Conditions</h2>
        <div className="input-group">
          <input type="text" id="positiveCondition" placeholder="Add positive condition" className="input" />
          <button className="button" onClick={() => addCondition('positive', document.getElementById('positiveCondition').value)}>Add Positive</button>
        </div>
        <div className="input-group">
          <input type="text" id="negativeCondition" placeholder="Add negative condition" className="input" />
          <button className="button" onClick={() => addCondition('negative', document.getElementById('negativeCondition').value)}>Add Negative</button>
        </div>
      </div>
      <div className="section">
        <h2 className="section-title">Conditions List</h2>
        <div className="conditions-container">
          <div className="conditions-column">
            <h3>Positive Conditions</h3>
            <ul>
              {conditions.positive.map((condition, index) => (
                <li key={index}>{condition.description}</li>
              ))}
            </ul>
          </div>
          <div className="conditions-column">
            <h3>Negative Conditions</h3>
            <ul>
              {conditions.negative.map((condition, index) => (
                <li key={index}>{condition.description}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="section">
        <h2 className="section-title">Compare Conditions</h2>
        <button className="button submit-button" onClick={generateComparisons}>Generate Comparisons</button>
        <div className="comparisons-list">
          {comparisons.map((comparison, index) => (
            <div key={index} className="comparison-item">
              <p>Which is more important?</p>
              <div className="comparison-options">
                <label>
                  <input
                    type="radio"
                    name={`comparison-${index}`}
                    onChange={() => setMoreImportant(index, comparison.conditionA)}
                    checked={comparison.moreImportant === comparison.conditionA} // 设置选中状态
                  />
                  {comparison.conditionA.description}
                </label>
                <label>
                  <input
                    type="radio"
                    name={`comparison-${index}`}
                    onChange={() => setMoreImportant(index, comparison.conditionB)}
                    checked={comparison.moreImportant === comparison.conditionB} // 设置选中状态
                  />
                  {comparison.conditionB.description}
                </label>
              </div>
            </div>
          ))}
        </div>

        <button className="button submit-button" onClick={sortConditions}>Sort Conditions</button>
      </div>
      <div className="section">
        <h2 className="section-title">Group Conditions and Set Weights</h2>
        <div className="groups-list">
          {groups.map((group, index) => (
            <div key={index} className="group-item">
              <div className="group-details">
                <p>Group {index + 1}:</p>
                <p>Positive: {group.positive.map((item) => item.description).join(', ')}</p>
                <p>Negative: {group.negative.map((item) => item.description).join(', ')}</p>
              </div>
              <input
                type="number"
                min="0"
                max="10"
                value={group.weight}
                onChange={(e) => setGroupWeight(index, parseInt(e.target.value))}
                className="weight-input"
              />
            </div>
          ))}
        </div>
        <button className="button submit-button" onClick={generateGroupComparisons}>Generate Group Comparisons</button>
      </div>
      {showCompareGroups && (
        <div className="section">
          <h2 className="section-title">Compare Groups</h2>

          <div className="comparisons-list">
            {groups.map((group, index) => (
              <div key={index} className="comparison-item">
                <p>Which is more important in Group {index + 1}?</p>
                <div className="comparison-options">
                  <label>
                    <input
                      type="radio"
                      name={`group-comparison-${index}`}
                      onChange={() => setMoreImportantGroup(index, 'positive')}
                      checked={group.moreImportant === 'positive'}
                    />
                    Positive: {Array.isArray(group.positive) ? group.positive.map((item) => item.description).join(', ') : group.positive.description}
                  </label>
                  <label>
                    <input
                      type="radio"
                      name={`group-comparison-${index}`}
                      onChange={() => setMoreImportantGroup(index, 'negative')}
                      checked={group.moreImportant === 'negative'}
                    />
                    Negative: {Array.isArray(group.negative) ? group.negative.map((item) => item.description).join(', ') : group.negative.description}
                  </label>
                </div>
              </div>
            ))}

          </div>

          <button className="button submit-button" onClick={calculateDecisionResult}>Calculate Decision Result</button>
          {decisionResult && (
            <div className="decision-result">
              <h3>Decision Result: {decisionResult}</h3>
            </div>
          )}
          <button className="button submit-button" onClick={saveDecisionData}>Save Decision</button>
        </div>
      )}

    </div>
  );
}

export default BalancedDecisionMaker;
