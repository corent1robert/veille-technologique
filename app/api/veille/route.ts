import { NextResponse } from 'next/server'
import Airtable from 'airtable'

// Configuration Airtable (à remplacer par les vraies valeurs)
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || 'your_api_key_here'
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'your_base_id_here'
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'Table_2'
const AIRTABLE_CLIENTS_TABLE = process.env.AIRTABLE_CLIENTS_TABLE || 'Clients'

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID)

function mapRecordToData(record: any) {
  const fields = record.fields
  return {
    article: {
      url: fields['URL'] || '',
      titre: fields['Titre'] || '',
      description_courte: fields['Description Courte'] || '',
      description_longue: fields['Description Longue'] || '',
      image_url: (Array.isArray(fields['Image']) && fields['Image'][0]?.url) || fields['Image'] || fields['image_url'] || '',
      mots_cles: Array.isArray(fields['Mots cles']) ? fields['Mots cles'] :
                typeof fields['Mots cles'] === 'string' ? [fields['Mots cles']] : [],
      categorie: Array.isArray(fields['Categorie']) ? fields['Categorie'] :
                typeof fields['Categorie'] === 'string' ? [fields['Categorie']] : [],
      date_publication: fields['date publication'] || '',
      auteur: fields['Auteur'] || '',
      source: fields['Nom de la source'] || '',
      entreprises_citees: Array.isArray(fields['Entreprises citées']) ? fields['Entreprises citées'] :
                        typeof fields['Entreprises citées'] === 'string' ? [fields['Entreprises citées']] : [],
      citations: Array.isArray(fields['Citation (lien dans l\'article)']) ? fields['Citation (lien dans l\'article)'] :
                typeof fields['Citation (lien dans l\'article)'] === 'string' ? [fields['Citation (lien dans l\'article)']] : [],
      pays_source: fields['Pays source'] || '',
      zone_geographique: fields['Zone geographique'] || '',
      typologie_source: fields['Typologie de source'] || '',
      typologie_contenu: fields['Typologie de contenu'] || ''
    },
    evaluation: {
      pertinence: fields['Pertinence'] || fields['pertinence'] || 0,
      pertinence_explication: fields['Pertinence_explication'] || fields['Pertinence explication'] || fields['pertinence_explication'] || '',
      fiabilite: fields['Fiabilite'] || fields['fiabilite'] || 0,
      fiabilite_explication: fields['Fiabilite_explication'] || fields['Fiabilite explication'] || fields['fiabilite_explication'] || ''
    },
    analyse_technique: {
      materiau: fields['Materiau'] || fields['materiau'] || '',
      technologie: fields['Technologie'] || fields['technologie'] || '',
      logiciel: fields['Logiciel'] || fields['logiciel'] || ''
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
          const titre = record.fields['Titre']
          return titre && typeof titre === 'string' && titre.trim() !== ''
        })
        .map((record: any) => mapRecordToData(record))

      const headers = new Headers({
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Last-Updated': new Date().toISOString(),
        'X-Articles-Count': mapped.length.toString()
      })

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
