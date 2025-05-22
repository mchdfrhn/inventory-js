import React from 'react';
import { createPortal } from 'react-dom';
import Toast from './Toast';
import { useNotification } from '../context/NotificationContext';

const ToastContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();
  // Create portal to render toasts at the root level of the document
  return createPortal(
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-4 max-h-[calc(100vh-32px)] pointer-events-none overflow-hidden">
      {notifications.map((notification, index) => (
        <div 
          key={notification.id} 
          className="pointer-events-auto transform transition-all duration-300 w-full max-w-md"
          style={{ 
            zIndex: 9999 - index,
          }}
        >
          <Toast
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        </div>
      ))}
    </div>,
    document.body
  );
};

export default ToastContainer;
