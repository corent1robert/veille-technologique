import { VeilleData } from '@/types/veille'

export interface SearchToken {
  type: 'term' | 'phrase' | 'operator'
  value: string
  operator?: 'AND' | 'OR' | 'NOT'
}

export function parseSearchQuery(query: string): SearchToken[] {
  const tokens: SearchToken[] = []
  const trimmedQuery = query.trim()
  
  if (!trimmedQuery) return tokens
  
  // Regex pour détecter les guillemets, opérateurs et termes
  const regex = /("([^"]+)")|(\b(AND|OR|NOT)\b)|(\S+)/gi
  let match
  
  while ((match = regex.exec(trimmedQuery)) !== null) {
    if (match[1]) {
      // Phrase entre guillemets
      tokens.push({
        type: 'phrase',
        value: match[2].toLowerCase()
      })
    } else if (match[3]) {
      // Opérateur booléen
      tokens.push({
        type: 'operator',
        value: match[3].toUpperCase(),
        operator: match[3].toUpperCase() as 'AND' | 'OR' | 'NOT'
      })
    } else if (match[5]) {
      // Terme simple
      tokens.push({
        type: 'term',
        value: match[5].toLowerCase()
      })
    }
  }
  
  return tokens
}

export function searchInVeilleData(data: VeilleData[], query: string): VeilleData[] {
  if (!query.trim()) return data
  
  const tokens = parseSearchQuery(query)
  if (tokens.length === 0) return data
  
  return data.filter(item => evaluateSearchExpression(item, tokens))
}

function evaluateSearchExpression(item: VeilleData, tokens: SearchToken[]): boolean {
  if (tokens.length === 0) return true
  
  // Si un seul terme, recherche simple
  if (tokens.length === 1 && tokens[0].type !== 'operator') {
    return searchInItem(item, tokens[0])
  }
  
  // Évaluation des expressions booléennes
  let result = false
  let currentOperator: 'AND' | 'OR' | 'NOT' | null = null
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    
    if (token.type === 'operator') {
      currentOperator = token.operator!
      continue
    }
    
    const tokenResult = searchInItem(item, token)
    
    if (i === 0) {
      result = tokenResult
    } else {
      switch (currentOperator) {
        case 'AND':
          result = result && tokenResult
          break
        case 'OR':
          result = result || tokenResult
          break
        case 'NOT':
          result = result && !tokenResult
          break
        default:
          // Par défaut, AND implicite
          result = result && tokenResult
      }
    }
  }
  
  return result
}

function searchInItem(item: VeilleData, token: SearchToken): boolean {
  const searchValue = token.value.toLowerCase()
  
  // Champs de recherche
  const searchableFields = [
    item.article?.titre,
    item.article?.description_courte,
    item.article?.description_longue,
    item.article?.auteur,
    item.article?.source,
    item.article?.pays_source,
    item.article?.zone_geographique,
    item.article?.typologie_source,
    item.article?.typologie_contenu,
    item.analyse_technique?.materiau,
    item.analyse_technique?.technologie,
    item.analyse_technique?.logiciel,
    item.innovation?.estimation_TRL,
    item.innovation?.explication_TRL,
    item.innovation?.projection_TRL,
    item.metadata?.resume_executif,
    ...(item.article?.mots_cles || []),
    ...(item.article?.categorie || []),
    ...(item.article?.entreprises_citees || []),
    ...(item.innovation?.application_secteur || []),
    ...(item.metadata?.tags_principaux || [])
  ]
  
  if (token.type === 'phrase') {
    // Recherche de phrase exacte
    return searchableFields.some(field => 
      field && field.toString().toLowerCase().includes(searchValue)
    )
  } else {
    // Recherche de terme (mots séparés)
    const searchWords = searchValue.split(/\s+/)
    return searchWords.every(word => 
      searchableFields.some(field => 
        field && field.toString().toLowerCase().includes(word)
      )
    )
  }
}

export function getSearchSuggestions(query: string, data: VeilleData[]): string[] {
  if (!query.trim()) return []
  
  const suggestions = new Set<string>()
  const queryLower = query.toLowerCase()
  
  // Extraire tous les mots uniques des champs de recherche
  data.forEach(item => {
    const searchableFields = [
      item.article?.titre,
      item.article?.description_courte,
      item.article?.auteur,
      item.article?.source,
      ...(item.article?.mots_cles || []),
      ...(item.article?.categorie || []),
      ...(item.article?.entreprises_citees || []),
      ...(item.innovation?.application_secteur || [])
    ]
    
    searchableFields.forEach(field => {
      if (field) {
        const words = field.toString().toLowerCase().split(/\s+/)
        words.forEach(word => {
          if (word.length > 2 && word.includes(queryLower)) {
            suggestions.add(word)
          }
        })
      }
    })
  })
  
  return Array.from(suggestions).slice(0, 10)
}

export function formatSearchQuery(query: string): string {
  // Mise en forme pour l'affichage
  return query
    .replace(/\b(AND|OR|NOT)\b/gi, (match) => `<span class="font-semibold text-blue-600">${match.toUpperCase()}</span>`)
    .replace(/"([^"]+)"/g, '<span class="font-mono bg-gray-100 px-1 rounded">"$1"</span>')
}
