'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authService } from '../../../lib/auth'
import Link from 'next/link'


function CheckoutSuccessPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [plan, setPlan] = useState('');

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        // Récupérer le plan depuis les query params
        const planParam = searchParams.get('plan');
        if (planParam && ['BAS', 'PRO', 'ELITE'].includes(planParam)) {
          const mappedPlan = planParam;
          const success = await authService.updatePlanOnBackend(mappedPlan as 'BAS' | 'PRO' | 'ELITE');
          if (success) {
            setPlan(planParam);
            setSuccess(true);
            setTimeout(() => {
              router.push('/chat');
            }, 2000);
          } else {
            setSuccess(false);
          }
        }
      } catch (error) {
        console.error('Erreur lors du traitement du paiement:', error);
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    };
    handlePaymentSuccess();
  }, [router, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Traitement de votre paiement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 text-center">
          {success ? (
            <>
              <h1 className="text-3xl font-bold text-green-400 mb-4">
                Paiement réussi
              </h1>
              <p className="text-gray-300 mb-2">
                Votre plan <span className="font-bold text-green-400">{plan}</span> est maintenant actif.
              </p>
              <p className="text-gray-400 text-sm mb-6">
                Vous serez redirigé vers le chat dans quelques secondes...
              </p>
              <Link
                href="/chat"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition"
              >
                Aller au chat maintenant
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-red-400 mb-4">
                Erreur
              </h1>
              <p className="text-gray-300 mb-6">
                Une erreur s&apos;est produite lors du traitement de votre paiement.
              </p>
              <div className="space-y-3">
                <Link
                  href="/pricing"
                  className="block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition"
                >
                  Retour à la page de tarification
                </Link>
                <Link
                  href="/chat"
                  className="block bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-8 rounded-lg transition"
                >
                  Retour au chat
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <CheckoutSuccessPageInner />
    </Suspense>
  );
}
