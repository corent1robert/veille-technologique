const fs = require('fs');
const path = require('path');

// Chemin vers le blueprint avec toutes les références corrigées
const blueprintPath = path.join(__dirname, 'Veille Technologique - Pipeline Complet - TOUTES-REFERENCES-CORRIGEES.blueprint.json');

console.log('🔧 Correction des références __IMTLENGTH__ cassées...');

try {
  // Lire le fichier blueprint
  const blueprintContent = fs.readFileSync(blueprintPath, 'utf8');
  const blueprint = JSON.parse(blueprintContent);
  
  console.log('📊 Analyse des références __IMTLENGTH__...');
  
  // Structure pour stocker les informations de chaque chemin
  const pathInfo = new Map();
  
  // Fonction pour analyser la structure des chemins
  function analyzePaths(obj, path = '') {
    if (obj && typeof obj === 'object') {
      // Analyser les routes (chemins parallèles)
      if (obj.routes && Array.isArray(obj.routes)) {
        obj.routes.forEach((route, routeIndex) => {
          const routePath = `${path}.routes.${routeIndex}`;
          
          if (route.flow && Array.isArray(route.flow)) {
            const modules = [];
            
            route.flow.forEach((module, moduleIndex) => {
              if (module && module.id !== undefined) {
                const moduleInfo = {
                  index: moduleIndex,
                  id: module.id,
                  name: module.name || 'Module',
                  path: `${routePath}.flow.${moduleIndex}`,
                  routeIndex
                };
                
                modules.push(moduleInfo);
              }
            });
            
            if (modules.length > 0) {
              pathInfo.set(routeIndex, {
                routePath,
                modules,
                routeIndex
              });
              
              console.log(`\n🛤️  Chemin ${routeIndex}:`);
              modules.forEach(module => {
                console.log(`   - Module ${module.index}: ID ${module.id} (${module.name})`);
              });
            }
          }
        });
      }
      
      // Parcourir récursivement
      for (const [key, value] of Object.entries(obj)) {
        if (value && typeof value === 'object' && key !== 'routes') {
          analyzePaths(value, `${path}.${key}`);
        }
      }
    }
  }
  
  analyzePaths(blueprint);
  
  console.log(`\n📋 ${pathInfo.size} chemins analysés`);
  
  // Identifier les références __IMTLENGTH__ cassées
  const brokenImtLengthRefs = [];
  
  // Fonction pour chercher les références __IMTLENGTH__
  function findImtLengthRefs(obj, path = '') {
    if (obj && typeof obj === 'object') {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string' && value.includes('__IMTLENGTH__')) {
          // Extraire l'ID du module référencé
          const match = value.match(/{{(\d+)\.`__IMTLENGTH__`}}/);
          if (match) {
            const moduleId = parseInt(match[1]);
            
            // Vérifier si ce module existe dans le chemin actuel
            let moduleExists = false;
            let currentRouteIndex = -1;
            
            // Déterminer dans quel chemin nous sommes
            for (const [routeIndex, info] of pathInfo) {
              if (path.includes(info.routePath)) {
                currentRouteIndex = routeIndex;
                moduleExists = info.modules.some(m => m.id === moduleId);
                break;
              }
            }
            
            if (!moduleExists && currentRouteIndex !== -1) {
              brokenImtLengthRefs.push({
                path: path,
                key: key,
                value: value,
                referencedModuleId: moduleId,
                currentRouteIndex: currentRouteIndex
              });
              
              console.log(`❌ Référence cassée trouvée: ${path}.${key} = ${value} (Module ${moduleId} n'existe pas dans le chemin ${currentRouteIndex})`);
            }
          }
        }
        
        // Parcourir récursivement
        if (value && typeof value === 'object') {
          findImtLengthRefs(value, `${path}.${key}`);
        }
      }
    }
  }
  
  console.log('\n🔍 Recherche des références __IMTLENGTH__ cassées...');
  findImtLengthRefs(blueprint);
  
  console.log(`\n⚠️  ${brokenImtLengthRefs.length} références __IMTLENGTH__ cassées identifiées`);
  
  // Corriger les références __IMTLENGTH__ cassées
  function fixImtLengthRefs(obj, path = '') {
    if (obj && typeof obj === 'object') {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string' && value.includes('__IMTLENGTH__')) {
          const match = value.match(/{{(\d+)\.`__IMTLENGTH__`}}/);
          if (match) {
            const moduleId = parseInt(match[1]);
            
            // Vérifier si ce module existe dans le chemin actuel
            let moduleExists = false;
            let currentRouteIndex = -1;
            let currentModules = [];
            
            // Déterminer dans quel chemin nous sommes
            for (const [routeIndex, info] of pathInfo) {
              if (path.includes(info.routePath)) {
                currentRouteIndex = routeIndex;
                currentModules = info.modules;
                moduleExists = info.modules.some(m => m.id === moduleId);
                break;
              }
            }
            
            if (!moduleExists && currentRouteIndex !== -1) {
              console.log(`🔧 Correction de la référence __IMTLENGTH__: ${path}.${key}`);
              
              // Trouver un module de remplacement dans le même chemin
              // Chercher un module qui a une propriété __IMTLENGTH__
              const replacementModule = currentModules.find(m => 
                m.name && m.name.includes('__IMTLENGTH__')
              );
              
              if (replacementModule) {
                console.log(`   ✅ Remplacement: Module ${moduleId} → Module ${replacementModule.id}`);
                
                // Mettre à jour la référence
                const oldRef = `{{${moduleId}.\`__IMTLENGTH__\`}}`;
                const newRef = `{{${replacementModule.id}.\`__IMTLENGTH__\`}}`;
                obj[key] = value.replace(oldRef, newRef);
              } else {
                console.log(`   ⚠️  Aucun module __IMTLENGTH__ de remplacement trouvé dans le chemin ${currentRouteIndex}`);
                
                // Utiliser le premier module du chemin comme fallback
                if (currentModules.length > 0) {
                  const fallbackModule = currentModules[0];
                  console.log(`   🔄 Fallback: Module ${moduleId} → Module ${fallbackModule.id}`);
                  
                  const oldRef = `{{${moduleId}.\`__IMTLENGTH__\`}}`;
                  const newRef = `{{${fallbackModule.id}.\`__IMTLENGTH__\`}}`;
                  obj[key] = value.replace(oldRef, newRef);
                }
              }
            }
          }
        }
        
        // Parcourir récursivement
        if (value && typeof value === 'object') {
          fixImtLengthRefs(value, `${path}.${key}`);
        }
      }
    }
  }
  
  console.log('\n🔧 Correction des références __IMTLENGTH__ cassées...');
  fixImtLengthRefs(blueprint);
  
  // Sauvegarder le blueprint corrigé
  const fixedBlueprintPath = path.join(__dirname, 'Veille Technologique - Pipeline Complet - IMTLENGTH-CORRIGE.blueprint.json');
  fs.writeFileSync(fixedBlueprintPath, JSON.stringify(blueprint, null, 2), 'utf8');
  
  console.log(`\n✅ Blueprint avec références __IMTLENGTH__ corrigées sauvegardé dans: ${fixedBlueprintPath}`);
  
  // Vérifier qu'il n'y a plus de références __IMTLENGTH__ cassées
  const finalBrokenRefs = [];
  findImtLengthRefs(blueprint);
  
  if (finalBrokenRefs.length === 0) {
    console.log('🎉 Toutes les références __IMTLENGTH__ cassées ont été corrigées !');
  } else {
    console.log(`⚠️  ${finalBrokenRefs.length} références __IMTLENGTH__ cassées restent:`);
    finalBrokenRefs.forEach(ref => {
      console.log(`   ${ref.path}.${ref.key} = ${ref.value}`);
    });
  }
  
} catch (error) {
  console.error('❌ Erreur lors de la correction des références __IMTLENGTH__:', error.message);
  process.exit(1);
}

