'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, TrendingUp, Calendar, User, Building2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { VeilleCard } from '@/components/VeilleCard'
import { FilterPanel } from '@/components/FilterPanel'
import { VeilleModal } from '@/components/VeilleModal'
import { RefreshButton } from '@/components/RefreshButton'
import { DebugInfo } from '@/components/DebugInfo'
import { VeilleData, FilterState } from '@/types/veille'
import { applyFilters, getFilterSummary } from '@/utils/filterUtils'

export default function Home() {
  const [data, setData] = useState<VeilleData[]>([])
  const [filteredData, setFilteredData] = useState<VeilleData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedArticle, setSelectedArticle] = useState<VeilleData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    activeFilters: []
  })
  const [sortBy, setSortBy] = useState<'date' | 'trl' | 'pertinence'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    applyFiltersAndSort()
  }, [data, filters, sortBy, sortOrder])

  const fetchData = async (forceRefresh = false) => {
    try {
      setLoading(true)
      
      // URL avec timestamp pour forcer le refresh
      const url = forceRefresh 
        ? `/api/veille?t=${Date.now()}`
        : '/api/veille'
      
      console.log(`🔄 Récupération des données: ${url}`)
      
      const response = await fetch(url, {
        // Headers pour éviter le cache
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      
      const result = await response.json()
      console.log(`✅ ${result.length} articles récupérés`)
      
      setData(result)
      setLastRefresh(new Date())
      
      // Stocker en localStorage pour debug
      localStorage.setItem('veille_last_refresh', new Date().toISOString())
      localStorage.setItem('veille_data_count', result.length.toString())
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleForceRefresh = async () => {
    console.log('🔄 Refresh forcé demandé')
    await fetchData(true)
  }

  const applyFiltersAndSort = () => {
    // Appliquer les filtres
    let filtered = applyFilters(data, filters)

    // Tri des données
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.article?.date_publication || 0).getTime()
          bValue = new Date(b.article?.date_publication || 0).getTime()
          break
        case 'trl':
          aValue = a.innovation?.numero_TRL || 0
          bValue = b.innovation?.numero_TRL || 0
          break
        case 'pertinence':
          aValue = a.evaluation?.pertinence || 0
          bValue = b.evaluation?.pertinence || 0
          break
        default:
          return 0
      }

      if (sortOrder === 'asc') {
        return aValue - bValue
      } else {
        return bValue - aValue
      }
    })

    setFilteredData(filtered)
  }

  const handleViewMore = (article: VeilleData) => {
    setSelectedArticle(article)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedArticle(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neutral-600">Chargement des données...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                Veille Technologique
              </h1>
              <p className="text-neutral-600 mt-1">
                {loading ? 'Chargement...' : `${filteredData.length} articles disponibles`}
                {lastRefresh && (
                  <span className="text-xs text-neutral-500 ml-2">
                    (Dernière actualisation: {lastRefresh.toLocaleTimeString('fr-FR')})
                  </span>
                )}
              </p>
              {getFilterSummary(filters) !== 'Aucun filtre' && (
                <p className="text-sm text-blue-600 mt-1">
                  {getFilterSummary(filters)}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-neutral-500">
                {filteredData.length} articles trouvés
              </div>
              <RefreshButton onRefresh={handleForceRefresh} />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtres */}
        <FilterPanel filters={filters} setFilters={setFilters} data={data} />

        {/* Options de tri */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-neutral-700">Trier par :</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'trl' | 'pertinence')}
                className="px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Date de publication</option>
                <option value="trl">Niveau TRL</option>
                <option value="pertinence">Pertinence</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center space-x-2 px-3 py-2 border border-neutral-300 rounded-md text-sm hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                {sortOrder === 'asc' ? (
                  <>
                    <ArrowUp className="w-4 h-4" />
                    <span>Croissant</span>
                  </>
                ) : (
                  <>
                    <ArrowDown className="w-4 h-4" />
                    <span>Décroissant</span>
                  </>
                )}
              </button>
            </div>
            <div className="text-sm text-neutral-500">
              {filteredData.length} articles
            </div>
          </div>
        </div>

        {/* Grille des articles */}
        <div className="mt-8">
          {filteredData.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-neutral-500 text-lg">
                Aucun article trouvé avec ces critères
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData.map((item, index) => (
                <VeilleCard key={index} data={item} onViewMore={handleViewMore} />
              ))}
            </div>
          )}
        </div>
      </div>

             {/* Modal pour les détails complets */}
       <VeilleModal
         data={selectedArticle}
         isOpen={isModalOpen}
         onClose={closeModal}
       />
       
       {/* Composant de debug */}
       <DebugInfo lastRefresh={lastRefresh} dataCount={filteredData.length} />
     </div>
   )
}
