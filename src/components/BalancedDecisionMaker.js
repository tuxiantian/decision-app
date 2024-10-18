import React, { useState } from 'react';
import axios from 'axios';
import './BalancedDecisionMaker.css';

function BalancedDecisionMaker() {
  const [conditions, setConditions] = useState({ positive: [], negative: [] });
  const [comparisons, setComparisons] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupComparisons, setGroupComparisons] = useState([]);
  const [decisionResult, setDecisionResult] = useState(null);

  // Step 1: Add conditions (positive or negative)
  const addCondition = (type, condition) => {
    if (condition.trim() !== "") {
      setConditions((prev) => ({
        ...prev,
        [type]: [...prev[type], { description: condition, id: prev[type].length + 1 }],
      }));
    }
  };

  // Step 2: Generate pairs for comparison
  const generateComparisons = () => {
    const positivePairs = generatePairs(conditions.positive);
    const negativePairs = generatePairs(conditions.negative);
    setComparisons([...positivePairs, ...negativePairs]);
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

  // Step 4: Sort conditions based on comparisons
  const sortConditions = () => {
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
    const maxLength = Math.max(sortedPositive.length, sortedNegative.length);

    for (let i = 0; i < maxLength; i++) {
      const positiveCondition = sortedPositive[i] || sortedPositive[sortedPositive.length - 1];
      const negativeCondition = sortedNegative[i] || sortedNegative[sortedNegative.length - 1];
      groups.push({
        positive: positiveCondition,
        negative: negativeCondition,
        weight: 0,
      });
    }

    setGroups(groups);
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
    const groupPairs = [];
    for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        groupPairs.push({
          groupA: groups[i],
          groupB: groups[j],
          moreImportant: null,
        });
      }
    }
    setGroupComparisons(groupPairs);
  };

  // Step 8: Set the more important group for each pair
  const setMoreImportantGroup = (index, moreImportant) => {
    setGroupComparisons((prevGroupComparisons) => {
      const updatedGroupComparisons = [...prevGroupComparisons];
      updatedGroupComparisons[index].moreImportant = moreImportant;
      return updatedGroupComparisons;
    });
  };

  // Step 9: Calculate final decision result
  const calculateDecisionResult = () => {
    let positiveScore = 0;
    let negativeScore = 0;

    groupComparisons.forEach((comparison) => {
      if (comparison.moreImportant === comparison.groupA.positive) {
        positiveScore += comparison.groupA.weight;
      } else if (comparison.moreImportant === comparison.groupA.negative) {
        negativeScore += comparison.groupA.weight;
      }
    });

    setDecisionResult(positiveScore > negativeScore ? 'Positive Wins' : 'Negative Wins');
  };

  return (
    <div className="decision-container">
      <h1 className="title">Balanced Decision Maker</h1>
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
                  <input type="radio" name={`comparison-${index}`} onChange={() => setMoreImportant(index, comparison.conditionA)} />
                  {comparison.conditionA.description}
                </label>
                <label>
                  <input type="radio" name={`comparison-${index}`} onChange={() => setMoreImportant(index, comparison.conditionB)} />
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
                <p>Positive: {group.positive.description}</p>
                <p>Negative: {group.negative.description}</p>
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
      <div className="section">
        <h2 className="section-title">Compare Groups</h2>
        <div className="comparisons-list">
          {groupComparisons.map((comparison, index) => (
            <div key={index} className="comparison-item">
              <p>Which is more important?</p>
              <div className="comparison-options">
                <label>
                  <input type="radio" name={`group-comparison-${index}`} onChange={() => setMoreImportantGroup(index, comparison.groupA.positive)} />
                  Positive: {comparison.groupA.positive.description}
                </label>
                <label>
                  <input type="radio" name={`group-comparison-${index}`} onChange={() => setMoreImportantGroup(index, comparison.groupA.negative)} />
                  Negative: {comparison.groupA.negative.description}
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
      </div>
    </div>
  );
}

export default BalancedDecisionMaker;
