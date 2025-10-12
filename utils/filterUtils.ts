import { VeilleData, FilterState, ActiveFilter } from '@/types/veille'
import { searchInVeilleData } from './searchUtils'

// Fonction pour regrouper les secteurs d'application (même logique que dans FilterPanel)
function groupApplicationSecteur(value: string): string {
  const lowerValue = value.toLowerCase()
  
  // Santé & Médical
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
    return 'Santé & Médical'
  }
  // Automobile & Transport
  else if (lowerValue.includes('automobile') || lowerValue.includes('automotive') || 
           lowerValue.includes('transport') || lowerValue.includes('mobilité') || 
           lowerValue.includes('mobility') || lowerValue.includes('véhicule') ||
           lowerValue.includes('motorsports')) {
    return 'Automobile & Transport'
  }
  // Aéronautique & Défense
  else if (lowerValue.includes('aéronautique') || lowerValue.includes('aeronautique') || 
           lowerValue.includes('spatial') || lowerValue.includes('aviation') || 
           lowerValue.includes('défense') || lowerValue.includes('defense') ||
           lowerValue.includes('military') || lowerValue.includes('armée') ||
           lowerValue.includes('aérospatial') || lowerValue.includes('militaire')) {
    return 'Aéronautique & Défense'
  }
  // Biotechnologie & Recherche
  else if (lowerValue.includes('biotechnologie') || lowerValue.includes('biotechnology') ||
           lowerValue.includes('recherche') || lowerValue.includes('research') ||
           lowerValue.includes('développement') || lowerValue.includes('development') ||
           lowerValue.includes('r&d') || lowerValue.includes('académique') ||
           lowerValue.includes('universitaire') || lowerValue.includes('université')) {
    return 'Biotechnologie & Recherche'
  }
  // Éducation & Formation
  else if (lowerValue.includes('éducation') || lowerValue.includes('education') || 
           lowerValue.includes('formation') || lowerValue.includes('training') ||
           lowerValue.includes('makerspaces') || lowerValue.includes('fablab') ||
           lowerValue.includes('université') || lowerValue.includes('university') ||
           lowerValue.includes('technique')) {
    return 'Éducation & Formation'
  }
  // Industrie & Manufacturing
  else if (lowerValue.includes('industrie') || lowerValue.includes('industrial') || 
           lowerValue.includes('manufacturing') || lowerValue.includes('fabrication') ||
           lowerValue.includes('production') || lowerValue.includes('outillage') ||
           lowerValue.includes('machines') || lowerValue.includes('équipement') ||
           lowerValue.includes('fabrication additive') || lowerValue.includes('additive manufacturing') ||
           lowerValue.includes('impression 3d') || lowerValue.includes('3d printing') ||
           lowerValue.includes('moules') || lowerValue.includes('molds') ||
           lowerValue.includes('prototypage') || lowerValue.includes('prototyping') ||
           lowerValue.includes('pièces fonctionnelles') || lowerValue.includes('manufacturière')) {
    return 'Industrie & Manufacturing'
  }
  // Architecture & Construction
  else if (lowerValue.includes('architecture') || lowerValue.includes('construction') ||
           lowerValue.includes('design industriel') || lowerValue.includes('urbanisme') ||
           lowerValue.includes('aménagement') || lowerValue.includes('génie civil') ||
           lowerValue.includes('infrastructures') || lowerValue.includes('immobilier')) {
    return 'Architecture & Construction'
  }
  // Électronique & IT
  else if (lowerValue.includes('électronique') || lowerValue.includes('electronics') || 
           lowerValue.includes('informatique') || lowerValue.includes('it') ||
           lowerValue.includes('télécommunications') || lowerValue.includes('telecom') ||
           lowerValue.includes('cybersécurité') || lowerValue.includes('cybersecurity') ||
           lowerValue.includes('semi-conducteur') || lowerValue.includes('semiconductor') ||
           lowerValue.includes('boîtiers') || lowerValue.includes('circuits')) {
    return 'Électronique & IT'
  }
  // Biens de consommation & Retail
  else if (lowerValue.includes('consommation') || lowerValue.includes('consumer') || 
           lowerValue.includes('grand public') || lowerValue.includes('retail') ||
           lowerValue.includes('e-commerce') || lowerValue.includes('commerce') ||
           lowerValue.includes('luxe') || lowerValue.includes('parfumerie') ||
           lowerValue.includes('cosmétique') || lowerValue.includes('bijouterie')) {
    return 'Biens de consommation & Retail'
  }
  // Énergie & Environnement
  else if (lowerValue.includes('énergie') || lowerValue.includes('energy') || 
           lowerValue.includes('environnement') || lowerValue.includes('environment') ||
           lowerValue.includes('éolien') || lowerValue.includes('wind') ||
           lowerValue.includes('solaire') || lowerValue.includes('solar') ||
           lowerValue.includes('hydrogène') || lowerValue.includes('hydrogen') ||
           lowerValue.includes('renouvelable') || lowerValue.includes('thermique')) {
    return 'Énergie & Environnement'
  }
  // Autres
  else {
    return 'Autres'
  }
}

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
              // Cas spécial pour application_secteur : utiliser le regroupement
              if (field === 'innovation.application_secteur') {
                matches = fieldValue.some(val => {
                  const groupedSecteur = groupApplicationSecteur(val.toString())
                  return groupedSecteur === filter.value.toString()
                })
              } else {
                matches = fieldValue.some(val => 
                  val.toString().toLowerCase().includes(filter.value.toString().toLowerCase())
                )
              }
            } else {
              // Cas spécial pour application_secteur : utiliser le regroupement
              if (field === 'innovation.application_secteur') {
                const groupedSecteur = groupApplicationSecteur(fieldValue.toString())
                matches = groupedSecteur === filter.value.toString()
              } else {
                matches = fieldValue.toString().toLowerCase().includes(filter.value.toString().toLowerCase())
              }
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
