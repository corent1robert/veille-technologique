# Interface Veille Technologique - La Biche-Renard

Interface web simple et élégante pour visualiser et filtrer les données de veille technologique depuis Airtable.

## 🚀 Installation

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configuration des variables d'environnement
Créer un fichier `.env.local` basé sur `env.example` :

```bash
cp env.example .env.local
```

Remplir avec vos vraies valeurs :
- `AIRTABLE_API_KEY` : Votre clé API Airtable
- `AIRTABLE_BASE_ID` : ID de votre base Airtable
- `AIRTABLE_TABLE_NAME` : Nom de votre table (par défaut "Table2")

### 3. Lancer en local
```bash
npm run dev
```

L'interface sera accessible sur `http://localhost:3000`

## 🎯 Fonctionnalités

### Interface
- **Design neutre** avec Tailwind CSS
- **Responsive** pour tous les écrans
- **Cartes d'articles** avec métadonnées complètes

### Filtres
- **Recherche globale** dans titres, descriptions et mots-clés
- **Filtre par catégorie** (Manufacturing, Innovation, etc.)
- **Filtre par priorité** (1-5)
- **Filtre par niveau TRL** (1-9)
- **Bouton d'effacement** des filtres

### Affichage des données
- **Priorité visuelle** avec codes couleur
- **Niveaux TRL** avec indicateurs visuels
- **Scores de qualité** et de confiance
- **Mots-clés** et métadonnées enrichies

## 🏗️ Architecture

```
app/
├── page.tsx              # Page principale
├── layout.tsx            # Layout global
├── globals.css           # Styles Tailwind
└── api/
    └── veille/
        └── route.ts      # API Airtable

components/
├── FilterPanel.tsx       # Panneau de filtres
└── VeilleCard.tsx        # Carte d'article

types/
└── veille.ts             # Types TypeScript
```

## 🔧 Configuration Airtable

L'API route mappe automatiquement les champs Airtable vers la structure de l'interface. Assurez-vous que votre table contient les champs suivants :

### Champs requis (recommandés)
- Titre article
- Description courte
- Mots clés
- Catégorie
- Source
- Date publication
- Priorité veille
- Numero TRL

## 🚀 Déploiement

### Vercel (recommandé)
1. Connecter votre repo GitHub
2. Configurer les variables d'environnement
3. Déployer automatiquement

### GitHub Pages
```bash
npm run build
npm run export
```

## 📱 Responsive

L'interface s'adapte automatiquement :
- **Mobile** : 1 colonne
- **Tablet** : 2 colonnes  
- **Desktop** : 3 colonnes

## 🎨 Personnalisation

### Couleurs
Modifier `tailwind.config.js` pour changer la palette de couleurs

### Composants
Tous les composants sont modulaires et personnalisables

### Filtres
Ajouter de nouveaux filtres dans `FilterPanel.tsx`

## 🔍 Debug

### Console
Vérifier les erreurs dans la console du navigateur

### API
Tester l'endpoint `/api/veille` directement

### Logs
Les erreurs Airtable sont loggées côté serveur

## 📞 Support

Pour toute question ou problème :
1. Vérifier la configuration Airtable
2. Contrôler les variables d'environnement
3. Tester l'API en local
