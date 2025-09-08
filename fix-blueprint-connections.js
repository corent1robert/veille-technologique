const fs = require('fs');
const path = require('path');

// Chemin vers le blueprint personnalisé
const blueprintPath = path.join(__dirname, 'Veille Technologique - Pipeline Complet - PROMPTS-PERSONNALISES-V2.blueprint.json');

console.log('🔧 Correction des connexions cassées entre modules...');

try {
  // Lire le fichier blueprint
  const blueprintContent = fs.readFileSync(blueprintPath, 'utf8');
  const blueprint = JSON.parse(blueprintContent);
  
  console.log('📊 Analyse des connexions et références...');
  
  // Structure pour stocker les informations de chaque chemin
  const pathInfo = new Map();
  const moduleConnections = new Map(); // moduleId -> [referencedIds]
  
  // Fonction pour analyser la structure des chemins et connexions
  function analyzeConnections(obj, path = '') {
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
                
                // Analyser les connexions de ce module
                if (module.connections) {
                  const connections = [];
                  for (const [key, value] of Object.entries(module.connections)) {
                    if (value && value.moduleId !== undefined) {
                      connections.push({
                        connectionKey: key,
                        targetModuleId: value.moduleId,
                        targetConnection: value.connection
                      });
                    }
                  }
                  moduleConnections.set(module.id, connections);
                }
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
                const connections = moduleConnections.get(module.id) || [];
                if (connections.length > 0) {
                  connections.forEach(conn => {
                    console.log(`     → Connexion vers module ${conn.targetModuleId}`);
                  });
                }
              });
            }
          }
        });
      }
      
      // Parcourir récursivement
      for (const [key, value] of Object.entries(obj)) {
        if (value && typeof value === 'object' && key !== 'routes') {
          analyzeConnections(value, `${path}.${key}`);
        }
      }
    }
  }
  
  analyzeConnections(blueprint);
  
  console.log(`\n📋 ${pathInfo.size} chemins analysés`);
  console.log(`🔗 ${moduleConnections.size} modules avec connexions identifiés`);
  
  // Identifier les connexions cassées
  const brokenConnections = [];
  for (const [moduleId, connections] of moduleConnections) {
    connections.forEach(conn => {
      // Vérifier si le module cible existe
      let targetModuleExists = false;
      for (const [routeIndex, info] of pathInfo) {
        if (info.modules.some(m => m.id === conn.targetModuleId)) {
          targetModuleExists = true;
          break;
        }
      }
      
      if (!targetModuleExists) {
        brokenConnections.push({
          sourceModuleId: moduleId,
          targetModuleId: conn.targetModuleId,
          connectionKey: conn.connectionKey,
          targetConnection: conn.targetConnection
        });
      }
    });
  }
  
  console.log(`\n⚠️  ${brokenConnections.length} connexions cassées identifiées`);
  
  // Corriger les connexions cassées
  function fixBrokenConnections(obj, path = '') {
    if (obj && typeof obj === 'object') {
      // Vérifier si c'est un module avec des connexions
      if (obj.id !== undefined && obj.connections) {
        const moduleId = obj.id;
        const connections = moduleConnections.get(moduleId) || [];
        
        connections.forEach(conn => {
          // Vérifier si cette connexion est cassée
          const isBroken = brokenConnections.some(bc => 
            bc.sourceModuleId === moduleId && 
            bc.targetModuleId === conn.targetModuleId
          );
          
          if (isBroken) {
            console.log(`🔧 Connexion cassée détectée: Module ${moduleId} → Module ${conn.targetModuleId}`);
            
            // Trouver un module de remplacement dans le même chemin
            for (const [routeIndex, info] of pathInfo) {
              const routeModules = info.modules;
              const currentModule = routeModules.find(m => m.id === moduleId);
              
              if (currentModule) {
                // Chercher un module du même type dans le même chemin
                const replacementModule = routeModules.find(m => 
                  m.id !== moduleId && 
                  m.name === routeModules.find(rm => rm.id === conn.targetModuleId)?.name
                );
                
                if (replacementModule) {
                  console.log(`   ✅ Remplacement: Module ${conn.targetModuleId} → Module ${replacementModule.id}`);
                  
                  // Mettre à jour la connexion
                  if (obj.connections[conn.connectionKey]) {
                    obj.connections[conn.connectionKey].moduleId = replacementModule.id;
                  }
                } else {
                  console.log(`   ⚠️  Aucun module de remplacement trouvé pour ${conn.targetModuleId}`);
                }
                break;
              }
            }
          }
        });
      }
      
      // Parcourir récursivement
      for (const [key, value] of Object.entries(obj)) {
        if (value && typeof value === 'object') {
          fixBrokenConnections(value, `${path}.${key}`);
        }
      }
    }
  }
  
  console.log('\n🔧 Correction des connexions cassées...');
  fixBrokenConnections(blueprint);
  
  // Sauvegarder le blueprint corrigé
  const fixedBlueprintPath = path.join(__dirname, 'Veille Technologique - Pipeline Complet - CONNEXIONS-CORRIGEES.blueprint.json');
  fs.writeFileSync(fixedBlueprintPath, JSON.stringify(blueprint, null, 2), 'utf8');
  
  console.log(`\n✅ Blueprint avec connexions corrigées sauvegardé dans: ${fixedBlueprintPath}`);
  
  // Vérifier qu'il n'y a plus de connexions cassées
  const finalBrokenConnections = [];
  for (const [moduleId, connections] of moduleConnections) {
    connections.forEach(conn => {
      let targetModuleExists = false;
      for (const [routeIndex, info] of pathInfo) {
        if (info.modules.some(m => m.id === conn.targetModuleId)) {
          targetModuleExists = true;
          break;
        }
      }
      
      if (!targetModuleExists) {
        finalBrokenConnections.push({
          sourceModuleId: moduleId,
          targetModuleId: conn.targetModuleId
        });
      }
    });
  }
  
  if (finalBrokenConnections.length === 0) {
    console.log('🎉 Toutes les connexions cassées ont été corrigées !');
  } else {
    console.log(`⚠️  ${finalBrokenConnections.length} connexions cassées restent:`);
    finalBrokenConnections.forEach(conn => {
      console.log(`   Module ${conn.sourceModuleId} → Module ${conn.targetModuleId}`);
    });
  }
  
} catch (error) {
  console.error('❌ Erreur lors de la correction des connexions:', error.message);
  process.exit(1);
}
