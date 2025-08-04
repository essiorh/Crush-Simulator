import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ParticleSystem = ({ particles }) => {
  const [activeParticles, setActiveParticles] = useState([]);
  const [particleConfig, setParticleConfig] = useState({
    gravity: 0.5,
    airResistance: 0.98,
    bounceDeceleration: 0.7,
    minLife: 2000,
    maxLife: 4000
  });

  // Update particles physics
  useEffect(() => {
    if (particles.length === 0) return;

    const updateParticles = () => {
      setActiveParticles(prev => 
        prev.map(particle => {
          // Apply physics
          const newVy = particle.vy + particleConfig.gravity;
          const newVx = particle.vx * particleConfig.airResistance;
          
          let newX = particle.x + newVx;
          let newY = particle.y + newVy;
          
          // Boundary collision (simple bounce)
          const bounds = { width: window.innerWidth, height: window.innerHeight };
          
          if (newX <= 0 || newX >= bounds.width) {
            newVx *= -particleConfig.bounceDeceleration;
            newX = Math.max(0, Math.min(bounds.width, newX));
          }
          
          if (newY <= 0 || newY >= bounds.height) {
            newVy *= -particleConfig.bounceDeceleration;
            newY = Math.max(0, Math.min(bounds.height, newY));
          }
          
          // Update life
          const newLife = particle.life - 0.02;
          
          return {
            ...particle,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
            life: Math.max(0, newLife),
            opacity: newLife,
            size: particle.originalSize * newLife
          };
        }).filter(p => p.life > 0)
      );
    };

    const animationFrame = setInterval(updateParticles, 16); // ~60fps
    return () => clearInterval(animationFrame);
  }, [particleConfig]);

  // Add new particles
  useEffect(() => {
    if (particles.length > 0) {
      const newParticles = particles.map(p => ({
        ...p,
        originalSize: p.size,
        opacity: 1,
        created: Date.now()
      }));
      
      setActiveParticles(prev => [...prev, ...newParticles]);
    }
  }, [particles]);

  // Particle component with material-specific styling
  const Particle = ({ particle }) => {
    const getParticleStyles = (type) => {
      const baseStyles = {
        position: 'absolute',
        pointerEvents: 'none',
        borderRadius: '50%',
        willChange: 'transform, opacity'
      };

      switch (type) {
        case 'metal':
          return {
            ...baseStyles,
            background: 'linear-gradient(45deg, #c0c0c0, #ffffff, #a8a8a8)',
            boxShadow: '0 0 4px rgba(192, 192, 192, 0.8), inset 0 0 4px rgba(255, 255, 255, 0.6)',
            borderRadius: '2px'
          };
          
        case 'paper':
          return {
            ...baseStyles,
            background: 'linear-gradient(45deg, #d4b896, #f4e4bc, #c9a876)',
            boxShadow: '0 0 2px rgba(212, 184, 150, 0.6)',
            borderRadius: '1px',
            transform: 'rotate(45deg)'
          };
          
        case 'glass':
          return {
            ...baseStyles,
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.8) 20%, rgba(200, 230, 255, 0.6) 70%, transparent)',
            boxShadow: '0 0 8px rgba(255, 255, 255, 0.9), 0 0 4px rgba(0, 150, 255, 0.5)',
            borderRadius: '50%'
          };
          
        case 'plastic':
          return {
            ...baseStyles,
            background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1)',
            boxShadow: '0 0 3px rgba(255, 107, 107, 0.7)',
            borderRadius: '3px'
          };
          
        case 'mixed':
          return {
            ...baseStyles,
            background: 'linear-gradient(45deg, #ffd93d, #6bcf7f, #4d4d4d, #ff6b6b)',
            boxShadow: '0 0 5px rgba(255, 217, 61, 0.8)',
            borderRadius: '2px',
            animation: 'particleShimmer 1s ease-in-out infinite'
          };
          
        default:
          return {
            ...baseStyles,
            background: 'radial-gradient(circle, #ffffff, #e0e0e0)',
            boxShadow: '0 0 2px rgba(255, 255, 255, 0.5)'
          };
      }
    };

    return (
      <motion.div
        initial={{ scale: 0, opacity: 1 }}
        animate={{
          x: particle.x,
          y: particle.y,
          scale: particle.size / particle.originalSize,
          opacity: particle.opacity,
          rotate: particle.rotation || 0
        }}
        transition={{
          type: "tween",
          duration: 0.1,
          ease: "linear"
        }}
        style={{
          ...getParticleStyles(particle.type),
          width: `${particle.originalSize}px`,
          height: `${particle.originalSize}px`,
          left: 0,
          top: 0
        }}
      />
    );
  };

  // Particle effects for different materials
  const createMaterialEffect = useCallback((position, materialType, intensity = 1) => {
    const particleCount = Math.floor(15 * intensity);
    const newParticles = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const velocity = 50 + Math.random() * 100 * intensity;
      
      newParticles.push({
        id: `effect-${Date.now()}-${i}`,
        type: materialType,
        x: position.x + (Math.random() - 0.5) * 20,
        y: position.y + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 50, // Initial upward velocity
        life: 1.0,
        size: 2 + Math.random() * 4,
        originalSize: 2 + Math.random() * 4,
        opacity: 1,
        rotation: Math.random() * 360
      });
    }

    setActiveParticles(prev => [...prev, ...newParticles]);
  }, []);

  // Sparkle effect for satisfying moments
  const createSparkleEffect = useCallback((position, color = 'white') => {
    const sparkles = [];
    
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const distance = 30 + Math.random() * 20;
      
      sparkles.push({
        id: `sparkle-${Date.now()}-${i}`,
        type: 'sparkle',
        x: position.x + Math.cos(angle) * distance,
        y: position.y + Math.sin(angle) * distance,
        vx: Math.cos(angle) * 20,
        vy: Math.sin(angle) * 20,
        life: 1.0,
        size: 3 + Math.random() * 3,
        originalSize: 3 + Math.random() * 3,
        opacity: 1,
        color: color
      });
    }

    setActiveParticles(prev => [...prev, ...sparkles]);
  }, []);

  // Expose particle system methods globally
  useEffect(() => {
    window.ParticleSystem = {
      createMaterialEffect,
      createSparkleEffect,
      setGravity: (gravity) => setParticleConfig(prev => ({ ...prev, gravity })),
      setAirResistance: (resistance) => setParticleConfig(prev => ({ ...prev, airResistance: resistance }))
    };
  }, [createMaterialEffect, createSparkleEffect]);

  return (
    <>
      {/* CSS for particle animations */}
      <style jsx>{`
        @keyframes particleShimmer {
          0%, 100% { filter: hue-rotate(0deg) brightness(1); }
          50% { filter: hue-rotate(180deg) brightness(1.2); }
        }
        
        @keyframes sparkle {
          0%, 100% { 
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
          50% { 
            transform: scale(1.5) rotate(180deg);
            opacity: 0.7;
          }
        }
        
        .sparkle-particle {
          animation: sparkle 0.8s ease-in-out infinite;
        }
      `}</style>

      {/* Render active particles */}
      <div className="fixed inset-0 pointer-events-none z-40">
        {activeParticles.map(particle => (
          <Particle key={particle.id} particle={particle} />
        ))}
      </div>

      {/* Particle system debug info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 text-xs text-gray-400 bg-black/50 p-2 rounded">
          Active Particles: {activeParticles.length}
        </div>
      )}
    </>
  );
};

export default ParticleSystem;