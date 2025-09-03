'use client'

import { Search, Filter, X } from 'lucide-react'

interface FilterPanelProps {
  filters: {
    search: string
    category: string
    priority: string
    trl: string
    source: string
  }
  setFilters: (filters: any) => void
  data: any[] // Données pour extraire les valeurs dynamiques
}

export function FilterPanel({ filters, setFilters, data }: FilterPanelProps) {
  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      priority: '',
      trl: '',
      source: ''
    })
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  // Extraction dynamique des valeurs pour les filtres
  const getUniqueCategories = () => {
    const categories = new Set<string>()
    data.forEach(item => {
      if (item.article?.categorie && Array.isArray(item.article.categorie)) {
        item.article.categorie.forEach((cat: string) => {
          if (cat && cat.trim()) categories.add(cat.trim())
        })
      }
    })
    return Array.from(categories).sort()
  }

  const getUniquePriorities = () => {
    const priorities = new Set<number>()
    data.forEach(item => {
      if (item.metadata?.priorite_veille && item.metadata.priorite_veille > 0) {
        priorities.add(item.metadata.priorite_veille)
      }
    })
    return Array.from(priorities).sort((a, b) => a - b)
  }

  const getUniqueTRLs = () => {
    const trls = new Set<number>()
    data.forEach(item => {
      if (item.innovation?.numero_TRL && item.innovation.numero_TRL > 0) {
        trls.add(item.innovation.numero_TRL)
      }
    })
    return Array.from(trls).sort((a, b) => a - b)
  }

  const getUniqueSources = () => {
    const sources = new Set<string>()
    data.forEach(item => {
      if (item.article?.source && item.article.source.trim()) {
        sources.add(item.article.source.trim())
      }
    })
    return Array.from(sources).sort()
  }

  const getPriorityLabel = (priority: number) => {
    const labels: { [key: number]: string } = {
      1: 'Faible',
      2: 'Modérée', 
      3: 'Moyenne',
      4: 'Élevée',
      5: 'Critique'
    }
    return labels[priority] || `Niveau ${priority}`
  }

  const getTRLLabel = (trl: number) => {
    const labels: { [key: number]: string } = {
      1: 'Idéation',
      2: 'Veille',
      3: 'Conception',
      4: 'Prototypage',
      5: 'Validation',
      6: 'Industrialisation',
      7: 'Certification',
      8: 'Commercialisation',
      9: 'Adoption'
    }
    return labels[trl] || `Niveau ${trl}`
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral-900 flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Filtres
        </h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-neutral-500 hover:text-neutral-700 flex items-center"
          >
            <X className="w-4 h-4 mr-1" />
            Effacer tous les filtres
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Recherche globale */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Recherche
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Rechercher dans les articles..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Catégorie */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Catégorie
          </label>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
          >
            <option value="">Toutes</option>
            {getUniqueCategories().map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Priorité */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Priorité
          </label>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-300 rounded-md focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
          >
            <option value="">Toutes</option>
            {getUniquePriorities().map(priority => (
              <option key={priority} value={priority.toString()}>
                {priority} - {getPriorityLabel(priority)}
              </option>
            ))}
          </select>
        </div>

        {/* TRL */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Niveau TRL
          </label>
          <select
            value={filters.trl}
            onChange={(e) => setFilters({ ...filters, trl: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
          >
            <option value="">Tous</option>
            {getUniqueTRLs().map(trl => (
              <option key={trl} value={trl.toString()}>
                {trl} - {getTRLLabel(trl)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
