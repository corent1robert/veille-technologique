'use client'

import { Search, Filter, X, Plus, Calendar, Hash, MapPin, Tag, Cpu, Package, Wrench, Target, HelpCircle } from 'lucide-react'
import { useState, useMemo } from 'react'
import { VeilleData, FilterConfig, ActiveFilter, FilterState } from '@/types/veille'
import { getSearchSuggestions } from '@/utils/searchUtils'

interface FilterPanelProps {
  filters: FilterState
  setFilters: (filters: FilterState) => void
  data: VeilleData[]
}

export function FilterPanel({ filters, setFilters, data }: FilterPanelProps) {
  const [showAddFilter, setShowAddFilter] = useState(false)
  const [showSearchHelp, setShowSearchHelp] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Configuration de tous les filtres disponibles
  const availableFilters: FilterConfig[] = useMemo(() => [
    {
      id: 'categorie',
      type: 'select',
      label: 'Catégorie',
      field: 'article.categorie',
      operator: 'contains'
    },
    {
      id: 'date_publication',
      type: 'date',
      label: 'Date de publication',
      field: 'article.date_publication',
      operator: 'gte'
    },
    {
      id: 'pertinence',
      type: 'numeric',
      label: 'Pertinence',
      field: 'evaluation.pertinence',
      operator: 'gte'
    },
    {
      id: 'fiabilite',
      type: 'numeric',
      label: 'Fiabilité',
      field: 'evaluation.fiabilite',
      operator: 'gte'
    },
    {
      id: 'pays_source',
      type: 'select',
      label: 'Pays source',
      field: 'article.pays_source',
      operator: 'eq'
    },
    {
      id: 'zone_geographique',
      type: 'select',
      label: 'Zone géographique',
      field: 'article.zone_geographique',
      operator: 'eq'
    },
    {
      id: 'typologie_source',
      type: 'select',
      label: 'Typologie de source',
      field: 'article.typologie_source',
      operator: 'eq'
    },
    {
      id: 'typologie_contenu',
      type: 'select',
      label: 'Typologie de contenu',
      field: 'article.typologie_contenu',
      operator: 'eq'
    },
    {
      id: 'materiau',
      type: 'select',
      label: 'Matériau',
      field: 'analyse_technique.materiau',
      operator: 'eq'
    },
    {
      id: 'technologie',
      type: 'select',
      label: 'Technologie',
      field: 'analyse_technique.technologie',
      operator: 'eq'
    },
    {
      id: 'logiciel',
      type: 'select',
      label: 'Logiciel',
      field: 'analyse_technique.logiciel',
      operator: 'eq'
    },
    {
      id: 'numero_TRL',
      type: 'numeric',
      label: 'Numéro TRL',
      field: 'innovation.numero_TRL',
      operator: 'eq'
    },
    {
      id: 'application_secteur',
      type: 'select',
      label: 'Application secteur',
      field: 'innovation.application_secteur',
      operator: 'contains'
    }
  ], [])

  // Extraction des valeurs uniques pour chaque filtre
  const getFilterOptions = (field: string) => {
    const values = new Set<string>()
    
    data.forEach(item => {
      const fieldParts = field.split('.')
      let value: any = item
      
      for (const part of fieldParts) {
        if (value && typeof value === 'object') {
          value = value[part]
        } else {
          value = null
          break
        }
      }
      
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => {
            if (v && v.toString().trim()) {
              values.add(v.toString().trim())
            }
          })
        } else if (value.toString().trim()) {
          values.add(value.toString().trim())
        }
      }
    })
    
    return Array.from(values).sort().map(value => ({ value, label: value }))
  }

  const clearAllFilters = () => {
    setFilters({
      search: '',
      activeFilters: []
    })
  }

  const addFilter = (filterConfig: FilterConfig) => {
    const newFilter: ActiveFilter = {
      id: `${filterConfig.id}_${Date.now()}`,
      type: filterConfig.type,
      label: filterConfig.label,
      field: filterConfig.field,
      operator: filterConfig.operator || 'eq',
      value: filterConfig.type === 'numeric' ? 0 : ''
    }
    
    setFilters({
      ...filters,
      activeFilters: [...filters.activeFilters, newFilter]
    })
    setShowAddFilter(false)
  }

  const removeFilter = (filterId: string) => {
    setFilters({
      ...filters,
      activeFilters: filters.activeFilters.filter(f => f.id !== filterId)
    })
  }

  const updateFilter = (filterId: string, updates: Partial<ActiveFilter>) => {
    setFilters({
      ...filters,
      activeFilters: filters.activeFilters.map(f => 
        f.id === filterId ? { ...f, ...updates } : f
      )
    })
  }

  const hasActiveFilters = filters.search !== '' || filters.activeFilters.length > 0

  const handleSearchChange = (value: string) => {
    setFilters({ ...filters, search: value })
    
    if (value.length > 2) {
      const suggestions = getSearchSuggestions(value, data)
      setSearchSuggestions(suggestions)
      setShowSuggestions(suggestions.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setFilters({ ...filters, search: suggestion })
    setShowSuggestions(false)
  }

  const getFilterIcon = (type: string) => {
    switch (type) {
      case 'date': return <Calendar className="w-4 h-4" />
      case 'numeric': return <Hash className="w-4 h-4" />
      case 'select': return <Tag className="w-4 h-4" />
      default: return <Filter className="w-4 h-4" />
    }
  }

  const getOperatorOptions = (type: string) => {
    switch (type) {
      case 'numeric':
        return [
          { value: 'eq', label: '=' },
          { value: 'gt', label: '>' },
          { value: 'gte', label: '>=' },
          { value: 'lt', label: '<' },
          { value: 'lte', label: '<=' }
        ]
      case 'date':
        return [
          { value: 'gte', label: 'Après le' },
          { value: 'lte', label: 'Avant le' },
          { value: 'eq', label: 'Le' }
        ]
      default:
        return [
          { value: 'eq', label: 'Égal à' },
          { value: 'contains', label: 'Contient' }
        ]
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral-900 flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Filtres
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddFilter(!showAddFilter)}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center px-3 py-1 border border-blue-200 rounded-md hover:bg-blue-50"
          >
            <Plus className="w-4 h-4 mr-1" />
            Ajouter un filtre
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-neutral-500 hover:text-neutral-700 flex items-center"
          >
            <X className="w-4 h-4 mr-1" />
              Effacer tous
          </button>
        )}
        </div>
      </div>

        {/* Recherche globale */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-neutral-700">
            Recherche avancée
          </label>
          <button
            onClick={() => setShowSearchHelp(!showSearchHelp)}
            className="text-neutral-400 hover:text-neutral-600 p-1"
            title="Aide pour la recherche"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
        
        {/* Aide pour la recherche */}
        {showSearchHelp && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
            <h4 className="font-medium text-blue-900 mb-2">Opérateurs de recherche :</h4>
            <ul className="space-y-1 text-blue-800">
              <li><code className="bg-blue-100 px-1 rounded">"phrase exacte"</code> - Recherche de phrase exacte</li>
              <li><code className="bg-blue-100 px-1 rounded">terme1 AND terme2</code> - Les deux termes doivent être présents</li>
              <li><code className="bg-blue-100 px-1 rounded">terme1 OR terme2</code> - Au moins un des termes doit être présent</li>
              <li><code className="bg-blue-100 px-1 rounded">terme1 NOT terme2</code> - Le premier terme mais pas le second</li>
              <li><code className="bg-blue-100 px-1 rounded">terme1 terme2</code> - Recherche par défaut (AND implicite)</li>
            </ul>
            <p className="text-blue-700 mt-2">
              <strong>Exemples :</strong> "intelligence artificielle" AND robotique, blockchain OR crypto, innovation NOT startup
            </p>
          </div>
        )}
        
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
            placeholder="Rechercher avec opérateurs booléens (AND, OR, NOT) ou guillemets..."
              value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => filters.search.length > 2 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          {/* Suggestions de recherche */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-300 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
              {searchSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-2 hover:bg-neutral-50 text-sm border-b border-neutral-100 last:border-b-0"
                >
                  {suggestion}
                </button>
              ))}
          </div>
          )}
        </div>

        {/* Affichage de la requête formatée */}
        {filters.search && (
          <div className="mt-2 text-xs text-neutral-600">
            <span className="font-medium">Recherche :</span> 
            <span className="ml-1" dangerouslySetInnerHTML={{ 
              __html: filters.search
                .replace(/\b(AND|OR|NOT)\b/gi, (match) => `<span class="font-semibold text-blue-600">${match.toUpperCase()}</span>`)
                .replace(/"([^"]+)"/g, '<span class="font-mono bg-gray-100 px-1 rounded">"$1"</span>')
            }} />
          </div>
        )}
      </div>

      {/* Menu d'ajout de filtre */}
      {showAddFilter && (
        <div className="mb-4 p-4 bg-neutral-50 rounded-lg border">
          <h3 className="text-sm font-medium text-neutral-700 mb-3">Sélectionner un filtre à ajouter :</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {availableFilters
              .filter(filterConfig => 
                !filters.activeFilters.some(active => active.field === filterConfig.field)
              )
              .map(filterConfig => (
                <button
                  key={filterConfig.id}
                  onClick={() => addFilter(filterConfig)}
                  className="flex items-center gap-2 p-2 text-sm text-left border border-neutral-200 rounded-md hover:bg-white hover:border-neutral-300 transition-colors"
                >
                  {getFilterIcon(filterConfig.type)}
                  {filterConfig.label}
                </button>
              ))}
          </div>
          {filters.activeFilters.length >= availableFilters.length && (
            <p className="text-sm text-neutral-500 mt-2">Tous les filtres sont déjà ajoutés</p>
          )}
        </div>
      )}

      {/* Filtres actifs */}
      {filters.activeFilters.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-neutral-700">Filtres actifs :</h3>
          {filters.activeFilters.map(filter => (
            <div key={filter.id} className="flex items-center gap-2 p-3 bg-neutral-50 rounded-lg border">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                {getFilterIcon(filter.type)}
                <span className="font-medium">{filter.label}</span>
        </div>

              {/* Opérateur pour les filtres numériques et dates */}
              {(filter.type === 'numeric' || filter.type === 'date') && (
          <select
                  value={filter.operator}
                  onChange={(e) => updateFilter(filter.id, { operator: e.target.value })}
                  className="text-sm border border-neutral-300 rounded px-2 py-1"
                >
                  {getOperatorOptions(filter.type).map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
            ))}
          </select>
              )}
              
              {/* Valeur du filtre */}
              {filter.type === 'select' && (
          <select
                  value={filter.value}
                  onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                  className="flex-1 text-sm border border-neutral-300 rounded px-2 py-1"
                >
                  <option value="">Sélectionner...</option>
                  {getFilterOptions(filter.field).map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
              )}
              
              {filter.type === 'numeric' && (
                <input
                  type="number"
                  value={filter.value}
                  onChange={(e) => updateFilter(filter.id, { value: parseFloat(e.target.value) || 0 })}
                  className="flex-1 text-sm border border-neutral-300 rounded px-2 py-1"
                  placeholder="Valeur..."
                />
              )}
              
              {filter.type === 'date' && (
                <input
                  type="date"
                  value={filter.value}
                  onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                  className="flex-1 text-sm border border-neutral-300 rounded px-2 py-1"
                />
              )}
              
              <button
                onClick={() => removeFilter(filter.id)}
                className="text-neutral-400 hover:text-red-500 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Affichage des filtres disponibles si aucun n'est actif */}
      {filters.activeFilters.length === 0 && !showAddFilter && (
        <div className="text-center py-8 text-neutral-500">
          <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Aucun filtre actif</p>
          <p className="text-xs mt-1">Cliquez sur "Ajouter un filtre" pour commencer</p>
      </div>
      )}
    </div>
  )
}