import { useEffect, useState } from 'react';

const ANIMATION_DURATION = 1600;
const FADE_DURATION = 350;

export default function TransactionLoader({ isVisible, onComplete }) {
  const [phase, setPhase] = useState('idle'); // idle | animating | fading

  useEffect(() => {
    if (!isVisible) {
      setPhase('idle');
      return;
    }

    setPhase('animating');

    const animTimer = setTimeout(() => {
      setPhase('fading');
    }, ANIMATION_DURATION);

    const doneTimer = setTimeout(() => {
      setPhase('idle');
      onComplete();
    }, ANIMATION_DURATION + FADE_DURATION);

    return () => {
      clearTimeout(animTimer);
      clearTimeout(doneTimer);
    };
  }, [isVisible, onComplete]);

  if (phase === 'idle') return null;

  return (
    <>
      <style>{`
        @keyframes txl-slide-card {
          0%   { transform: translateY(0) rotate(0deg); }
          50%  { transform: translateY(-70px) rotate(90deg); }
          60%  { transform: translateY(-70px) rotate(90deg); }
          100% { transform: translateY(-8px) rotate(90deg); }
        }
        @keyframes txl-slide-post {
          50%  { transform: translateY(0); }
          100% { transform: translateY(-70px); }
        }
        @keyframes txl-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes txl-fade-out {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        .txl-overlay {
          animation: txl-fade-in 0.2s ease forwards;
        }
        .txl-overlay.fading {
          animation: txl-fade-out ${FADE_DURATION}ms ease forwards;
        }
        .txl-card {
          animation: txl-slide-card 1.2s cubic-bezier(0.645, 0.045, 0.355, 1) both;
        }
        .txl-post {
          animation: txl-slide-post 1s cubic-bezier(0.165, 0.84, 0.44, 1) both;
        }
        .txl-label {
          animation: txl-fade-in 0.3s 1s backwards;
        }
      `}</style>

      <div
        className={`txl-overlay${phase === 'fading' ? ' fading' : ''}`}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          background: 'rgba(var(--fundly-deep-rgb),0.88)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div
          style={{
            width: '130px',
            height: '120px',
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            className="txl-card"
            style={{
              width: '70px',
              height: '46px',
              background: 'linear-gradient(180deg, var(--fundly-accent-soft) 0%, var(--fundly-accent) 58%, var(--fundly-warm) 100%)',
              borderRadius: '6px',
              position: 'absolute',
              display: 'flex',
              zIndex: 10,
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '9px 9px 20px -6px rgba(var(--fundly-accent-rgb),0.75)',
            }}
          >
            <div
              style={{
                width: '65px',
                height: '13px',
                backgroundColor: 'rgba(var(--fundly-deep-rgb),0.42)',
                borderRadius: '2px',
                marginTop: '7px',
              }}
            />
            <div
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: 'var(--fundly-surface)',
                boxShadow: '0 -10px 0 0 rgba(var(--fundly-surface-rgb),0.9), 0 10px 0 0 rgba(var(--fundly-surface-rgb),0.6)',
                borderRadius: '50%',
                transform: 'rotate(90deg)',
                margin: '10px 0 0 -30px',
              }}
            />
          </div>

          <div
            className="txl-post"
            style={{
              width: '63px',
              height: '75px',
              backgroundColor: 'var(--fundly-surface)',
              border: '1px solid rgba(var(--fundly-primary-rgb),0.14)',
              position: 'absolute',
              zIndex: 11,
              top: '120px',
              borderRadius: '6px',
              overflow: 'hidden',
              boxShadow: '0 10px 24px rgba(var(--fundly-deep-rgb),0.2)',
            }}
          >
            <div
              style={{
                width: '47px',
                height: '9px',
                backgroundColor: 'var(--fundly-primary)',
                position: 'absolute',
                borderRadius: '0 0 3px 3px',
                right: '8px',
                top: '8px',
              }}
            />
            <div
              style={{
                width: '47px',
                height: '23px',
                backgroundColor: 'rgba(var(--fundly-accent-rgb),0.12)',
                position: 'absolute',
                top: '22px',
                right: '8px',
                borderRadius: '3px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--fundly-primary)',
                fontSize: '10px',
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              NIS
            </div>
            <div
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: 'var(--fundly-primary)',
                boxShadow: '0 -18px 0 0 var(--fundly-primary), 0 18px 0 0 var(--fundly-primary)',
                borderRadius: '2px',
                position: 'absolute',
                transform: 'rotate(90deg)',
                left: '25px',
                top: '52px',
              }}
            />
            <div
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: 'var(--fundly-accent)',
                boxShadow: '0 -18px 0 0 var(--fundly-accent), 0 18px 0 0 var(--fundly-accent)',
                borderRadius: '2px',
                position: 'absolute',
                transform: 'rotate(90deg)',
                left: '25px',
                top: '68px',
              }}
            />
          </div>
        </div>

        <p
          className="txl-label"
          style={{
            margin: 0,
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'rgba(var(--fundly-surface-rgb),0.7)',
          }}
        >
          Opening transaction form...
        </p>
      </div>
    </>
  );
}
