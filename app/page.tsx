'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Filter, TrendingUp, Calendar, User, Building2, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, ChevronUp } from 'lucide-react'
import { VeilleCard } from '@/components/VeilleCard'
import { FilterPanel } from '@/components/FilterPanel'
import { VeilleModal } from '@/components/VeilleModal'
import { RefreshButton } from '@/components/RefreshButton'
import { DebugInfo } from '@/components/DebugInfo'
import ClientSelectorModal from '@/components/ClientSelectorModal'
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
  const [currentPage, setCurrentPage] = useState<number>(1)
  const itemsPerPage = 50
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const [progress, setProgress] = useState<{ total: number; loaded: number; nextOffset: string | null }>({ total: 0, loaded: 0, nextOffset: null })
  const [lastKnownTotal, setLastKnownTotal] = useState<number>(0)
  const isFetchingRef = useRef<boolean>(false)
  const fetchedOnceRef = useRef<boolean>(false)
  const [isClientModalOpen, setIsClientModalOpen] = useState<boolean>(false)
  const [currentClient, setCurrentClient] = useState<{ id: string; name: string; slug: string } | null>(null)
  const [isClientAuthenticated, setIsClientAuthenticated] = useState<boolean>(false)

  useEffect(() => {
    if (fetchedOnceRef.current) return
    fetchedOnceRef.current = true
    // Toujours demander la sélection de portail au premier chargement
    setIsClientModalOpen(true)
    fetchData()
    return () => {
      // Réinitialiser le verrou si on démonte la page
      isFetchingRef.current = false
    }
  }, [])

  useEffect(() => {
    // Charger un total précédent pour afficher X/Y approximatif
    try {
      const last = Number(localStorage.getItem('veille_data_count') || '0')
      if (!isNaN(last) && last > 0) setLastKnownTotal(last)
    } catch (e) {}
  }, [])

  useEffect(() => {
    applyFiltersAndSort()
    // Réinitialiser la pagination à chaque changement de critères
    setCurrentPage(1)
  }, [data, filters, sortBy, sortOrder])

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = filteredData.slice(startIndex, endIndex)

  const fetchData = async (forceRefresh = false) => {
    try {
      if (isFetchingRef.current) return
      isFetchingRef.current = true
      setLoading(true)
      setProgress({ total: 0, loaded: 0, nextOffset: null })
      
      // Nouveau: chargement par pages côté API pour mesurer la progression
      const limit = 100
      let nextOffset: string | null = null
      let aggregated: VeilleData[] = []
      let loaded = 0

      do {
        const url = new URL('/api/veille', window.location.origin)
        url.searchParams.set('limit', String(limit))
        if (nextOffset) url.searchParams.set('offset', nextOffset)
        if (forceRefresh) url.searchParams.set('t', String(Date.now()))

        const resp = await fetch(url.toString(), {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
        if (!resp.ok) throw new Error(`Erreur HTTP: ${resp.status}`)
        const json = await resp.json()
        let items: VeilleData[] = json.items || []
        // Normalisation + regroupement front (test rapide): catégories & typologies
        const normalizeLabel = (s?: string) => {
          if (!s) return ''
          let x = s.trim().toLowerCase()
          x = x.normalize('NFD').replace(/[\u0300-\u036f]+/g, '')
          x = x.replace(/[_\-]+/g, ' ').replace(/\s+/g, ' ').trim()
          if (x === 'ia' || x === 'ai') x = 'intelligence artificielle'
          if (x === 'biotech') x = 'biotechnologie'
          if (x === 'etude' || x === 'etudes') x = 'étude'
          if (x === 'video') x = 'vidéo'
          if (x === 'news') x = 'article'
          return x
        }

        const groupCategory = (label: string) => {
          const l = normalizeLabel(label)
          // Actualité (toutes variantes)
          if (/actualite|actualité/.test(l)) return 'Actualité'
          // M&A / Financement / Business
          if (/(fusion|acquisition|m&a|rachat|merger|acquisitions)/.test(l)) return 'Fusions & Acquisitions'
          if (/(levee de fonds|lev\u00e9e de fonds|financement|fundraising|serie [ab]|seed|capital risque|venture)/.test(l)) return 'Financement'
          if (/(partenariat|alliance|collaboration)/.test(l)) return 'Partenariats'
          if (/(reglementation|r\u00e9glementation|conformite|compliance|norme|certification)/.test(l)) return 'Réglementation / Conformité'
          if (/(produit|lancement produit|nouveau produit|release)/.test(l)) return 'Produit / Lancement'
          if (/(r&d|recherche et developpement|recherche & developpement|recherche|developpement)/.test(l)) return 'R&D'
          if (/(appel d offres|marches publics|march\u00e9s publics|tender|procurement)/.test(l)) return 'Marchés publics'
          if (/(strategie|strat\u00e9gie|gouvernance|restructuration)/.test(l)) return 'Stratégie / Gouvernance'
          if (/(evenement|\u00e9v\u00e9nement|conference|salon|webinar)/.test(l)) return 'Événements'
          // Thèmes génériques
          if (/(technologie|technology|tech)/.test(l)) return 'Technologie'
          if (/(industrie|industrial|manufactur)/.test(l)) return 'Industrie'
          if (/(recherche|scientifique|science|laboratoire|lab)/.test(l)) return 'Recherche'
          if (/(innovation|innovant|innov)/.test(l)) return 'Innovation'
          if (/(marche|march\u00e9|market|analyse de marche|etude de marche)/.test(l)) return 'Marché'
          if (/(gouvernement|public|politiques publiques|administration)/.test(l)) return 'Secteur public'
          if (/(education|enseignement|universite|ecole)/.test(l)) return 'Éducation'
          if (/(sante publique|securite sanitaire)/.test(l)) return 'Santé publique'
          if (/(environnement|recyclage|dechets|durable|soutenable|climat|ecologie)/.test(l)) return 'Environnement'
          // Secteurs
          if (/sante|pharma|pharmaceutique|medical|medecine/.test(l)) return 'Santé / Pharma'
          if (/agro|alimentaire|agriculture|agri/.test(l)) return 'Agroalimentaire'
          if (/energie|energies|renouvelable|hydrogene|hydrogen/.test(l)) return 'Énergie'
          if (/transport|mobilite|automobile|aeronautique|aero/.test(l)) return 'Transport / Mobilité'
          if (/defense|défense|militaire|securite|sécurite/.test(l)) return 'Défense / Sécurité'
          if (/environnement|climat|recyclage|dechet|dechets|durable|soutenable/.test(l)) return 'Environnement / Climat'
          if (/(construction|batiment|bim|chantier)/.test(l)) return 'Construction / BTP'
          if (/education|enseignement|edtech/.test(l)) return 'Éducation'
          if (/finance|banque|fintech|assurance/.test(l)) return 'Finance'
          if (/retail|commerce|e commerce|distribution/.test(l)) return 'Commerce / Retail'
          if (/tic|it|numerique|informatique|digital|logiciel/.test(l)) return 'Numérique / TIC'
          if (/spatial|espace|satellite/.test(l)) return 'Spatial'

          // Technologies
          if (/(intelligence artificielle|machine learning|apprentissage automatique|deep learning)/.test(l)) return 'IA / ML'
          if (/(robotique|robot|cobot)/.test(l)) return 'Robotique'
          if (/(iot|capteur|capteurs|internet des objets)/.test(l)) return 'IoT / Capteurs'
          if (/(impression 3d|fabrication additive|additif|additive|3d printing|bioprinting|bioimpression|biofabrication)/.test(l)) return 'Impression 3D'
          if (/(materiaux|materiau|materiel avanc|materiaux avance|composite|polymere|ceramique|metal)/.test(l)) return 'Matériaux avancés'
          if (/(biotechnologie|biotech|biologie synthetique)/.test(l)) return 'Biotechnologies'
          if (/(cybersecurite|securite informatique|cyber)/.test(l)) return 'Cybersécurité'
          if (/(cloud|edge)/.test(l)) return 'Cloud / Edge'
          if (/blockchain|web3|crypto/.test(l)) return 'Blockchain / Web3'
          if (/(realite augmentee|realite virtuelle|ar | vr|metaverse)/.test(l)) return 'AR / VR'

          // Termes techniques génériques orientés numérique
          if (/(electronique|web|internet|telecom|telecommunications|bureautique|it|logiciel|software)/.test(l)) return 'Numérique / TIC'
          if (/(manufacturing|fabrication|industrie manufacturiere|supply chain|logistique|usina|fonderie|plasturgie|procedes)/.test(l)) return 'Industrie'

          // Par défaut, regrouper sous "Autres" pour éviter l'explosion de catégories
          return 'Autres'
        }

        const groupTypologie = (label?: string) => {
          const l = normalizeLabel(label || '')
          if (!l) return label
          // Actualités
          if (/(actualite|actualité|news|briefing|digest|br[eè]ve)/.test(l)) return 'Actualité'
          // Analyses / études
          if (/(analyse|review|meta analyse|m[eé]ta analyse|synth[eè]se)/.test(l)) return 'Analyse'
          if (/(rapport|report|livre blanc|white paper)/.test(l)) return 'Rapport'
          if (/(etude|study|publication|paper|revue|recherche)/.test(l)) return 'Étude'
          // Annonces & Communiqués
          if (/(annonce|nouvelle|lancement)/.test(l)) return 'Annonce'
          if (/(communique|press release)/.test(l)) return 'Communiqué'
          // Types fréquents
          if (/(article|blog|post)/.test(l)) return 'Article'
          if (/(video|vidéo|webinar|podcast)/.test(l)) return 'Vidéo'
          if (/(tutoriel|guide|how to|tutorial)/.test(l)) return 'Tutoriel'
          if (/(notice|manuel|documentation|specification|sp[eé]cification)/.test(l)) return 'Guide / Notice'
          if (/(interview|entretien)/.test(l)) return 'Interview'
          if (/(tribune|opinion|editorial|éditorial|commentaire)/.test(l)) return 'Opinion / Tribune'
          if (/(alerte|avertissement|securite|sécurité)/.test(l)) return 'Alerte sécurité'
          if (/(offre d emploi|recrutement|job|poste|description de poste)/.test(l)) return 'Offre d’emplois'
          if (/(evenement|événement|compte rendu d evenement|conference|salon)/.test(l)) return 'Événement'
          if (/(levee de fonds|levée de fonds|financement|fundraising)/.test(l)) return 'Financement'
          if (/(page d erreur|erreur http|404|protection anti bot|login|politique de confidentialite|confidentialite)/.test(l)) return 'Technique / Infrastructure'
          if (/(brevet|patent)/.test(l)) return 'Brevet'
          // Par défaut
          return 'Autres'
        }
        items = items.map((it) => {
          const art = it.article || {}
          const normalizedCategorieRaw = Array.isArray(art.categorie)
            ? art.categorie.flatMap((c: any) => String(c).split(/[,/]|\u00B7|\||;|\s{2,}/)).map((s: string) => normalizeLabel(s)).filter(Boolean)
            : (art.categorie
                ? String(art.categorie)
                    .split(/[,/]|\u00B7|\||;|\s{2,}/)
                    .map((s: string) => normalizeLabel(s))
                    .filter(Boolean)
                : [])
          const groupedCategorie = Array.from(new Set(normalizedCategorieRaw.map(groupCategory)))
            .map(v => v && v.trim())
            .filter(Boolean) as string[]
          const normalizedTypoContenu = groupTypologie(art.typologie_contenu) || normalizeLabel(art.typologie_contenu)
          const normalizedTypoSource = normalizeLabel(art.typologie_source)
          return {
            ...it,
            article: {
              ...art,
              categorie: groupedCategorie,
              typologie_contenu: normalizedTypoContenu || art.typologie_contenu,
              typologie_source: normalizedTypoSource || art.typologie_source
            }
          }
        })
        nextOffset = json.nextOffset || null
        aggregated = aggregated.concat(items)
        loaded = aggregated.length
        setProgress({ total: Math.max(loaded, 1), loaded, nextOffset })
        // Afficher dès la première page
        if (aggregated.length > 0 && data.length === 0) {
          setData(aggregated)
          // Sortir de l'état "loading" pour afficher immédiatement
          if (loading) setLoading(false)
        }
      } while (nextOffset)

      setData(aggregated)
      setLastRefresh(new Date())
      try {
        localStorage.setItem('veille_data_count', String(aggregated.length))
        setLastKnownTotal(aggregated.length)
      } catch (e) {}
      
      // Stocker en localStorage pour debug
      localStorage.setItem('veille_last_refresh', new Date().toISOString())
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données:', error)
    } finally {
      isFetchingRef.current = false
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
    // Affichage skeleton pendant le chargement initial
    const skeletonItems = Array.from({ length: 12 })
    return (
      <div className="min-h-screen bg-neutral-50">
        <header className="bg-white shadow-sm border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">
                  Veille Technologique
                </h1>
                <p className="text-neutral-600 mt-1">
                  Chargement des articles…
                  {progress.loaded > 0 && (
                    <>
                      {' '}
                      {lastKnownTotal > 0
                        ? `${progress.loaded}/${lastKnownTotal} environ`
                        : `${progress.loaded} chargés`}
                    </>
                  )}
                </p>
                <div className="mt-2 h-2 w-64 bg-neutral-200 rounded overflow-hidden">
                  <div
                    className="h-2 bg-blue-500 transition-all"
                    style={{ width: `${Math.min(100, Math.round((progress.loaded / Math.max(progress.total, progress.loaded || 1)) * 100))}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-neutral-500">Préparation des données…</div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Barre d’info temps de chargement */}
          <div className="mb-6 p-3 bg-neutral-100 border border-neutral-200 rounded text-sm text-neutral-600">
            Les articles se chargent. Cela peut prendre quelques secondes la première fois.
          </div>
          {/* Grille skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skeletonItems.map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 animate-pulse">
                <div className="h-5 w-3/4 bg-neutral-200 rounded mb-2" />
                <div className="h-3 w-32 bg-neutral-200 rounded mb-4" />
                <div className="space-y-2 mb-4">
                  <div className="h-3 w-full bg-neutral-200 rounded" />
                  <div className="h-3 w-11/12 bg-neutral-200 rounded" />
                  <div className="h-3 w-10/12 bg-neutral-200 rounded" />
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-6 w-16 bg-neutral-200 rounded-full" />
                  <div className="h-6 w-20 bg-neutral-200 rounded-full" />
                </div>
                <div className="pt-3 border-t border-neutral-100 mt-auto space-y-2">
                  <div className="h-9 w-full bg-neutral-200 rounded" />
                  <div className="h-9 w-full bg-neutral-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Modal sélection client pendant le chargement */}
        <ClientSelectorModal
          isOpen={isClientModalOpen}
          onClose={() => setIsClientModalOpen(false)}
          onAuthenticated={(client) => {
            setCurrentClient({ id: client.id, name: client.name, slug: client.slug })
            try { localStorage.setItem('veille_client', JSON.stringify({ id: client.id, name: client.name, slug: client.slug })) } catch {}
            if (client.defaultFilters && typeof client.defaultFilters === 'object') {
              const df: any = client.defaultFilters
              const normalized = Array.isArray(df.activeFilters) ? df.activeFilters.map((f: any) => ({
                id: String(f.id || ''),
                type: String(f.type || ''),
                label: String(f.label || ''),
                field: String(f.field || ''),
                operator: String(f.operator || 'eq'),
                value: f.type === 'numeric' ? Number(f.value || 0) : String(f.value ?? '')
              })) : []
              setFilters({
                search: String(df.search || ''),
                activeFilters: normalized
              })
            }
          }}
        />
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
              {/* Sélecteur/indicateur de portail utilisateur */}
              <button
                onClick={() => setIsClientModalOpen(true)}
                className={`px-3 py-2 text-sm border rounded-md hover:bg-neutral-50 ${isClientAuthenticated ? 'border-neutral-300' : 'border-blue-300 text-blue-700 bg-blue-50'}`}
                title="Changer de portail utilisateur"
              >
                {isClientAuthenticated && currentClient ? `Portail: ${currentClient.name}` : 'Sélectionner un portail'}
              </button>
              <div className="text-sm text-neutral-500">
                {filteredData.length} articles trouvés
              </div>
              <RefreshButton onRefresh={handleForceRefresh} />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress bar en tâche de fond quand d'autres lots arrivent */}
        {progress.loaded > 0 && progress.nextOffset && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-center justify-between text-sm text-blue-800 mb-2">
              <span>
                Chargement en cours… {lastKnownTotal > 0 ? `${progress.loaded}/${lastKnownTotal}` : `${progress.loaded}+`}
              </span>
            </div>
            <div className="h-2 w-full bg-blue-100 rounded overflow-hidden">
              <div
                className="h-2 bg-blue-500 transition-all"
                style={{ width: `${Math.min(100, Math.round((progress.loaded / (lastKnownTotal > 0 ? lastKnownTotal : progress.loaded + 100)) * 100))}%` }}
              />
            </div>
          </div>
        )}
        {/* Filtres - panneau rétractable */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2 text-neutral-900 font-medium">
              <Filter className="w-5 h-5" />
              Filtres
              {getFilterSummary(filters) !== 'Aucun filtre' && (
                <span className="ml-2 text-sm text-blue-600">{getFilterSummary(filters)}</span>
              )}
            </div>
            <button
              onClick={() => setShowFilters(v => !v)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-neutral-300 rounded-md hover:bg-neutral-50"
              aria-expanded={showFilters}
              aria-controls="filters-panel"
            >
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showFilters ? 'Réduire' : 'Afficher'}
            </button>
          </div>
          {showFilters && (
            <div id="filters-panel" className="border-t border-neutral-200 p-4">
        <FilterPanel filters={filters} setFilters={setFilters} data={data} currentClient={currentClient} />
            </div>
          )}
        </div>

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
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedData.map((item, index) => (
                  <VeilleCard key={startIndex + index} data={item} onViewMore={handleViewMore} />
              ))}
            </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 text-sm border rounded-md ${currentPage === 1 ? 'text-neutral-400 border-neutral-200' : 'text-neutral-700 border-neutral-300 hover:bg-neutral-50'}`}
                  >
                    Précédent
                  </button>
                  <div className="text-sm text-neutral-600">
                    Page {currentPage} / {totalPages}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 text-sm border rounded-md ${currentPage === totalPages ? 'text-neutral-400 border-neutral-200' : 'text-neutral-700 border-neutral-300 hover:bg-neutral-50'}`}
                  >
                    Suivant
                  </button>
                </div>
              )}
            </>
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

       {/* Modal sélection client */}
       <ClientSelectorModal
         isOpen={isClientModalOpen}
         onClose={() => setIsClientModalOpen(false)}
         onAuthenticated={(client) => {
           setCurrentClient({ id: client.id, name: client.name, slug: client.slug })
           setIsClientAuthenticated(true)
           try { localStorage.setItem('veille_client', JSON.stringify({ id: client.id, name: client.name, slug: client.slug })) } catch {}
           if (client.defaultFilters && typeof client.defaultFilters === 'object') {
             const df: any = client.defaultFilters
             const normalized = Array.isArray(df.activeFilters) ? df.activeFilters.map((f: any) => ({
               id: String(f.id || ''),
               type: String(f.type || ''),
               label: String(f.label || ''),
               field: String(f.field || ''),
               operator: String(f.operator || 'eq'),
               value: f.type === 'numeric' ? Number(f.value || 0) : String(f.value ?? '')
             })) : []
             setFilters({
               search: String(df.search || ''),
               activeFilters: normalized
             })
           }
         }}
       />
     </div>
   )
}
