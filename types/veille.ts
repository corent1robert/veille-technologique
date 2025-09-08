export interface VeilleData {
  article?: {
    url?: string
    titre?: string
    description_courte?: string
    description_longue?: string
    mots_cles?: string[]
    categorie?: string[]
    date_publication?: string
    auteur?: string
    source?: string
    entreprises_citees?: string[]
    citations?: string[]
    pays_source?: string
    zone_geographique?: string
    typologie_source?: string
    typologie_contenu?: string
  }
  evaluation?: {
    pertinence?: number
    pertinence_explication?: string
    fiabilite?: number
    fiabilite_explication?: string
  }
  analyse_technique?: {
    materiau?: string
    technologie?: string
    logiciel?: string
  }
  innovation?: {
    estimation_TRL?: string
    numero_TRL?: number
    explication_TRL?: string
    projection_TRL?: string
    application_secteur?: string[]
  }
  metadata?: {
    date_traitement?: string
    version_analyse?: string
    sources_consolidees?: string[]
    qualite_donnees?: number
    confiance_analyse?: number
    resume_executif?: string
    tags_principaux?: string[]
    priorite_veille?: number
  }
}

export interface FilterConfig {
  id: string
  type: 'select' | 'date' | 'numeric' | 'search'
  label: string
  field: string
  operator?: 'eq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains'
  options?: { value: string; label: string }[]
}

export interface ActiveFilter {
  id: string
  type: string
  label: string
  field: string
  operator: string
  value: string | number
}

export interface FilterState {
  search: string
  activeFilters: ActiveFilter[]
}
