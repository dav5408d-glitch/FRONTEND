'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { authService } from '@/lib/auth'
import GlassBackground from '@/components/GlassBackground'
import GlassCard from '@/components/GlassCard'
import Input from '@/components/Input'
import Button from '@/components/Button'
import AnimatedCard from '@/components/AnimatedCard'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await authService.login(email, password)
      router.push('/chat')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 to-black text-white">
      <GlassBackground />

      {/* Header */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <div className="container mx-auto px-6 py-4">
          <Link href="/" className="text-lg font-bold tracking-widest hover:text-gray-300 transition">
            SYNAPSE AI
          </Link>
        </div>
      </motion.header>

      {/* Contenu principal */}
      <div className="flex items-center justify-center min-h-screen pt-20 px-4">
        <div className="w-full max-w-md">
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold mb-2">SYNAPSE AI</h1>
            <p className="text-gray-400">Connectez-vous à votre compte</p>
          </motion.div>

          {/* Carte glass */}
          <AnimatedCard delay={0.2}>
            <GlassCard gradient>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  type="email"
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="votre@email.com"
                />

                <Input
                  type="password"
                  label="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  error={error ? error : undefined}
                />

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    disabled={isLoading}
                    loading={isLoading}
                    size="lg"
                    className="w-full bg-linear-to-r from-white to-gray-200 text-black hover:from-gray-100 hover:to-white"
                  >
                    Se connecter
                  </Button>
                </motion.div>
              </form>

              <div className="relative mt-6 pt-6 border-t border-white/10">
                <p className="text-center text-gray-400">
                  Pas de compte ?{' '}
                  <Link href="/auth/register" className="text-white hover:text-gray-300 transition font-medium">
                    S&apos;inscrire
                  </Link>
                </p>

                <div className="mt-6 pt-6 border-t border-white/10 text-center">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      authService.logout();
                      router.push('/chat');
                    }}
                    className="text-sm text-gray-400 hover:text-white transition flex items-center justify-center gap-2 mx-auto group"
                  >
                    <span>Continuer en tant qu&apos;invité</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </motion.button>
                </div>
              </div>
            </GlassCard>
          </AnimatedCard>

          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition text-sm group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              Retour à l&apos;accueil
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 text-center text-gray-600 text-sm backdrop-blur-md bg-black/30 border-t border-white/10">
        <p>SYNAPSE AI • Orchestrateur Multi-IA</p>
      </div>
    </div>
  )
}