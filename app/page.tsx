'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import GlassBackground from '@/components/GlassBackground';
import AnimatedCard from '@/components/AnimatedCard';
import Button from '@/components/Button';

export default function LandingPage() {
  
  return (
    <div className="min-h-screen bg-linear-to-br from-[#0a0a23] to-[#1a1a40] text-white overflow-hidden font-sans">
      <GlassBackground />
      <Navigation transparent currentPage="home" />

      {/* Hero Section */}
      <main className="min-h-screen flex flex-col justify-center items-center pt-32 px-6 relative">
        <motion.div 
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          {/* Badge */}
          <motion.div 
            className="inline-block mb-8 px-4 py-2 bg-blue-600/10 rounded-full border border-blue-400/30"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <p className="text-sm text-blue-200 font-medium">Plateforme d&apos;Orchestration IA</p>
          </motion.div>

          {/* Main Heading */}
          <motion.h1 
            className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <span className="block">Une seule interface,</span>
            <span className="text-blue-400">toutes les IAs</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p 
            className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            SYNAPSE orchestre les meilleures IA pour vous. Claude, GPT-4, Gemini, DeepSeek et plus — économisez 30-60% d&apos;une seule interface.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <Link href="/chat" aria-label="Commencer le chat">
              <Button size="lg" variant="primary">Commencer le chat</Button>
            </Link>
            <Link href="/pricing" aria-label="Voir les plans">
              <Button variant="outline" size="lg">Voir les plans</Button>
            </Link>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div 
            className="animate-bounce" 
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <svg className="w-6 h-6 mx-auto text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <title>Scroll down</title>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </main>

        {/* Problem Section */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.h2 
              className="text-4xl font-bold text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Le problème
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                  { title: 'Trop cher', desc: '20$/mois pour une seule IA, plus les frais d&apos;intégration.' },
                  { title: 'Verrouillé', desc: 'Un seul fournisseur = point de défaillance unique.' },
                  { title: 'Setup complexe', desc: 'Multiples APIs, multiples dashboards, chaos.' }
              ].map((item, i) => (
                <AnimatedCard key={i} delay={i * 0.1}>
                  <h3 className="text-xl font-bold mb-2 text-blue-200">{item.title}</h3>
                  <p className="text-gray-300">{item.desc}</p>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-6 bg-white/5">
          <div className="max-w-6xl mx-auto">
            <motion.h2 
              className="text-4xl font-bold text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Designed for Everyone
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: 'For Startups', features: ['Save 50% on API costs', 'Never get locked in', 'Scale as you grow'] },
                { title: 'For Developers', features: ['One API, 9 providers', 'Smart fallback routing', 'Clear billing'] },
                { title: 'For Enterprises', features: ['Data privacy control', 'Multi-workspace', 'VIP support'] }
              ].map((user, i) => (
                <AnimatedCard key={i} delay={i * 0.1} glass>
                  <h3 className="text-2xl font-bold mb-6">{user.title}</h3>
                  <ul className="space-y-3">
                    {user.features.map((feat, j) => (
                      <li key={j} className="flex items-center gap-3 text-gray-300">
                        <span className="text-blue-400">✓</span> {feat}
                      </li>
                    ))}
                  </ul>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </section>

      {/* Pricing Preview */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-4xl font-bold text-center mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Tarifs Simples
          </motion.h2>
          <motion.p 
            className="text-center text-gray-400 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Pas de plan gratuit. Commencez avec le Plan Pro ($25/mois) et passez à l&apos;Élite ($49/mois).
          </motion.p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { name: 'Plan Pro', price: '$25', desc: '/mois', color: 'from-blue-400' },
              { name: 'Plan Élite', price: '$49', desc: '/mois', color: 'from-purple-400' }
            ].map((plan, i) => (
              <AnimatedCard key={i} delay={i * 0.1}>
                <div className={`relative backdrop-blur-2xl border-2 rounded-3xl p-10 shadow-xl transition-all duration-300 ${
                  plan.name === 'Plan Élite'
                    ? 'border-purple-500 bg-linear-to-br from-purple-700/30 via-purple-500/10 to-pink-500/10 scale-105'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}>
                  {plan.name === 'Plan Élite' && (
                    <div className="absolute top-0 right-0 bg-linear-to-r from-purple-500 to-pink-500 text-white px-5 py-1.5 rounded-bl-lg rounded-tr-3xl text-base font-bold shadow-lg">
                      POPULAIRE
                    </div>
                  )}
                  
                  <h3 className="text-3xl font-extrabold mb-3 tracking-tight drop-shadow-lg">{plan.name}</h3>
                  <div className="mb-7">
                    <span className="text-5xl font-extrabold text-white drop-shadow">{plan.price}</span>
                    <span className="text-gray-400 ml-2 text-lg">{plan.desc}</span>
                  </div>
                  
                  <Link href="/pricing" className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-2">
                    Voir les détails complets ➜
                  </Link>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.h2 
            className="text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Ready to Chat Smarter?
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-400 mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Experience the future of AI orchestration. Start now.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Link href="/chat">
              <Button size="lg" className="bg-linear-to-r from-blue-400 to-purple-400 text-black hover:from-blue-300 hover:to-purple-300">
                Start Chatting
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center text-gray-500">
          <p>© 2026 SYNAPSE AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
