import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Veille Technologique - La Biche-Renard',
  description: 'Interface de veille technologique pour les employés',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-neutral-50">
        {children}
      </body>
    </html>
  )
}


