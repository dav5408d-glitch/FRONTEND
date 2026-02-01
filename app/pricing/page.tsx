'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { authService } from '../../lib/auth';
import GlassBackground from '@/components/GlassBackground';
import Navigation from '@/components/Navigation';
import AnimatedCard from '@/components/AnimatedCard';

type Plan = {
  id: string;
  name: string;
  priceUSD: number;
  priceEUR: number;
  features: string[];
  highlighted?: boolean;
  lemonSqueezyId?: string;
};

export default function PricingPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const user = authService.getUser();
  const [isLoading, setIsLoading] = useState(false);
  const [userPlan] = useState<string>(user?.plan || 'FREE');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [router, user]);

  useEffect(() => {
    const initializePlans = () => {
      const data: Plan[] = [
        {
          id: 'bas',
          name: 'Plan Basic',
          priceUSD: 9,
          priceEUR: 8,
          features: [
            '✓ Accès à Google Gemini',
            '✓ Routeur IA basique',
            '✓ 20 requêtes/mois (limite bêta)',
            '✓ Historique local des conversations'
          ],
          lemonSqueezyId: ''
        },
        {
          id: 'pro',
          name: 'Plan Pro',
          priceUSD: 25,
          priceEUR: 23,
          features: [
            '✓ Gemini gratuit + OpenAI API (bientôt)',
            '✓ Routeur IA multi-provider intelligent',
            '✓ Requêtes illimitées',
            '✓ Historique conversations illimité',
            '✓ Support email prioritaire',
            '✓ Images et vision support',
            '✓ Web search intégré'
          ],
          highlighted: true
        },
        {
          id: 'elite',
          name: 'Plan Elite',
          priceUSD: 49,
          priceEUR: 45,
          features: [
            '✓ Accès à 9 providers IA (Gemini, GPT-4, Claude, DeepSeek...)',
            '✓ Sélection automatique intelligente par cas d\'usage',
            '✓ Requêtes illimitées',
            '✓ Email + Chat support VIP 24/7',
            '✓ Analytics détaillées (bientôt)',
            '✓ API access (bientôt)',
            '✓ Images, web search, plugins'
          ]
        }
      ];
      setPlans(data);
    };
    initializePlans();
  }, []);

  useEffect(() => {
    // Redirect handling for checkout
  }, []);

  const handleSelectPlan = async (planId: string) => {
    setIsLoading(true);
    try {
      // Call backend to create Stripe checkout session
      const response = await fetch('http://localhost:3002/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({
          planId: planId,
          email: user?.email
        })
      });

      const data = await response.json();
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur lors de la création de la session de paiement');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 to-black text-white">
      <GlassBackground />
      {/* Navigation */}
      <Navigation currentPage="pricing" />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-20 pt-32">
        <section className="text-center mb-16">
          <motion.h1 
            className="text-6xl font-extrabold mb-4 bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Tarifs & Abonnements
          </motion.h1>
          <motion.p 
            className="text-gray-300 text-xl max-w-2xl mx-auto mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Accédez à la meilleure IA, au meilleur prix. Plateforme transparente, sans engagement, pensée pour tous.
          </motion.p>
          <motion.div 
            className="flex justify-center mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="backdrop-blur-xl bg-blue-600/20 border border-blue-500/30 rounded-2xl px-6 py-3 flex items-center gap-3 shadow-lg">
              <svg className="w-5 h-5 text-blue-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2z" clipRule="evenodd" />
              </svg>
              <span className="text-blue-200 font-semibold">BÊTA PUBLIQUE : accès gratuit à Gemini pour tous</span>
            </div>
          </motion.div>
        </section>

        {userPlan !== 'FREE' && (
          <div className="bg-white/8 border border-white/10 rounded-lg p-4 mb-8">
            <p className="text-gray-200 text-center font-semibold">
              Plan actuel: <span className="text-blue-400">{userPlan === 'BAS' ? 'Basique' : userPlan === 'PRO' ? 'Pro' : userPlan === 'ELITE' ? 'Elite' : userPlan}</span>
            </p>
          </div>
        )}



        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <AnimatedCard key={plan.id} delay={index * 0.1}>
              <div
                className={`relative backdrop-blur-2xl border-2 rounded-3xl p-10 shadow-xl transition-all duration-300 h-full flex flex-col ${
                  plan.highlighted
                    ? 'border-purple-500 bg-linear-to-br from-purple-700/30 via-purple-500/10 to-pink-500/10 scale-105'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 right-0 bg-linear-to-r from-purple-500 to-pink-500 text-white px-5 py-1.5 rounded-bl-lg rounded-tr-3xl text-base font-bold shadow-lg">
                    POPULAIRE
                  </div>
                )}

                {userPlan !== 'FREE' && (
                  (userPlan === 'BAS' && plan.id === 'bas') ||
                  (userPlan === 'PRO' && plan.id === 'pro') ||
                  (userPlan === 'ELITE' && plan.id === 'elite')
                ) && (
                  <div className="absolute top-0 left-0 bg-green-500 text-white px-4 py-1.5 rounded-bl-lg rounded-tr-3xl text-base font-bold shadow-lg">
                    ✓ ACTIF
                  </div>
                )}

                <div className="flex-1">
                  <h2 className="text-3xl font-extrabold mb-3 tracking-tight drop-shadow-lg">{plan.name}</h2>
                  <div className="mb-7">
                    <span className="text-5xl font-extrabold text-white drop-shadow">${plan.priceUSD}</span>
                    <span className="text-gray-400 ml-2 text-lg">/ mois</span>
                    <div className="text-xs text-gray-400 mt-1">ou €{plan.priceEUR}/mois</div>
                  </div>

                  <ul className="space-y-3 mb-10">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="text-gray-200 text-base flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-linear-to-r from-blue-400 to-purple-400"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto">
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isLoading}
                    className={`w-full py-3 rounded-2xl font-bold text-lg transition-all duration-300 shadow-md ${
                      plan.highlighted
                        ? 'bg-linear-to-r from-purple-500 to-pink-500 hover:shadow-2xl hover:shadow-purple-500/50 disabled:opacity-50 text-white'
                        : 'bg-white/10 hover:bg-white/20 border border-white/20 disabled:opacity-50 text-white'
                    }`}
                  >
                    {isLoading ? 'Redirection...' : 'Choisir ce plan'}
                  </button>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>

        {/* Current Plan Info */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="backdrop-blur-xl bg-green-500/10 border border-green-500/30 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-2 text-green-300">✅ Bêta Gratuite & Illimitée</h3>
            <p className="text-gray-300">
              <strong>Websearch désactivé temporairement.</strong> Toutes les requêtes sont traitées localement ou via Gemini cloud.<br/>
              <span className="text-green-300">Accès gratuit et illimité à Gemini pour tous pendant la bêta.</span><br/>
              <span className="text-yellow-200">Le routeur IA sera plus performant et multi-provider à la sortie officielle.</span>
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Questions Fréquentes</h2>
          <div className="space-y-4">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
              <h3 className="font-bold mb-2">🚀 Pourquoi une bêta?</h3>
              <p className="text-gray-400 text-sm">Nous construisons SYNAPSE AI en public. Plan gratuit avec Gemini. Autres providers + paiements activés très bientôt. Soyez early adopters!</p>
            </div>
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
              <h3 className="font-bold mb-2">✅ Puis-je utiliser Gemini gratuitement?</h3>
              <p className="text-gray-400 text-sm">Oui! Accès complet et illimité à Google Gemini maintenant. Aucune carte bancaire requise. C&apos;est gratuit pendant la bêta.</p>
            </div>
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
              <h3 className="font-bold mb-2">💳 Quand puis-je payer pour Pro/Elite?</h3>
              <p className="text-gray-400 text-sm">Les paiements seront activés dans les prochaines semaines. Les early adopters bêta recevront des réductions spéciales comme remerciement!</p>
            </div>
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
              <h3 className="font-bold mb-2">🤖 Quels providers sont inclus?</h3>
              <p className="text-gray-400 text-sm">Actuellement: Google Gemini (gratuit). Très bientôt: OpenAI (GPT-4), Anthropic Claude, DeepSeek, et 5 autres.</p>
            </div>
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
              <h3 className="font-bold mb-2">❤️ Comment j&apos;aide le projet?</h3>
              <p className="text-gray-400 text-sm">Utilisez SYNAPSE, donnez du feedback, partagez avec vos amis. Vous êtes essentiels pour nous aider à améliorer!</p>
            </div>
          </div>
        </div>

        {/* Secure Payment Badge */}
        <div className="mt-16 text-center">
          <div className="inline-block backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-gray-400 text-sm">
              🔒 Paiements sécurisés par <strong>Lemon Squeezy</strong> - Vos données de paiement sont protégées
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-linear-to-br from-gray-950/80 to-black/90 backdrop-blur-2xl mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="inline-block px-8 py-4 rounded-2xl shadow-xl backdrop-blur-xl bg-white/5 border border-white/10">
            <p className="text-lg font-bold bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow">© 2026 SYNAPSE AI</p>
            <p className="text-gray-400 text-sm mt-1">Tous droits réservés. Plateforme IA française indépendante.</p>
            <div className="mt-4 flex justify-center gap-4">
              <Link href="/" className="text-blue-400 hover:text-pink-400 transition font-semibold">Accueil</Link>
              <Link href="/chat" className="text-blue-400 hover:text-pink-400 transition font-semibold">Chat</Link>
              <Link href="/pricing" className="text-blue-400 hover:text-pink-400 transition font-semibold">Tarifs</Link>
            </div>
            <div className="mt-4 text-xs text-gray-500">Made with ❤️ in France</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
