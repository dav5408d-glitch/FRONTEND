'use client';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

export default function GlassCard({ children, className = '', gradient = false }: GlassCardProps) {
  return (
    <div className={`relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/50 ${className}`}>
      {gradient && (
        <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-white/10 to-transparent opacity-20"></div>
      )}
      <div className="relative">
        {children}
      </div>
    </div>
  );
}
