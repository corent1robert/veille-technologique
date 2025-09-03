'use client'

import { RefreshCw, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface RefreshButtonProps {
  onRefresh: () => Promise<void>
  className?: string
}

export function RefreshButton({ onRefresh, className = '' }: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      // Ajouter un timestamp pour forcer le refresh
      const timestamp = Date.now()
      console.log(`🔄 Refresh forcé à ${new Date(timestamp).toLocaleTimeString()}`)
      
      await onRefresh()
      
      // Feedback visuel
      console.log('✅ Refresh terminé avec succès')
    } catch (error) {
      console.error('❌ Erreur lors du refresh:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={`inline-flex items-center justify-center p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors duration-200 ${className}`}
      title="Actualiser les données (contourne le cache)"
    >
      {isRefreshing ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <RefreshCw className="w-5 h-5" />
      )}
    </button>
  )
}
