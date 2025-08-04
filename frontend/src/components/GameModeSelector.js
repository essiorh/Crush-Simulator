import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const GameModeSelector = ({ onModeSelect }) => {
  const [modes, setModes] = useState([]);
  const [selectedMode, setSelectedMode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGameModes();
  }, []);

  const fetchGameModes = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/modes`);
      const data = await response.json();
      setModes(data.modes);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch game modes:', error);
      setIsLoading(false);
    }
  };

  const handleModeSelect = (mode) => {
    setSelectedMode(mode.id);
    setTimeout(() => {
      onModeSelect(mode.id);
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-center mb-12"
      >
        Выберите режим игры
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {modes.map((mode, index) => (
          <motion.div
            key={mode.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -10 }}
            whileTap={{ scale: 0.95 }}
            className={`card-glass p-8 cursor-pointer relative overflow-hidden group ${
              selectedMode === mode.id ? 'ring-2 ring-purple-400' : ''
            }`}
            onClick={() => handleModeSelect(mode)}
          >
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Content */}
            <div className="relative z-10 text-center">
              {/* Icon */}
              <motion.div
                className="text-6xl mb-4"
                whileHover={{ scale: 1.2, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {mode.icon}
              </motion.div>
              
              {/* Title */}
              <h3 className="text-xl font-bold mb-3 text-white group-hover:text-gradient transition-all">
                {mode.name}
              </h3>
              
              {/* Description */}
              <p className="text-gray-300 text-sm leading-relaxed">
                {mode.description}
              </p>
              
              {/* Features based on mode */}
              <div className="mt-4 space-y-2">
                {mode.id === 'interactive' && (
                  <div className="text-xs text-purple-300 space-y-1">
                    <div>• Нажимайте для разрушения</div>
                    <div>• Контролируйте силу удара</div>
                    <div>• Мгновенная вибрация</div>
                  </div>
                )}
                
                {mode.id === 'auto' && (
                  <div className="text-xs text-blue-300 space-y-1">
                    <div>• Автоматическое разрушение</div>
                    <div>• Расслабляющий ритм</div>
                    <div>• ASMR звуки</div>
                  </div>
                )}
                
                {mode.id === 'mixed' && (
                  <div className="text-xs text-pink-300 space-y-1">
                    <div>• Авто + интерактив</div>
                    <div>• Динамическая подстройка</div>
                    <div>• Максимальный релакс</div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Selection indicator */}
            {selectedMode === mode.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-4 right-4 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </motion.div>
            )}
            
            {/* Hover effects */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full animate-[shimmer_2s_ease-in-out_infinite]" />
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Additional info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-12"
      >
        <div className="card-glass p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold mb-3 text-gradient">🎧 ASMR Особенности</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">🔊</span>
              <span>3D Audio</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-400">📳</span>
              <span>Haptic Feedback</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-400">✨</span>
              <span>Particle Effects</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GameModeSelector;