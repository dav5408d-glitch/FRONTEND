'use client';

export default function GlassBackground() {
  return (
    <>
      {/* Effet de fond glass */}
      <div className="fixed inset-0 -z-10 opacity-20">
        <div className="absolute inset-0  from-gray-900 via-black to-gray-900"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gray-400 rounded-full blur-3xl opacity-10"></div>
      </div>

      {/* Grille de fond subtile */}
      <div className="fixed inset-0 -z-10 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>
    </>
  );
}
