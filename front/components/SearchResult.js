import React, { useState } from 'react';

const SearchResults = ({ searchResult, onClose }) => {
  const [expandedTasks, setExpandedTasks] = useState({});

  const toggleTask = (name) => {
    setExpandedTasks(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  if (!searchResult) return null;

  return (
    <div className="search-result">
      <div className="search-result-inner">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2>Search Results</h2>
        {searchResult.dailytask && searchResult.dailytask.length > 0 && (
          <div>
            <h3>-----Daily Tasks-----</h3>
            {searchResult.dailytask.map((task, index) => (
              <div key={index}>
                <h2 onClick={() => toggleTask(task.name)} style={{ cursor: 'pointer' }}>
                  {expandedTasks[task.name] ? '▼ ' : '▶ '}
                  {task.name}
                </h2>
                {expandedTasks[task.name] && (
                  <div>
                    <p>State: {task.state}</p>
                    <p>End: {task.end}</p>
                    <p>Description: {task.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {searchResult.subtask && searchResult.subtask.length > 0 && (
          <div>
            <h3>-----Subtasks-----</h3>
            {searchResult.subtask.map((task, index) => (
              <div key={index}>
                <h2 onClick={() => toggleTask(task.name)} style={{ cursor: 'pointer' }}>
                  {expandedTasks[task.name] ? '▼ ' : '▶ '}
                  {task.name}
                </h2>
                {expandedTasks[task.name] && (
                  <div>
                    <p>State: {task.state}</p>
                    <p>End: {task.end}</p>
                    <p>Belong: {task.belong}</p>
                    <p>Description: {task.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <style jsx>{`
        .search-result {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          color: black;
        }
        .search-result-inner {
          background: white;
          padding: 20px;
          border-radius: 5px;
          position: relative;
          text-align: left;
          color: black;
          font-size: 18px;
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
        ul {
          list-style: none;
          padding: 0;
        }
        li {
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
};

export default SearchResults;
