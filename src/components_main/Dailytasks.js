
import React from 'react';

const DailyTasks = ({ task, expandedTasks, toggleTask}) => {
  const user_id=sessionStorage.getItem('user_id');
    const handleChangeState = async () => {
      try {
        const response = await fetch('http://35.189.180.59:40000/change_small_state/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ user_id : user_id ,
                                  name : task.name ,
                                  state : "delete" ,
                                  end : task.end ,
                                  belong : "none"
                                })
        });
        const data = await response.json();
        if (data.msg === 'delete success') {
          window.location.reload(); 
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
            <p>End: {task.end}</p>
            <p>Description: {task.description}</p>

            <button onClick={handleChangeState}>delete</button>

        </div>
        )}
    </div>
    );
};

export default DailyTasks;