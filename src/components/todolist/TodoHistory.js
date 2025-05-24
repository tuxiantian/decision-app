import React, { useEffect, useState } from 'react';
import '../../App.css';  // 引入 CSS 文件
import { API_BASE_URL } from '../../config';
import api from '../api';

const TodoHistory = ({ }) => {

    const [completedTodos, setCompletedTodos] = useState([]);
    const [endedTodos, setEndedTodos] = useState([]);
    const [selectedTab, setSelectedTab] = useState('completed'); // 新增状态，用于切换选项卡
    const [completedPage, setCompletedPage] = useState(1);
    const [endedPage, setEndedPage] = useState(1);
    const [totalCompletedPages, setTotalCompletedPages] = useState(1);
    const [totalEndedPages, setTotalEndedPages] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        fetchCompletedTodos(completedPage);
        fetchEndedTodos(endedPage);
    }, []);

    // 当 completedPage 发生变化时重新获取已完成的待办事项
    useEffect(() => {
        fetchCompletedTodos(completedPage);
    }, [completedPage]);

    useEffect(() => {
        fetchEndedTodos(endedPage);
    }, [endedPage]);

    const handleRemoveTodo = (id) => {
        api.delete(`${API_BASE_URL}/todos/${id}`)
            .then(() => {
                fetchCompletedTodos(completedPage); // 更新已完成事项列表
            })
            .catch(error => {
                console.error('There was an error deleting the todo!', error);
            });
    };

    const fetchCompletedTodos = (page) => {
        api.get(`${API_BASE_URL}/todos/completed`, {
            params: {
                page,
                page_size: pageSize
            }
        })
            .then(response => {
                setCompletedTodos(response.data.todos);
                setTotalCompletedPages(response.data.total_pages);
            })
            .catch(error => {
                console.error('There was an error fetching the completed todos!', error);
            });

    };

    // 新增方法，获取已结束的 Todo
    const fetchEndedTodos = (page) => {
        api.get(`${API_BASE_URL}/todos/ended`, {
            params: {
                page,
                page_size: pageSize
            }
        })
            .then(response => {
                setEndedTodos(response.data.todos);
                setTotalEndedPages(response.data.total_pages);
            })
            .catch(error => {
                console.error('There was an error fetching the ended todos!', error);
            });
    };

    const handleNextCompletedPage = () => {
        if (completedPage < totalCompletedPages) {
            setCompletedPage(completedPage + 1);
        }
    };

    const handlePrevCompletedPage = () => {
        if (completedPage > 1) {
            setCompletedPage(completedPage - 1);
        }
    };

    const handleNextEndedPage = () => {
        if (endedPage < totalEndedPages) {
            setEndedPage(endedPage + 1);
        }
    };

    const handlePrevEndedPage = () => {
        if (endedPage > 1) {
            setEndedPage(endedPage - 1);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ margin: '20px auto', display: 'flex', justifyContent: 'center', width: '600px' }}>
                <button onClick={() => setSelectedTab('completed')} className={`tab-button ${selectedTab === 'completed' ? 'active' : ''}`}>
                    Completed Todos
                </button>
                <button onClick={() => setSelectedTab('ended')} className={`tab-button ${selectedTab === 'ended' ? 'active' : ''}`}>
                    Ended Todos
                </button>
            </div>
            {selectedTab === 'completed' && (
                <>
                    <div style={{ marginTop: '20px', width: '80%' }}>
                        <h3>Completed Todos</h3>
                        {completedTodos.map(todo => (
                            <div key={todo.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                <div style={{
                                    marginBottom: '10px',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    backgroundColor:
                                        todo.importance && todo.urgency ? 'red' :
                                            todo.importance && !todo.urgency ? 'orange' :
                                                !todo.importance && todo.urgency ? '#FFD700' : 'green',
                                    color:
                                        todo.importance && todo.urgency ? 'white' :
                                            todo.importance && !todo.urgency ? 'white' :
                                                !todo.importance && todo.urgency ? 'black' : 'white'
                                }}>
                                    <strong style={{ margin: '0 5px' }}>{todo.name}</strong>
                                    <small style={{ margin: '0 5px' }}>Importance: {todo.importance ? 'Yes' : 'No'}</small>
                                    <small style={{ margin: '0 5px' }}>Urgency: {todo.urgency ? 'Yes' : 'No'}</small>
                                    <small style={{ margin: '0 5px' }}>Completed At: {new Date(todo.updated_at).toLocaleString()}</small>
                                </div>
                                <button onClick={() => handleRemoveTodo(todo.id)} style={{ marginLeft: '10px' }} className='red-button'>Remove</button>
                            </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'flex-start', margin: '20px auto' }}>
                            <button onClick={handlePrevCompletedPage} disabled={completedPage === 1} className='green-button'>Previous</button>
                            <p style={{ margin: '0 10px', display: 'flex', alignItems: 'center' }}>Page {completedPage} of {totalCompletedPages}</p>
                            <button onClick={handleNextCompletedPage} disabled={completedPage === totalCompletedPages} className='green-button'>Next</button>
                        </div>
                    </div>
                </>
            )}

            {selectedTab === 'ended' && (
                <>
                    <div style={{ marginTop: '20px', width: '80%' }}>
                        <h3>Ended Todos</h3>
                        {endedTodos.map(todo => (
                            <div key={todo.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                <div style={{
                                    marginBottom: '10px',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    backgroundColor:
                                        todo.importance && todo.urgency ? 'gray' :
                                            todo.importance && !todo.urgency ? 'darkorange' :
                                                !todo.importance && todo.urgency ? '#FFEB3B' : 'lightgray',
                                    color:
                                        todo.importance && todo.urgency ? 'white' :
                                            todo.importance && !todo.urgency ? 'black' :
                                                !todo.importance && todo.urgency ? 'black' : 'black'
                                }}>
                                    <strong style={{ margin: '0 5px' }}>{todo.name}</strong>
                                    <small style={{ margin: '0 5px' }}>Importance: {todo.importance ? 'Yes' : 'No'}</small>
                                    <small style={{ margin: '0 5px' }}>Urgency: {todo.urgency ? 'Yes' : 'No'}</small>
                                    <small style={{ margin: '0 5px' }}>Ended At: {new Date(todo.updated_at).toLocaleString()}</small>
                                </div>
                            </div>
                        ))}

                        <div style={{ display: 'flex', justifyContent: 'flex-start', margin: '20px auto' }}>
                            <button onClick={handlePrevEndedPage} disabled={endedPage === 1} className='green-button'>Previous</button>
                            <p style={{ margin: '0 10px', display: 'flex', alignItems: 'center' }}>Page {completedPage} of {totalCompletedPages}</p>
                            <button onClick={handleNextEndedPage} disabled={endedPage === totalEndedPages} className='green-button'>Next</button>
                        </div>

                    </div>
                </>
            )}
        </div>
    );
}

export default TodoHistory;