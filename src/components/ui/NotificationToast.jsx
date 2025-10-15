import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../stores/uiStore.js';

const NotificationToast = ({ notifications }) => {
  const { removeNotification } = useUIStore();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <motion.div
            key={`${notification}-${index}`}
            initial={{ opacity: 0, x: 300, scale: 0.3 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 
                       text-white shadow-lg max-w-sm cursor-pointer"
            onClick={() => removeNotification(index)}
          >
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <p className="text-sm">{notification}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeNotification(index);
                }}
                className="text-gray-300 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationToast;
