// components/Task.js
import React from 'react';
import Subtask from './Subtask';

const Task = ({ task, expandedTasks, toggleTask, expandedSubtasks, toggleSubtask }) => {

    const handleChangeState = async () => {
        try {
          const response = await fetch('http://35.189.180.59:40000/change_main_state/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id : "46e3dfd8-b530-4cc3-8e26-ef709e4b3938" ,
                                    name : task.name ,
                                    state : "delete" })
          });
          const data = await response.json();
          if (data.msg === 'delete success') {
            window.location.reload(); // 重新加载页面
          }
        } catch (error) {
          console.error('Error changing state:', error);
        }
    };

    return (
    <div>
        <h2 onClick={() => toggleTask(task.name)} style={{ cursor: 'pointer' }}>
        {expandedTasks[task.name] ? '▼ ' : '▶ '}
        {task.name}
        </h2>
        {expandedTasks[task.name] && (
        <div>
            <p>State: {task.state}</p>
            <p>Start: {task.start}</p>
            <p>End: {task.end}</p>
            <p>Description: {task.description}</p>

            <button onClick={handleChangeState}>delete</button>

            {task.subtasks.length > 0 && (
            <div>
                <h3>Subtasks:</h3>
                {task.subtasks.map(subtask => (
                <Subtask
                    key={subtask.name}
                    taskName={task.name}
                    subtask={subtask}
                    expandedSubtasks={expandedSubtasks}
                    toggleSubtask={toggleSubtask}
                />
                ))}
            </div>
            )}
        </div>
        )}
    </div>
    );
};

export default Task;
