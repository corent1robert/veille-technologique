# Pipeline de Veille Technologique - Make.com

## Vue d'ensemble

Ce pipeline automatise la veille technologique en combinant Inoreader, Apify et une série de modèles GPT pour analyser et structurer des articles technologiques.

## Architecture du Pipeline

### Étape 1 : Collecte et Traitement Initial
1. **Inoreader (ID: 4)** - Surveillance des flux RSS "Veille EGE"
2. **Apify (ID: 20)** - Scraping des URLs des articles avec Playwright Firefox
3. **Série de GPT** - Analyse multi-dimensionnelle des articles

### Étape 2 : Analyse Multi-GPT
- **GPT 30** - Extraction d'informations générales
- **GPT 32** - Évaluation de pertinence et fiabilité  
- **GPT 33** - Analyse technique (matériaux, technologies, logiciels)
- **GPT 34** - Évaluation TRL et applications sectorielles

### Étape 3 : Consolidation et Validation
- **GPT 35** - Consolidation des 4 analyses en JSON unique
- **GPT 36** - Validation et correction JSON
- **GPT 37** - Enrichissement final avec métadonnées

## Structure du JSON Final

```json
{
  "article": {
    "titre": "string",
    "description_courte": "string",
    "description_longue": "string",
    "mots_cles": ["string"],
    "categorie": ["string"],
    "date_publication": "string",
    "auteur": "string",
    "source": "string",
    "entreprises_citees": ["string"],
    "citations": ["string"],
    "pays_source": "string",
    "zone_geographique": "string",
    "typologie_source": "string",
    "typologie_contenu": "string"
  },
  "evaluation": {
    "pertinence": 1-4,
    "pertinence_explication": "string",
    "fiabilite": 1-4,
    "fiabilite_explication": "string"
  },
  "analyse_technique": {
    "materiau": "string",
    "technologie": "string",
    "logiciel": "string"
  },
  "innovation": {
    "estimation_TRL": "string",
    "numero_TRL": 1-9,
    "explication_TRL": "string",
    "projection_TRL": "string",
    "application_secteur": ["string"]
  },
  "metadata": {
    "date_traitement": "ISO date",
    "version_analyse": "1.1",
    "sources_consolidees": ["GPT30", "GPT32", "GPT33", "GPT34"],
    "qualite_donnees": 1-5,
    "confiance_analyse": 1-5,
    "resume_executif": "string",
    "tags_principaux": ["string"],
    "priorite_veille": 1-5
  }
}
```

## Processus de Validation

### 1. Consolidation (GPT 35)
- Fusion intelligente des 4 analyses
- Élimination des doublons
- Cohérence des types de données
- Structure standardisée

### 2. Validation (GPT 36)
- Vérification syntaxique JSON
- Correction automatique si nécessaire
- Respect de la structure attendue
- Sortie JSON valide garantie

### 3. Enrichissement (GPT 37)
- Ajout de métadonnées enrichies
- Évaluation de la qualité des données
- Tags et priorités de veille
- Version finale optimisée

## Configuration des Modèles

- **Modèle** : o4-mini (OpenAI)
- **Température** : 0.1-0.3 (cohérence maximale)
- **Max Tokens** : 1024-4096 selon l'étape
- **Format** : JSON strict uniquement

## Flux de Données

```
Inoreader → Apify → GPT30 → GPT32 → GPT33 → GPT34 → GPT35 → GPT36 → GPT37
   ↓           ↓      ↓      ↓      ↓      ↓      ↓      ↓      ↓
  RSS      Scraping  Info   Eval   Tech   TRL   Consol  Valid  Final
```

## Gestion des Erreurs

- **Inoreader** : Ignore les erreurs (ID: 5)
- **Apify** : Ignore les erreurs (ID: 28)
- **GPT** : Validation automatique et correction

## Métadonnées de Qualité

- **Qualité des données** : 1-5 (faible à excellente)
- **Confiance d'analyse** : 1-5 (faible à élevée)
- **Priorité de veille** : 1-5 (faible à critique)
- **Tags principaux** : 5 mots-clés les plus pertinents

## Utilisation

1. **Déclenchement** : Automatique via Inoreader
2. **Fréquence** : Selon la configuration Inoreader
3. **Sortie** : JSON structuré et validé
4. **Stockage** : Intégration possible avec bases de données

## Maintenance

- Vérifier régulièrement les connexions API
- Monitorer la qualité des sorties JSON
- Ajuster les prompts si nécessaire
- Mettre à jour les modèles GPT selon disponibilité
