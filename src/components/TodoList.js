import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [completedTodos, setCompletedTodos] = useState([]);
  const [completedPage, setCompletedPage] = useState(1);
  const [totalCompletedPages, setTotalCompletedPages] = useState(1);
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
  }, []);

  // 当 completedPage 发生变化时重新获取已完成的待办事项
  useEffect(() => {
    fetchCompletedTodos(completedPage);
  }, [completedPage]);

  const fetchTodos = () => {
    axios.get('http://localhost:5000/todos')
      .then(response => {
        setTodos(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the todos!', error);
      });
  };

  const fetchCompletedTodos = (page) => {
    axios.get('http://localhost:5000/todos/completed', {
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

  const handleAddTodo = () => {
    if (newTodoName) {
      let startDate = '';
      let endDate = '';
      const currentDate = new Date();

      if (newTodoType === 'today') {
        startDate = currentDate.toISOString();
        endDate = new Date(currentDate.setHours(23, 59, 59)).toISOString();
      } else if (newTodoType === 'this_week') {
        const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
        const endOfWeek = new Date(currentDate.setDate(currentDate.getDate() + (6 - currentDate.getDay())));
        startDate = startOfWeek.toISOString();
        endDate = new Date(endOfWeek.setHours(23, 59, 59)).toISOString();
      } else if (newTodoType === 'this_month') {
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        startDate = startOfMonth.toISOString();
        endDate = new Date(endOfMonth.setHours(23, 59, 59)).toISOString();
      } else if (newTodoType === 'custom') {
        startDate = customStartDate;
        endDate = customEndDate;
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

      axios.post('http://localhost:5000/todos', newTodo)
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
    axios.put(`http://localhost:5000/todos/${id}`, { status: 'completed' })
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
    axios.delete(`http://localhost:5000/todos/${id}`)
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
          <option value="this_week">This Week</option>
          <option value="this_month">This Month</option>
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
        <button onClick={handleAddTodo}>Add Todo</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '20px', width: '80%', marginTop: '20px' }}>
        <div style={{ border: '1px solid #000', padding: '10px' }}>
          <h3 style={{backgroundColor:'red'}}>重要且紧急</h3>
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
              <button onClick={() => handleRemoveTodo(todo.id)} style={{ marginLeft: '10px' }}>Remove</button>
            </div>


          ))}
        </div>
        <div style={{ border: '1px solid #000', padding: '10px' }}>
          <h3 style={{backgroundColor:'orange'}}>重要但不紧急</h3>
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
              <button onClick={() => handleRemoveTodo(todo.id)} style={{ marginLeft: '10px' }}>Remove</button>
            </div>
          ))}
        </div>
        <div style={{ border: '1px solid #000', padding: '10px' }}>
          <h3 style={{backgroundColor:'#FFD700'}}>不重要但紧急</h3>
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
              <button onClick={() => handleRemoveTodo(todo.id)} style={{ marginLeft: '10px' }}>Remove</button>
            </div>
          ))}
        </div>
        <div style={{ border: '1px solid #000', padding: '10px' }}>
          <h3 style={{backgroundColor:'green'}}>不重要也不紧急</h3>
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
              <button onClick={() => handleRemoveTodo(todo.id)} style={{ marginLeft: '10px' }}>Remove</button>
            </div>
          ))}
        </div>
      </div>
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
            <button onClick={() => handleRemoveTodo(todo.id)} style={{ marginLeft: '10px' }}>Remove</button>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '20px' }}>
          <button onClick={handlePrevCompletedPage} disabled={completedPage === 1}>Previous</button>
          <p>Page {completedPage} of {totalCompletedPages}</p>
          <button onClick={handleNextCompletedPage} disabled={completedPage === totalCompletedPages}>Next</button>
        </div>
      </div>



    </div>
  );
};

export default TodoList;
