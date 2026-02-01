'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '@/lib/auth';

interface NavigationProps {
  transparent?: boolean;
  currentPage?: string;
}

export default function Navigation({ transparent = false, currentPage }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = authService.getUser();
  const router = useRouter();

  useEffect(() => {
    if (transparent) {
      const handleScroll = () => {
        setScrolled(window.scrollY > 50);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [transparent]);

  const handleLogout = () => {
    authService.logout();
    router.push('/');
  };

  const handleGuestLogin = () => {
    authService.logout();
    router.push('/chat');
  };

  const bgClass = transparent
    ? scrolled ? 'bg-black/70 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'
    : 'bg-black/50 backdrop-blur-xl border-b border-white/10';

  const navLinks = [
    { href: '/', label: 'Accueil', active: currentPage === 'home' },
    { href: '/chat', label: 'Chat', active: currentPage === 'chat' },
    { href: '/pricing', label: 'Tarifs', active: currentPage === 'pricing' },
  ];

  return (
    <>
      <motion.header 
        className={`fixed top-0 left-0 right-0 z-50 ${bgClass} transition-all duration-300`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 text-xl font-bold hover:text-gray-300 transition group">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <svg className="w-8 h-8 object-contain" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 17v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd" />
                </svg>
              </motion.div>
              <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                SYNAPSE
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-sm font-medium transition-colors hover:text-white ${
                    link.active ? 'text-white' : 'text-gray-300'
                  }`}
                >
                  {link.label}
                  {link.active && (
                    <motion.div
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-linear-to-r from-blue-400 to-purple-400"
                      layoutId="activeTab"
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* User Actions */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Connecté</div>
                    <div className="text-sm font-medium text-white">{user.email}</div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm text-red-400 hover:text-red-300 transition border border-red-400/30 rounded-lg hover:bg-red-400/10"
                  >
                    Déconnexion
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGuestLogin}
                    className="px-4 py-2 text-sm text-amber-400 hover:text-amber-300 transition border border-amber-400/30 rounded-lg hover:bg-amber-400/10"
                  >
                    🎯 Mode Invité
                  </motion.button>
                  <Link
                    href="/auth/login"
                    className="px-6 py-2 text-sm bg-linear-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-400 hover:to-purple-400 transition shadow-lg"
                  >
                    Connexion
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition"
            >
              <motion.div
                animate={mobileMenuOpen ? "open" : "closed"}
                className="w-6 h-6 relative"
              >
                <motion.span
                  variants={{
                    closed: { rotate: 0, y: 0 },
                    open: { rotate: 45, y: 8 }
                  }}
                  className="absolute top-0 left-0 w-6 h-0.5 bg-white"
                />
                <motion.span
                  variants={{
                    closed: { opacity: 1 },
                    open: { opacity: 0 }
                  }}
                  className="absolute top-2 left-0 w-6 h-0.5 bg-white"
                />
                <motion.span
                  variants={{
                    closed: { rotate: 0, y: 0 },
                    open: { rotate: -45, y: -8 }
                  }}
                  className="absolute top-4 left-0 w-6 h-0.5 bg-white"
                />
              </motion.div>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-16 left-0 right-0 z-40 bg-black/95 backdrop-blur-xl border-b border-white/10 md:hidden"
          >
            <div className="container mx-auto px-6 py-4 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-2 text-sm font-medium transition-colors ${
                    link.active ? 'text-white' : 'text-gray-300'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-white/10">
                {user ? (
                  <div className="space-y-3">
                    <div className="text-sm text-gray-400">
                      Connecté: {user.email}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full py-2 text-sm text-red-400 border border-red-400/30 rounded-lg hover:bg-red-400/10 transition"
                    >
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={handleGuestLogin}
                      className="w-full py-2 text-sm text-amber-400 border border-amber-400/30 rounded-lg hover:bg-amber-400/10 transition"
                    >
                      🎯 Mode Invité
                    </button>
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full py-2 text-center text-sm bg-linear-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold"
                    >
                      Connexion
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
