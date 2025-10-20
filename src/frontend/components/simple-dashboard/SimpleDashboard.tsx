import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

export function SimpleDashboard() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mock данные для демонстрации
  const totalTokens = 250000;
  const unlockedTokens = 167500; // 67% разблокировано
  const percentage = 67;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Cosmic stars animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Star properties
    interface Star {
      x: number;
      y: number;
      size: number;
      speed: number;
      opacity: number;
      pulseSpeed: number;
      pulsePhase: number;
    }

    const stars: Star[] = [];
    const starCount = 150;

    // Create stars
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.5 + 0.1,
        opacity: Math.random() * 0.5 + 0.3,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }

    // Animation loop
    let animationFrame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        // Pulse effect
        star.pulsePhase += star.pulseSpeed;
        const currentOpacity = star.opacity + Math.sin(star.pulsePhase) * 0.2;

        // Draw star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147, 51, 234, ${currentOpacity})`;
        ctx.fill();

        // Glow effect
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147, 51, 234, ${currentOpacity * 0.2})`;
        ctx.fill();

        // Move star
        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      background: '#0a0118',
      fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
      overflow: 'hidden'
    }}>
      {/* Cosmic Canvas Background */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />

      {/* Gradient Orbs */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}>
        {/* Purple Orb */}
        <div style={{
          position: 'absolute',
          top: '10%',
          right: '15%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(147, 51, 234, 0.25) 0%, transparent 70%)',
          filter: 'blur(120px)',
          animation: 'float-orb 20s ease-in-out infinite',
          animationDelay: '0s'
        }} />

        {/* Blue Orb */}
        <div style={{
          position: 'absolute',
          bottom: '15%',
          left: '10%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
          filter: 'blur(130px)',
          animation: 'float-orb 25s ease-in-out infinite',
          animationDelay: '3s'
        }} />

        {/* Yellow Orb */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(255, 233, 0, 0.15) 0%, transparent 70%)',
          filter: 'blur(100px)',
          animation: 'float-orb 18s ease-in-out infinite',
          animationDelay: '6s',
          transform: 'translate(-50%, -50%)'
        }} />
      </div>

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '3rem 1.5rem'
      }}>
        {/* Hero Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem',
          animation: 'fadeInUp 0.8s ease-out'
        }}>
          {/* Label */}
          <div style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(59, 130, 246, 0.2))',
            border: '1px solid rgba(255, 233, 0, 0.3)',
            borderRadius: '50px',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#FFE900',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: '1.5rem',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 30px rgba(255, 233, 0, 0.15)',
            animation: 'label-glow 2s ease-in-out infinite'
          }}>
            💎 ВАШИ ТОКЕНЫ
          </div>

          {/* Big Number with Gradient */}
          <div style={{
            fontSize: 'clamp(3rem, 10vw, 6rem)',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #9333ea 0%, #3b82f6 50%, #FFE900 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1.1,
            marginBottom: '0.5rem',
            animation: 'text-pulse 3s ease-in-out infinite',
            textShadow: '0 0 80px rgba(147, 51, 234, 0.3)'
          }}>
            {formatNumber(totalTokens)}
          </div>

          {/* Token Symbol */}
          <div style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            color: '#A0A3B1',
            fontWeight: 500,
            letterSpacing: '0.1em'
          }}>
            HYPE
          </div>
        </div>

        {/* Glass Card with Progress */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 32, 38, 0.95), rgba(10, 1, 24, 0.95))',
          border: '1px solid rgba(147, 51, 234, 0.4)',
          borderRadius: '32px',
          padding: 'clamp(1.5rem, 4vw, 3rem)',
          marginBottom: '2rem',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(147, 51, 234, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          animation: 'fadeInUp 0.8s ease-out 0.2s backwards'
        }}>
          {/* Shine effect */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'linear-gradient(45deg, transparent 30%, rgba(255, 233, 0, 0.03) 50%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          {/* Card Content */}
          <div style={{
            textAlign: 'center',
            marginBottom: '2rem',
            position: 'relative',
            zIndex: 1
          }}>
            <div style={{
              fontSize: '0.875rem',
              color: '#A0A3B1',
              marginBottom: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: 500
            }}>
              Разблокировано
            </div>

            <div style={{
              fontSize: 'clamp(2rem, 6vw, 4rem)',
              fontWeight: 700,
              color: '#FFE900',
              marginBottom: '0.5rem',
              textShadow: '0 0 30px rgba(255, 233, 0, 0.3)',
              animation: 'stat-pulse 3s ease-in-out 0.5s infinite'
            }}>
              {percentage}%
            </div>

            <div style={{
              fontSize: 'clamp(1rem, 3vw, 1.5rem)',
              color: '#FFFFFF',
              fontWeight: 500
            }}>
              {formatNumber(unlockedTokens)} HYPE доступно
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '16px',
            background: 'rgba(147, 51, 234, 0.15)',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid rgba(147, 51, 234, 0.3)',
            boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3)'
          }}>
            {/* Progress Fill */}
            <div style={{
              width: `${percentage}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #9333ea 0%, #3b82f6 50%, #FFE900 100%)',
              borderRadius: '16px',
              transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 0 30px rgba(147, 51, 234, 0.6), 0 0 60px rgba(59, 130, 246, 0.4)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Shimmer effect */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '200%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
                animation: 'shimmer 3s infinite'
              }} />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem',
          animation: 'fadeInUp 0.8s ease-out 0.4s backwards'
        }}>
          {/* Buy Button */}
          <button
            onClick={() => router.push('/buy')}
            style={{
              padding: 'clamp(1.25rem, 3vw, 1.75rem) clamp(1.5rem, 4vw, 2.5rem)',
              background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.3), rgba(59, 130, 246, 0.25))',
              border: '2px solid rgba(147, 51, 234, 0.6)',
              borderRadius: '20px',
              color: '#FFFFFF',
              fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              backdropFilter: 'blur(10px)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(147, 51, 234, 0.5), rgba(59, 130, 246, 0.4))';
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(147, 51, 234, 0.5), 0 0 60px rgba(147, 51, 234, 0.3)';
              e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.8)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(147, 51, 234, 0.3), rgba(59, 130, 246, 0.25))';
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.6)';
            }}
          >
            <span style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem'
            }}>
              <span style={{ fontSize: '1.5em' }}>💰</span>
              <span>КУПИТЬ ЕЩЁ</span>
            </span>
          </button>

          {/* Claim Button */}
          <button
            onClick={() => router.push('/claim')}
            disabled={unlockedTokens === 0}
            style={{
              padding: 'clamp(1.25rem, 3vw, 1.75rem) clamp(1.5rem, 4vw, 2.5rem)',
              background: 'linear-gradient(135deg, #9333ea, #3b82f6)',
              border: '2px solid transparent',
              borderRadius: '20px',
              color: '#FFFFFF',
              fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
              fontWeight: 600,
              cursor: unlockedTokens === 0 ? 'not-allowed' : 'pointer',
              opacity: unlockedTokens === 0 ? 0.5 : 1,
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 8px 30px rgba(147, 51, 234, 0.4)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (unlockedTokens > 0) {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(147, 51, 234, 0.6), 0 0 60px rgba(59, 130, 246, 0.4)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #a855f7, #60a5fa)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(147, 51, 234, 0.4)';
              e.currentTarget.style.background = 'linear-gradient(135deg, #9333ea, #3b82f6)';
            }}
          >
            <span style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem'
            }}>
              <span style={{ fontSize: '1.5em' }}>💎</span>
              <span>ЗАБРАТЬ ТОКЕНЫ</span>
            </span>
          </button>
        </div>

        {/* Info Section */}
        <div style={{
          textAlign: 'center',
          animation: 'fadeInUp 0.8s ease-out 0.6s backwards'
        }}>
          <div style={{
            color: '#A0A3B1',
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            lineHeight: 1.6,
            marginBottom: '2.5rem',
            maxWidth: '600px',
            margin: '0 auto 2.5rem'
          }}>
            20% получаете сразу, остальное разблокируется за 21 месяц
          </div>

          {/* Switch to Full Version */}
          <div style={{
            padding: '2rem',
            background: 'linear-gradient(135deg, rgba(30, 32, 38, 0.6), rgba(10, 1, 24, 0.6))',
            border: '1px solid rgba(147, 51, 234, 0.2)',
            borderRadius: '24px',
            backdropFilter: 'blur(10px)'
          }}>
            <p style={{
              color: '#A0A3B1',
              fontSize: '1rem',
              marginBottom: '1rem'
            }}>
              Нужна подробная статистика?
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              style={{
                background: 'transparent',
                border: '2px solid #FFE900',
                borderRadius: '12px',
                padding: '0.75rem 2rem',
                color: '#FFE900',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#FFE900';
                e.currentTarget.style.color = '#0a0118';
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 233, 0, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#FFE900';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              → Переключиться на полную версию
            </button>
          </div>
        </div>
      </div>

      {/* Animations CSS */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float-orb {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(50px, -40px) scale(1.08);
          }
          50% {
            transform: translate(-15px, 50px) scale(1.15);
          }
          75% {
            transform: translate(-40px, -30px) scale(0.92);
          }
        }

        @keyframes text-pulse {
          0%, 100% {
            filter: drop-shadow(0 0 10px rgba(147, 51, 234, 0.3));
          }
          50% {
            filter: drop-shadow(0 0 20px rgba(147, 51, 234, 0.5))
                    drop-shadow(0 0 40px rgba(59, 130, 246, 0.3));
          }
        }

        @keyframes stat-pulse {
          0%, 100% {
            filter: drop-shadow(0 0 5px rgba(255, 233, 0, 0.3));
          }
          50% {
            filter: drop-shadow(0 0 15px rgba(255, 233, 0, 0.5))
                    drop-shadow(0 0 30px rgba(255, 233, 0, 0.3));
          }
        }

        @keyframes label-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(255, 233, 0, 0.15);
          }
          50% {
            box-shadow: 0 0 40px rgba(255, 233, 0, 0.3);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        @media (max-width: 768px) {
          canvas {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
