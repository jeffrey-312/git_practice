import React, { useState } from 'react';

const Popup2 = ({ onClose, onSubmit , tasks}) => {
  const [name, setTaskName] = useState('');
  const [end, setEnd] = useState('');
  const [belong, setBelong] = useState('');
  const [description, setDescription] = useState('');


  const handleSubmit = () => {
    if (name.trim() && belong.trim() && end.trim()) {
      onSubmit({ name, belong, end, description });
      setTaskName('');
      setEnd('');
      setBelong('');
      setDescription('');
      onClose();
    }
  };

  return (
    <div className="popup">
      <div className="popup-inner">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2>Add Daily Task</h2>
        <input
          type="text"
          placeholder="Task Name"
          value={name}
          onChange={(e) => setTaskName(e.target.value)}
        />
        <input
          type="datetime-local"
          placeholder="End Time"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />
        <select
          value={belong}
          onChange={(e) => setBelong(e.target.value)}
        >
          <option value="">Select Main Task</option>
          {tasks.map(task => (
            <option key={task.name} value={task.name}>{task.name}</option>
          ))}
          <option value="none">None</option>
        </select>
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button onClick={handleSubmit}>Add</button>
      </div>
      <style jsx>{`
        .popup {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .popup-inner {
          background: white;
          padding: 20px;
          border-radius: 5px;
          position: relative;
          text-align: center;
        }
        .close-btn {
          position: absolute;
          top: 5px;
          right: 10px;
          font-size: 30px;
          cursor: pointer;
          color: red;
        }
        h2 {
          color: black;
        }
        input,select {
          margin-top: 10px;
          padding: 8px;
          width: 80%;
        }
        button {
          margin-top: 10px;
          padding: 8px 16px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default Popup2;