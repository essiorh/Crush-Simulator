import React, { useEffect, useState, useRef } from 'react';
import { Howl } from 'howler';

const SoundManager = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(0.7);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const soundCache = useRef({});
  const ambientLoop = useRef(null);

  // Sound files mapping
  const soundFiles = {
    'can_crush.mp3': '/sounds/can_crush.mp3',
    'cardboard_crush.mp3': '/sounds/cardboard_crush.mp3',
    'electronics_crush.mp3': '/sounds/electronics_crush.mp3',
    'glass_shatter.mp3': '/sounds/glass_shatter.mp3',
    'plastic_crush.mp3': '/sounds/plastic_crush.mp3',
    'ambient_background.mp3': '/sounds/ambient_background.mp3'
  };

  // Initialize sound system
  useEffect(() => {
    // Create ambient background sound
    try {
      ambientLoop.current = new Howl({
        src: [soundFiles['ambient_background.mp3']],
        loop: true,
        volume: 0.2,
        autoplay: false,
        html5: true, // Use HTML5 Audio for better mobile support
        format: ['mp3'],
        onloaderror: () => {
          console.log('Ambient sound not available, using fallback');
          // Create synthetic ambient sound
          createSyntheticAmbient();
        }
      });
    } catch (error) {
      console.log('Howler not available, creating synthetic sounds');
      createSyntheticAmbient();
    }

    // Preload crush sounds
    Object.keys(soundFiles).forEach(soundKey => {
      if (soundKey !== 'ambient_background.mp3') {
        try {
          soundCache.current[soundKey] = new Howl({
            src: [soundFiles[soundKey]],
            volume: volume,
            html5: true,
            format: ['mp3'],
            onloaderror: () => {
              // Create synthetic sound as fallback
              soundCache.current[soundKey] = createSyntheticSound(soundKey);
            }
          });
        } catch (error) {
          soundCache.current[soundKey] = createSyntheticSound(soundKey);
        }
      }
    });

    return () => {
      // Cleanup
      if (ambientLoop.current) {
        ambientLoop.current.stop();
        ambientLoop.current.unload();
      }
      Object.values(soundCache.current).forEach(sound => {
        if (sound && sound.stop) {
          sound.stop();
          sound.unload();
        }
      });
    };
  }, []);

  // Create synthetic ambient sound
  const createSyntheticAmbient = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(60, audioContext.currentTime); // Low frequency
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
    
    // Add some variation
    setInterval(() => {
      if (soundEnabled) {
        oscillator.frequency.setValueAtTime(
          60 + Math.random() * 20, 
          audioContext.currentTime
        );
      }
    }, 5000);
    
    if (soundEnabled) {
      oscillator.start();
    }
    
    ambientLoop.current = {
      play: () => oscillator.start && oscillator.start(),
      stop: () => oscillator.stop && oscillator.stop(),
      volume: (vol) => gainNode.gain.setValueAtTime(vol * 0.1, audioContext.currentTime)
    };
  };

  // Create synthetic crush sounds using Web Audio API
  const createSyntheticSound = (soundType) => {
    return {
      play: () => {
        if (!soundEnabled) return;
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Different sound characteristics based on material
        switch (soundType) {
          case 'can_crush.mp3':
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);
            oscillator.type = 'square';
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(400, audioContext.currentTime);
            break;
            
          case 'cardboard_crush.mp3':
            oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.5);
            oscillator.type = 'sawtooth';
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(200, audioContext.currentTime);
            break;
            
          case 'electronics_crush.mp3':
            oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.4);
            oscillator.type = 'square';
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, audioContext.currentTime);
            break;
            
          case 'glass_shatter.mp3':
            oscillator.frequency.setValueAtTime(2000, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(500, audioContext.currentTime + 0.2);
            oscillator.type = 'triangle';
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(1000, audioContext.currentTime);
            break;
            
          case 'plastic_crush.mp3':
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.6);
            oscillator.type = 'sine';
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(300, audioContext.currentTime);
            break;
            
          default:
            oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
            oscillator.type = 'sine';
        }
        
        // Envelope
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume * 0.3, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.8);
        
        setCurrentlyPlaying(soundType);
        setTimeout(() => setCurrentlyPlaying(null), 800);
      },
      volume: () => {},
      stop: () => {},
      unload: () => {}
    };
  };

  // Play crush sound
  const playCrushSound = (soundFile) => {
    if (!soundEnabled || !soundFile) return;

    const sound = soundCache.current[soundFile];
    if (sound && sound.play) {
      sound.volume(volume);
      sound.play();
      setCurrentlyPlaying(soundFile);
      
      // Clear playing state after estimated duration
      setTimeout(() => {
        setCurrentlyPlaying(null);
      }, 1000);
    }
  };

  // Start ambient sound
  const startAmbient = () => {
    if (ambientLoop.current && soundEnabled) {
      if (ambientLoop.current.volume) {
        ambientLoop.current.volume(volume * 0.3);
      }
      if (ambientLoop.current.play) {
        ambientLoop.current.play();
      }
    }
  };

  // Stop ambient sound
  const stopAmbient = () => {
    if (ambientLoop.current && ambientLoop.current.stop) {
      ambientLoop.current.stop();
    }
  };

  // Volume change handler
  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (ambientLoop.current && ambientLoop.current.volume) {
      ambientLoop.current.volume(newVolume * 0.3);
    }
    Object.values(soundCache.current).forEach(sound => {
      if (sound && sound.volume) {
        sound.volume(newVolume);
      }
    });
  };

  // Toggle sound
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      startAmbient();
    } else {
      stopAmbient();
    }
  };

  // Expose sound manager to window for other components
  useEffect(() => {
    window.SoundManager = {
      playCrushSound,
      startAmbient,
      stopAmbient,
      toggleSound,
      setVolume: handleVolumeChange,
      isEnabled: () => soundEnabled,
      getVolume: () => volume
    };
  }, [soundEnabled, volume]);

  return (
    <div className="fixed top-4 left-4 z-50">
      <div className="card-glass p-3 flex items-center gap-3">
        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            soundEnabled 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-red-500/20 text-red-400'
          }`}
          title={soundEnabled ? 'Отключить звук' : 'Включить звук'}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>

        {/* Volume control */}
        {soundEnabled && (
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-20 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #10b981 0%, #10b981 ${volume * 100}%, #4b5563 ${volume * 100}%, #4b5563 100%)`
              }}
            />
            <span className="text-xs text-gray-400 w-8">
              {Math.round(volume * 100)}
            </span>
          </div>
        )}

        {/* Currently playing indicator */}
        {currentlyPlaying && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-400">♪</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SoundManager;