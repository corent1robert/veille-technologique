import { NextResponse } from 'next/server'
import Airtable from 'airtable'

// Configuration Airtable (à remplacer par les vraies valeurs)
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || 'your_api_key_here'
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'your_base_id_here'
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'Table2'

// Debug des variables d'environnement
console.log('🔧 Configuration Airtable:')
console.log('- API_KEY:', AIRTABLE_API_KEY ? `${AIRTABLE_API_KEY.substring(0, 10)}...` : 'NON DÉFINI')
console.log('- BASE_ID:', AIRTABLE_BASE_ID)
console.log('- TABLE_NAME:', AIRTABLE_TABLE_NAME)

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID)

export async function GET() {
  try {
    console.log('🚀 Début de la récupération des données Airtable')
    
    // Récupération de tous les enregistrements (limite augmentée)
    const records = await base(AIRTABLE_TABLE_NAME).select({
      maxRecords: 100000, // Limite très élevée pour récupérer tous les articles
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

    // Filtrer seulement les articles avec titre vide
    const filteredRecords = records.filter(record => {
      const titre = record.fields['Titre']
      return titre && typeof titre === 'string' && titre.trim() !== ''
    })

    console.log(`🎯 Articles filtrés (avec titre valide): ${filteredRecords.length}`)

    const data = filteredRecords.map(record => {
      const fields = record.fields
      
      // Mapping des champs Airtable vers notre structure
      return {
        article: {
          url: fields['URL'] || '',
          titre: fields['Titre'] || '',
          description_courte: fields['Description Courte'] || '',
          description_longue: fields['Description Longue'] || '',
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
    })

    console.log(`🎉 Données transformées avec succès: ${data.length} articles`)
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des données Airtable:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération des données',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
        config: {
          hasApiKey: !!AIRTABLE_API_KEY,
          hasBaseId: !!AIRTABLE_BASE_ID,
          hasTableName: !!AIRTABLE_TABLE_NAME
        }
      },
      { status: 500 }
    )
  }
}
