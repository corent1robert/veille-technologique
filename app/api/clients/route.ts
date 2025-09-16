import { NextResponse } from 'next/server'
import Airtable from 'airtable'
import crypto from 'crypto'

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || 'your_api_key_here'
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'your_base_id_here'
const AIRTABLE_CLIENTS_TABLE = process.env.AIRTABLE_CLIENTS_TABLE || 'Clients'

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID)

export async function GET() {
  try {
    const records = await base(AIRTABLE_CLIENTS_TABLE).select({ pageSize: 100, view: 'Grid view' }).all()
    const items = records.map(r => ({
      id: r.id,
      name: (r.fields['Nom'] as string) || (r.fields['name'] as string) || '',
      slug: (r.fields['Slug'] as string) || (r.fields['slug'] as string) || ''
    }))
    return NextResponse.json({ items })
  } catch (e) {
    return NextResponse.json({ error: 'clients_fetch_failed', details: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { slug, password } = body || {}
    if (!slug || !password) {
      return NextResponse.json({ error: 'missing_params' }, { status: 400 })
    }
    const records = await base(AIRTABLE_CLIENTS_TABLE).select({ filterByFormula: `{Slug} = '${slug}'`, maxRecords: 1 }).all()
    if (records.length === 0) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }
    const rec = records[0]
    const hash = ((rec.fields['Hash MDP'] as string) || (rec.fields['hash_mdp'] as string) || (rec.fields['SHA256'] as string) || '').trim()
    const plain = ((rec.fields['Mot de passe'] as string) || (rec.fields['mot_de_passe'] as string) || (rec.fields['mdp'] as string) || (rec.fields['password'] as string) || (rec.fields['Password'] as string) || '').trim()
    const defaultFilters = (rec.fields['Filtres par défaut'] as string) || (rec.fields['filtres_par_défaut'] as string) || (rec.fields['default_filters'] as string) || ''

    let isValid = false
    const given = String(password).trim()
    if (hash) {
      const isHex64 = /^[a-f0-9]{64}$/i.test(hash)
      if (isHex64) {
        const computedHash = crypto.createHash('sha256').update(given).digest('hex')
        isValid = computedHash.toLowerCase() === hash.toLowerCase()
      } else {
        // Le champ hash_mdp contient en fait un mot de passe en clair
        isValid = given === hash
      }
    } else if (plain) {
      isValid = given === plain
    }
    if (!isValid) {
      // Debug non sensible en développement
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔐 Auth client échouée', {
          slug,
          hasHash: !!hash,
          hasPlain: !!plain,
          givenLength: given.length,
          hashPrefix: hash ? hash.slice(0, 8) : null
        })
      }
      return NextResponse.json({ error: 'invalid_password' }, { status: 401 })
    }
    // Mettre à jour la dernière connexion
    try {
      const lastLoginField = ['Dernière connexion', 'Derniere connexion', 'Dernière connection', 'Last Login', 'last_login', 'Derniere connexion (UTC)']
        .find(name => rec.fields[name] !== undefined) || 'Dernière connexion'
      await base(AIRTABLE_CLIENTS_TABLE).update([
        {
          id: rec.id,
          fields: {
            [lastLoginField]: new Date().toISOString()
          }
        }
      ])
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('⚠️ Impossible de mettre à jour la dernière connexion:', e instanceof Error ? e.message : String(e))
      }
    }

    return NextResponse.json({
      id: rec.id,
      name: (rec.fields['Nom'] as string) || '',
      slug,
      default_filters: defaultFilters
    })
  } catch (e) {
    return NextResponse.json({ error: 'clients_auth_failed', details: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { slug, password, default_filters } = body || {}
    if (!slug || !default_filters) {
      return NextResponse.json({ error: 'missing_params' }, { status: 400 })
    }
    const records = await base(AIRTABLE_CLIENTS_TABLE).select({ filterByFormula: `{Slug} = '${slug}'`, maxRecords: 1 }).all()
    if (records.length === 0) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }
    const rec = records[0]
    const hash = ((rec.fields['Hash MDP'] as string) || (rec.fields['hash_mdp'] as string) || (rec.fields['SHA256'] as string) || '').trim()
    const plain = ((rec.fields['Mot de passe'] as string) || (rec.fields['mot_de_passe'] as string) || (rec.fields['mdp'] as string) || (rec.fields['password'] as string) || (rec.fields['Password'] as string) || '').trim()
    // Auth simplifiée: si password fourni, vérifier; sinon, autoriser (cas usage interne)
    if (password !== undefined) {
      const given = String(password).trim()
      let isValid = false
      if (hash) {
        const isHex64 = /^[a-f0-9]{64}$/i.test(hash)
        if (isHex64) {
          const computedHash = crypto.createHash('sha256').update(given).digest('hex')
          isValid = computedHash.toLowerCase() === hash.toLowerCase()
        } else {
          isValid = given === hash
        }
      } else if (plain) {
        isValid = given === plain
      }
      if (!isValid) {
        return NextResponse.json({ error: 'invalid_password' }, { status: 401 })
      }
    }

    const filtersString = typeof default_filters === 'string' ? default_filters : JSON.stringify(default_filters)
    const fieldName = rec.fields['Filtres par défaut'] !== undefined
      ? 'Filtres par défaut'
      : (rec.fields['filtres_par_défaut'] !== undefined
        ? 'filtres_par_défaut'
        : 'default_filters')

    await base(AIRTABLE_CLIENTS_TABLE).update([
      {
        id: rec.id,
        fields: {
          [fieldName]: filtersString
        }
      }
    ])

    // Mettre à jour la date de dernière modification
    try {
      const lastUpdateField = ['Dernière modification', 'Derniere modification', 'Last Update', 'last_update', 'Updated At', 'updated_at']
        .find(name => rec.fields[name] !== undefined) || 'Dernière modification'
      await base(AIRTABLE_CLIENTS_TABLE).update([
        {
          id: rec.id,
          fields: {
            [lastUpdateField]: new Date().toISOString()
          }
        }
      ])
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('⚠️ Impossible de mettre à jour la dernière modification:', e instanceof Error ? e.message : String(e))
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'clients_patch_failed', details: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}


