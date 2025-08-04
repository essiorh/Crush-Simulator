import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CrushArena = ({ selectedObject, mode, onCrush }) => {
  const [crushState, setCrushState] = useState('idle'); // idle, crushing, crushed
  const [crushForce, setCrushForce] = useState(1.0);
  const [crushPosition, setCrushPosition] = useState({ x: 0, y: 0 });
  const [autoTimer, setAutoTimer] = useState(null);
  const [crushCount, setCrushCount] = useState(0);
  const [ripples, setRipples] = useState([]);
  const arenaRef = useRef(null);

  // Auto mode logic
  useEffect(() => {
    if (mode === 'auto' || mode === 'mixed') {
      const interval = setInterval(() => {
        const randomX = (Math.random() - 0.5) * 400;
        const randomY = (Math.random() - 0.5) * 300;
        handleCrush(randomX, randomY, Math.random() * 0.8 + 0.2);
      }, 3000 + Math.random() * 2000); // Random interval between 3-5 seconds

      setAutoTimer(interval);
      return () => clearInterval(interval);
    }
  }, [mode, selectedObject]);

  // Handle crush interaction
  const handleCrush = useCallback(async (x, y, force = 1.0) => {
    if (crushState === 'crushing' || !selectedObject) return;

    setCrushState('crushing');
    setCrushPosition({ x, y });
    setCrushForce(force);

    // Create ripple effect
    const rippleId = `ripple-${Date.now()}`;
    setRipples(prev => [...prev, { id: rippleId, x, y }]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== rippleId));
    }, 1000);

    try {
      // Call backend API
      const result = await onCrush(selectedObject.id, force, { x, y });
      
      if (result) {
        setCrushCount(prev => prev + 1);
        
        // Reset state after animation
        setTimeout(() => {
          setCrushState('idle');
        }, result.animation_duration * 1000);
      }
    } catch (error) {
      console.error('Crush action failed:', error);
      setCrushState('idle');
    }
  }, [crushState, selectedObject, onCrush]);

  // Handle click/tap for interactive mode
  const handleArenaClick = (event) => {
    if (mode === 'auto') return; // No interaction in auto mode

    const rect = arenaRef.current?.getBoundingClientRect();
    if (rect) {
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      
      // Calculate force based on click intensity (simulated)
      const force = Math.random() * 0.5 + 0.5;
      handleCrush(x, y, force);
    }
  };

  // Simple 2D Object component (instead of 3D)
  const CrushableObject = ({ object, isBeingCrushed, crushForce }) => {
    const getObjectEmoji = (type) => {
      switch (type) {
        case 'can': return '🥫';
        case 'box': return '📦';
        case 'electronics': return '📱';
        case 'glass': return '🍾';
        case 'plastic': return '🍼';
        default: return '⚡';
      }
    };

    const getObjectColor = (type) => {
      switch (type) {
        case 'can': return 'from-gray-300 to-gray-500';
        case 'box': return 'from-yellow-600 to-yellow-800';
        case 'electronics': return 'from-gray-700 to-gray-900';
        case 'glass': return 'from-blue-200 to-blue-400';
        case 'plastic': return 'from-red-400 to-red-600';
        default: return 'from-white to-gray-300';
      }
    };

    return (
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        initial={{ scale: 1, rotate: 0 }}
        animate={{
          scale: isBeingCrushed ? [1, 1.2, 0.8, 1] : 1,
          rotate: isBeingCrushed ? [0, 5, -5, 0] : 0,
          y: isBeingCrushed ? [0, -10, 0] : 0
        }}
        transition={{ 
          duration: isBeingCrushed ? object?.crush_time || 2 : 0.3,
          ease: "easeInOut"
        }}
      >
        {/* Object representation */}
        <div className={`w-32 h-32 rounded-xl bg-gradient-to-br ${getObjectColor(object?.type)} shadow-2xl flex items-center justify-center relative overflow-hidden`}>
          {/* Object emoji/icon */}
          <div className="text-6xl z-10 relative">
            {getObjectEmoji(object?.type)}
          </div>
          
          {/* Crush effect overlay */}
          {isBeingCrushed && (
            <motion.div
              className="absolute inset-0 bg-white/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.7, 0] }}
              transition={{ duration: object?.crush_time || 2 }}
            />
          )}
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full animate-[shimmer_3s_ease-in-out_infinite]" />
        </div>
      </motion.div>
    );
  };

  if (!selectedObject) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-4">🎯</div>
          <p>Выберите объект для разрушения</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative bg-gradient-to-br from-gray-900/50 to-purple-900/30 overflow-hidden">
      {/* Arena */}
      <div
        ref={arenaRef}
        className="w-full h-full cursor-pointer relative"
        onClick={handleArenaClick}
      >
        {/* Simple 2D Scene (instead of 3D) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <CrushableObject 
            object={selectedObject}
            isBeingCrushed={crushState === 'crushing'}
            crushForce={crushForce}
          />
        </div>

        {/* Ripple Effects */}
        <AnimatePresence>
          {ripples.map(ripple => (
            <motion.div
              key={ripple.id}
              className="absolute border-4 border-white/30 rounded-full pointer-events-none"
              style={{
                left: `calc(50% + ${ripple.x}px)`,
                top: `calc(50% + ${ripple.y}px)`,
                transform: 'translate(-50%, -50%)'
              }}
              initial={{ width: 0, height: 0, opacity: 1 }}
              animate={{ width: 200, height: 200, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          ))}
        </AnimatePresence>

        {/* Object Info Overlay */}
        <div className="absolute top-6 left-6 card-glass p-4 max-w-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl">
              {selectedObject.type === 'can' && '🥫'}
              {selectedObject.type === 'box' && '📦'}
              {selectedObject.type === 'electronics' && '📱'}
              {selectedObject.type === 'glass' && '🍾'}
              {selectedObject.type === 'plastic' && '🍼'}
            </div>
            <div>
              <h3 className="font-semibold text-white">{selectedObject.name}</h3>
              <p className="text-xs text-gray-300">Сложность: {'★'.repeat(selectedObject.difficulty)}</p>
            </div>
          </div>
          
          <div className="space-y-2 text-xs text-gray-400">
            <div className="flex justify-between">
              <span>Удовлетворение:</span>
              <span className="text-purple-300">{selectedObject.satisfaction_score}/10</span>
            </div>
            <div className="flex justify-between">
              <span>Время разрушения:</span>
              <span className="text-blue-300">{selectedObject.crush_time}s</span>
            </div>
          </div>
        </div>

        {/* Mode indicator */}
        <div className="absolute top-6 right-6 card-glass p-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-white capitalize">{mode} Mode</span>
          </div>
          {mode !== 'auto' && (
            <p className="text-xs text-gray-400 mt-1">Нажмите для разрушения</p>
          )}
        </div>

        {/* Crush counter */}
        <div className="absolute bottom-6 left-6 card-glass p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{crushCount}</div>
            <div className="text-xs text-gray-400">Разрушено объектов</div>
          </div>
        </div>

        {/* Force indicator for interactive mode */}
        {mode !== 'auto' && (
          <div className="absolute bottom-6 right-6 card-glass p-4">
            <div className="text-center mb-2">
              <div className="text-xs text-gray-400 mb-1">Сила удара</div>
              <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400"
                  initial={{ width: '50%' }}
                  animate={{ width: `${crushForce * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
            <div className="text-xs text-center text-gray-400">
              {(crushForce * 100).toFixed(0)}%
            </div>
          </div>
        )}

        {/* Crushing state overlay */}
        {crushState === 'crushing' && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="text-6xl"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                💥
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Instructions for new users */}
        {crushCount === 0 && mode !== 'auto' && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 1 }}
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="card-glass p-6 text-center">
              <div className="text-4xl mb-4">👆</div>
              <p className="text-white font-semibold">Нажмите в любом месте</p>
              <p className="text-gray-300 text-sm">чтобы разрушить объект</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CrushArena;