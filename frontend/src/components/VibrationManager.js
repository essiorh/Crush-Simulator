import React, { useEffect, useState } from 'react';

const VibrationManager = () => {
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [vibrationStrength, setVibrationStrength] = useState(1.0);
  const [isVibrating, setIsVibrating] = useState(false);
  const [supportedVibration, setSupportedVibration] = useState(false);

  // Check vibration API support
  useEffect(() => {
    const checkVibrationSupport = () => {
      const hasVibration = 'vibrate' in navigator;
      setSupportedVibration(hasVibration);
      
      if (hasVibration) {
        // Test vibration capability
        try {
          navigator.vibrate(1); // Very short test vibration
        } catch (error) {
          console.log('Vibration API not fully supported');
          setSupportedVibration(false);
        }
      }
    };

    checkVibrationSupport();
  }, []);

  // Vibrate function with pattern
  const vibrate = (pattern, strength = 1.0) => {
    if (!vibrationEnabled || !supportedVibration || !navigator.vibrate) return;

    setIsVibrating(true);
    
    // Adjust pattern intensity based on strength
    let adjustedPattern;
    if (Array.isArray(pattern)) {
      adjustedPattern = pattern.map((duration, index) => {
        // Even indices are vibration durations, odd are pauses
        return index % 2 === 0 ? Math.round(duration * strength * vibrationStrength) : duration;
      });
    } else {
      adjustedPattern = Math.round(pattern * strength * vibrationStrength);
    }

    try {
      navigator.vibrate(adjustedPattern);
      
      // Calculate total duration for state management
      const totalDuration = Array.isArray(adjustedPattern) 
        ? adjustedPattern.reduce((sum, val) => sum + val, 0)
        : adjustedPattern;
        
      setTimeout(() => setIsVibrating(false), totalDuration);
    } catch (error) {
      console.log('Vibration failed:', error);
      setIsVibrating(false);
    }
  };

  // Predefined ASMR vibration patterns
  const asmrPatterns = {
    // Light tap sensation
    tap: [50],
    
    // Gentle pulse
    pulse: [100, 50, 100],
    
    // Crushing sensation patterns
    can_crush: [100, 50, 200], // Quick impact, pause, longer pressure
    cardboard_crush: [150, 100, 150, 100], // Multiple crunch sensations
    electronics_crush: [200, 150, 300, 100], // Complex breaking pattern
    glass_shatter: [50, 200, 50, 200, 300], // Sharp breaks with resonance
    plastic_crush: [80, 40, 120], // Soft crushing
    
    // Satisfaction patterns
    satisfaction_low: [80, 80, 80],
    satisfaction_medium: [100, 50, 150, 50, 100],
    satisfaction_high: [200, 100, 300, 50, 400],
    
    // ASMR specific patterns
    tingle: [30, 50, 30, 50, 30], // Light tingling sensation
    wave: [50, 30, 100, 30, 150, 30, 100, 30, 50], // Wave-like pattern
    heartbeat: [120, 500, 120], // Relaxing heartbeat-like
  };

  // Crush vibration based on object properties
  const playObjectVibration = (objectType, satisfaction, force = 1.0) => {
    if (!vibrationEnabled) return;

    // Base pattern from object type
    let basePattern = asmrPatterns[`${objectType}_crush`] || asmrPatterns.tap;
    
    // Adjust intensity based on satisfaction and force
    const intensityMultiplier = Math.max(0.3, (satisfaction / 10) * force);
    
    vibrate(basePattern, intensityMultiplier);
  };

  // ASMR enhancement vibrations
  const playASMRPattern = (patternName, intensity = 1.0) => {
    if (!vibrationEnabled || !asmrPatterns[patternName]) return;
    
    vibrate(asmrPatterns[patternName], intensity);
  };

  // Success/achievement vibrations
  const playFeedbackVibration = (type) => {
    if (!vibrationEnabled) return;

    switch (type) {
      case 'success':
        vibrate(asmrPatterns.satisfaction_medium, 0.8);
        break;
      case 'achievement':
        vibrate(asmrPatterns.satisfaction_high, 1.0);
        break;
      case 'milestone':
        vibrate([200, 100, 200, 100, 400], 1.0);
        break;
      default:
        vibrate(asmrPatterns.tap, 0.5);
    }
  };

  // Ambient ASMR vibrations (very subtle)
  const startAmbientVibration = () => {
    if (!vibrationEnabled) return;

    const ambientInterval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every few seconds
        playASMRPattern('tingle', 0.2);
      }
    }, 8000 + Math.random() * 4000); // Every 8-12 seconds

    return () => clearInterval(ambientInterval);
  };

  // Toggle vibration
  const toggleVibration = () => {
    setVibrationEnabled(!vibrationEnabled);
    
    if (!vibrationEnabled) {
      // Test vibration when enabled
      vibrate([100, 50, 100], 0.5);
    }
  };

  // Strength adjustment
  const handleStrengthChange = (newStrength) => {
    setVibrationStrength(newStrength);
    
    // Test vibration with new strength
    vibrate(asmrPatterns.tap, newStrength);
  };

  // Expose vibration manager to window for other components
  useEffect(() => {
    window.VibrationManager = {
      playObjectVibration,
      playASMRPattern,
      playFeedbackVibration,
      startAmbientVibration,
      toggleVibration,
      setStrength: handleStrengthChange,
      isEnabled: () => vibrationEnabled,
      getStrength: () => vibrationStrength,
      isSupported: () => supportedVibration
    };
  }, [vibrationEnabled, vibrationStrength, supportedVibration]);

  // Don't render if vibration is not supported
  if (!supportedVibration) {
    return null;
  }

  return (
    <div className="fixed top-4 left-48 z-50">
      <div className="card-glass p-3 flex items-center gap-3">
        {/* Vibration toggle */}
        <button
          onClick={toggleVibration}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            vibrationEnabled 
              ? 'bg-purple-500/20 text-purple-400' 
              : 'bg-gray-500/20 text-gray-400'
          } ${isVibrating ? 'animate-pulse' : ''}`}
          title={vibrationEnabled ? 'Отключить вибрацию' : 'Включить вибрацию'}
        >
          📳
        </button>

        {/* Strength control */}
        {vibrationEnabled && (
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
              value={vibrationStrength}
              onChange={(e) => handleStrengthChange(parseFloat(e.target.value))}
              className="w-20 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${(vibrationStrength - 0.1) / 1.9 * 100}%, #4b5563 ${(vibrationStrength - 0.1) / 1.9 * 100}%, #4b5563 100%)`
              }}
            />
            <span className="text-xs text-gray-400 w-8">
              {Math.round(vibrationStrength * 100)}
            </span>
          </div>
        )}

        {/* Currently vibrating indicator */}
        {isVibrating && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            <span className="text-xs text-purple-400">buzz</span>
          </div>
        )}

        {/* Pattern tester */}
        {vibrationEnabled && (
          <div className="flex gap-1">
            <button
              onClick={() => playASMRPattern('wave', 0.8)}
              className="text-xs px-2 py-1 bg-purple-600/20 hover:bg-purple-600/30 rounded text-purple-300 transition-colors"
              title="Тест волнового паттерна"
            >
              🌊
            </button>
            <button
              onClick={() => playASMRPattern('tingle', 0.6)}
              className="text-xs px-2 py-1 bg-pink-600/20 hover:bg-pink-600/30 rounded text-pink-300 transition-colors"
              title="Тест покалывания"
            >
              ✨
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VibrationManager;