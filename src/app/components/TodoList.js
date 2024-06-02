// components/TodoList.js
import React from 'react';
import './TodoList.css';

const TodoList = ({ todos, toggleComplete, removeTodo }) => {
  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <li className="todo-item" key={todo.id} >
          <span className="todo-text"
            style={{
              textDecoration: todo.completed ? 'line-through' : 'none',
            }}
            // onClick={() => toggleComplete(todo.id)}
          >
            {todo.text} 
          </span>
          <span className="todo-date">
            {todo.dueDate ? new Date(todo.dueDate).toLocaleString() : 'No due date'}
          </span>
          <div className="todo-actions">
            <button class="btn rounded-full bg-secondary" onClick={() => toggleComplete(todo.id)}>
                {todo.completed ? 'Undo' : 'Complete'}
            </button>
            <button class="btn rounded-full bg-primary" onClick={() => removeTodo(todo.id)}>Remove</button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default TodoList;
