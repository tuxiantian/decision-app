import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../App.css';  // 引入 CSS 文件
import { API_BASE_URL } from '../config';
import api from './api'; 

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [completedTodos, setCompletedTodos] = useState([]);
  const [endedTodos, setEndedTodos] = useState([]);
  const [selectedTab, setSelectedTab] = useState('completed'); // 新增状态，用于切换选项卡
  const [completedPage, setCompletedPage] = useState(1);
  const [endedPage, setEndedPage] = useState(1);
  const [totalCompletedPages, setTotalCompletedPages] = useState(1);
  const [totalEndedPages, setTotalEndedPages] = useState(1);
  const pageSize = 10;
  const [newTodoName, setNewTodoName] = useState('');
  const [newTodoDueDate, setNewTodoDueDate] = useState('');
  const [newTodoType, setNewTodoType] = useState('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [importance, setImportance] = useState(false);
  const [urgency, setUrgency] = useState(false);

  useEffect(() => {
    fetchTodos();
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

  const fetchTodos = () => {
    api.get(`${API_BASE_URL}/todos`)
      .then(response => {
        setTodos(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the todos!', error);
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

  const handleAddTodo = () => {
    if (newTodoName) {
      let startDate = '';
      let endDate = '';
      var currentDate = new Date();

      const toBeijingTimeString = (date) => {
        return date.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
      };

      if (newTodoType === 'today') {
        // 今天的开始和结束时间
        startDate = toBeijingTimeString(currentDate);
        const todayEnd = new Date(currentDate);
        todayEnd.setHours(23, 59, 59, 999);
        endDate = toBeijingTimeString(todayEnd);
      } else if (newTodoType === 'tomorrow') {
        // 明天的开始和结束时间
        startDate = toBeijingTimeString(currentDate); // 开始时间为当前时间
        const tomorrow = new Date(currentDate);
        tomorrow.setDate(currentDate.getDate() + 1); // 设置为明天
        tomorrow.setHours(23, 59, 59, 999); // 设置时间为明天的 23:59:59
        endDate = toBeijingTimeString(tomorrow); // 结束时间
      } else if (newTodoType === 'this_week') {
        // 本周的开始和结束时间
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(currentDate);
        endOfWeek.setDate(currentDate.getDate() + (6 - currentDate.getDay()));
        endOfWeek.setHours(23, 59, 59, 999);

        startDate = toBeijingTimeString(startOfWeek);
        endDate = toBeijingTimeString(endOfWeek);
      } else if (newTodoType === 'this_month') {
        // 本月的开始和结束时间
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);

        startDate = toBeijingTimeString(startOfMonth);
        endDate = toBeijingTimeString(endOfMonth);
      } else if (newTodoType === 'custom') {
        // 自定义开始和结束时间
        startDate = toBeijingTimeString(new Date(customStartDate));
        endDate = toBeijingTimeString(new Date(customEndDate));
      } else if (newTodoType === 'one_week') {
        // 从今天开始算的未来一周的开始和结束时间，保持时间一致
        startDate = toBeijingTimeString(currentDate);
        const oneWeekEnd = new Date(currentDate);
        oneWeekEnd.setDate(currentDate.getDate() + 6);
        oneWeekEnd.setHours(23, 59, 59, 999); // 确保设置到当天的结束时间
        endDate = toBeijingTimeString(oneWeekEnd);
      } else if (newTodoType === 'one_month') {
        // 从今天开始算的未来一个月的开始和结束时间
        startDate = toBeijingTimeString(currentDate);
        const oneMonthEnd = new Date(currentDate);
        oneMonthEnd.setMonth(currentDate.getMonth() + 1);
        oneMonthEnd.setDate(0); // 设置到下个月的最后一天
        oneMonthEnd.setHours(23, 59, 59, 999); // 确保设置到当天的结束时间
        endDate = toBeijingTimeString(oneMonthEnd);
      }

      const newTodo = {
        name: newTodoName,
        start_time: startDate,
        end_time: endDate,
        type: newTodoType,
        importance,
        urgency,
        status: 'in_progress'
      };

      api.post(`${API_BASE_URL}/todos`, newTodo)
        .then(response => {
          setTodos([...todos, response.data]);
          setNewTodoName('');
          setNewTodoDueDate('');
          setNewTodoType('today');
          setCustomStartDate('');
          setCustomEndDate('');
          setImportance(false);
          setUrgency(false);
        })
        .catch(error => {
          console.error('There was an error adding the todo!', error);
        });
    }
  };

  const handleTodoCompletion = (id) => {
    api.put(`${API_BASE_URL}/todos/${id}`, { status: 'completed' })
      .then(() => {
        // 更新状态后的操作，刷新待办列表和已完成列表
        fetchTodos(); // 更新待办事项列表
        fetchCompletedTodos(completedPage); // 更新已完成事项列表
      })
      .catch(error => {
        console.error('There was an error updating the todo!', error);
      });
  };

  const handleRemoveTodo = (id) => {
    api.delete(`${API_BASE_URL}/todos/${id}`)
      .then(() => {
        fetchTodos(); // 更新待办事项列表
        fetchCompletedTodos(completedPage); // 更新已完成事项列表
      })
      .catch(error => {
        console.error('There was an error deleting the todo!', error);
      });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2>Todo List</h2>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Todo Name"
          value={newTodoName}
          onChange={(e) => setNewTodoName(e.target.value)}
          style={{ marginRight: '10px' }}
        />
        {newTodoType === 'custom' && (
          <>
            <input
              type="datetime-local"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              style={{ marginRight: '10px' }}
            />
            <input
              type="datetime-local"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              style={{ marginRight: '10px' }}
            />
          </>
        )}
        <select
          value={newTodoType}
          onChange={(e) => setNewTodoType(e.target.value)}
          style={{ marginRight: '10px' }}
        >
          <option value="today">Today</option>
          <option value="tomorrow">Tomorrow</option>
          <option value="this_week">This Week</option>
          <option value="this_month">This Month</option>
          <option value="one_week">One Week</option>
          <option value="one_month">One Month</option>
          <option value="custom">Custom</option>
        </select>
        <label style={{ marginRight: '10px' }}>
          <input
            type="checkbox"
            checked={importance}
            onChange={(e) => setImportance(e.target.checked)}
          />
          Important
        </label>
        <label style={{ marginRight: '10px' }}>
          <input
            type="checkbox"
            checked={urgency}
            onChange={(e) => setUrgency(e.target.checked)}
          />
          Urgent
        </label>
        <button onClick={handleAddTodo} className='green-button'>Add Todo</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '20px', width: '80%', marginTop: '20px' }}>
        <div style={{ border: '1px solid #000', padding: '10px' }}>
          <h3 style={{ backgroundColor: 'red' }}>重要且紧急</h3>
          {todos.filter(todo => todo.importance && todo.urgency && todo.status === 'in_progress').map(todo => (
            <div key={todo.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <input
                type="checkbox"
                onChange={() => handleTodoCompletion(todo.id)}
                style={{ marginRight: '10px' }}
              />
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <strong style={{ marginRight: '10px' }}>{todo.name}</strong>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <small style={{ marginBottom: '5px' }}>Start: {new Date(todo.start_time).toLocaleString()}</small>
                  <small>End: {new Date(todo.end_time).toLocaleString()}</small>
                </div>
              </div>
              <button onClick={() => handleRemoveTodo(todo.id)} style={{ marginLeft: '10px' }} className='red-button'>Remove</button>
            </div>


          ))}
        </div>
        <div style={{ border: '1px solid #000', padding: '10px' }}>
          <h3 style={{ backgroundColor: 'orange' }}>重要但不紧急</h3>
          {todos.filter(todo => todo.importance && !todo.urgency && todo.status === 'in_progress').map(todo => (
            <div key={todo.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <input
                type="checkbox"
                onChange={() => handleTodoCompletion(todo.id)}
                style={{ marginRight: '10px' }}
              />
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <strong style={{ marginRight: '10px' }}>{todo.name}</strong>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <small style={{ marginBottom: '5px' }}>Start: {new Date(todo.start_time).toLocaleString()}</small>
                  <small>End: {new Date(todo.end_time).toLocaleString()}</small>
                </div>
              </div>
              <button onClick={() => handleRemoveTodo(todo.id)} style={{ marginLeft: '10px' }} className='red-button'>Remove</button>
            </div>
          ))}
        </div>
        <div style={{ border: '1px solid #000', padding: '10px' }}>
          <h3 style={{ backgroundColor: '#FFD700' }}>不重要但紧急</h3>
          {todos.filter(todo => !todo.importance && todo.urgency && todo.status === 'in_progress').map(todo => (
            <div key={todo.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <input
                type="checkbox"
                onChange={() => handleTodoCompletion(todo.id)}
                style={{ marginRight: '10px' }}
              />
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <strong style={{ marginRight: '10px' }}>{todo.name}</strong>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <small style={{ marginBottom: '5px' }}>Start: {new Date(todo.start_time).toLocaleString()}</small>
                  <small>End: {new Date(todo.end_time).toLocaleString()}</small>
                </div>
              </div>
              <button onClick={() => handleRemoveTodo(todo.id)} style={{ marginLeft: '10px' }} className='green-button'>Remove</button>
            </div>
          ))}
        </div>
        <div style={{ border: '1px solid #000', padding: '10px' }}>
          <h3 style={{ backgroundColor: 'green' }}>不重要也不紧急</h3>
          {todos.filter(todo => !todo.importance && !todo.urgency && todo.status === 'in_progress').map(todo => (
            <div key={todo.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <input
                type="checkbox"
                onChange={() => handleTodoCompletion(todo.id)}
                style={{ marginRight: '10px' }}
              />
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <strong style={{ marginRight: '10px' }}>{todo.name}</strong>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <small style={{ marginBottom: '5px' }}>Start: {new Date(todo.start_time).toLocaleString()}</small>
                  <small>End: {new Date(todo.end_time).toLocaleString()}</small>
                </div>
              </div>
              <button onClick={() => handleRemoveTodo(todo.id)} style={{ marginLeft: '10px' }} className='red-button'>Remove</button>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs for switching between Completed and Ended Todos */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
        <button onClick={() => setSelectedTab('completed')} className={`tab-button ${selectedTab === 'completed' ? 'active' : ''}`}>
          Completed Todos
        </button>
        <button onClick={() => setSelectedTab('ended')} className={`tab-button ${selectedTab === 'ended' ? 'active' : ''}`}>
          Ended Todos
        </button>
      </div>
      {/* Conditional rendering for Completed and Ended Todos */}

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
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '20px' }}>
              <button onClick={handlePrevCompletedPage} disabled={completedPage === 1} className='green-button'>Previous</button>
              <p>Page {completedPage} of {totalCompletedPages}</p>
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

            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '20px' }}>
              <button onClick={handlePrevEndedPage} disabled={endedPage === 1} className='green-button'>Previous</button>
              <p>Page {completedPage} of {totalCompletedPages}</p>
              <button onClick={handleNextEndedPage} disabled={endedPage === totalEndedPages} className='green-button'>Next</button>
            </div>

          </div>
        </>
      )}





    </div>
  );
};

export default TodoList;
