const fs = require('fs');
const path = require('path');

// Chemin vers le blueprint avec connexions corrigées
const blueprintPath = path.join(__dirname, 'Veille Technologique - Pipeline Complet - CONNEXIONS-CORRIGEES.blueprint.json');

console.log('🔧 Correction de toutes les références par ID dans le blueprint...');

try {
  // Lire le fichier blueprint
  const blueprintContent = fs.readFileSync(blueprintPath, 'utf8');
  const blueprint = JSON.parse(blueprintContent);
  
  console.log('📊 Analyse des références par ID...');
  
  // Structure pour stocker les informations de chaque chemin
  const pathInfo = new Map();
  const allReferences = new Map(); // moduleId -> [referencedIds]
  
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
                
                // Analyser les références dans ce module
                const references = [];
                
                // Chercher dans mapper.data (prompts)
                if (module.mapper && module.mapper.data) {
                  const data = JSON.stringify(module.mapper.data);
                  const idMatches = data.match(/{{(\d+)\.(\w+)}}/g);
                  if (idMatches) {
                    idMatches.forEach(match => {
                      const idMatch = match.match(/{{(\d+)\.(\w+)}}/);
                      if (idMatch) {
                        references.push({
                          type: 'prompt',
                          reference: match,
                          moduleId: parseInt(idMatch[1]),
                          field: idMatch[2]
                        });
                      }
                    });
                  }
                }
                
                // Chercher dans d'autres configurations
                if (module.configuration) {
                  const config = JSON.stringify(module.configuration);
                  const idMatches = config.match(/{{(\d+)\.(\w+)}}/g);
                  if (idMatches) {
                    idMatches.forEach(match => {
                      const idMatch = match.match(/{{(\d+)\.(\w+)}}/);
                      if (idMatch) {
                        references.push({
                          type: 'configuration',
                          reference: match,
                          moduleId: parseInt(idMatch[1]),
                          field: idMatch[2]
                        });
                      }
                    });
                  }
                }
                
                if (references.length > 0) {
                  allReferences.set(module.id, references);
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
                const references = allReferences.get(module.id) || [];
                if (references.length > 0) {
                  references.forEach(ref => {
                    console.log(`     → Référence ${ref.type}: ${ref.reference} (Module ${ref.moduleId})`);
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
          analyzePaths(value, `${path}.${key}`);
        }
      }
    }
  }
  
  analyzePaths(blueprint);
  
  console.log(`\n📋 ${pathInfo.size} chemins analysés`);
  console.log(`🔗 ${allReferences.size} modules avec références identifiés`);
  
  // Identifier les références cassées
  const brokenReferences = [];
  for (const [moduleId, references] of allReferences) {
    references.forEach(ref => {
      // Vérifier si le module référencé existe
      let targetModuleExists = false;
      for (const [routeIndex, info] of pathInfo) {
        if (info.modules.some(m => m.id === ref.moduleId)) {
          targetModuleExists = true;
          break;
        }
      }
      
      if (!targetModuleExists) {
        brokenReferences.push({
          sourceModuleId: moduleId,
          targetModuleId: ref.moduleId,
          reference: ref.reference,
          type: ref.type,
          field: ref.field
        });
      }
    });
  }
  
  console.log(`\n⚠️  ${brokenReferences.length} références cassées identifiées`);
  
  // Corriger les références cassées
  function fixBrokenReferences(obj, path = '') {
    if (obj && typeof obj === 'object') {
      // Vérifier si c'est un module avec des références
      if (obj.id !== undefined) {
        const moduleId = obj.id;
        const references = allReferences.get(moduleId) || [];
        
        references.forEach(ref => {
          // Vérifier si cette référence est cassée
          const isBroken = brokenReferences.some(br => 
            br.sourceModuleId === moduleId && 
            br.targetModuleId === ref.moduleId
          );
          
          if (isBroken) {
            console.log(`🔧 Référence cassée détectée: Module ${moduleId} → Module ${ref.moduleId} (${ref.reference})`);
            
            // Trouver un module de remplacement dans le même chemin
            for (const [routeIndex, info] of pathInfo) {
              const routeModules = info.modules;
              const currentModule = routeModules.find(m => m.id === moduleId);
              
              if (currentModule) {
                // Chercher un module du même type dans le même chemin
                const replacementModule = routeModules.find(m => 
                  m.id !== moduleId && 
                  m.name === routeModules.find(rm => rm.id === ref.moduleId)?.name
                );
                
                if (replacementModule) {
                  console.log(`   ✅ Remplacement: Module ${ref.moduleId} → Module ${replacementModule.id}`);
                  
                  // Mettre à jour la référence dans mapper.data
                  if (obj.mapper && obj.mapper.data) {
                    const oldRef = `{{${ref.moduleId}.${ref.field}}}`;
                    const newRef = `{{${replacementModule.id}.${ref.field}}}`;
                    obj.mapper.data = obj.mapper.data.replace(new RegExp(oldRef, 'g'), newRef);
                  }
                  
                  // Mettre à jour la référence dans configuration
                  if (obj.configuration) {
                    const configStr = JSON.stringify(obj.configuration);
                    const oldRef = `{{${ref.moduleId}.${ref.field}}}`;
                    const newRef = `{{${replacementModule.id}.${ref.field}}}`;
                    const newConfigStr = configStr.replace(new RegExp(oldRef, 'g'), newRef);
                    obj.configuration = JSON.parse(newConfigStr);
                  }
                } else {
                  console.log(`   ⚠️  Aucun module de remplacement trouvé pour ${ref.moduleId}`);
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
          fixBrokenReferences(value, `${path}.${key}`);
        }
      }
    }
  }
  
  console.log('\n🔧 Correction des références cassées...');
  fixBrokenReferences(blueprint);
  
  // Sauvegarder le blueprint corrigé
  const fixedBlueprintPath = path.join(__dirname, 'Veille Technologique - Pipeline Complet - REFERENCES-COMPLETES-CORRIGEES.blueprint.json');
  fs.writeFileSync(fixedBlueprintPath, JSON.stringify(blueprint, null, 2), 'utf8');
  
  console.log(`\n✅ Blueprint avec toutes les références corrigées sauvegardé dans: ${fixedBlueprintPath}`);
  
  // Vérifier qu'il n'y a plus de références cassées
  const finalBrokenReferences = [];
  for (const [moduleId, references] of allReferences) {
    references.forEach(ref => {
      let targetModuleExists = false;
      for (const [routeIndex, info] of pathInfo) {
        if (info.modules.some(m => m.id === ref.moduleId)) {
          targetModuleExists = true;
          break;
        }
      }
      
      if (!targetModuleExists) {
        finalBrokenReferences.push({
          sourceModuleId: moduleId,
          targetModuleId: ref.moduleId
        });
      }
    });
  }
  
  if (finalBrokenReferences.length === 0) {
    console.log('🎉 Toutes les références cassées ont été corrigées !');
  } else {
    console.log(`⚠️  ${finalBrokenReferences.length} références cassées restent:`);
    finalBrokenReferences.forEach(ref => {
      console.log(`   Module ${ref.sourceModuleId} → Module ${ref.targetModuleId}`);
    });
  }
  
} catch (error) {
  console.error('❌ Erreur lors de la correction des références:', error.message);
  process.exit(1);
}

