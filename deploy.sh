#!/bin/bash

echo "🚀 Déploiement Vercel - Interface Veille Technologique"
echo "=================================================="

# Vérifier que Git est initialisé
if [ ! -d ".git" ]; then
    echo "❌ Git non initialisé. Initialisation..."
    git init
    git add .
    git commit -m "Initial commit - Interface Veille Technologique"
    echo "✅ Git initialisé"
else
    echo "✅ Git déjà initialisé"
fi

# Build du projet
echo "🔨 Build du projet..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build réussi"
else
    echo "❌ Build échoué"
    exit 1
fi

# Vérifier le statut Git
echo "📊 Statut Git:"
git status

echo ""
echo "🎯 Prochaines étapes:"
echo "1. Créer un repository sur GitHub"
echo "2. Ajouter le remote: git remote add origin https://github.com/TON_USERNAME/TON_REPO.git"
echo "3. Pousser: git push -u origin main"
echo "4. Aller sur vercel.com et importer le repository"
echo "5. Configurer les variables d'environnement Airtable"
echo ""
echo "🚀 Interface prête pour le déploiement Vercel !"
