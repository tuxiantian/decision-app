import React from 'react';
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
                            <strong style={{ marginRight: '10px' }}>{todo.name}</strong>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <small style={{ marginBottom: '5px' }}>Start: {startTime.toLocaleString()}</small>
                                <small>End: {endTime.toLocaleString()}</small>
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
