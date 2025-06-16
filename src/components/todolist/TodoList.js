import React, { useEffect, useState } from 'react';
import '../../App.css';  // 引入 CSS 文件
import { API_BASE_URL } from '../../config';
import api from '../api';
import TodoQuadrant from './TodoQuadrant';

const TodoList = ({ }) => {
  const [todos, setTodos] = useState([]);
  const [newTodoName, setNewTodoName] = useState('');
  const [newTodoDueDate, setNewTodoDueDate] = useState('');
  const [newTodoType, setNewTodoType] = useState('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [importance, setImportance] = useState(false);
  const [urgency, setUrgency] = useState(false);
  const importantAndUrgent = todos.filter(todo => todo.importance && todo.urgency && todo.status === 'in_progress');
  const importantNotUrgent = todos.filter(todo => todo.importance && !todo.urgency && todo.status === 'in_progress');
  const notImportantUrgent = todos.filter(todo => !todo.importance && todo.urgency && todo.status === 'in_progress');
  const notImportantNotUrgent = todos.filter(todo => !todo.importance && !todo.urgency && todo.status === 'in_progress');

  useEffect(() => {
    fetchTodos();
    // 每 20 分钟刷新一次数据
    const interval = setInterval(() => {
      fetchTodos();
    }, 20 * 60 * 1000); // 20 分钟 = 20 * 60 * 1000 毫秒

    // 清除定时器
    return () => clearInterval(interval);
  }, []);


  const fetchTodos = () => {
    api.get(`${API_BASE_URL}/todos`)
      .then(response => {
        setTodos(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the todos!', error);
      });
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
      })
      .catch(error => {
        console.error('There was an error updating the todo!', error);
      });
  };

  const handleRemoveTodo = (id) => {
    api.delete(`${API_BASE_URL}/todos/${id}`)
      .then(() => {
        fetchTodos(); // 更新待办事项列表
      })
      .catch(error => {
        console.error('There was an error deleting the todo!', error);
      });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ margin: '10px auto' }}>
        <input
          type="text"
          placeholder="Todo Name"
          value={newTodoName}
          onChange={(e) => setNewTodoName(e.target.value)}
          style={{ marginRight: '10px',width:'500px' }}
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
          重要
        </label>
        <label style={{ marginRight: '10px' }}>
          <input
            type="checkbox"
            checked={urgency}
            onChange={(e) => setUrgency(e.target.checked)}
          />
          紧急
        </label>
        <button onClick={handleAddTodo} className='green-button'>Add Todo</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '20px', width: '80%', marginTop: '20px' }}>
        <div style={{ border: '1px solid #000', padding: '10px' }}>
          <h3 style={{ backgroundColor: 'red' }}>重要且紧急</h3>
          <TodoQuadrant todos={importantAndUrgent} onTodoCompletion={handleTodoCompletion} onRemoveTodo={handleRemoveTodo} />


        </div>
        <div style={{ border: '1px solid #000', padding: '10px' }}>
          <h3 style={{ backgroundColor: 'orange' }}>重要但不紧急</h3>
          <TodoQuadrant todos={importantNotUrgent} onTodoCompletion={handleTodoCompletion} onRemoveTodo={handleRemoveTodo} />

        </div>
        <div style={{ border: '1px solid #000', padding: '10px' }}>
          <h3 style={{ backgroundColor: '#FFD700' }}>不重要但紧急</h3>
          <TodoQuadrant todos={notImportantUrgent} onTodoCompletion={handleTodoCompletion} onRemoveTodo={handleRemoveTodo} />

        </div>
        <div style={{ border: '1px solid #000', padding: '10px' }}>
          <h3 style={{ backgroundColor: 'green' }}>不重要也不紧急</h3>
          <TodoQuadrant todos={notImportantNotUrgent} onTodoCompletion={handleTodoCompletion} onRemoveTodo={handleRemoveTodo} />

        </div>
      </div>

    </div>
  );
};

export default TodoList;
