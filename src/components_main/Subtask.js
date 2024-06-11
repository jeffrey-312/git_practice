// components/Subtask.js
import React from 'react';

const Subtask = ({ taskName, subtask, expandedSubtasks, toggleSubtask }) => {
  const user_id=sessionStorage.getItem('user_id');
  const handleChangeState = async () => {
    try {
      const response = await fetch('http://35.189.180.59:40000/change_small_state/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id : user_id ,
                                name : subtask.name ,
                                state : "delete" ,
                                end : subtask.end ,
                                belong : taskName
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
      <h4 onClick={() => toggleSubtask(taskName, subtask.name)} style={{ cursor: 'pointer' }}>
        {expandedSubtasks[taskName]?.[subtask.name] ? '▼ ' : '▶ '}
        {subtask.name}
      </h4>
      {expandedSubtasks[taskName]?.[subtask.name] && (
        <div>
          <p>State: {subtask.state}</p>
          <p>End: {subtask.end}</p>
          <p>Description: {subtask.description}</p>

          <button onClick={handleChangeState}>delete</button>
        </div>
        
      )}
    </div>
  );
};

export default Subtask;

