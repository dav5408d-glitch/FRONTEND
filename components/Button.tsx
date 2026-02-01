'use client';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'font-semibold transition-all duration-300 rounded-xl focus:outline-none font-sans shadow-md';

  const variantClasses = {
    primary: 'bg-linear-to-r from-blue-500 to-purple-500 text-white hover:from-blue-400 hover:to-purple-400',
    secondary: 'bg-black/20 hover:bg-black/30 text-white border border-white/20',
    outline: 'border border-white/30 hover:border-white/50 text-white hover:bg-white/5'
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {loading ? '⏳ Chargement...' : children}
    </button>
  );
}
