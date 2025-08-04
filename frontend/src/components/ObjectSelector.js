import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ObjectSelector = ({ objects, selectedObject, onObjectSelect }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('satisfaction');

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

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 1: return 'text-green-400';
      case 2: return 'text-yellow-400';
      case 3: return 'text-orange-400';
      case 4: return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getSatisfactionColor = (score) => {
    if (score >= 9) return 'text-purple-400';
    if (score >= 7) return 'text-blue-400';
    if (score >= 5) return 'text-green-400';
    return 'text-yellow-400';
  };

  const filteredObjects = objects
    .filter(obj => filter === 'all' || obj.type === filter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'satisfaction':
          return b.satisfaction_score - a.satisfaction_score;
        case 'difficulty':
          return a.difficulty - b.difficulty;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'crush_time':
          return a.crush_time - b.crush_time;
        default:
          return 0;
      }
    });

  const objectTypes = [...new Set(objects.map(obj => obj.type))];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-3">Объекты для разрушения</h2>
        
        {/* Filters */}
        <div className="space-y-3">
          {/* Type filter */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Тип объекта</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:border-purple-500"
            >
              <option value="all">Все типы</option>
              {objectTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Sort by */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Сортировка</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:border-purple-500"
            >
              <option value="satisfaction">По удовлетворению</option>
              <option value="difficulty">По сложности</option>
              <option value="name">По названию</option>
              <option value="crush_time">По времени разрушения</option>
            </select>
          </div>
        </div>
      </div>

      {/* Objects list */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        <AnimatePresence>
          {filteredObjects.map((object, index) => (
            <motion.div
              key={object.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`card-glass p-4 cursor-pointer transition-all duration-200 ${
                selectedObject?.id === object.id 
                  ? 'ring-2 ring-purple-400 bg-purple-500/20' 
                  : 'hover:bg-white/10'
              }`}
              onClick={() => onObjectSelect(object)}
            >
              {/* Object header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="text-2xl"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                  >
                    {getObjectEmoji(object.type)}
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{object.name}</h3>
                    <p className="text-xs text-gray-400 capitalize">{object.type}</p>
                  </div>
                </div>
                
                {/* Selection indicator */}
                {selectedObject?.id === object.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center"
                  >
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}
              </div>

              {/* Object stats */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Сложность:</span>
                  <div className="flex items-center gap-1">
                    <span className={getDifficultyColor(object.difficulty)}>
                      {'★'.repeat(object.difficulty)}
                    </span>
                    <span className="text-gray-500">
                      {'☆'.repeat(5 - object.difficulty)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Удовлетворение:</span>
                  <span className={getSatisfactionColor(object.satisfaction_score)}>
                    {object.satisfaction_score}/10
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Время разрушения:</span>
                  <span className="text-blue-300">{object.crush_time}s</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Эффекты:</span>
                  <span className="text-green-300">{object.particles}</span>
                </div>
              </div>

              {/* Vibration pattern preview */}
              <div className="mt-3 pt-3 border-t border-gray-700/50">
                <div className="text-xs text-gray-400 mb-2">Вибрация:</div>
                <div className="flex items-center gap-1">
                  {object.vibration_pattern.map((intensity, i) => (
                    <motion.div
                      key={i}
                      className="bg-purple-400 rounded-sm"
                      style={{ 
                        width: '8px',
                        height: `${(intensity / 300) * 16 + 4}px`,
                        minHeight: '4px'
                      }}
                      whileHover={{ scaleY: 1.2 }}
                    />
                  ))}
                </div>
              </div>

              {/* Sound preview button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full mt-3 py-2 bg-purple-600/30 hover:bg-purple-600/50 rounded-lg text-xs text-purple-200 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  // Play sound preview
                  console.log(`Playing sound: ${object.sound}`);
                }}
              >
                🔊 Предпрослушать звук
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Stats summary */}
      <div className="mt-6 pt-4 border-t border-gray-700/50">
        <div className="text-xs text-gray-400 text-center">
          <p>Найдено объектов: {filteredObjects.length}</p>
          <p className="mt-1">
            Средняя сложность: {(filteredObjects.reduce((sum, obj) => sum + obj.difficulty, 0) / filteredObjects.length || 0).toFixed(1)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ObjectSelector;