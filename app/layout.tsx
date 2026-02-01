import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'SYNAPSE AI',
  description: 'Plateforme SYNAPSE AI'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <div id="__app-wrapper" className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
