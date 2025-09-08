const fs = require('fs');
const path = require('path');

// Chemin vers le blueprint
const blueprintPath = path.join(__dirname, 'Veille Technologique - Pipeline Complet.blueprint.json');

console.log('🔧 Correction des IDs en double dans le blueprint Make.com...');

try {
  // Lire le fichier blueprint
  const blueprintContent = fs.readFileSync(blueprintPath, 'utf8');
  const blueprint = JSON.parse(blueprintContent);
  
  console.log('📊 Analyse du blueprint...');
  
  // Trouver tous les IDs utilisés
  const usedIds = new Set();
  const duplicateIds = new Map();
  
  // Fonction récursive pour parcourir tous les objets
  function findIds(obj, path = '') {
    if (obj && typeof obj === 'object') {
      if (obj.id !== undefined && typeof obj.id === 'number') {
        const id = obj.id;
        if (usedIds.has(id)) {
          if (!duplicateIds.has(id)) {
            duplicateIds.set(id, []);
          }
          duplicateIds.get(id).push(path);
        }
        usedIds.add(id);
      }
      
      // Parcourir récursivement
      for (const [key, value] of Object.entries(obj)) {
        if (value && typeof value === 'object') {
          findIds(value, `${path}.${key}`);
        }
      }
    }
  }
  
  findIds(blueprint);
  
  console.log(`📋 IDs uniques trouvés: ${usedIds.size}`);
  console.log(`⚠️  IDs en double: ${duplicateIds.size}`);
  
  // Afficher les IDs en double
  for (const [id, paths] of duplicateIds) {
    console.log(`   ID ${id} trouvé dans: ${paths.join(', ')}`);
  }
  
  // Générer de nouveaux IDs uniques
  let nextId = Math.max(...usedIds) + 1;
  const idMapping = new Map();
  
  // Fonction pour remplacer les IDs en double
  function fixDuplicateIds(obj, path = '') {
    if (obj && typeof obj === 'object') {
      if (obj.id !== undefined && typeof obj.id === 'number') {
        const id = obj.id;
        if (duplicateIds.has(id)) {
          const paths = duplicateIds.get(id);
          const currentPath = path;
          
          // Vérifier si c'est le premier ou un doublon
          if (paths[0] === currentPath) {
            // Garder le premier
            console.log(`✅ Garder ID ${id} dans ${currentPath}`);
          } else {
            // Remplacer le doublon
            const newId = nextId++;
            idMapping.set(`${currentPath}:${id}`, newId);
            obj.id = newId;
            console.log(`🔄 Remplacer ID ${id} par ${newId} dans ${currentPath}`);
          }
        }
      }
      
      // Parcourir récursivement
      for (const [key, value] of Object.entries(obj)) {
        if (value && typeof value === 'object') {
          fixDuplicateIds(value, `${path}.${key}`);
        }
      }
    }
  }
  
  console.log('\n🔧 Correction des IDs en double...');
  fixDuplicateIds(blueprint);
  
  // Sauvegarder le blueprint corrigé
  const fixedBlueprintPath = path.join(__dirname, 'Veille Technologique - Pipeline Complet - CORRIGE.blueprint.json');
  fs.writeFileSync(fixedBlueprintPath, JSON.stringify(blueprint, null, 2), 'utf8');
  
  console.log(`\n✅ Blueprint corrigé sauvegardé dans: ${fixedBlueprintPath}`);
  console.log(`📊 Résumé des corrections:`);
  console.log(`   - IDs uniques: ${usedIds.size}`);
  console.log(`   - IDs corrigés: ${idMapping.size}`);
  console.log(`   - Prochain ID disponible: ${nextId}`);
  
  // Afficher le mapping des IDs
  if (idMapping.size > 0) {
    console.log('\n🔄 Mapping des IDs corrigés:');
    for (const [path, newId] of idMapping) {
      console.log(`   ${path} → ${newId}`);
    }
  }
  
} catch (error) {
  console.error('❌ Erreur lors de la correction:', error.message);
  process.exit(1);
}
