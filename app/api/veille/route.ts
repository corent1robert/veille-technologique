import { NextResponse } from 'next/server'
import Airtable from 'airtable'

// Configuration Airtable (à remplacer par les vraies valeurs)
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || 'your_api_key_here'
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'your_base_id_here'
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'Table_2'
const AIRTABLE_CLIENTS_TABLE = process.env.AIRTABLE_CLIENTS_TABLE || 'Clients'

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID)

function normalizeLabel(input?: string): string {
  if (!input) return ''
  let x = String(input).trim().toLowerCase()
  x = x.normalize('NFD').replace(/[\u0300-\u036f]+/g, '')
  x = x.replace(/[_\-]+/g, ' ').replace(/\s+/g, ' ').trim()
  if (x === 'ia' || x === 'ai') x = 'intelligence artificielle'
  if (x === 'biotech') x = 'biotechnologie'
  if (x === 'etude' || x === 'etudes') x = 'étude'
  if (x === 'video') x = 'vidéo'
  if (x === 'news') x = 'article'
  return x
}

function groupCategory(label: string): string {
  const l = normalizeLabel(label)
  if (!l) return 'Autres'
  if (/actualite|actualité/.test(l)) return 'Actualité'
  if (/(fusion|acquisition|m&a|rachat|merger|acquisitions)/.test(l)) return 'Fusions & Acquisitions'
  if (/(levee de fonds|levée de fonds|financement|fundraising|serie [ab]|seed|capital risque|venture)/.test(l)) return 'Financement'
  if (/(partenariat|alliance|collaboration)/.test(l)) return 'Partenariats'
  if (/(reglementation|réglementation|conformite|compliance|norme|certification)/.test(l)) return 'Réglementation / Conformité'
  if (/(produit|lancement produit|nouveau produit|release)/.test(l)) return 'Produit / Lancement'
  if (/(r&d|recherche et developpement|recherche & developpement|recherche|developpement)/.test(l)) return 'R&D'
  if (/(appel d offres|marches publics|marchés publics|tender|procurement)/.test(l)) return 'Marchés publics'
  if (/(strategie|stratégie|gouvernance|restructuration)/.test(l)) return 'Stratégie / Gouvernance'
  if (/(evenement|événement|conference|salon|webinar)/.test(l)) return 'Événements'
  if (/sante|pharma|pharmaceutique|medical|medecine|médecine/.test(l)) return 'Santé / Pharma'
  if (/agro|alimentaire|agriculture|agri/.test(l)) return 'Agroalimentaire'
  if (/energie|énergies|energies|renouvelable|hydrogene|hydrogen/.test(l)) return 'Énergie'
  if (/transport|mobilite|automobile|aeronautique|aero/.test(l)) return 'Transport / Mobilité'
  if (/defense|défense|militaire|securite|sécurite/.test(l)) return 'Défense / Sécurité'
  if (/environnement|climat|recyclage|dechet|dechets|durable|soutenable|ecologie/.test(l)) return 'Environnement'
  if (/(construction|batiment|bim|chantier|btp)/.test(l)) return 'Construction / BTP'
  if (/education|enseignement|edtech|universite|éducation/.test(l)) return 'Éducation'
  if (/finance|banque|fintech|assurance|investissement/.test(l)) return 'Finance'
  if (/retail|commerce|e commerce|distribution/.test(l)) return 'Commerce / Retail'
  if (/spatial|espace|satellite/.test(l)) return 'Spatial'
  if (/(tic|it|numerique|informatique|digital|logiciel|software)/.test(l)) return 'Numérique / TIC'
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
  if (/(electronique|web|internet|telecom|telecommunications|bureautique)/.test(l)) return 'Numérique / TIC'
  if (/(manufacturing|fabrication|industrie manufacturiere|supply chain|logistique|usina|fonderie|plasturgie|procedes)/.test(l)) return 'Industrie'
  return 'Autres'
}

