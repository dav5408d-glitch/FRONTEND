'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { authService } from '../../lib/auth';

export default function UpgradePage() {
  const router = useRouter();

  useEffect(() => {
    // Si l'utilisateur a déjà un plan payant, le rediriger
    if (authService.canUseAI()) {
      router.push('/chat');
    }
  }, [router]);

  const handleGoToChat = () => {
    router.push('/chat');
  };

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background effect */}
      <div className="fixed inset-0 -z-10 opacity-20">
        <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-black to-gray-900"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-400 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-20"></div>
      </div>

      {/* Header */}
      <header className="backdrop-blur-xl bg-black/30 border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/chat" className="text-lg font-bold tracking-widest hover:text-gray-300 transition">
            SYNAPSE AI
          </Link>
          <button
            onClick={() => {
              authService.logout();
              router.push('/auth/login');
            }}
            className="text-red-400 hover:text-red-300 transition"
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="max-w-2xl w-full">
          {/* Main Card */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 text-center">
            {/* Icon */}
            <div className="text-6xl mb-6 animate-pulse">🔒</div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Plan Gratuit
            </h1>

            {/* Description */}
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
              Vous êtes actuellement en mode <strong>lecture seule</strong>. Pour utiliser la puissance des IA et accéder à toutes les fonctionnalités, vous devez souscrire à un plan payant.
            </p>

            {/* Benefits Section */}
            <div className="mb-10 space-y-4">
              <h2 className="text-xl font-semibold text-white mb-6">Débloquez l&apos;accès complet:</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="text-2xl mb-2">⚡</div>
                  <h3 className="font-semibold mb-2">IA Basique</h3>
                  <p className="text-sm text-gray-400">Accès à DeepSeek et à d&apos;autres IA low-cost</p>
                </div>
                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="text-2xl mb-2">🧠</div>
                  <h3 className="font-semibold mb-2">IA Premium</h3>
                  <p className="text-sm text-gray-400">Débloquez Claude et d&apos;autres modèles premium</p>
                </div>
                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="text-2xl mb-2">🚀</div>
                  <h3 className="font-semibold mb-2">Routeur IA</h3>
                  <p className="text-sm text-gray-400">Sélection automatique de la meilleure IA</p>
                </div>
              </div>
            </div>

            {/* Pricing Info */}
            <div className="mb-10 backdrop-blur-md bg-linear-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Nos Plans</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-black/30 rounded-lg p-3">
                  <p className="font-semibold text-white">Plan Basique</p>
                  <p className="text-2xl font-bold text-purple-400">$5</p>
                  <p className="text-xs text-gray-400 mt-1">/mois</p>
                </div>
                <div className="bg-black/30 rounded-lg p-3 border border-purple-500/50">
                  <p className="font-semibold text-white">Plan Pro</p>
                  <p className="text-2xl font-bold text-pink-400">$15</p>
                  <p className="text-xs text-gray-400 mt-1">/mois</p>
                </div>
                <div className="bg-black/30 rounded-lg p-3">
                  <p className="font-semibold text-white">Plan Elite</p>
                  <p className="text-2xl font-bold text-purple-400">$30</p>
                  <p className="text-xs text-gray-400 mt-1">/mois</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGoToChat}
                className="backdrop-blur-md bg-white/10 border border-white/20 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/20 transition-all duration-300"
              >
                Retour au chat
              </button>
              <button
                onClick={handleUpgrade}
                className="backdrop-blur-md bg-linear-to-r from-purple-500 to-pink-500 text-white font-semibold px-8 py-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
              >
                💎 Choisir un plan
              </button>
            </div>

            {/* FAQ */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <h3 className="text-lg font-semibold mb-4">Questions Fréquentes</h3>
              <div className="space-y-3 text-left">
                <details className="backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-4 cursor-pointer group">
                  <summary className="font-semibold flex items-center justify-between">
                    <span>Puis-je tester gratuitement?</span>
                    <span className="group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-sm text-gray-400 mt-2">Non, le plan gratuit ne permet que la lecture. Vous devez souscrire à un plan payant pour utiliser les IA.</p>
                </details>
                <details className="backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-4 cursor-pointer group">
                  <summary className="font-semibold flex items-center justify-between">
                    <span>Quel plan recommandez-vous?</span>
                    <span className="group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-sm text-gray-400 mt-2">Le Plan Pro est le plus populaire pour les utilisateurs réguliers. Commencez par le Plan Basique et upgradez selon vos besoins.</p>
                </details>
                <details className="backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-4 cursor-pointer group">
                  <summary className="font-semibold flex items-center justify-between">
                    <span>Puis-je annuler mon abonnement?</span>
                    <span className="group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-sm text-gray-400 mt-2">Oui, vous pouvez annuler à tout moment. Votre abonnement ne se renouvellera pas le mois suivant.</p>
                </details>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
