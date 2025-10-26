import React, { useEffect, useRef, useState } from 'react';

/**
 * GraphAnimations - Canvas-based particle effects and animations
 *
 * Features:
 * - Particle system for data flow visualization
 * - Connection pulses
 * - Background grid animation
 * - Performance-optimized with RAF
 */

class Particle {
  constructor(x, y, color = '#00E5FF', size = 2) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.speedX = (Math.random() - 0.5) * 2;
    this.speedY = (Math.random() - 0.5) * 2;
    this.life = 1;
    this.decay = 0.01;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life -= this.decay;
    this.size = Math.max(0, this.size - 0.05);
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  isDead() {
    return this.life <= 0 || this.size <= 0;
  }
}

class ConnectionPulse {
  constructor(x1, y1, x2, y2, color = '#00E5FF') {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.color = color;
    this.progress = 0;
    this.speed = 0.02;
  }

  update() {
    this.progress += this.speed;
  }

  draw(ctx) {
    if (this.progress >= 1) return;

    const currentX = this.x1 + (this.x2 - this.x1) * this.progress;
    const currentY = this.y1 + (this.y2 - this.y1) * this.progress;

    ctx.save();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;

    ctx.beginPath();
    ctx.arc(currentX, currentY, 5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  isDead() {
    return this.progress >= 1;
  }
}

const GraphAnimations = ({ nodes = [], edges = [] }) => {
  const canvasRef = useRef(null);
  const [particles, setParticles] = useState([]);
  const [pulses, setPulses] = useState([]);
  const animationFrameRef = useRef(null);

  // Get node positions
  const getNodePosition = (nodeId) => {
    const node = nodes.find((n) => n.id === nodeId);
    return node ? node.position : { x: 0, y: 0 };
  };

  // Create particles at node positions
  const createParticles = (x, y, count = 5, color = '#00E5FF') => {
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      newParticles.push(new Particle(x, y, color, Math.random() * 3 + 2));
    }
    setParticles((prev) => [...prev, ...newParticles]);
  };

  // Create connection pulse
  const createPulse = (sourceId, targetId, color = '#00E5FF') => {
    const source = getNodePosition(sourceId);
    const target = getNodePosition(targetId);
    setPulses((prev) => [...prev, new ConnectionPulse(source.x, source.y, target.x, target.y, color)]);
  };

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    // Set canvas size
    canvas.width = rect.width;
    canvas.height = rect.height;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      setParticles((prevParticles) => {
        const updatedParticles = prevParticles.filter((particle) => {
          particle.update();
          particle.draw(ctx);
          return !particle.isDead();
        });
        return updatedParticles;
      });

      // Update and draw pulses
      setPulses((prevPulses) => {
        const updatedPulses = prevPulses.filter((pulse) => {
          pulse.update();
          pulse.draw(ctx);
          return !pulse.isDead();
        });
        return updatedPulses;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Generate particles for active nodes
  useEffect(() => {
    const interval = setInterval(() => {
      nodes.forEach((node) => {
        if (node.data?.status === 'active' || node.data?.status === 'working') {
          const color = node.data.status === 'active' ? '#00E5FF' : '#00AAFF';
          createParticles(
            node.position.x + 50, // Offset to center of node
            node.position.y + 50,
            3,
            color
          );
        }
      });
    }, 500);

    return () => clearInterval(interval);
  }, [nodes]);

  // Generate pulses for edges
  useEffect(() => {
    const interval = setInterval(() => {
      edges.forEach((edge) => {
        if (edge.animated || edge.data?.active) {
          createPulse(edge.source, edge.target, edge.data?.color || '#00E5FF');
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [edges]);

  // Grid animation background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let gridOffset = 0;

    const animateGrid = () => {
      gridOffset += 0.5;
      if (gridOffset >= 20) gridOffset = 0;

      ctx.save();
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.05)';
      ctx.lineWidth = 1;

      // Draw vertical lines
      for (let x = gridOffset; x < canvas.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Draw horizontal lines
      for (let y = gridOffset; y < canvas.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      ctx.restore();
    };

    const gridInterval = setInterval(animateGrid, 50);

    return () => clearInterval(gridInterval);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="graph-animations-canvas"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    />
  );
};

export default GraphAnimations;