function groupTypologie(label?: string): string {
  const l = normalizeLabel(label || '')
  if (!l) return 'Autres'
  if (/(actualite|actualité|news|briefing|digest|br[eè]ve)/.test(l)) return 'Actualité'
  if (/(analyse|review|meta analyse|m[eé]ta analyse|synth[eè]se)/.test(l)) return 'Analyse'
  if (/(rapport|report|livre blanc|white paper)/.test(l)) return 'Rapport'
  if (/(etude|study|publication|paper|revue|recherche)/.test(l)) return 'Étude'
  if (/(annonce|nouvelle|lancement)/.test(l)) return 'Annonce'
  if (/(communique|press release)/.test(l)) return 'Communiqué'
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
  return 'Autres'
}

function groupZoneGeographique(label?: string): string {
  const l = normalizeLabel(label || '')
  if (!l) return 'Autres'
  if (/(europe|france|allemagne|italie|espagne|royaume uni|pays bas|belgique|suisse|autriche|suede|norvege|danemark|finlande|pologne|republique tcheque|hongrie|portugal|grece|irlande|luxembourg|slovaquie|slovenie|croatie|roumanie|bulgarie|lituanie|lettonie|estonie|malte|chypre)/.test(l)) return 'Europe'
  if (/(amerique du nord|etats unis|canada|usa|us|amerique du nord)/.test(l)) return 'Amérique du Nord'
  if (/(asie|chine|japon|coree du sud|inde|singapour|hong kong|taiwan|thailande|vietnam|malaisie|indonesie|philippines|asie est|asie sud|asie du sud)/.test(l)) return 'Asie'
  if (/(amerique du sud|bresil|argentine|chili|colombie|perou|uruguay|paraguay|bolivie|equateur|venezuela)/.test(l)) return 'Amérique du Sud'
  if (/(afrique|afrique du sud|egypte|maroc|tunisie|algerie|nigeria|kenya|ghana|afrique nord)/.test(l)) return 'Afrique'
  if (/(oceanie|australie|nouvelle zelande)/.test(l)) return 'Océanie'
  if (/(moyen orient|israel|emirats arabes unis|arabie saoudite|turquie|iran)/.test(l)) return 'Moyen-Orient'
  if (/(international|global|mondial|multi pays|internationale)/.test(l)) return 'International'
  return 'Autres'
}

function groupMateriau(label?: string): string {
  const l = normalizeLabel(label || '')
  if (!l) return 'Autres'
  if (/(polymere|plastique|polyethylene|polypropylene|pvc|pet|resine|elastomere|caoutchouc|silicone|polyurethane|acrylique|nylon|polyester|polycarbonate|polystyrene|abs|pmma)/.test(l)) return 'Polymères'
  if (/(metal|acier|aluminium|titane|cuivre|zinc|nickel|chrome|fer|alliage|bronze|laiton|inox|acier inoxydable|magnesium|plomb|etain)/.test(l)) return 'Métaux'
  if (/(ceramique|porcelaine|faience|gres|terre cuite|brique|carrelage|ciment|beton|chaux|platre|gypse)/.test(l)) return 'Céramiques'
  if (/(composite|fibre de verre|fibre de carbone|kevlar|aramide|bois|bambou|liege|composite bois plastique|wpc)/.test(l)) return 'Composites'
  if (/(textile|coton|laine|soie|lin|chanvre|jute|polyester textile|nylon textile|fibre naturelle|fibre synthetique)/.test(l)) return 'Textiles'
  if (/(verre|cristal|verre borosilicaté|verre trempe|verre feuilleté|verre optique)/.test(l)) return 'Verres'
  if (/(papier|carton|carton ondule|papier recycle|cellulose|pate a papier)/.test(l)) return 'Papier/Carton'
  return 'Autres'
}

