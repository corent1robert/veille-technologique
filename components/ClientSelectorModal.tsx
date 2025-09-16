'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

interface ClientItem {
  id: string
  name: string
  slug: string
}

interface ClientSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onAuthenticated: (client: { id: string; name: string; slug: string; defaultFilters?: any }) => void
}

export default function ClientSelectorModal({ isOpen, onClose, onAuthenticated }: ClientSelectorModalProps) {
  const [clients, setClients] = useState<ClientItem[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingClients, setLoadingClients] = useState(false)
  const [selectedSlug, setSelectedSlug] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const passwordRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!isOpen) return
    ;(async () => {
      setLoadingClients(true)
      try {
        const res = await fetch('/api/clients')
        const json = await res.json()
        setClients(Array.isArray(json.items) ? json.items : [])
      } catch (e) {
        setError("Impossible de charger la liste des clients")
      } finally {
        setLoadingClients(false)
      }
    })()
  }, [isOpen])

  // Autofocus mot de passe après sélection client
  useEffect(() => {
    if (isOpen && selectedSlug && passwordRef.current) {
      passwordRef.current.focus()
    }
  }, [isOpen, selectedSlug])

  // Raccourcis clavier: Entrée pour valider, Échap pour fermer
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'Enter') {
        if (selectedSlug && password && !loading && !success) {
          handleSubmit()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, selectedSlug, password, loading, success])

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: selectedSlug, password })
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        // Message clair pour mauvais mot de passe
        if (res.status === 401 || json?.error === 'invalid_password') {
          setError('Mot de passe incorrect')
        } else {
          setError(json?.error || 'Échec de l\'authentification')
        }
        return
      }
      // Normaliser/parse des filtres par défaut si fournis
      let parsed: any = undefined
      if (json?.default_filters) {
        try {
          const cleaned = String(json.default_filters)
            .replace(/\u00A0/g, ' ')
            .replace(/\n/g, '\n')
            .replace(/\\_/g, '_')
          parsed = JSON.parse(cleaned)
        } catch {
          // ignorer si invalide
        }
      }
      // Animation de succès avant fermeture
      setSuccess(true)
      setTimeout(() => {
        onAuthenticated({ id: json.id, name: json.name, slug: json.slug, defaultFilters: parsed })
        onClose()
        setSuccess(false)
      }, 550)
    } catch (e) {
      setError('Échec de la connexion, vérifiez votre réseau')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={!success ? onClose : undefined} />
      <div className="relative w-full max-w-lg">
        {/* Card */}
        <div className="relative bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-white/70 border border-neutral-200 overflow-hidden shadow-sm">
                  <Image src="/favicon.ico" width={36} height={36} alt="Logo" className="h-full w-full object-cover" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900">Sélection du portail</h3>
              </div>
              <span className="text-[10px] uppercase tracking-wide text-neutral-500 bg-white/60 border border-neutral-200 rounded px-2 py-1">Accès client</span>
            </div>
            <p className="mt-1 text-sm text-neutral-600">Choisissez un client et saisissez son mot de passe pour charger ses filtres.</p>
          </div>

          {/* Body */}
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-800 mb-1">Client</label>
                <div className="relative">
                  <select
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
                    value={selectedSlug}
                    onChange={(e) => setSelectedSlug(e.target.value)}
                    disabled={loadingClients}
                  >
                    <option value="">{loadingClients ? 'Chargement…' : 'Sélectionner…'}</option>
                    {!loadingClients && clients.map((c) => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                  {loadingClients && (
                    <div className="mt-2 space-y-2">
                      <div className="h-3 w-1/2 rounded bg-neutral-200 animate-pulse" />
                      <div className="h-3 w-1/3 rounded bg-neutral-200 animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-800 mb-1">Mot de passe</label>
                <input
                  type="password"
                  ref={passwordRef}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                />
                <p className="mt-1 text-xs text-neutral-500">L’accès restreint permet d’appliquer des filtres enregistrés pour votre organisation.</p>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mt-[2px]"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM9 7a1 1 0 112 0v4a1 1 0 11-2 0V7zm1 8a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" /></svg>
                  <span>{error}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button onClick={onClose} className="px-3 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50 active:scale-[0.98] transition-transform">Annuler</button>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedSlug || !password || loading}
                  className={`px-4 py-2 text-sm rounded-lg text-white disabled:opacity-50 transition-all active:scale-[0.98] ${success ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {success ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Connecté !
                    </span>
                  ) : loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                      Connexion…
                    </span>
                  ) : 'Valider'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


