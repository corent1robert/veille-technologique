const fs = require('fs');
const path = require('path');

// Chemin vers le blueprint original
const blueprintPath = path.join(__dirname, 'Veille Technologique - Pipeline Complet.blueprint.json');

console.log('🔧 Correction intelligente des références dans le blueprint Make.com...');

try {
  // Lire le fichier blueprint original
  const blueprintContent = fs.readFileSync(blueprintPath, 'utf8');
  const blueprint = JSON.parse(blueprintContent);
  
  console.log('📊 Analyse du blueprint original...');
  
  // Trouver tous les IDs et leurs références
  const idReferences = new Map(); // ID -> [paths]
  const pathToId = new Map(); // path -> ID
  const connections = new Map(); // moduleId -> [referencedIds]
  
  // Fonction récursive pour parcourir tous les objets
  function analyzeBlueprint(obj, path = '') {
    if (obj && typeof obj === 'object') {
      // Enregistrer l'ID et son chemin
      if (obj.id !== undefined && typeof obj.id === 'number') {
        const id = obj.id;
        if (!idReferences.has(id)) {
          idReferences.set(id, []);
        }
        idReferences.get(id).push(path);
        pathToId.set(path, id);
      }
      
      // Analyser les connexions (flow, routes, etc.)
      if (obj.flow && Array.isArray(obj.flow)) {
        obj.flow.forEach((item, index) => {
          if (item && item.id !== undefined) {
            const currentPath = `${path}.flow.${index}`;
            analyzeBlueprint(item, currentPath);
          }
        });
      }
      
      if (obj.routes && Array.isArray(obj.routes)) {
        obj.routes.forEach((route, index) => {
          if (route && route.flow) {
            const currentPath = `${path}.routes.${index}`;
            analyzeBlueprint(route, currentPath);
          }
        });
      }
      
      // Parcourir récursivement les autres propriétés
      for (const [key, value] of Object.entries(obj)) {
        if (value && typeof value === 'object' && key !== 'flow' && key !== 'routes') {
          analyzeBlueprint(value, `${path}.${key}`);
        }
      }
    }
  }
  
  analyzeBlueprint(blueprint);
  
  console.log(`📋 IDs trouvés: ${idReferences.size}`);
  
  // Identifier les IDs en double
  const duplicateIds = new Map();
  for (const [id, paths] of idReferences) {
    if (paths.length > 1) {
      duplicateIds.set(id, paths);
      console.log(`⚠️  ID ${id} dupliqué dans: ${paths.length} chemins`);
    }
  }
  
  // Identifier le chemin principal (le premier de chaque ID)
  const mainPaths = new Map();
  for (const [id, paths] of duplicateIds) {
    mainPaths.set(id, paths[0]); // Garder le premier chemin
  }
  
  console.log('\n🔧 Correction des références...');
  
  // Fonction pour corriger les références
  function fixReferences(obj, path = '', isMainPath = false) {
    if (obj && typeof obj === 'object') {
      // Si c'est un doublon et qu'on n'est pas sur le chemin principal, changer l'ID
      if (obj.id !== undefined && typeof obj.id === 'number') {
        const id = obj.id;
        if (duplicateIds.has(id)) {
          const mainPath = mainPaths.get(id);
          if (path !== mainPath) {
            // C'est un doublon, générer un nouvel ID
            const newId = Math.max(...Array.from(idReferences.keys())) + 1;
            console.log(`🔄 Remplacer ID ${id} par ${newId} dans ${path} (doublon de ${mainPath})`);
            obj.id = newId;
            
            // Mettre à jour les références
            idReferences.set(newId, [path]);
            pathToId.set(path, newId);
          } else {
            console.log(`✅ Garder ID ${id} dans ${path} (chemin principal)`);
          }
        }
      }
      
      // Corriger les références dans les connexions
      if (obj.flow && Array.isArray(obj.flow)) {
        obj.flow.forEach((item, index) => {
          if (item && item.id !== undefined) {
            const currentPath = `${path}.flow.${index}`;
            fixReferences(item, currentPath, mainPaths.has(item.id) && mainPaths.get(item.id) === currentPath);
          }
        });
      }
      
      if (obj.routes && Array.isArray(obj.routes)) {
        obj.routes.forEach((route, index) => {
          if (route && route.flow) {
            const currentPath = `${path}.routes.${index}`;
            fixReferences(route, currentPath, false);
          }
        });
      }
      
      // Parcourir récursivement les autres propriétés
      for (const [key, value] of Object.entries(obj)) {
        if (value && typeof value === 'object' && key !== 'flow' && key !== 'routes') {
          fixReferences(value, `${path}.${key}`, false);
        }
      }
    }
  }
  
  fixReferences(blueprint);
  
  // Sauvegarder le blueprint corrigé
  const fixedBlueprintPath = path.join(__dirname, 'Veille Technologique - Pipeline Complet - REFERENCES-CORRIGEES.blueprint.json');
  fs.writeFileSync(fixedBlueprintPath, JSON.stringify(blueprint, null, 2), 'utf8');
  
  console.log(`\n✅ Blueprint corrigé sauvegardé dans: ${fixedBlueprintPath}`);
  
  // Vérifier qu'il n'y a plus de doublons
  const finalIdReferences = new Map();
  function checkFinalIds(obj, path = '') {
    if (obj && typeof obj === 'object') {
      if (obj.id !== undefined && typeof obj.id === 'number') {
        const id = obj.id;
        if (!finalIdReferences.has(id)) {
          finalIdReferences.set(id, []);
        }
        finalIdReferences.get(id).push(path);
      }
      
      if (obj.flow && Array.isArray(obj.flow)) {
        obj.flow.forEach((item, index) => {
          if (item) checkFinalIds(item, `${path}.flow.${index}`);
        });
      }
      
      if (obj.routes && Array.isArray(obj.routes)) {
        obj.routes.forEach((route, index) => {
          if (route) checkFinalIds(route, `${path}.routes.${index}`);
        });
      }
      
      for (const [key, value] of Object.entries(obj)) {
        if (value && typeof value === 'object' && key !== 'flow' && key !== 'routes') {
          checkFinalIds(value, `${path}.${key}`);
        }
      }
    }
  }
  
  checkFinalIds(blueprint);
  
  const finalDuplicates = Array.from(finalIdReferences.entries()).filter(([id, paths]) => paths.length > 1);
  
  if (finalDuplicates.length === 0) {
    console.log('🎉 Aucun ID en double restant !');
  } else {
    console.log(`⚠️  ${finalDuplicates.length} IDs en double restent:`);
    finalDuplicates.forEach(([id, paths]) => {
      console.log(`   ID ${id}: ${paths.join(', ')}`);
    });
  }
  
} catch (error) {
  console.error('❌ Erreur lors de la correction:', error.message);
  process.exit(1);
}

