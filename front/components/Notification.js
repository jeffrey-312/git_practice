// components/Notification.js
import React from 'react';

const Notification = ({ message }) => (
  <div className="notification">
    {message}
    <style jsx>{`
      .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #4caf50;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        animation: fadein 0.5s, fadeout 0.5s 4.5s;
      }

      @keyframes fadein {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes fadeout {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `}</style>
  </div>
);

export default Notification;
