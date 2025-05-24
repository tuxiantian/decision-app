import React, { useState } from 'react';

const KellyCalculator = () => {
  const [winGain, setWinGain] = useState(1.0);    // b - 赢局收获比例
  const [lossLoss, setLossLoss] = useState(1.0);   // a - 输局损失比例
  const [winProb, setWinProb] = useState(0.5);     // p - 赢的概率
  const [totalCapital, setTotalCapital] = useState(1000); // 总资金
  const [result, setResult] = useState(null);      // 计算结果

  const calculateInvestment = () => {
    // 验证输入
    if (winProb <= 0 || winProb >= 1) {
      alert('赢的概率必须在0和1之间');
      return;
    }
    if (winGain <= 0) {
      alert('赢局收获必须大于0');
      return;
    }
    if (lossLoss <= 0) {
      alert('输局损失必须大于0');
      return;
    }
    if (totalCapital <= 0) {
      alert('总资金必须大于0');
      return;
    }

    const loseProb = 1 - winProb; // q = 1 - p
    const fraction = (winProb / lossLoss) - (loseProb / winGain); // f = p/a - q/b
    
    setResult({
      fraction: fraction,
      amount: fraction * totalCapital,
      isValid: fraction > 0 && fraction <= 1
    });
  };

  const handleReset = () => {
    setWinGain(1.0);
    setLossLoss(1.0);
    setWinProb(0.5);
    setTotalCapital(1000);
    setResult(null);
  };

  // 格式化百分比显示
  const formatPercent = (value) => {
    return (value * 100).toFixed(2) + '%';
  };

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '0 auto', 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ 
        textAlign: 'center', 
        color: '#2c3e50',
        marginBottom: '25px'
      }}>凯利投资比例计算器</h2>
      
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '15px',
        marginBottom: '20px'
      }}>
        {/* 第一行：赢局收获和输局损失 */}
        <div style={{ 
          backgroundColor: 'white',
          padding: '15px',
          borderRadius: '6px'
        }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 'bold',
            color: '#34495e'
          }}>
            赢局收获比例 (b):
          </label>
          <input
            type="number"
            value={winGain}
            onChange={(e) => setWinGain(parseFloat(e.target.value))}
            step="0.1"
            min="0.1"
            style={{ 
              width: '100%', 
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
          <div style={{ fontSize: '0.8em', color: '#7f8c8d', marginTop: '5px' }}>
            例如: 1.5 表示赢时获得1.5倍本金
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: 'white',
          padding: '15px',
          borderRadius: '6px'
        }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 'bold',
            color: '#34495e'
          }}>
            输局损失比例 (a):
          </label>
          <input
            type="number"
            value={lossLoss}
            onChange={(e) => setLossLoss(parseFloat(e.target.value))}
            step="0.1"
            min="0.1"
            style={{ 
              width: '100%', 
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
          <div style={{ fontSize: '0.8em', color: '#7f8c8d', marginTop: '5px' }}>
            例如: 1.0 表示输时损失全部本金
          </div>
        </div>
        
        {/* 第二行：赢的概率和总资金 */}
        <div style={{ 
          backgroundColor: 'white',
          padding: '15px',
          borderRadius: '6px'
        }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 'bold',
            color: '#34495e'
          }}>
            赢的概率 (p):
          </label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="number"
              value={winProb}
              onChange={(e) => setWinProb(parseFloat(e.target.value))}
              step="0.01"
              min="0.01"
              max="0.99"
              style={{ 
                flex: '1', 
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
            <span style={{ 
              marginLeft: '10px', 
              color: '#3498db',
              fontWeight: 'bold'
            }}>{formatPercent(winProb)}</span>
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: 'white',
          padding: '15px',
          borderRadius: '6px'
        }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 'bold',
            color: '#34495e'
          }}>
            总资金:
          </label>
          <input
            type="number"
            value={totalCapital}
            onChange={(e) => setTotalCapital(parseFloat(e.target.value))}
            step="10"
            min="1"
            style={{ 
              width: '100%', 
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>
      </div>
      
      {/* 按钮行 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '25px',
        gap: '10px'
      }}>
        <button
          onClick={calculateInvestment}
          style={{
            padding: '12px 0',
            backgroundColor: '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            flex: '1',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'background-color 0.3s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#2ecc71'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#27ae60'}
        >
          计算投资比例
        </button>
        <button
          onClick={handleReset}
          style={{
            padding: '12px 0',
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            flex: '1',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'background-color 0.3s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#c0392b'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#e74c3c'}
        >
          重置
        </button>
      </div>
      
      {/* 结果展示 */}
      {result && (
        <div style={{
          backgroundColor: result.isValid ? '#e8f5e9' : '#ffebee',
          padding: '20px',
          borderRadius: '6px',
          borderLeft: `4px solid ${result.isValid ? '#2ecc71' : '#e74c3c'}`,
          marginBottom: '20px'
        }}>
          <h3 style={{ 
            marginTop: '0', 
            color: result.isValid ? '#27ae60' : '#e74c3c',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            {result.isValid ? '✓ 计算结果' : '⚠ 计算结果'}
          </h3>
          
          <div style={{ marginBottom: '15px' }}>
            <p style={{ margin: '5px 0' }}>
              <strong>建议投资比例 (f):</strong> 
              <span style={{ 
                color: result.fraction > 0.5 ? '#e67e22' : '#2c3e50',
                fontWeight: 'bold',
                marginLeft: '10px'
              }}>
                {formatPercent(result.fraction)}
              </span>
            </p>
            <p style={{ margin: '5px 0' }}>
              <strong>建议投资金额:</strong> 
              <span style={{ 
                color: '#16a085',
                fontWeight: 'bold',
                marginLeft: '10px'
              }}>
                {result.amount.toFixed(2)}
              </span>
            </p>
          </div>
          
          {!result.isValid ? (
            <div style={{ 
              backgroundColor: '#fde0dc',
              padding: '10px',
              borderRadius: '4px',
              borderLeft: '3px solid #e74c3c'
            }}>
              <p style={{ 
                color: '#c0392b',
                fontWeight: 'bold',
                margin: '0'
              }}>
                {result.fraction <= 0 ? 
                  '不建议进行此项投资 (f ≤ 0)' : 
                  '建议投资比例超过100%，请谨慎评估风险'}
              </p>
            </div>
          ) : result.fraction > 0.5 ? (
            <div style={{ 
              backgroundColor: '#fff3e0',
              padding: '10px',
              borderRadius: '4px',
              borderLeft: '3px solid #f39c12'
            }}>
              <p style={{ 
                color: '#e67e22',
                fontWeight: 'bold',
                margin: '0'
              }}>
                警告：建议投资比例超过50%，风险较高
              </p>
            </div>
          ) : null}
        </div>
      )}
      
      {/* 公式说明 */}
      <div style={{ 
        backgroundColor: '#eaf2f8',
        padding: '15px',
        borderRadius: '6px',
        fontSize: '0.9em'
      }}>
        <h4 style={{ 
          marginTop: '0',
          color: '#2980b9',
          borderBottom: '1px solid #d4e6f1',
          paddingBottom: '5px'
        }}>公式说明</h4>
        <p style={{ margin: '5px 0' }}><strong>投资比例公式:</strong> f = p/a - q/b</p>
        <p style={{ margin: '5px 0' }}>其中:</p>
        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
          <li>f = 建议投资资金比例</li>
          <li>a = 输局损失比例</li>
          <li>b = 赢局收获比例</li>
          <li>p = 赢的概率 (q = 1 - p)</li>
        </ul>
      </div>
    </div>
  );
};

export default KellyCalculator;