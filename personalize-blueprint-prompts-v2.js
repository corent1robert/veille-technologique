const fs = require('fs');
const path = require('path');

// Chemin vers le blueprint corrigé
const blueprintPath = path.join(__dirname, 'Veille Technologique - Pipeline Complet - REFERENCES-CORRIGEES.blueprint.json');

console.log('🔧 Personnalisation des prompts pour chaque chemin avec les bons IDs (Version 2)...');

try {
  // Lire le fichier blueprint corrigé
  const blueprintContent = fs.readFileSync(blueprintPath, 'utf8');
  const blueprint = JSON.parse(blueprintContent);
  
  console.log('📊 Analyse des chemins et modules GPT...');
  
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
            const gptModules = [];
            
            route.flow.forEach((module, moduleIndex) => {
              if (module && module.id !== undefined) {
                // Identifier les modules GPT par leur modèle
                if (module.configuration && module.configuration.model && 
                    (module.configuration.model === 'o4-mini' || 
                     module.configuration.model.model === 'o4-mini')) {
                  gptModules.push({
                    index: moduleIndex,
                    id: module.id,
                    name: module.name || 'GPT Module',
                    path: `${routePath}.flow.${moduleIndex}`,
                    model: module.configuration.model
                  });
                }
              }
            });
            
            if (gptModules.length > 0) {
              pathInfo.set(routeIndex, {
                routePath,
                gptModules,
                routeIndex
              });
              
              console.log(`\n🛤️  Chemin ${routeIndex}:`);
              gptModules.forEach(module => {
                console.log(`   - Module ${module.index}: ID ${module.id} (${module.name}) - Modèle: ${module.model}`);
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
  
  console.log(`\n📋 ${pathInfo.size} chemins identifiés avec modules GPT`);
  
  // Fonction pour personnaliser les prompts de chaque chemin
  function personalizePrompts(obj, path = '') {
    if (obj && typeof obj === 'object') {
      // Chercher les modules de consolidation (JSON Parser ou Text Aggregator)
      if (obj.name && (obj.name.includes('JSON') || obj.name.includes('Parse') || obj.name.includes('Consolidate'))) {
        // Vérifier si c'est dans un des chemins identifiés
        for (const [routeIndex, info] of pathInfo) {
          if (path.includes(info.routePath)) {
            console.log(`\n🔧 Personnalisation du prompt pour le chemin ${routeIndex}...`);
            
            // Récupérer les IDs des modules GPT de ce chemin
            const gptIds = info.gptModules.map(m => m.id);
            console.log(`   IDs GPT pour ce chemin: ${gptIds.join(', ')}`);
            
            // Personnaliser le prompt avec les bons IDs
            if (obj.configuration && obj.configuration.data) {
              const prompt = obj.configuration.data;
              
              // Remplacer les références génériques par les IDs spécifiques
              let personalizedPrompt = prompt;
              
              // Remplacer les références {{30.result}}, {{32.result}}, etc.
              if (gptIds.length >= 4) {
                personalizedPrompt = personalizedPrompt.replace(/{{30\.result}}/g, `{{${gptIds[0]}.result}}`);
                personalizedPrompt = personalizedPrompt.replace(/{{32\.result}}/g, `{{${gptIds[1]}.result}}`);
                personalizedPrompt = personalizedPrompt.replace(/{{33\.result}}/g, `{{${gptIds[2]}.result}}`);
                personalizedPrompt = personalizedPrompt.replace(/{{34\.result}}/g, `{{${gptIds[3]}.result}}`);
                
                // Mettre à jour les sources consolidées
                personalizedPrompt = personalizedPrompt.replace(
                  /"sources_consolidees":\s*\["GPT30",\s*"GPT32",\s*"GPT33",\s*"GPT34"\]/g,
                  `"sources_consolidees": ["GPT${gptIds[0]}", "GPT${gptIds[1]}", "GPT${gptIds[2]}", "GPT${gptIds[3]}"]`
                );
                
                // Mettre à jour le prompt
                obj.configuration.data = personalizedPrompt;
                
                console.log(`   ✅ Prompt personnalisé pour le chemin ${routeIndex}`);
                console.log(`   📝 Références mises à jour: GPT${gptIds[0]}, GPT${gptIds[1]}, GPT${gptIds[2]}, GPT${gptIds[3]}`);
              } else {
                console.log(`   ⚠️  Chemin ${routeIndex}: Pas assez de modules GPT (${gptIds.length}/4)`);
              }
            }
          }
        }
      }
      
      // Parcourir récursivement
      for (const [key, value] of Object.entries(obj)) {
        if (value && typeof value === 'object') {
          personalizePrompts(value, `${path}.${key}`);
        }
      }
    }
  }
  
  console.log('\n🔧 Personnalisation des prompts...');
  personalizePrompts(blueprint);
  
  // Sauvegarder le blueprint personnalisé
  const personalizedBlueprintPath = path.join(__dirname, 'Veille Technologique - Pipeline Complet - PROMPTS-PERSONNALISES-V2.blueprint.json');
  fs.writeFileSync(personalizedBlueprintPath, JSON.stringify(blueprint, null, 2), 'utf8');
  
  console.log(`\n✅ Blueprint avec prompts personnalisés sauvegardé dans: ${personalizedBlueprintPath}`);
  
  // Résumé des personnalisations
  console.log('\n📊 Résumé des personnalisations:');
  for (const [routeIndex, info] of pathInfo) {
    const gptIds = info.gptModules.map(m => m.id);
    console.log(`   Chemin ${routeIndex}: GPT modules avec IDs ${gptIds.join(', ')}`);
  }
  
} catch (error) {
  console.error('❌ Erreur lors de la personnalisation:', error.message);
  process.exit(1);
}

