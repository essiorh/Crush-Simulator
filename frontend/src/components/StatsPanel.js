import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const StatsPanel = ({ stats }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSatisfactionLevel = (score) => {
    if (score >= 80) return { level: 'Экстаз', color: 'text-purple-400', emoji: '😍' };
    if (score >= 60) return { level: 'Восторг', color: 'text-pink-400', emoji: '🤩' };
    if (score >= 40) return { level: 'Удовлетворение', color: 'text-blue-400', emoji: '😊' };
    if (score >= 20) return { level: 'Спокойствие', color: 'text-green-400', emoji: '😌' };
    return { level: 'Начинающий', color: 'text-gray-400', emoji: '🙂' };
  };

  const satisfactionData = getSatisfactionLevel(stats.totalSatisfaction);

  return (
    <div className="relative">
      {/* Compact stats display */}
      <motion.div
        className="card-glass px-4 py-3 cursor-pointer select-none"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          {/* Crush count */}
          <div className="text-center">
            <motion.div 
              className="text-lg font-bold text-white"
              key={stats.totalCrushed}
              initial={{ scale: 1.2, color: '#10b981' }}
              animate={{ scale: 1, color: '#ffffff' }}
              transition={{ duration: 0.3 }}
            >
              {stats.totalCrushed}
            </motion.div>
            <div className="text-xs text-gray-400">Разрушено</div>
          </div>

          {/* Satisfaction */}
          <div className="text-center">
            <motion.div 
              className={`text-lg font-bold ${satisfactionData.color}`}
              key={stats.totalSatisfaction}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {stats.totalSatisfaction}
            </motion.div>
            <div className="text-xs text-gray-400">Удовольствие</div>
          </div>

          {/* Time */}
          <div className="text-center">
            <div className="text-lg font-bold text-white">
              {formatTime(stats.sessionDuration)}
            </div>
            <div className="text-xs text-gray-400">Время</div>
          </div>

          {/* Expand indicator */}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-gray-400"
          >
            ⌄
          </motion.div>
        </div>
      </motion.div>

      {/* Expanded stats panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-80 card-glass p-6 z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Статистика сессии</h3>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-purple-400 hover:text-purple-300"
              >
                {showDetails ? 'Скрыть' : 'Детали'}
              </button>
            </div>

            {/* Satisfaction level */}
            <div className="mb-6 text-center">
              <motion.div 
                className="text-4xl mb-2"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {satisfactionData.emoji}
              </motion.div>
              <div className={`text-xl font-bold ${satisfactionData.color} mb-1`}>
                {satisfactionData.level}
              </div>
              <div className="text-sm text-gray-400">
                Уровень удовлетворения
              </div>
            </div>

            {/* Progress bars */}
            <div className="space-y-4 mb-6">
              {/* Crush progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Разрушено объектов</span>
                  <span className="text-white font-semibold">{stats.totalCrushed}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-400 to-blue-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(stats.totalCrushed * 5, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Satisfaction progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Удовольствие</span>
                  <span className={`font-semibold ${satisfactionData.color}`}>
                    {stats.totalSatisfaction}/100+
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r from-purple-400 to-pink-400`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(stats.totalSatisfaction, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                  />
                </div>
              </div>
            </div>

            {/* Additional details */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-700/50 pt-4"
                >
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Средний балл</div>
                      <div className="text-white font-semibold">
                        {stats.totalCrushed > 0 
                          ? (stats.totalSatisfaction / stats.totalCrushed).toFixed(1)
                          : '0.0'
                        }
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-gray-400">Активность</div>
                      <div className="text-white font-semibold">
                        {stats.sessionDuration > 0 
                          ? (stats.totalCrushed / (stats.sessionDuration / 60)).toFixed(1)
                          : '0.0'
                        } /мин
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-gray-400">Лучший объект</div>
                      <div className="text-purple-300 font-semibold text-xs">
                        {stats.objects_crushed?.length > 0 
                          ? stats.objects_crushed[stats.objects_crushed.length - 1]?.replace(/_/g, ' ')
                          : 'Пока нет'
                        }
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-gray-400">ASMR эффект</div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <motion.span
                            key={i}
                            className={`text-xs ${
                              i < Math.min(satisfactionData.level === 'Экстаз' ? 5 : 
                                          satisfactionData.level === 'Восторг' ? 4 :
                                          satisfactionData.level === 'Удовлетворение' ? 3 :
                                          satisfactionData.level === 'Спокойствие' ? 2 : 1, 5)
                                ? 'text-yellow-400' 
                                : 'text-gray-600'
                            }`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                          >
                            ⭐
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recent objects */}
                  {stats.objects_crushed?.length > 0 && (
                    <div className="mt-4">
                      <div className="text-gray-400 text-xs mb-2">Последние разрушения:</div>
                      <div className="flex flex-wrap gap-1">
                        {stats.objects_crushed.slice(-5).map((objectId, i) => (
                          <motion.span
                            key={`${objectId}-${i}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="text-xs bg-gray-700/50 px-2 py-1 rounded text-gray-300"
                          >
                            {objectId.replace(/_/g, ' ')}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Achievement hints */}
            <div className="mt-4 pt-4 border-t border-gray-700/50">
              <div className="text-xs text-gray-400 text-center">
                {stats.totalCrushed < 10 && "💡 Разрушьте 10 объектов для первого достижения"}
                {stats.totalCrushed >= 10 && stats.totalCrushed < 25 && "🎯 Достигните 25 разрушений для следующего уровня"}
                {stats.totalCrushed >= 25 && stats.totalSatisfaction < 100 && "🌟 Наберите 100+ удовольствия для мастерства"}
                {stats.totalSatisfaction >= 100 && "👑 Вы мастер разрушения! Продолжайте наслаждаться!"}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StatsPanel;