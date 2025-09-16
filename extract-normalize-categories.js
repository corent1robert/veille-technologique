#!/usr/bin/env node
// Extraction et normalisation basique des catégories depuis l'API locale
// Usage: node extract-normalize-categories.js [BASE_URL]
// Exemple: node extract-normalize-categories.js http://localhost:3000

const fs = require('fs/promises')

const BASE_URL = process.argv[2] || process.env.BASE_URL || 'http://localhost:3000'
const PAGE_SIZE = 100

async function fetchAllArticles() {
  const items = []
  let offset = undefined
  let page = 0
  while (true) {
    const url = new URL('/api/veille', BASE_URL)
    url.searchParams.set('limit', String(PAGE_SIZE))
    if (offset) url.searchParams.set('offset', offset)
    const res = await fetch(url.toString())
    if (!res.ok) {
      throw new Error(`API error ${res.status} on ${url}`)
    }
    const json = await res.json()
    const batch = Array.isArray(json.items) ? json.items : Array.isArray(json) ? json : []
    items.push(...batch)
    offset = json.nextOffset || null
    page += 1
    if (!offset) break
  }
  return items
}

function ensureArray(value) {
  if (Array.isArray(value)) return value
  if (value === undefined || value === null) return []
  return [value]
}

function normalizeLabel(label) {
  if (!label || typeof label !== 'string') return ''
  let s = label.trim().toLowerCase()
  s = s.normalize('NFD').replace(/\p{Diacritic}+/gu, '') // remove accents
  s = s.replace(/[_\-]+/g, ' ')
  s = s.replace(/\s+/g, ' ').trim()
  // synonymes simples (exemples de base à enrichir)
  const synonyms = new Map([
    ['ia', 'intelligence artificielle'],
    ['ai', 'intelligence artificielle'],
    ['biotech', 'biotechnologie'],
    ['etude', 'étude'],
    ['etudes', 'étude'],
    ['video', 'vidéo'],
    ['news', 'article'],
  ])
  if (synonyms.has(s)) s = synonyms.get(s)
  return s
}

function aggregate(items) {
  const buckets = {
    'article.categorie': new Map(),
    'article.typologie_contenu': new Map(),
    'article.typologie_source': new Map(),
    'innovation.application_secteur': new Map(),
    'article.pays_source': new Map(),
    'article.zone_geographique': new Map(),
    'analyse_technique.materiau': new Map(),
    'analyse_technique.technologie': new Map(),
    'analyse_technique.logiciel': new Map(),
    'metadata.tags_principaux': new Map()
  }

  function addToBucket(bucket, raw) {
    const n = normalizeLabel(raw)
    if (!n) return
    const entry = bucket.get(n) || { normalized: n, count: 0, originals: new Map() }
    entry.count += 1
    entry.originals.set(raw, (entry.originals.get(raw) || 0) + 1)
    bucket.set(n, entry)
  }

  for (const it of items) {
    const art = it.article || {}
    const inn = it.innovation || {}
    const at = it.analyse_technique || {}
    const meta = it.metadata || {}

    ensureArray(art.categorie).forEach(v => addToBucket(buckets['article.categorie'], String(v)))
    if (art.typologie_contenu) addToBucket(buckets['article.typologie_contenu'], String(art.typologie_contenu))
    if (art.typologie_source) addToBucket(buckets['article.typologie_source'], String(art.typologie_source))
    ensureArray(inn.application_secteur).forEach(v => addToBucket(buckets['innovation.application_secteur'], String(v)))
    if (art.pays_source) addToBucket(buckets['article.pays_source'], String(art.pays_source))
    if (art.zone_geographique) addToBucket(buckets['article.zone_geographique'], String(art.zone_geographique))
    if (at.materiau) addToBucket(buckets['analyse_technique.materiau'], String(at.materiau))
    if (at.technologie) addToBucket(buckets['analyse_technique.technologie'], String(at.technologie))
    if (at.logiciel) addToBucket(buckets['analyse_technique.logiciel'], String(at.logiciel))
    ensureArray(meta.tags_principaux).forEach(v => addToBucket(buckets['metadata.tags_principaux'], String(v)))
  }

  function toSortedArray(map) {
    return Array.from(map.values())
      .map(e => ({
        normalized: e.normalized,
        count: e.count,
        originals: Array.from(e.originals.entries()).sort((a, b) => b[1] - a[1])
      }))
      .sort((a, b) => b.count - a.count)
  }

  const normalized = {}
  for (const key of Object.keys(buckets)) {
    normalized[key] = toSortedArray(buckets[key])
  }
  return normalized
}

async function main() {
  console.log(`➡️  Extraction depuis ${BASE_URL} ...`)
  const items = await fetchAllArticles()
  console.log(`✅ ${items.length} articles récupérés`)
  const normalized = aggregate(items)

  await fs.writeFile('categories_raw.json', JSON.stringify({ count: items.length, fields: normalized }, null, 2), 'utf8')
  console.log('📝 Écrit: categories_raw.json')

  // Proposer des "grandes catégories" pour article.categorie par exemple
  const topCategories = (normalized['article.categorie'] || []).slice(0, 200)
  const proposal = topCategories.map(x => ({ from: x.originals[0]?.[0] || x.normalized, to: x.normalized }))
  await fs.writeFile('categories_normalized_proposal.json', JSON.stringify({ proposal, guideline: 'Modifiez to selon vos regroupements souhaités' }, null, 2), 'utf8')
  console.log('🧭 Écrit: categories_normalized_proposal.json')
}

main().catch(err => {
  console.error('❌ Erreur:', err)
  process.exit(1)
})


