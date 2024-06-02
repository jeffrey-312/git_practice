// components/TodoForm.js
import React, { useState } from 'react';
//import { v4 as uuidv4 } from 'uuid';
import './TodoList.css';


const TodoForm = ({ addTodo }) => {
  const [text, setText] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e) => { //e 是事件對象，代表表單提交事件。
    e.preventDefault();
    //e.preventDefault()是用來阻止表單的默認提交行為。
    //默認情況下，表單提交會刷新頁面，但在這裡我們希望使用 JavaScript 來處理提交邏輯，而不刷新頁面。
    if (text.trim()) {//trim() 方法用來移除字符串的頭尾空白字符。
        addTodo({
          text,
          dueDate
        });
        setText('');
        setDueDate('');
    }//將 todo 設置為空字符串，以清空輸入框，準備下一次輸入。
    
  };

  return (
    <form onSubmit={handleSubmit}>
        <userInputContainer>
            <input
            class="btn"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a new todo"
            />
            <input
            class="btn"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            placeholder="Due date"
            />
            <button class="btn rounded-full bg-blue-500" type="submit"> Add </button>
        </userInputContainer>
        
    </form>
  );
};

export default TodoForm;
