'use client';

export default function HeroBackdrop() {
  return (
    <>
      {/* Vignette - edge darkening for both themes */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 40%, transparent 0%, var(--vignette-color) 100%)
          `,
        }}
      />

      {/* Dome Container - overflow hidden creates the arc/dome shape */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '1400px',
          height: '700px',
          top: '-320px',
          left: '50%',
          transform: 'translateX(-50%)',
          overflow: 'hidden',
        }}
      >
        {/* Big Circle - only top portion visible through container = dome arc */}
        <div
          className="absolute"
          style={{
            width: '1400px',
            height: '1400px',
            borderRadius: '9999px',
            top: '320px',
            left: '0',
            background: 'var(--dome-bg)',
          }}
        >
          {/* Blue glow - right-top bias */}
          <div
            className="absolute"
            style={{
              width: '550px',
              height: '550px',
              borderRadius: '9999px',
              top: '-80px',
              right: '180px',
              background: 'radial-gradient(circle, var(--dome-blue) 0%, transparent 65%)',
              filter: 'blur(50px)',
            }}
          />
          
          {/* Orange glow - left-top bias */}
          <div
            className="absolute"
            style={{
              width: '480px',
              height: '480px',
              borderRadius: '9999px',
              top: '-40px',
              left: '220px',
              background: 'radial-gradient(circle, var(--dome-orange) 0%, transparent 65%)',
              filter: 'blur(45px)',
            }}
          />

          {/* Center blend glow */}
          <div
            className="absolute"
            style={{
              width: '650px',
              height: '350px',
              borderRadius: '9999px',
              top: '-30px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'radial-gradient(ellipse 100% 100% at 50% 0%, var(--dome-center) 0%, transparent 75%)',
              filter: 'blur(35px)',
            }}
          />
        </div>
      </div>

      {/* Rim / Arc Highlight - stronger thin bright arc along dome edge */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '1300px',
          height: '650px',
          top: '-320px',
          left: '50%',
          transform: 'translateX(-50%)',
          overflow: 'hidden',
        }}
      >
        <div
          className="absolute"
          style={{
            width: '1300px',
            height: '1300px',
            borderRadius: '9999px',
            top: '320px',
            left: '0',
            background: 'transparent',
            boxShadow: `
              inset 0 -3px 20px 0 var(--dome-rim),
              inset 0 -1px 40px 0 var(--dome-rim-soft),
              inset 0 -6px 80px 0 var(--dome-center)
            `,
          }}
        />
      </div>
    </>
  );
}
