'use client'

import { Search, Filter, X, Plus, Calendar, Hash, MapPin, Tag, Cpu, Package, Wrench, Target, HelpCircle, Save, Download } from 'lucide-react'
import { useState, useMemo } from 'react'
import { VeilleData, FilterConfig, ActiveFilter, FilterState } from '@/types/veille'
import { getSearchSuggestions } from '@/utils/searchUtils'
import { NotificationToast } from './NotificationToast'
import { applyFilters } from '@/utils/filterUtils'

interface FilterPanelProps {
  filters: FilterState
  setFilters: (filters: FilterState) => void
  data: VeilleData[]
  currentClient?: { id: string; name: string; slug: string } | null
}

export function FilterPanel({ filters, setFilters, data, currentClient }: FilterPanelProps) {
  const [showAddFilter, setShowAddFilter] = useState(false)
  const [showSearchHelp, setShowSearchHelp] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning'
    title: string
    message?: string
  } | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const DATE_FIELD = 'article.date_publication'

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
    
    let raw = Array.from(values) as string[]

    // Debug pour les filtres problématiques
    if (field === 'analyse_technique.technologie' || field === 'innovation.application_secteur') {
      console.log(`🔍 Filtre ${field}:`, raw)
    }

    // Post-traitement spécifique pour Application secteur: regrouper en grandes thématiques
    if (field === 'innovation.application_secteur') {
      const separatedValues = new Set<string>()
      raw.forEach(value => {
        // Séparer par virgule et nettoyer chaque élément
        const parts = value.split(',').map(part => part.trim()).filter(part => part.length > 0)
        parts.forEach(part => {
          // Nettoyer les espaces et caractères spéciaux
          const cleanPart = part.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim()
          if (cleanPart) {
            separatedValues.add(cleanPart)
          }
        })
      })
      
      // Regrouper en grandes thématiques basées sur l'analyse des données réelles
      const groupedValues = new Set<string>()
      console.log('🔍 Secteurs séparés:', Array.from(separatedValues))
      separatedValues.forEach(value => {
        const lowerValue = value.toLowerCase()
        console.log(`🔍 Traitement secteur: "${value}" -> "${lowerValue}"`)
        
        // Santé & Médical (le plus fréquent - 14+ occurrences)
        if (lowerValue.includes('médical') || lowerValue.includes('medical') || 
            lowerValue.includes('santé') || lowerValue.includes('health') || 
            lowerValue.includes('dentaire') || lowerValue.includes('dental') ||
            lowerValue.includes('biomédical') || lowerValue.includes('biomedical') ||
            lowerValue.includes('hôpital') || lowerValue.includes('hospital') ||
            lowerValue.includes('orthodontie') || lowerValue.includes('dentisterie') ||
            lowerValue.includes('dispositifs médicaux') || lowerValue.includes('medical devices') ||
            lowerValue.includes('implants') || lowerValue.includes('prothèses') ||
            lowerValue.includes('pharmaceutique') || lowerValue.includes('pharmaceutical') ||
            lowerValue.includes('médecine régénérative') || lowerValue.includes('neurosciences') ||
            lowerValue.includes('neurochirurgie') || lowerValue.includes('ingénierie tissulaire') ||
            lowerValue.includes('orthopédie') || lowerValue.includes('laboratoires dentaires') ||
            lowerValue.includes('biomatériaux') || lowerValue.includes('biomédicale')) {
          groupedValues.add('Santé & Médical')
        }
        // Automobile & Transport (13 occurrences)
        else if (lowerValue.includes('automobile') || lowerValue.includes('automotive') || 
                 lowerValue.includes('transport') || lowerValue.includes('mobilité') || 
                 lowerValue.includes('mobility') || lowerValue.includes('véhicule') ||
                 lowerValue.includes('motorsports')) {
          groupedValues.add('Automobile & Transport')
        }
        // Aéronautique & Défense (8+4+3+2 occurrences)
        else if (lowerValue.includes('aéronautique') || lowerValue.includes('aeronautique') || 
                 lowerValue.includes('spatial') || lowerValue.includes('aviation') || 
                 lowerValue.includes('défense') || lowerValue.includes('defense') ||
                 lowerValue.includes('military') || lowerValue.includes('armée') ||
                 lowerValue.includes('aérospatial') || lowerValue.includes('militaire')) {
          groupedValues.add('Aéronautique & Défense')
        }
        // Biotechnologie & Recherche (8+6+5+2+2 occurrences)
        else if (lowerValue.includes('biotechnologie') || lowerValue.includes('biotechnology') ||
                 lowerValue.includes('recherche') || lowerValue.includes('research') ||
                 lowerValue.includes('développement') || lowerValue.includes('development') ||
                 lowerValue.includes('r&d') || lowerValue.includes('académique') ||
                 lowerValue.includes('universitaire') || lowerValue.includes('université')) {
          groupedValues.add('Biotechnologie & Recherche')
        }
        // Éducation & Formation (5+4+2+2+2 occurrences)
        else if (lowerValue.includes('éducation') || lowerValue.includes('education') || 
                 lowerValue.includes('formation') || lowerValue.includes('training') ||
                 lowerValue.includes('makerspaces') || lowerValue.includes('fablab') ||
                 lowerValue.includes('université') || lowerValue.includes('university') ||
                 lowerValue.includes('technique')) {
          groupedValues.add('Éducation & Formation')
        }
        // Industrie & Manufacturing (3+2+2+2 occurrences)
        else if (lowerValue.includes('industrie') || lowerValue.includes('industrial') || 
                 lowerValue.includes('manufacturing') || lowerValue.includes('fabrication') ||
                 lowerValue.includes('production') || lowerValue.includes('outillage') ||
                 lowerValue.includes('machines') || lowerValue.includes('équipement') ||
                 lowerValue.includes('fabrication additive') || lowerValue.includes('additive manufacturing') ||
                 lowerValue.includes('impression 3d') || lowerValue.includes('3d printing') ||
                 lowerValue.includes('moules') || lowerValue.includes('molds') ||
                 lowerValue.includes('prototypage') || lowerValue.includes('prototyping') ||
                 lowerValue.includes('pièces fonctionnelles') || lowerValue.includes('manufacturière')) {
          groupedValues.add('Industrie & Manufacturing')
        }
        // Architecture & Construction (4+3+2 occurrences)
        else if (lowerValue.includes('architecture') || lowerValue.includes('construction') ||
                 lowerValue.includes('design industriel') || lowerValue.includes('urbanisme') ||
                 lowerValue.includes('aménagement') || lowerValue.includes('génie civil') ||
                 lowerValue.includes('infrastructures') || lowerValue.includes('immobilier')) {
          groupedValues.add('Architecture & Construction')
        }
        // Électronique & IT (2+2 occurrences)
        else if (lowerValue.includes('électronique') || lowerValue.includes('electronics') || 
                 lowerValue.includes('informatique') || lowerValue.includes('it') ||
                 lowerValue.includes('télécommunications') || lowerValue.includes('telecom') ||
                 lowerValue.includes('cybersécurité') || lowerValue.includes('cybersecurity') ||
                 lowerValue.includes('semi-conducteur') || lowerValue.includes('semiconductor') ||
                 lowerValue.includes('boîtiers') || lowerValue.includes('circuits')) {
          groupedValues.add('Électronique & IT')
        }
        // Biens de consommation & Retail (4+2+2 occurrences)
        else if (lowerValue.includes('consommation') || lowerValue.includes('consumer') || 
                 lowerValue.includes('grand public') || lowerValue.includes('retail') ||
                 lowerValue.includes('e-commerce') || lowerValue.includes('commerce') ||
                 lowerValue.includes('luxe') || lowerValue.includes('parfumerie') ||
                 lowerValue.includes('cosmétique') || lowerValue.includes('bijouterie')) {
          groupedValues.add('Biens de consommation & Retail')
        }
        // Énergie & Environnement (2+2 occurrences)
        else if (lowerValue.includes('énergie') || lowerValue.includes('energy') || 
                 lowerValue.includes('environnement') || lowerValue.includes('environment') ||
                 lowerValue.includes('éolien') || lowerValue.includes('wind') ||
                 lowerValue.includes('solaire') || lowerValue.includes('solar') ||
                 lowerValue.includes('hydrogène') || lowerValue.includes('hydrogen') ||
                 lowerValue.includes('renouvelable') || lowerValue.includes('thermique')) {
          groupedValues.add('Énergie & Environnement')
        }
        // Autres
        else {
          groupedValues.add('Autres')
        }
      })
      
      raw = Array.from(groupedValues).sort()
    }

    // Post-traitement spécifique pour la Technologie: regrouper en grandes familles
    if (field === 'analyse_technique.technologie') {
      const groupedValues = new Set<string>()
      raw.forEach(value => {
        const lowerValue = value.toLowerCase()
        
        // Extrusion & FDM (33 occurrences)
        if (lowerValue.includes('extrusion') || lowerValue.includes('fdm') ||
            lowerValue.includes('fused deposition') || lowerValue.includes('filament')) {
          groupedValues.add('Extrusion & FDM')
        }
        // Photopolymérisation & SLA (13 occurrences)
        else if (lowerValue.includes('photopolymérisation') || lowerValue.includes('sla') ||
                 lowerValue.includes('stereolithography') || lowerValue.includes('dlp') ||
                 lowerValue.includes('uv') || lowerValue.includes('résine')) {
          groupedValues.add('Photopolymérisation & SLA')
        }
        // Fusion sur lit de poudre (13+1 occurrences)
        else if (lowerValue.includes('fusion sur lit') || lowerValue.includes('sintering') ||
                 lowerValue.includes('sls') || lowerValue.includes('slm') ||
                 lowerValue.includes('poudre métal') || lowerValue.includes('poudre polymère') ||
                 lowerValue.includes('selective laser') || lowerValue.includes('eos') ||
                 lowerValue.includes('multijet fusion') || lowerValue.includes('mjf')) {
          groupedValues.add('Fusion sur lit de poudre')
        }
        // Jet de matière & Binder Jetting (1+ occurrences)
        else if (lowerValue.includes('jet de matière') || lowerValue.includes('jet de liant') ||
                 lowerValue.includes('binder jetting') || lowerValue.includes('inkjet') ||
                 lowerValue.includes('jet d\'encre') || lowerValue.includes('jet d\'aérosol')) {
          groupedValues.add('Jet de matière & Binder Jetting')
        }
        // Bio-impression & Biomédical (5 occurrences)
        else if (lowerValue.includes('bio-impression') || lowerValue.includes('bioprinting') ||
                 lowerValue.includes('biomédical') || lowerValue.includes('tissulaire') ||
                 lowerValue.includes('cellules') || lowerValue.includes('organoïdes')) {
          groupedValues.add('Bio-impression & Biomédical')
        }
        // Impression 3D Béton & Construction
        else if (lowerValue.includes('béton') || lowerValue.includes('concrete') ||
                 lowerValue.includes('construction') || lowerValue.includes('ciment')) {
          groupedValues.add('Impression 3D Béton & Construction')
        }
        // Procédés conventionnels (2 occurrences)
        else if (lowerValue.includes('conventionnel') || lowerValue.includes('injection') ||
                 lowerValue.includes('moulage') || lowerValue.includes('thermoformage') ||
                 lowerValue.includes('electroformage') || lowerValue.includes('electroforming')) {
          groupedValues.add('Procédés conventionnels')
        }
        // Métrologie & Contrôle
        else if (lowerValue.includes('métrologie') || lowerValue.includes('numérisation') ||
                 lowerValue.includes('scan') || lowerValue.includes('contrôle') ||
                 lowerValue.includes('mesure') || lowerValue.includes('inspection')) {
          groupedValues.add('Métrologie & Contrôle')
        }
        // Non précisé & Autres (28+2+ autres)
        else if (lowerValue.includes('non précisé') || lowerValue.includes('autre') ||
                 lowerValue.includes('non precise') || lowerValue.includes('non spécifié')) {
          groupedValues.add('Non précisé & Autres')
        }
        // Autres technologies spécialisées
        else {
          groupedValues.add('Autres technologies spécialisées')
        }
      })
      
      raw = Array.from(groupedValues).sort()
    }

    const arr = raw.map(value => ({ value, label: value }))
    // Placer "Autres" toujours à la fin (général)
    arr.sort((a, b) => {
      const aIsOther = a.label.toLowerCase() === 'autres'
      const bIsOther = b.label.toLowerCase() === 'autres'
      if (aIsOther && !bIsOther) return 1
      if (!aIsOther && bIsOther) return -1
      return a.label.localeCompare(b.label, 'fr', { sensitivity: 'base' })
    })
    return arr
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

  // Upsert d'un filtre date spécifique (gte/lte)
  const upsertDateFilter = (operator: 'gte' | 'lte', valueISO: string) => {
    console.log(`📅 upsertDateFilter: ${operator} = ${valueISO}`)
    
    const existing = filters.activeFilters.find(
      f => f.field === DATE_FIELD && f.type === 'date' && f.operator === operator
    )
    if (existing) {
      console.log(`  - Mise à jour filtre existant: ${existing.id}`)
      updateFilter(existing.id, { value: valueISO })
      return
    }
    // Créer le filtre si manquant
    const newFilter: ActiveFilter = {
      id: `date_${operator}_${Date.now()}`,
      type: 'date',
      label: 'Date de publication',
      field: DATE_FIELD,
      operator,
      value: valueISO
    }
    console.log(`  - Création nouveau filtre:`, newFilter)
    const newFilters = {
      ...filters,
      activeFilters: [...filters.activeFilters, newFilter]
    }
    console.log(`  - Nouvel état des filtres:`, newFilters.activeFilters)
    setFilters(newFilters)
  }

  const removeDateFilter = (operator: 'gte' | 'lte') => {
    setFilters({
      ...filters,
      activeFilters: filters.activeFilters.filter(
        f => !(f.field === DATE_FIELD && f.type === 'date' && f.operator === operator)
      )
    })
  }

  // Presets rapides 7/30/90 jours
  const applyDatePresetDays = (days: number) => {
    const today = new Date()
    const start = new Date()
    start.setDate(today.getDate() - (days - 1))
    const toISO = (d: Date) => d.toISOString().slice(0, 10)
    
    console.log(`🎯 Appliquer filtre ${days} jours:`)
    console.log(`  - Aujourd'hui: ${toISO(today)}`)
    console.log(`  - Début: ${toISO(start)}`)
    
    // Créer les deux filtres en une seule fois
    const gteFilter: ActiveFilter = {
      id: `date_gte_${Date.now()}`,
      type: 'date',
      label: 'Date de publication',
      field: DATE_FIELD,
      operator: 'gte',
      value: toISO(start)
    }
    
    const lteFilter: ActiveFilter = {
      id: `date_lte_${Date.now() + 1}`,
      type: 'date',
      label: 'Date de publication',
      field: DATE_FIELD,
      operator: 'lte',
      value: toISO(today)
    }
    
    // Supprimer tous les filtres de date existants et ajouter les nouveaux
    const otherFilters = filters.activeFilters.filter(f => f.field !== DATE_FIELD)
    setFilters({
      ...filters,
      activeFilters: [...otherFilters, gteFilter, lteFilter]
    })
    
    console.log(`✅ Filtres créés: gte=${toISO(start)}, lte=${toISO(today)}`)
  }

  const getDateFilterValue = (operator: 'gte' | 'lte') => {
    const f = filters.activeFilters.find(
      x => x.field === DATE_FIELD && x.type === 'date' && x.operator === operator
    )
    return (f?.value as string) || ''
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

  const saveFiltersForClient = async () => {
    if (!currentClient) {
      setNotification({
        type: 'warning',
        title: 'Aucun portail sélectionné',
        message: 'Veuillez d\'abord sélectionner un portail utilisateur.'
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/clients', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: currentClient.slug,
          default_filters: filters
        })
      })

      if (response.ok) {
        setNotification({
          type: 'success',
          title: 'Filtres sauvegardés',
          message: `Les filtres ont été enregistrés pour le portail ${currentClient.name}.`
        })
      } else {
        const error = await response.json()
        setNotification({
          type: 'error',
          title: 'Erreur de sauvegarde',
          message: error.error === 'invalid_password' 
            ? 'Mot de passe incorrect.' 
            : 'Impossible de sauvegarder les filtres. Veuillez réessayer.'
        })
      }
    } catch (error) {
      setNotification({
        type: 'error',
        title: 'Erreur de sauvegarde',
        message: 'Une erreur inattendue est survenue.'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const exportJson = () => {
    const filtered = applyFilters(data, filters)
    const exportItems = filtered.map(item => ({
      titre: item.article?.titre || '',
      url: item.article?.url || '',
      date_publication: item.article?.date_publication || '',
      description_courte: item.article?.description_courte || '',
      image_url: (item as any).article?.image_url || '',
      typologie_contenu: item.article?.typologie_contenu || '',
      categorie: item.article?.categorie || [],
      pays_source: item.article?.pays_source || '',
      zone_geographique: item.article?.zone_geographique || '',
      evaluation: item.evaluation || {},
      innovation: item.innovation || {},
      metadata: item.metadata || {}
    }))
    const blob = new Blob([
      JSON.stringify({
        export_generated_at: new Date().toISOString(),
        filters_applied: filters,
        count: exportItems.length,
        items: exportItems
      }, null, 2)
    ], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `veille_export_${new Date().toISOString().slice(0,10)}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
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
          {currentClient && (
            <button
              onClick={saveFiltersForClient}
              disabled={isSaving}
              className="text-sm text-green-600 hover:text-green-700 flex items-center px-3 py-1 border border-green-200 rounded-md hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-1" />
              {isSaving ? 'Sauvegarde...' : 'Enregistrer pour ce portail'}
            </button>
          )}
          <button
            onClick={exportJson}
            className="text-sm text-neutral-700 hover:text-neutral-900 flex items-center px-3 py-1 border border-neutral-200 rounded-md hover:bg-neutral-50"
            title="Exporter les articles filtrés en JSON"
          >
            <Download className="w-4 h-4 mr-1" />
            Export JSON (pour Synthèse IA)
          </button>
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

      {/* Presets rapides pour la date + entre-deux dates */}
      <div className="mb-4 p-4 bg-neutral-50 rounded-lg border">
        <h3 className="text-sm font-medium text-neutral-700 mb-3 flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          Date de publication
        </h3>
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={() => {
              console.log('🔥 CLIC 7 jours')
              applyDatePresetDays(7)
            }}
            className="text-xs px-2 py-1 border border-neutral-300 rounded hover:bg-white"
          >7 jours</button>
          <button
            onClick={() => applyDatePresetDays(30)}
            className="text-xs px-2 py-1 border border-neutral-300 rounded hover:bg-white"
          >30 jours</button>
          <button
            onClick={() => {
              console.log('🔥 CLIC 90 jours - Effacer d\'abord tous les filtres')
              // Effacer tous les filtres de date existants
              setFilters({
                ...filters,
                activeFilters: filters.activeFilters.filter(f => f.field !== DATE_FIELD)
              })
              // Puis appliquer le nouveau filtre
              setTimeout(() => {
                console.log('🔥 Appliquer filtre 90 jours après nettoyage')
                applyDatePresetDays(90)
              }, 100)
            }}
            className="text-xs px-2 py-1 border border-neutral-300 rounded hover:bg-white"
          >90 jours</button>
          {(getDateFilterValue('gte') || getDateFilterValue('lte')) && (
            <button
              onClick={() => { removeDateFilter('gte'); removeDateFilter('lte') }}
              className="text-xs px-2 py-1 border border-neutral-300 rounded hover:bg-white text-neutral-600"
            >Effacer dates</button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-600 w-16">Après le</span>
            <input
              type="date"
              value={getDateFilterValue('gte')}
              onChange={(e) => {
                const v = e.target.value
                if (v) upsertDateFilter('gte', v); else removeDateFilter('gte')
              }}
              className="flex-1 text-sm border border-neutral-300 rounded px-2 py-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-600 w-16">Avant le</span>
            <input
              type="date"
              value={getDateFilterValue('lte')}
              onChange={(e) => {
                const v = e.target.value
                if (v) upsertDateFilter('lte', v); else removeDateFilter('lte')
              }}
              className="flex-1 text-sm border border-neutral-300 rounded px-2 py-1"
            />
          </div>
        </div>
      </div>

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
                  className="flex-1 text-sm border border-neutral-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-neutral-50"
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

      {/* Notification Toast */}
      {notification && (
        <NotificationToast
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  )
}