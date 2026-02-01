'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface GuestModeBannerProps {
  requestCount: number;
  limit: number;
}

export default function GuestModeBanner({ requestCount, limit }: GuestModeBannerProps) {
  const percentage = (requestCount / limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = requestCount >= limit;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${
        isAtLimit 
          ? 'bg-red-600/20 border-red-500/30' 
          : isNearLimit 
            ? 'bg-amber-600/20 border-amber-500/30' 
            : 'bg-blue-600/20 border-blue-500/30'
      } border rounded-lg p-4 mb-4 backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <span className={`font-semibold ${
            isAtLimit ? 'text-red-300' : isNearLimit ? 'text-amber-300' : 'text-blue-300'
          }`}>
            Mode Invité
          </span>
        </div>
        <Link
          href="/auth/login"
          className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg transition"
        >
          Se connecter
        </Link>
      </div>
      
      <div className="mb-2">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-300">
            Messages utilisés: {requestCount}/{limit}
          </span>
          <span className={`${
            isAtLimit ? 'text-red-300' : isNearLimit ? 'text-amber-300' : 'text-gray-400'
          }`}>
            {Math.round(percentage)}%
          </span>
        </div>
        <div className="w-full bg-black/30 rounded-full h-2 overflow-hidden">
          <motion.div
            className={`h-full transition-all duration-500 ${
              isAtLimit 
                ? 'bg-red-500' 
                : isNearLimit 
                  ? 'bg-amber-500' 
                  : 'bg-blue-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentage, 100)}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
      
      {isAtLimit && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-red-300"
        >
          ⚠️ Limite atteinte ! 
          <Link href="/auth/login" className="underline ml-1">
            Connectez-vous pour continuer
          </Link>
        </motion.p>
      )}
      
      {isNearLimit && !isAtLimit && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-amber-300"
        >
          💡 Il vous reste {limit - requestCount} messages. 
          <Link href="/auth/login" className="underline ml-1">
            Créez un compte pour un accès illimité
          </Link>
        </motion.p>
      )}
      
      {!isNearLimit && !isAtLimit && (
        <p className="text-xs text-gray-400">
          Profitez de SYNAPSE AI gratuitement ! 
          <Link href="/pricing" className="underline ml-1 text-blue-300">
            Voir les plans
          </Link>
        </p>
      )}
    </motion.div>
  );
}
