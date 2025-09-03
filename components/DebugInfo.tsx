'use client'

import { useState, useEffect } from 'react'
import { Info, Clock, Database, RefreshCw } from 'lucide-react'

interface DebugInfoProps {
  lastRefresh: Date | null
  dataCount: number
}

export function DebugInfo({ lastRefresh, dataCount }: DebugInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localStorageInfo, setLocalStorageInfo] = useState<any>({})

  useEffect(() => {
    // Récupérer les infos du localStorage
    const lastRefreshLS = localStorage.getItem('veille_last_refresh')
    const dataCountLS = localStorage.getItem('veille_data_count')
    
    setLocalStorageInfo({
      lastRefresh: lastRefreshLS ? new Date(lastRefreshLS) : null,
      dataCount: dataCountLS ? parseInt(dataCountLS) : 0
    })
  }, [lastRefresh])

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 z-50"
        title="Informations de debug"
      >
        <Info className="w-5 h-5" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-neutral-200 rounded-lg shadow-xl p-4 max-w-sm z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-neutral-900 flex items-center">
          <Database className="w-4 h-4 mr-2" />
          Debug Info
        </h3>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-neutral-400 hover:text-neutral-600"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-neutral-600">État actuel:</span>
          <span className="font-medium">{dataCount} articles</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-neutral-600">Dernier refresh:</span>
          <span className="font-medium">
            {lastRefresh ? lastRefresh.toLocaleTimeString('fr-FR') : 'Jamais'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-neutral-600">localStorage:</span>
          <span className="font-medium">
            {localStorageInfo.dataCount || 0} articles
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-neutral-600">localStorage time:</span>
          <span className="font-medium">
            {localStorageInfo.lastRefresh ? 
              localStorageInfo.lastRefresh.toLocaleTimeString('fr-FR') : 
              'N/A'
            }
          </span>
        </div>
        
        <div className="pt-2 border-t border-neutral-100">
          <div className="flex items-center text-neutral-500">
            <Clock className="w-3 h-3 mr-1" />
            <span className="text-xs">
              {new Date().toLocaleTimeString('fr-FR')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
