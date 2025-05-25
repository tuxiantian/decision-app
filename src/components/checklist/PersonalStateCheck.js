import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PersonalStateCheck.css'

// 定义状态的枚举对象
const states = {
  INITIAL: 'initial',
  RESTED_CHECK: 'rested_check',
  MOOD_CHECK: 'mood_check',
  CALM_DOWN: 'calm_down',
  DELIBERATE_CHECK: 'deliberate_check',
  PERSUADED_CHECK: 'persuaded_check',
  SUCCESS: 'success',
};

const PersonalStateCheck = ({ onAssessmentComplete }) => {
  const [currentState, setCurrentState] = useState(states.RESTED_CHECK);
  const [mood, setMood] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false); // 控制通过状态检测的弹窗
  const [showModal, setShowModal] = useState(false); // 控制其他弹窗
  const [modalMessage, setModalMessage] = useState(''); // 弹窗的消息内容
  const [modalCallback, setModalCallback] = useState(null); // 弹窗关闭后的回调
  const navigate = useNavigate(); // 使用 useNavigate 进行页面跳转

  useEffect(() => {
    // 自动处理流程的推进逻辑
    if (currentState === states.SUCCESS) {
      // 显示通过状态检测的弹窗，3秒后跳转到做决定的页面
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        onAssessmentComplete(); // 完成评估并进入决策
      }, 3000);
    }
  }, [currentState, onAssessmentComplete]);

  const handleRested = (isRested) => {
    if (isRested) {
      setCurrentState(states.MOOD_CHECK);
    } else {
      setModalMessage('人在疲惫的状态下，深度思考的能力不足，容易做出非理智的决定，请饱饱的睡一觉再考虑做决定。');
      setModalCallback(null); // 无需特殊操作，只是关闭弹窗
      setShowModal(true);
    }
  };

  const handleMoodChange = (newMood) => {
    setMood(newMood);
    if (newMood === '平静') {
      setCurrentState(states.PERSUADED_CHECK);
    } else if (newMood === '愤怒' || newMood === '悲伤') {
      if (newMood === '愤怒') {
        setModalMessage('人在愤怒的状态下，容易冲动做出不理智的行动，去让自己平静下来。')
      } else if (newMood === '悲伤') {
        setModalMessage('人在悲观的状态下，对事情的看法偏向负面，态度偏向消极，往往会做出不理智的行动，去让自己平静下来。')
      }
      setShowModal(true);
      setModalCallback(() => () => setCurrentState(states.CALM_DOWN));
    } else if (newMood === '兴奋') {
      setCurrentState(states.DELIBERATE_CHECK);
    }
  };

  const handleCalmDown = () => {
    setCurrentState(states.PERSUADED_CHECK);
  };

  const handleDeliberate = (isDeliberate) => {
    if (isDeliberate) {
      setCurrentState(states.PERSUADED_CHECK);
    } else {
      setModalMessage('人在兴奋的状态下，往往对事情的看法过于乐观，往往看不到事情背后的风险，当前状态可能不够理性，请推迟做决定');
      setModalCallback(() => () => navigate('/checklists'));
      setShowModal(true);
    }
  };

  const handlePersuaded = (isPersuaded) => {
    if (isPersuaded) {
      setModalMessage('人在被说服的状态下，在说服者的滤镜下看事情角度很单一，容易做出事后后悔的决定。这个时候最好的做法是找朋友、家人沟通自己的想法，或者给自己一个冷静期，待冷静期后再做决定。');
      setModalCallback(() => () => navigate('/checklists'));
      setShowModal(true);
    } else {
      setCurrentState(states.SUCCESS);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (modalCallback) {
      modalCallback();
    }
  };

  return (
    <div className="personal-state-check" style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* 成功检测通过后的弹窗 */}
      {showSuccessModal && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '30px',
            backgroundColor: '#f0fdf4',
            boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.2)',
            zIndex: 1000,
            textAlign: 'center',
            borderRadius: '10px',
          }}
        >
          <div style={{ marginBottom: '15px' }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="green"
              width="48px"
              height="48px"
            >
              <path d="M0 0h24v24H0z" fill="none" />
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z" />
            </svg>
          </div>
          <h3 style={{ color: '#065f46' }}>状态检测通过，可以去做决定了</h3>
          <p style={{ color: '#065f46' }}>即将跳转到决策页面...</p>
        </div>
      )}

      {/* 通用弹窗 */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '20px',
            backgroundColor: '#fff',
            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
            zIndex: 1000,
            textAlign: 'center',
          }}
        >
          <p style={{ textAlign: 'left' }}>{modalMessage}</p>
          <button
            onClick={handleCloseModal}
            style={{
              marginTop: '15px',
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            确定
          </button>
        </div>
      )}

      {/* 不同状态下的问题和选项 */}
      {currentState === states.RESTED_CHECK && (
        <div>
          <h2>状态检查 - 是否感到疲惫？</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
            <button onClick={() => handleRested(false)} className='green-button'>是</button>
            <button onClick={() => handleRested(true)} className='green-button'>否</button>
          </div>
        </div>
      )}

      {currentState === states.MOOD_CHECK && (
        <div>
          <h2>状态检查 - 你现在的心情是什么样的？</h2>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '15px', marginTop: '20px' }}>
            <button onClick={() => handleMoodChange('愤怒')} className='green-button'>
              😠 愤怒
            </button>
            <button onClick={() => handleMoodChange('悲伤')} className='green-button'>
              😢 悲伤
            </button>
            <button onClick={() => handleMoodChange('兴奋')} className='green-button'>
              🤩 兴奋
            </button>
            <button onClick={() => handleMoodChange('平静')} className='green-button'>
              😌 平静
            </button>
          </div>
        </div>
      )}

      {currentState === states.CALM_DOWN && (
        <div>
          <h2>状态检查 - 请尝试平静下来</h2>
          <div >
            <p>上帝，赐我平和，接受无法改变的事物；</p>
            <p>赐我勇气，去改变能改变的事物；</p>
            <p>赐我智慧，去分辨这两者。</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
            <button onClick={handleCalmDown} className='green-button'>已经平静</button>
          </div>
        </div>
      )}

      {currentState === states.DELIBERATE_CHECK && (
        <div>
          <h2>状态检查 - 决定是否经过深思熟虑？</h2>
          <img src="/images/我深思熟虑了吗？.png" alt='我深思熟虑了吗？' style={{ display: 'block', margin: '20px auto', maxWidth: '100%', height: 'auto', transform: 'scale(1.5)' }} />
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '90px' }}>
            <button onClick={() => handleDeliberate(true)} className='green-button'>是</button>
            <button onClick={() => handleDeliberate(false)} className='green-button'>否</button>
          </div>
        </div>
      )}

      {currentState === states.PERSUADED_CHECK && (
        <div>
          <h2>状态检查 - 是否正在被人说服？</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
            <button onClick={() => handlePersuaded(true)} className='green-button'>是</button>
            <button onClick={() => handlePersuaded(false)} className='green-button'>否</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalStateCheck;
