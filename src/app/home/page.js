//import Image from "next/image";
"use client";

// pages/index.js
import React, { useState } from 'react';
import TodoForm from '../components/TodoForm';
import TodoList from '../components/TodoList';
import { v4 as uuidv4 } from 'uuid';

const Home = () => {
  const [todos, setTodos] = useState([]);

   const addTodo = (todo) => {
    const newTodo = { id: uuidv4(), ...todo, completed: false };
    setTodos([...todos, newTodo]);
  };
  const toggleComplete = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const removeTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <main className="App">
      <header className="App-header">
        <h1 className="text-2xl font-bold">To Do Lister</h1>
      </header>
    <TodoForm addTodo={addTodo} />
    <TodoList todos={todos} toggleComplete={toggleComplete} removeTodo={removeTodo} />
  </main>
);
};

export default Home;