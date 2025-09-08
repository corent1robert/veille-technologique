import { VeilleData, FilterState, ActiveFilter } from '@/types/veille'
import { searchInVeilleData } from './searchUtils'

export function applyFilters(data: VeilleData[], filters: FilterState): VeilleData[] {
  let filteredData = [...data]

  // Appliquer la recherche avancée avec opérateurs booléens
  if (filters.search.trim()) {
    filteredData = searchInVeilleData(filteredData, filters.search)
  }

  // Appliquer chaque filtre actif
  filters.activeFilters.forEach(filter => {
    filteredData = filteredData.filter(item => {
      const fieldValue = getFieldValue(item, filter.field)
      
      if (fieldValue === null || fieldValue === undefined) {
        return false
      }

      switch (filter.operator) {
        case 'eq':
          if (Array.isArray(fieldValue)) {
            return fieldValue.some(val => val.toString() === filter.value.toString())
          }
          return fieldValue.toString() === filter.value.toString()
          
        case 'contains':
          if (Array.isArray(fieldValue)) {
            return fieldValue.some(val => 
              val.toString().toLowerCase().includes(filter.value.toString().toLowerCase())
            )
          }
          return fieldValue.toString().toLowerCase().includes(filter.value.toString().toLowerCase())
          
        case 'gt':
          return parseFloat(fieldValue.toString()) > parseFloat(filter.value.toString())
          
        case 'gte':
          return parseFloat(fieldValue.toString()) >= parseFloat(filter.value.toString())
          
        case 'lt':
          return parseFloat(fieldValue.toString()) < parseFloat(filter.value.toString())
          
        case 'lte':
          return parseFloat(fieldValue.toString()) <= parseFloat(filter.value.toString())
          
        default:
          return true
      }
    })
  })

  return filteredData
}

function getFieldValue(item: VeilleData, fieldPath: string): any {
  const fieldParts = fieldPath.split('.')
  let value: any = item
  
  for (const part of fieldParts) {
    if (value && typeof value === 'object') {
      value = value[part]
    } else {
      return null
    }
  }
  
  return value
}

export function getFilterSummary(filters: FilterState): string {
  const parts: string[] = []
  
  if (filters.search) {
    parts.push(`Recherche: "${filters.search}"`)
  }
  
  if (filters.activeFilters.length > 0) {
    parts.push(`${filters.activeFilters.length} filtre(s) actif(s)`)
  }
  
  return parts.length > 0 ? parts.join(' • ') : 'Aucun filtre'
}
