/**
 * Boot Screen Component
 */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOSStore } from '../../state/osStore';
import './Boot.css';

const BOOT_MESSAGES = [
  { phase: 'bios', messages: [
    'Initializing hardware...',
    'Checking memory...',
    'Loading BIOS...',
  ]},
  { phase: 'loading', messages: [
    'Loading kernel...',
    'Initializing drivers...',
    'Starting boot process...',
  ]},
  { phase: 'services', messages: [
    'Starting network services...',
    'Loading user interface...',
    'Initializing WebOS core...',
    'Starting window manager...',
    'Loading file system...',
  ]},
  { phase: 'ready', messages: [
    'WebOS ready!',
  ]},
];

interface BootProps {
  onComplete: () => void;
  skipBoot?: boolean;
}

export function Boot({ onComplete, skipBoot = false }: BootProps) {
  const { bootPhase, bootProgress, bootMessage, setBootPhase, setBootProgress } = useOSStore();
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    if (hasCompleted) return;
    
    if (skipBoot) {
      setBootPhase('done');
      setHasCompleted(true);
      onComplete();
      return;
    }

    let currentPhaseIndex = 0;
    let currentMessageIndex = 0;
    let progress = 0;
    let completedRef = false;

    const advanceBoot = () => {
      if (completedRef) return;
      
      const phaseData = BOOT_MESSAGES[currentPhaseIndex];
      
      if (!phaseData) {
        completedRef = true;
        setBootPhase('done');
        setHasCompleted(true);
        onComplete();
        return;
      }

      setBootPhase(phaseData.phase as 'bios' | 'loading' | 'services' | 'ready');
      setBootProgress(progress, phaseData.messages[currentMessageIndex]);

      currentMessageIndex++;
      progress += 100 / (BOOT_MESSAGES.reduce((sum, p) => sum + p.messages.length, 0));

      if (currentMessageIndex >= phaseData.messages.length) {
        currentPhaseIndex++;
        currentMessageIndex = 0;
      }

      if (currentPhaseIndex >= BOOT_MESSAGES.length && !completedRef) {
        completedRef = true;
        setTimeout(() => {
          setBootPhase('done');
          setHasCompleted(true);
          onComplete();
        }, 500);
      }
    };

    advanceBoot();
    const interval = setInterval(advanceBoot, 600);

    return () => clearInterval(interval);
  }, [skipBoot]); // eslint-disable-line react-hooks/exhaustive-deps

  if (bootPhase === 'done') {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div 
        className="boot-screen"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="boot-content">
          <motion.div 
            className="boot-logo"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="logo-icon">⚡</div>
            <h1>WebOS</h1>
          </motion.div>

          <div className="boot-progress-container">
            <div className="boot-progress-bar">
              <motion.div 
                className="boot-progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${bootProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <motion.p 
              className="boot-message"
              key={bootMessage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {bootMessage}
            </motion.p>
          </div>

          <div className="boot-phase-indicator">
            {BOOT_MESSAGES.slice(0, 4).map((p, i) => (
              <div 
                key={p.phase}
                className={`phase-dot ${
                  BOOT_MESSAGES.findIndex(m => m.phase === bootPhase) >= i 
                    ? 'active' 
                    : ''
                }`}
              />
            ))}
          </div>

          <button 
            className="sound-toggle"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
