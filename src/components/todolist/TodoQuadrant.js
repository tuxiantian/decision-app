import React from 'react';
import { Tooltip } from 'react-tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const TodoQuadrant = ({ todos, onTodoCompletion, onRemoveTodo }) => {
    return (
        <>
            {todos.map(todo => {
                const startTime = new Date(todo.start_time);
                const endTime = new Date(todo.end_time);
                const currentTime = new Date();

                const totalTime = endTime - startTime;
                const timePassed = Math.min(currentTime - startTime, totalTime);
                const remainingPercent = Math.max(0, Math.min(100, ((totalTime - timePassed) / totalTime) * 100));

                return (
                    <div key={todo.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        <input
                            type="checkbox"
                            onChange={() => onTodoCompletion(todo.id)}
                            style={{ marginRight: '10px' }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                            <strong style={{ marginRight: '10px',textAlign:'left' }}>{todo.name}</strong>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>

                                {/* 开始时间图标+Tooltip */}
                                <div title={`开始时间: ${startTime.toLocaleString()}`} style={{ position: 'relative' }}
                                    data-tip={`开始时间: ${startTime.toLocaleString()}`}
                                    data-for="start-time-tooltip">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="12" cy="12" r="9" stroke="#666666" strokeWidth="2" />
                                        <path d="M12 6V12" stroke="#666666" strokeWidth="2" strokeLinecap="round" />
                                        <path d="M12 12L16 14" stroke="#666666" strokeWidth="2" strokeLinecap="round" />
                                        <circle cx="12" cy="12" r="2" fill="#666666" />
                                        <path d="M7 3L7 6M17 3L17 6" stroke="#666666" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <Tooltip id="start-time-tooltip" effect="solid" />

                                {/* 结束时间图标+Tooltip */}
                                <div title={`结束时间: ${endTime.toLocaleString()}`} style={{ position: 'relative' }}
                                    data-tip={`结束时间: ${endTime.toLocaleString()}`}
                                    data-for="end-time-tooltip">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="12" cy="12" r="9" stroke="#666666" strokeWidth="2" />
                                        <path d="M12 6V12" stroke="#666666" strokeWidth="2" strokeLinecap="round" />
                                        <path d="M12 12L8 15" stroke="#666666" strokeWidth="2" strokeLinecap="round" />
                                        <circle cx="12" cy="12" r="2" fill="#666666" />
                                        <path d="M7 3L7 6M17 3L17 6" stroke="#666666" strokeWidth="2" strokeLinecap="round" />
                                        <path d="M6 19L18 19" stroke="#666666" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <Tooltip id="end-time-tooltip" effect="solid" />
                            </div>
                        </div>
                        <div
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: `conic-gradient(
                                    green ${remainingPercent}%,
                                    red ${remainingPercent}% 100%
                                )`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.8em',
                                color: 'white',
                                marginLeft: '10px',
                            }}
                        >
                            {remainingPercent.toFixed(0)}%
                        </div>
                        <button onClick={() => onRemoveTodo(todo.id)} style={{ marginLeft: '10px', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <FontAwesomeIcon icon={faTrash} style={{ color: '#ff4444', fontSize: '1.2rem' }} />
                        </button>
                    </div>
                );
            })}
        </>
    );
};

export default TodoQuadrant;
