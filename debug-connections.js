const fs = require('fs');
const path = require('path');

// Chemin vers le blueprint original
const blueprintPath = path.join(__dirname, 'Veille Technologique - Pipeline Complet.blueprint.json');

console.log('🔍 Debug des connexions dans le blueprint...');

try {
  // Lire le fichier blueprint original
  const blueprintContent = fs.readFileSync(blueprintPath, 'utf8');
  const blueprint = JSON.parse(blueprintContent);
  
  console.log('📊 Analyse de la structure des connexions...');
  
  // Fonction pour examiner la structure d'un objet
  function examineStructure(obj, path = '', depth = 0) {
    if (depth > 3) return; // Limiter la profondeur
    
    if (obj && typeof obj === 'object') {
      // Chercher des patterns de connexion
      for (const [key, value] of Object.entries(obj)) {
        if (key === 'connections' || key === 'connection' || key === 'connect') {
          console.log(`🔗 Connexion trouvée à ${path}.${key}:`, JSON.stringify(value, null, 2));
        }
        
        if (key === 'moduleId' || key === 'targetModule' || key === 'sourceModule') {
          console.log(`🎯 Référence module trouvée à ${path}.${key}:`, value);
        }
        
        if (key === 'data' && typeof value === 'string' && value.includes('{{')) {
          console.log(`📝 Prompt avec références trouvé à ${path}.${key}:`, value.substring(0, 200) + '...');
        }
        
        // Parcourir récursivement
        if (value && typeof value === 'object' && depth < 3) {
          examineStructure(value, `${path}.${key}`, depth + 1);
        }
      }
    }
  }
  
  // Examiner la structure globale
  examineStructure(blueprint, 'root');
  
  // Examiner spécifiquement les routes
  if (blueprint.routes && Array.isArray(blueprint.routes)) {
    console.log('\n🛤️  Analyse des routes...');
    
    blueprint.routes.forEach((route, routeIndex) => {
      console.log(`\n--- Route ${routeIndex} ---`);
      
      if (route.flow && Array.isArray(route.flow)) {
        route.flow.forEach((module, moduleIndex) => {
          if (module && module.id !== undefined) {
            console.log(`\nModule ${moduleIndex}: ID ${module.id}, Nom: ${module.name || 'N/A'}`);
            
            // Examiner la structure du module
            for (const [key, value] of Object.entries(module)) {
              if (key === 'connections' || key === 'connection') {
                console.log(`  🔗 ${key}:`, JSON.stringify(value, null, 2));
              }
              
              if (key === 'mapper' && value && value.data) {
                console.log(`  📝 mapper.data:`, value.data.substring(0, 300) + '...');
              }
              
              if (key === 'configuration') {
                console.log(`  ⚙️  configuration:`, JSON.stringify(value, null, 2));
              }
            }
          }
        });
      }
    });
  }
  
  console.log('\n✅ Analyse terminée');
  
} catch (error) {
  console.error('❌ Erreur lors de l\'analyse:', error.message);
  process.exit(1);
}