function groupLogiciel(label?: string): string {
  const l = normalizeLabel(label || '')
  if (!l) return 'Autres'
  if (/(cao|fao|solidworks|autocad|fusion 360|inventor|catia|nx|creo|rhino|sketchup|freecad|openscad|blender|maya|3ds max|cad|cam)/.test(l)) return 'CAO/FAO'
  if (/(simulation|ansys|comsol|abaqus|ls dyna|fluent|cfd|fea|modelisation|calcul|analyse)/.test(l)) return 'Simulation'
  if (/(sap|oracle|microsoft dynamics|salesforce|erp|crm|plm|mes|wms|gestion|management)/.test(l)) return 'Gestion'
  if (/(tensorflow|pytorch|scikit learn|keras|opencv|machine learning|deep learning|intelligence artificielle|ia|ml|neural network|cnn|rnn)/.test(l)) return 'IA/ML'
  if (/(python|r|matlab|julia|c\+\+|java|javascript|node\.js|react|vue|angular|developpement|programmation|code)/.test(l)) return 'Développement'
  if (/(tableau|power bi|qlik|looker|jupyter|rstudio|spss|sas|analyse|data|big data|analytics|bi)/.test(l)) return 'Analyse de données'
  return 'Autres'
}

function groupTechnologie(label?: string): string {
  const l = normalizeLabel(label || '')
  if (!l) return 'Autres'
  // Familles normalisées AM (ISO/ASTM 52900)
  if (/(extrusion de matiere|fused filament|fff|fdm|direct ink writing|diw|material extrusion)/.test(l)) return 'Extrusion de matière'
  if (/(photopolymerisation|sla|dlp|msla|stereolithographie|lithography)/.test(l)) return 'Photopolymérisation'
  if (/(fusion sur lit de poudre polymere|pbf p|sls|selective laser sintering|polymer powder bed)/.test(l)) return 'Fusion sur lit de poudre polymère'
  if (/(fusion sur lit de poudre metal|pbf m|l pbf|l\-pbf|e pbf|e\-pbf|slm|dmls|ebm|laser powder bed|electron beam)/.test(l)) return 'Fusion sur lit de poudre métal'
  if (/(jet de matiere|material jetting|polyjet|mjp)/.test(l)) return 'Jet de matière'
  if (/(jet de liant|binder jetting|binderjet)/.test(l)) return 'Jet de liant'
  if (/(depot de fil metallique|wire arc am|waam|cold spray|csam|directed energy deposition|ded|laser metal deposition|lmd|clad|depôt energetique dirige)/.test(l)) return 'Dépôt d’énergie dirigée'
  if (/(stratification de feuilles|laminated object manufacturing|lom|sheet lamination)/.test(l)) return 'Stratification de feuilles'
  if (/(bio impression|bioprint)/.test(l)) return 'Bio-impression'
  if (/(impression 3d beton|beton|construction printing|concrete)/.test(l)) return 'Impression 3D Béton'
  if (/(injection molding|moulage par injection|thermoforming|formage thermique)/.test(l)) return 'Procédé conventionnel associé'
  if (/(scan 3d|scannage|3d scanning|metrologie|metrology)/.test(l)) return 'Numérisation / Métrologie'
  // Par défaut, renvoyer libellé capitalisé simple
  return label || 'Autres'
}

function groupPaysSource(label?: string): string {
  const l = normalizeLabel(label || '')
  if (!l) return 'Autres'
  if (/(france|allemagne|italie|espagne|royaume uni|pays bas|belgique|suisse|autriche|suede|norvege|danemark|finlande|pologne|republique tcheque|hongrie|portugal|grece|irlande|luxembourg|slovaquie|slovenie|croatie|roumanie|bulgarie|lituanie|lettonie|estonie|malte|chypre)/.test(l)) return 'Europe'
  if (/(etats unis|canada|usa|us|amerique du nord)/.test(l)) return 'Amérique du Nord'
  if (/(chine|japon|coree du sud|inde|singapour|hong kong|taiwan|thailande|vietnam|malaisie|indonesie|philippines)/.test(l)) return 'Asie'
  if (/(bresil|argentine|chili|colombie|perou|uruguay|paraguay|bolivie|equateur|venezuela)/.test(l)) return 'Amérique du Sud'
  if (/(afrique du sud|egypte|maroc|tunisie|algerie|nigeria|kenya|ghana)/.test(l)) return 'Afrique'
  if (/(australie|nouvelle zelande)/.test(l)) return 'Océanie'
  if (/(israel|emirats arabes unis|arabie saoudite|turquie|iran)/.test(l)) return 'Moyen-Orient'
  if (/(international|global|mondial|multi pays)/.test(l)) return 'International'
  return 'Autres'
}

