// Script de test pour vérifier la configuration des variables d'environnement
require('dotenv').config()

console.log('🔧 Test de configuration des variables d\'environnement')
console.log('==================================================')

// Variables Airtable
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME

console.log('📊 Variables Airtable:')
console.log(`- AIRTABLE_API_KEY: ${AIRTABLE_API_KEY ? '✅ DÉFINI' : '❌ NON DÉFINI'}`)
if (AIRTABLE_API_KEY) {
  console.log(`  Valeur: ${AIRTABLE_API_KEY.substring(0, 10)}...`)
}
console.log(`- AIRTABLE_BASE_ID: ${AIRTABLE_BASE_ID ? '✅ DÉFINI' : '❌ NON DÉFINI'}`)
if (AIRTABLE_BASE_ID) {
  console.log(`  Valeur: ${AIRTABLE_BASE_ID}`)
}
console.log(`- AIRTABLE_TABLE_NAME: ${AIRTABLE_TABLE_NAME ? '✅ DÉFINI' : '❌ NON DÉFINI'}`)
if (AIRTABLE_TABLE_NAME) {
  console.log(`  Valeur: ${AIRTABLE_TABLE_NAME}`)
}

console.log('\n🌐 Variables Next.js:')
console.log(`- NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL || '❌ NON DÉFINI'}`)

console.log('\n📋 Résumé:')
if (AIRTABLE_API_KEY && AIRTABLE_BASE_ID && AIRTABLE_TABLE_NAME) {
  console.log('✅ Configuration complète - Prêt pour la production')
} else {
  console.log('❌ Configuration incomplète - Vérifiez vos variables d\'environnement')
  
  if (!AIRTABLE_API_KEY) {
    console.log('  - AIRTABLE_API_KEY manquant')
  }
  if (!AIRTABLE_BASE_ID) {
    console.log('  - AIRTABLE_BASE_ID manquant')
  }
  if (!AIRTABLE_TABLE_NAME) {
    console.log('  - AIRTABLE_TABLE_NAME manquant')
  }
}

console.log('\n💡 Pour configurer en production (Vercel):')
console.log('1. Allez sur votre dashboard Vercel')
console.log('2. Sélectionnez votre projet')
console.log('3. Allez dans Settings > Environment Variables')
console.log('4. Ajoutez les variables manquantes')
console.log('5. Redéployez votre application')
