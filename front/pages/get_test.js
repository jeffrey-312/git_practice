// pages/index.js
import { useEffect, useState } from 'react';
import Task from '../components/Maintask';

export default function Maintask({ maintask }) {
  const [tasks, setTasks] = useState(maintask);
  const [expandedTasks, setExpandedTasks] = useState({});
  const [expandedSubtasks, setExpandedSubtasks] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('http://35.189.180.59:40000/get_todolist/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ user_id: '46e3dfd8-b530-4cc3-8e26-ef709e4b3938' })
        });
        const data = await response.json();
        setTasks(data.maintask);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);

  const toggleTask = (name) => {
    setExpandedTasks(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const toggleSubtask = (parentName, name) => {
    setExpandedSubtasks(prev => ({
      ...prev,
      [parentName]: {
        ...prev[parentName],
        [name]: !prev[parentName]?.[name]
      }
    }));
  };

  return (
    <div>
      <h1>Maintask</h1>
      {tasks && tasks.map(task => (
        <Task
          key={task.name}
          task={task}
          expandedTasks={expandedTasks}
          toggleTask={toggleTask}
          expandedSubtasks={expandedSubtasks}
          toggleSubtask={toggleSubtask}
        />
      ))}
    </div>
  );
}
