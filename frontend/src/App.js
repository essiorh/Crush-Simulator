import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameModeSelector from './components/GameModeSelector';
import CrushArena from './components/CrushArena';
import ObjectSelector from './components/ObjectSelector';
import StatsPanel from './components/StatsPanel';
import SoundManager from './components/SoundManager';
import VibrationManager from './components/VibrationManager';
import ParticleSystem from './components/ParticleSystem';
import './App.css';

function App() {
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused
  const [currentMode, setCurrentMode] = useState('interactive');
  const [sessionId, setSessionId] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [availableObjects, setAvailableObjects] = useState([]);
  const [sessionStats, setSessionStats] = useState({
    totalCrushed: 0,
    totalSatisfaction: 0,
    sessionDuration: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [particles, setParticles] = useState([]);

  // Fetch available objects on load
  useEffect(() => {
    fetchAvailableObjects();
  }, []);

  const fetchAvailableObjects = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/objects`);
      const data = await response.json();
      setAvailableObjects(data.objects);
      if (data.objects.length > 0) {
        setSelectedObject(data.objects[0]);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch objects:', error);
      setIsLoading(false);
    }
  };

  const startSession = async (mode) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/session/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mode }),
      });
      const data = await response.json();
      setSessionId(data.session_id);
      setCurrentMode(mode);
      setGameState('playing');
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const crushObject = async (objectId, force = 1.0, position = { x: 0, y: 0 }) => {
    if (!sessionId) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/session/${sessionId}/crush`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          object_id: objectId,
          force: force,
          position: position
        }),
      });
      const crushResult = await response.json();
      
      // Update stats
      updateSessionStats();
      
      // Trigger effects
      triggerCrushEffects(crushResult, position);
      
      return crushResult;
    } catch (error) {
      console.error('Failed to crush object:', error);
    }
  };

  const triggerCrushEffects = (crushResult, position) => {
    // Add particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: `particle-${Date.now()}-${i}`,
      type: crushResult.particles,
      x: position.x + (Math.random() - 0.5) * 100,
      y: position.y + (Math.random() - 0.5) * 100,
      vx: (Math.random() - 0.5) * 200,
      vy: (Math.random() - 0.5) * 200,
      life: 1.0,
      size: Math.random() * 5 + 2
    }));
    
    setParticles(prev => [...prev, ...newParticles]);
    
    // Remove particles after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 3000);
  };

  const updateSessionStats = async () => {
    if (!sessionId) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/session/${sessionId}/stats`);
      const stats = await response.json();
      setSessionStats(stats);
    } catch (error) {
      console.error('Failed to update stats:', error);
    }
  };

  const endSession = async () => {
    if (!sessionId) return;
    
    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/session/${sessionId}/end`, {
        method: 'POST'
      });
      setSessionId(null);
      setGameState('menu');
      setSessionStats({ totalCrushed: 0, totalSatisfaction: 0, sessionDuration: 0 });
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  const handleBackToMenu = () => {
    endSession();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-white border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
      {/* Background particles */}
      <div className="absolute inset-0 pointer-events-none">
        <ParticleSystem particles={particles} />
      </div>

      {/* Sound & Vibration Managers */}
      <SoundManager />
      <VibrationManager />

      <AnimatePresence mode="wait">
        {gameState === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col"
          >
            {/* Header */}
            <header className="text-center py-12">
              <motion.h1
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-6xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent"
              >
                🔨 Crush Simulator
              </motion.h1>
              <motion.p
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-300 mb-8"
              >
                Испытайте удовольствие от идеального разрушения
              </motion.p>
            </header>

            {/* Game Mode Selector */}
            <div className="flex-1 flex items-center justify-center">
              <GameModeSelector onModeSelect={startSession} />
            </div>

            {/* Footer */}
            <footer className="text-center py-8 text-gray-400">
              <p>🎯 ASMR Gaming Experience • Расслабляющие звуки и вибрация</p>
            </footer>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col"
          >
            {/* Game Header */}
            <header className="bg-black/20 backdrop-blur-md p-4 flex justify-between items-center">
              <button
                onClick={handleBackToMenu}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all"
              >
                <span>←</span> Меню
              </button>
              
              <div className="text-center">
                <h2 className="text-xl font-bold capitalize">{currentMode} Mode</h2>
                <p className="text-sm text-gray-300">Сессия активна</p>
              </div>

              <StatsPanel stats={sessionStats} />
            </header>

            {/* Game Content */}
            <div className="flex-1 flex">
              {/* Object Selector */}
              <div className="w-80 bg-black/10 backdrop-blur-md p-6">
                <ObjectSelector
                  objects={availableObjects}
                  selectedObject={selectedObject}
                  onObjectSelect={setSelectedObject}
                />
              </div>

              {/* Crush Arena */}
              <div className="flex-1">
                <CrushArena
                  selectedObject={selectedObject}
                  mode={currentMode}
                  onCrush={crushObject}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;