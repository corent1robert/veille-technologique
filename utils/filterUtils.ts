import { VeilleData, FilterState, ActiveFilter } from '@/types/veille'
import { searchInVeilleData } from './searchUtils'

export function applyFilters(data: VeilleData[], filters: FilterState): VeilleData[] {
  let filteredData = [...data]

  // Appliquer la recherche avancée avec opérateurs booléens
  if (filters.search.trim()) {
    filteredData = searchInVeilleData(filteredData, filters.search)
  }

  // Grouper les filtres par champ pour gérer les plages de dates
  const filtersByField = new Map<string, ActiveFilter[]>()
  filters.activeFilters.forEach(filter => {
    if (!filtersByField.has(filter.field)) {
      filtersByField.set(filter.field, [])
    }
    filtersByField.get(filter.field)!.push(filter)
  })

  // Appliquer chaque groupe de filtres
  filtersByField.forEach((fieldFilters, field) => {
    filteredData = filteredData.filter(item => {
      const fieldValue = getFieldValue(item, field)
      
      if (fieldValue === null || fieldValue === undefined) {
        return false
      }

      // Gestion spécifique des dates avec plages
      if (fieldFilters[0].type === 'date') {
        const itemTime = new Date(fieldValue as any).getTime()
        if (isNaN(itemTime)) {
          return false
        }

        // Vérifier tous les filtres de date pour ce champ
        for (const filter of fieldFilters) {
          const filterDate = new Date(filter.value as any)
          if (isNaN(filterDate.getTime())) {
            return false
          }

          // Pour l'opérateur 'eq', on compare sur la journée entière (00:00 -> 23:59:59)
          const filterStart = new Date(filterDate)
          filterStart.setHours(0, 0, 0, 0)
          const filterEnd = new Date(filterDate)
          filterEnd.setHours(23, 59, 59, 999)

          let matches = false
          switch (filter.operator) {
            case 'eq':
              matches = itemTime >= filterStart.getTime() && itemTime <= filterEnd.getTime()
              break
            case 'gt':
              matches = itemTime > filterEnd.getTime()
              break
            case 'gte':
              matches = itemTime >= filterStart.getTime()
              break
            case 'lt':
              matches = itemTime < filterStart.getTime()
              break
            case 'lte':
              matches = itemTime <= filterEnd.getTime()
              break
            default:
              matches = true
          }
          
          if (!matches) {
            return false
          }
        }
        return true
      }

      // Gestion des autres types de filtres (non-date)
      for (const filter of fieldFilters) {
        let matches = false
        switch (filter.operator) {
          case 'eq':
            if (Array.isArray(fieldValue)) {
              matches = fieldValue.some(val => val.toString() === filter.value.toString())
            } else {
              matches = fieldValue.toString() === filter.value.toString()
            }
            break
            
          case 'contains':
            if (Array.isArray(fieldValue)) {
              matches = fieldValue.some(val => 
                val.toString().toLowerCase().includes(filter.value.toString().toLowerCase())
              )
            } else {
              matches = fieldValue.toString().toLowerCase().includes(filter.value.toString().toLowerCase())
            }
            break
            
          case 'gt':
            matches = parseFloat(fieldValue.toString()) > parseFloat(filter.value.toString())
            break
            
          case 'gte':
            matches = parseFloat(fieldValue.toString()) >= parseFloat(filter.value.toString())
            break
            
          case 'lt':
            matches = parseFloat(fieldValue.toString()) < parseFloat(filter.value.toString())
            break
            
          case 'lte':
            matches = parseFloat(fieldValue.toString()) <= parseFloat(filter.value.toString())
            break
            
          default:
            matches = true
        }
        
        if (!matches) {
          return false
        }
      }
      return true
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
