'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, TrendingUp, Calendar, User, Building2 } from 'lucide-react'
import { VeilleCard } from '@/components/VeilleCard'
import { FilterPanel } from '@/components/FilterPanel'
import { VeilleModal } from '@/components/VeilleModal'
import { VeilleData } from '@/types/veille'

export default function Home() {
  const [data, setData] = useState<VeilleData[]>([])
  const [filteredData, setFilteredData] = useState<VeilleData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedArticle, setSelectedArticle] = useState<VeilleData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    priority: '',
    trl: '',
    source: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [data, filters])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/veille')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...data]

    if (filters.search) {
      filtered = filtered.filter(item => 
        item.article?.titre?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.article?.description_courte?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.article?.mots_cles?.some(keyword => 
          keyword.toLowerCase().includes(filters.search.toLowerCase())
        )
      )
    }

    if (filters.category) {
      filtered = filtered.filter(item => 
        item.article?.categorie?.includes(filters.category)
      )
    }

    if (filters.priority) {
      filtered = filtered.filter(item => 
        item.metadata?.priorite_veille?.toString() === filters.priority
      )
    }

    if (filters.trl) {
      filtered = filtered.filter(item => 
        item.innovation?.numero_TRL?.toString() === filters.trl
      )
    }

    if (filters.source) {
      filtered = filtered.filter(item => 
        item.article?.source?.toLowerCase().includes(filters.source.toLowerCase())
      )
    }

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
                La Biche-Renard - Interface employés
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-neutral-500">
                {filteredData.length} articles trouvés
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtres */}
        <FilterPanel filters={filters} setFilters={setFilters} data={data} />

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
    </div>
  )
}
