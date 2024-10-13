import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newTodoName, setNewTodoName] = useState('');
  const [newTodoDueDate, setNewTodoDueDate] = useState('');
  const [newTodoType, setNewTodoType] = useState('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [importance, setImportance] = useState(false);
  const [urgency, setUrgency] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5000/todos')
      .then(response => {
        setTodos(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the todos!', error);
      });
  }, []);

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
        setTodos(todos.map(todo => todo.id === id ? { ...todo, status: 'completed' } : todo));
      })
      .catch(error => {
        console.error('There was an error updating the todo!', error);
      });
  };

  const handleRemoveTodo = (id) => {
    axios.delete(`http://localhost:5000/todos/${id}`)
      .then(() => {
        setTodos(todos.filter(todo => todo.id !== id));
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
          <h3>重要且紧急</h3>
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
          <h3>重要但不紧急</h3>
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
          <h3>不重要但紧急</h3>
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
          <h3>不重要也不紧急</h3>
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
      <div style={{ marginTop: '20px', width: '80%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <h3>Completed Todos</h3>
        {todos.filter(todo => todo.status === 'completed').map(todo => (
          <div key={todo.id} style={{ marginBottom: '10px',
            padding: '10px',
            borderRadius: '5px',
            backgroundColor: 
                todo.importance && todo.urgency ? 'red' :
                todo.importance && !todo.urgency ? 'orange' :
                !todo.importance && todo.urgency ? '#FFD700' : 'green', 
            color: 
                todo.importance && todo.urgency ? 'white' :
                todo.importance && !todo.urgency ? 'white' :
                !todo.importance && todo.urgency ? 'black' : 'white'}}>
            <strong style={{ marginRight: '5px' }}>{todo.name}</strong>
            <small style={{ marginRight: '5px' }}>Importance: {todo.importance ? 'Yes' : 'No'}</small>
            <small style={{ marginRight: '5px' }}>Urgency: {todo.urgency ? 'Yes' : 'No'}</small>
            <small>Completed At: {new Date(todo.updated_at).toLocaleString()}</small>
          </div>
        ))}
      </div>



    </div>
  );
};

export default TodoList;
