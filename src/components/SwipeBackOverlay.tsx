import React from 'react';

interface SwipeBackOverlayProps {
  progress: number; // 0 to 1
}

export const SwipeBackOverlay: React.FC<SwipeBackOverlayProps> = ({ progress }) => {
  const translateX = (progress * 100) - 100; // -100% to 0%
  const opacity = progress * 0.3; // 0 to 0.3

  return (
    <>
      {/* Swipe indicator line on the left */}
      <div
        className="fixed left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gold-royal via-gold-royal to-transparent pointer-events-none transition-opacity duration-150"
        style={{
          opacity: progress > 0 ? 1 : 0,
          zIndex: 40,
        }}
      />

      {/* Animated background card preview */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{
          zIndex: 35,
        }}
      >
        <div
          className="absolute inset-0 bg-gradient-to-r from-gold-royal/20 via-transparent to-transparent backdrop-blur-sm"
          style={{
            transform: `translateX(${translateX}%)`,
            transition: progress === 0 ? 'transform 0.3s ease-out' : 'none',
          }}
        />
      </div>

      {/* Overlay shadow */}
      <div
        className="fixed inset-0 bg-black pointer-events-none"
        style={{
          opacity,
          zIndex: 30,
          transition: progress === 0 ? 'opacity 0.3s ease-out' : 'none',
        }}
      />

      {/* Swipe hint text (appears on swipe) */}
      {progress > 0.1 && (
        <div
          className="fixed left-4 top-1/2 -translate-y-1/2 text-gold-royal font-grotesk font-semibold pointer-events-none"
          style={{
            opacity: Math.min(progress * 2, 1),
            transform: `translateX(${progress * 20}px) translateY(-50%)`,
            zIndex: 50,
            fontSize: '14px',
            transition: progress === 0 ? 'all 0.3s ease-out' : 'none',
          }}
        >
          ← Relâchez pour revenir
        </div>
      )}
    </>
  );
};