function groupTypologieSource(label?: string): string {
  const l = normalizeLabel(label || '')
  if (!l) return 'Autres'
  if (/(nature|science|cell|pnas|journal of|review|research|scientific|academic|peer reviewed|revue scientifique|publication scientifique)/.test(l)) return 'Revues scientifiques'
  if (/(techcrunch|wired|mit technology review|ieee spectrum|presse|magazine|journal|media|presse specialisee)/.test(l)) return 'Presse spécialisée'
  if (/(mit|stanford|harvard|cnrs|inria|universite|laboratoire|institut|centre de recherche|institution|organisme)/.test(l)) return 'Institutions'
  if (/(google|microsoft|apple|tesla|startup|entreprise|corporation|company|firm|societe)/.test(l)) return 'Entreprises'
  if (/(gouvernement|ministere|agence|commission|autorite|etat|public|administration)/.test(l)) return 'Gouvernements'
  if (/(onu|unesco|oms|ocde|organisation|association|fondation|ong|international)/.test(l)) return 'Organisations'
  return 'Autres'
}

function mapRecordToData(record: any) {
      const fields = record.fields
      return {
        article: {
      url: fields['URL'] || fields['Url'] || fields['url'] || '',
      titre: fields['Titre'] || fields['Titre article'] || fields['title'] || fields['Title'] || fields['Nom'] || fields['name'] || '',
          description_courte: fields['Description Courte'] || '',
          description_longue: fields['Description Longue'] || '',
      image_url: (Array.isArray(fields['Image']) && fields['Image'][0]?.url) || fields['Image'] || fields['image_url'] || '',
          mots_cles: Array.isArray(fields['Mots cles']) ? fields['Mots cles'] : 
                    typeof fields['Mots cles'] === 'string' ? [fields['Mots cles']] : [],
          categorie: Array.isArray(fields['Categorie']) ? fields['Categorie'].map(groupCategory) : 
                    typeof fields['Categorie'] === 'string' ? [groupCategory(fields['Categorie'])] : [],
      date_publication: fields['date publication'] || fields['Date publication'] || fields['Date'] || fields['date'] || '',
          auteur: fields['Auteur'] || '',
          source: fields['Nom de la source'] || '',
          entreprises_citees: Array.isArray(fields['Entreprises citées']) ? fields['Entreprises citées'] : 
                            typeof fields['Entreprises citées'] === 'string' ? [fields['Entreprises citées']] : [],
          citations: Array.isArray(fields['Citation (lien dans l\'article)']) ? fields['Citation (lien dans l\'article)'] : 
                    typeof fields['Citation (lien dans l\'article)'] === 'string' ? [fields['Citation (lien dans l\'article)']] : [],
          pays_source: groupPaysSource(fields['Pays source']),
          zone_geographique: groupZoneGeographique(fields['Zone geographique']),
          typologie_source: groupTypologieSource(fields['Typologie de source']),
          typologie_contenu: groupTypologie(fields['Typologie de contenu'])
        },
        evaluation: {
          pertinence: fields['Pertinence'] || fields['pertinence'] || 0,
          pertinence_explication: fields['Pertinence_explication'] || fields['Pertinence explication'] || fields['pertinence_explication'] || '',
          fiabilite: fields['Fiabilite'] || fields['fiabilite'] || 0,
          fiabilite_explication: fields['Fiabilite_explication'] || fields['Fiabilite explication'] || fields['fiabilite_explication'] || ''
        },
        analyse_technique: {
          materiau: groupMateriau(fields['Materiau'] || fields['materiau']),
          technologie: groupTechnologie(fields['Technologie'] || fields['technologie']),
          logiciel: groupLogiciel(fields['Logiciel'] || fields['logiciel'])
        },
        innovation: {
          estimation_TRL: fields['Estimation TRL'] || fields['estimation_TRL'] || '',
          numero_TRL: fields['Numero TRL'] || fields['numero_TRL'] || 0,
          explication_TRL: fields['Explication TRL'] || fields['explication_TRL'] || '',
          projection_TRL: fields['Projection TRL'] || fields['projection_TRL'] || '',
          application_secteur: Array.isArray(fields['Application secteur']) ? fields['Application secteur'] : 
                              Array.isArray(fields['application_secteur']) ? fields['application_secteur'] : 
                              typeof fields['Application secteur'] === 'string' ? [fields['Application secteur']] : 
                              typeof fields['application_secteur'] === 'string' ? [fields['application_secteur']] : []
        },
        metadata: {
          date_traitement: fields['Date traitement'] || fields['date_traitement'] || '',
          version_analyse: fields['Version analyse'] || fields['version_analyse'] || '',
          sources_consolidees: Array.isArray(fields['Sources consolidees']) ? fields['Sources consolidees'] : 
                              Array.isArray(fields['sources_consolidees']) ? fields['sources_consolidees'] : 
                              typeof fields['Sources consolidees'] === 'string' ? [fields['Sources consolidees']] : 
                              typeof fields['sources_consolidees'] === 'string' ? [fields['sources_consolidees']] : [],
          qualite_donnees: fields['Qualite donnees'] || fields['qualite_donnees'] || 0,
          confiance_analyse: fields['Confiance analyse'] || fields['confiance_analyse'] || 0,
          resume_executif: fields['Resume executif'] || fields['resume_executif'] || '',
          tags_principaux: Array.isArray(fields['Tags principaux']) ? fields['Tags principaux'] : 
                          Array.isArray(fields['tags_principaux']) ? fields['tags_principaux'] : 
                          typeof fields['Tags principaux'] === 'string' ? [fields['Tags principaux']] : 
                          typeof fields['tags_principaux'] === 'string' ? [fields['tags_principaux']] : [],
          priorite_veille: fields['Priorite veille'] || fields['priorite_veille'] || 0
        }
      }
}
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const forceRefresh = searchParams.get('t') // Timestamp pour forcer le refresh
    const limitParam = searchParams.get('limit')
    const offsetParam = searchParams.get('offset')
    const clientsOnly = searchParams.get('clients') === '1'
    // Airtable REST: pageSize maximum = 100
    const pageSize = Math.min(Math.max(parseInt(limitParam || '0', 10) || 0, 1), 100)
    
    console.log('🚀 Début de la récupération des données Airtable')
    if (forceRefresh) {
      console.log(`🔄 Refresh forcé demandé à ${new Date(parseInt(forceRefresh)).toLocaleTimeString()}`)
    }
    
    // Endpoint secondaire: liste des clients (léger)
    if (clientsOnly) {
      const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_CLIENTS_TABLE)}`)
      url.searchParams.set('pageSize', '100')
      const airtableResp = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
      })
      if (!airtableResp.ok) {
        throw new Error(`Airtable REST error ${airtableResp.status}`)
      }
      const json = await airtableResp.json()
      const items = (json.records || []).map((r: any) => ({
        id: r.id,
        name: r.fields['Nom'] || r.fields['name'] || '',
        slug: r.fields['Slug'] || r.fields['slug'] || '',
        default_filters: r.fields['Filtres par défaut'] || r.fields['default_filters'] || ''
      }))
      return NextResponse.json({ items })
    }

    // Si on demande une pagination côté API, on passe par l'API REST d'Airtable (offset supporté)
    if (pageSize && pageSize > 0) {
      const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`)
      url.searchParams.set('pageSize', String(pageSize))
      url.searchParams.set('view', 'Grid view')
      if (offsetParam) url.searchParams.set('offset', offsetParam)

      const airtableResp = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
      })
      if (!airtableResp.ok) {
        throw new Error(`Airtable REST error ${airtableResp.status}`)
      }
      const json = await airtableResp.json()
      const records = json.records || []

      console.log(`✅ Page Airtable récupérée: ${records.length} enregistrements, offset suivant: ${json.offset || 'none'}`)

      const mapped = records
        .filter((record: any) => {
          const titre = record.fields['Titre'] || record.fields['Titre article'] || record.fields['title'] || record.fields['Title'] || record.fields['Nom'] || record.fields['name']
          return titre && typeof titre === 'string' && String(titre).trim() !== ''
        })
        .map((record: any) => {
          const it = mapRecordToData(record)
          // Normalisation / regroupement au niveau API
          const rawCats = Array.isArray(it.article?.categorie) ? it.article?.categorie : (it.article?.categorie ? [it.article?.categorie] : [])
          const splitCats = rawCats.flatMap((c: any) => String(c).split(/[,/]|\u00B7|\||;|\s{2,}/)).map((s: string) => s.trim()).filter(Boolean)
          const groupedCats = Array.from(new Set(splitCats.map(groupCategory)))
          const groupedTypo = groupTypologie(it.article?.typologie_contenu)
          return {
            ...it,
            article: {
              ...it.article,
              categorie: groupedCats,
              typologie_contenu: groupedTypo
            }
          }
        })

      const headers = new Headers({
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Last-Updated': new Date().toISOString(),
        'X-Articles-Count': mapped.length.toString()
      })

      // Toujours renvoyer items, même si vide; nextOffset si présent
      return new NextResponse(JSON.stringify({ items: mapped, nextOffset: json.offset || null }), {
        status: 200,
        headers
      })
    }

    // Sinon: récupération de tous les enregistrements (mode legacy)
    const records = await base(AIRTABLE_TABLE_NAME).select({
      maxRecords: 100000,
      view: 'Grid view'
    }).all()

    console.log(`✅ Total des enregistrements récupérés: ${records.length}`)

    // Debug: afficher la structure du premier enregistrement
    if (records.length > 0) {
      console.log('📋 Structure du premier enregistrement:')
      console.log('Champs disponibles:', Object.keys(records[0].fields))
      console.log('Premier titre trouvé:', records[0].fields['Titre'] || 'AUCUN TITRE')
      
      // Debug spécifique pour les champs d'évaluation
      console.log('🔍 Champs d\'évaluation disponibles:')
      console.log('- Pertinence:', records[0].fields['Pertinence'])
      console.log('- Pertinence_explication:', records[0].fields['Pertinence_explication'])
      console.log('- Fiabilite:', records[0].fields['Fiabilite'])
      console.log('- Fiabilite_explication:', records[0].fields['Fiabilite_explication'])
    } else {
      console.log('⚠️ Aucun enregistrement trouvé - Vérifiez la configuration Airtable')
    }

    // Filtrer seulement les articles avec titre valide
    const filteredRecords = records.filter(record => {
      const titre = record.fields['Titre']
      return titre && typeof titre === 'string' && titre.trim() !== ''
    })

    console.log(`🎯 Articles filtrés (avec titre valide): ${filteredRecords.length}`)

    const data = filteredRecords.map(mapRecordToData)

    console.log(`🎉 Données transformées avec succès: ${data.length} articles`)
    
    // Headers pour contrôler le cache
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Last-Updated': new Date().toISOString(),
      'X-Articles-Count': data.length.toString()
    })
    
    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers
    })
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des données Airtable:', error)
    
    const errorResponse = {
      error: 'Erreur lors de la récupération des données',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
      config: {
        hasApiKey: !!AIRTABLE_API_KEY,
        hasBaseId: !!AIRTABLE_BASE_ID,
        hasTableName: !!AIRTABLE_TABLE_NAME
      },
      timestamp: new Date().toISOString()
    }
    
    return new NextResponse(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  }
}
