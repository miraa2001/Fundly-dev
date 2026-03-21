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
        @keyframes txl-fade-dollar {
          0%   { opacity: 0; transform: translateY(-5px); }
          100% { opacity: 1; transform: translateY(0); }
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
        .txl-dollar {
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
          background: 'rgba(7, 20, 26, 0.88)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* ── POS SCENE ── */}
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
          {/* Credit card */}
          <div
            className="txl-card"
            style={{
              width: '70px',
              height: '46px',
              backgroundColor: '#c7ffbc',
              borderRadius: '6px',
              position: 'absolute',
              display: 'flex',
              zIndex: 10,
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '9px 9px 9px -2px rgba(77,200,143,0.72)',
            }}
          >
            {/* Card stripe */}
            <div
              style={{
                width: '65px',
                height: '13px',
                backgroundColor: '#80ea69',
                borderRadius: '2px',
                marginTop: '7px',
              }}
            />
            {/* Card dots */}
            <div
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#379e1f',
                boxShadow: '0 -10px 0 0 #26850e, 0 10px 0 0 #56be3e',
                borderRadius: '50%',
                transform: 'rotate(90deg)',
                margin: '10px 0 0 -30px',
              }}
            />
          </div>

          {/* POS terminal */}
          <div
            className="txl-post"
            style={{
              width: '63px',
              height: '75px',
              backgroundColor: '#dddde0',
              position: 'absolute',
              zIndex: 11,
              top: '120px',
              borderRadius: '6px',
              overflow: 'hidden',
            }}
          >
            {/* Terminal top bar */}
            <div
              style={{
                width: '47px',
                height: '9px',
                backgroundColor: '#545354',
                position: 'absolute',
                borderRadius: '0 0 3px 3px',
                right: '8px',
                top: '8px',
              }}
            />
            {/* Screen */}
            <div
              style={{
                width: '47px',
                height: '23px',
                backgroundColor: '#ffffff',
                position: 'absolute',
                top: '22px',
                right: '8px',
                borderRadius: '3px',
              }}
            >
              {/* Dollar sign */}
              <div
                className="txl-dollar"
                style={{
                  position: 'absolute',
                  fontSize: '16px',
                  fontFamily: '"Roboto Condensed", sans-serif',
                  width: '100%',
                  left: 0,
                  top: 0,
                  color: '#4b953b',
                  textAlign: 'center',
                  lineHeight: '23px',
                }}
              >
                ₪
              </div>
            </div>
            {/* Keypad row 1 */}
            <div
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#838183',
                boxShadow: '0 -18px 0 0 #838183, 0 18px 0 0 #838183',
                borderRadius: '2px',
                position: 'absolute',
                transform: 'rotate(90deg)',
                left: '25px',
                top: '52px',
              }}
            />
            {/* Keypad row 2 */}
            <div
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#aaa9ab',
                boxShadow: '0 -18px 0 0 #aaa9ab, 0 18px 0 0 #aaa9ab',
                borderRadius: '2px',
                position: 'absolute',
                transform: 'rotate(90deg)',
                left: '25px',
                top: '68px',
              }}
            />
          </div>
        </div>

        {/* Label */}
        <p
          style={{
            margin: 0,
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'rgba(68,232,244,0.7)',
          }}
        >
          Opening transaction form…
        </p>
      </div>
    </>
  );
}
