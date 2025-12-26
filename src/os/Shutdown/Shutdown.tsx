/**
 * Shutdown Screen Component - Displays clock and boot button
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './Shutdown.css';

interface ShutdownProps {
  onBootUp: () => void;
}

export function Shutdown({ onBootUp }: ShutdownProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <motion.div 
      className="shutdown-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="shutdown-content">
        <motion.div 
          className="shutdown-clock"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="clock-time">{formatTime(time)}</div>
          <div className="clock-date">{formatDate(time)}</div>
        </motion.div>

        <motion.button
          className="boot-button"
          onClick={onBootUp}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(79, 172, 254, 0.5)' }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="boot-icon">⚡</span>
          <span className="boot-text">Boot Up</span>
        </motion.button>

        <motion.p 
          className="shutdown-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Click to start WebOS
        </motion.p>
      </div>
    </motion.div>
  );
}
