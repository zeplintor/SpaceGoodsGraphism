# 🚀 Déploiement SpaceGoods

Guide rapide pour déployer SpaceGoods sur GitHub et Netlify.

## 📋 Prérequis

- Compte GitHub
- Compte Netlify (gratuit)
- Git installé

## 🔥 Étape 1 : Initialiser Git

```bash
cd /Users/mac/Desktop/SpaceGoodsGraphism
git init
git add .
git commit -m "Initial commit - SpaceGoods website"
```

## 🌐 Étape 2 : Pusher sur GitHub

### Option A : Créer un nouveau repo depuis la ligne de commande

```bash
# Créer le repo sur GitHub.com d'abord, puis :
git remote add origin https://github.com/VOTRE-USERNAME/spacegoods.git
git branch -M main
git push -u origin main
```

### Option B : Utiliser GitHub CLI

```bash
gh repo create spacegoods --public --source=. --remote=origin
git push -u origin main
```

## ⚡ Étape 3 : Déployer sur Netlify

### Méthode 1 : Via l'interface Netlify (Recommandé)

1. Aller sur [netlify.com](https://netlify.com)
2. Cliquer sur "Add new site" → "Import an existing project"
3. Choisir GitHub et sélectionner le repo `spacegoods`
4. Configuration :
   - **Branch to deploy**: `main`
   - **Publish directory**: `.` (point)
   - Laisser Build command vide
5. Cliquer sur "Deploy site"

### Méthode 2 : Via Netlify CLI

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Se connecter
netlify login

# Initialiser et déployer
netlify init

# Ou déploiement direct
netlify deploy --prod
```

## ✅ Vérification

Après le déploiement :

1. **GitHub** : https://github.com/VOTRE-USERNAME/spacegoods
2. **Netlify** : URL générée automatiquement (ex: spacegoods-xyz123.netlify.app)

## 🎨 Personnaliser le domaine Netlify

1. Dans Netlify dashboard → Site settings
2. Domain management → Options → Edit site name
3. Changer de `random-name-123` à `spacegoods`
4. Votre site sera : `spacegoods.netlify.app`

## 🔄 Mises à jour futures

```bash
# Faire vos modifications
git add .
git commit -m "Description des changements"
git push

# Netlify déploiera automatiquement !
```

## 🐛 Troubleshooting

### Problème : Les SVG ne s'affichent pas
- Vérifier que le dossier `assets/img/SVG/` est bien committé
- Vérifier les chemins dans le HTML

### Problème : 404 sur les pages
- Le fichier `netlify.toml` gère les redirects
- S'assurer qu'il est bien présent à la racine

### Problème : CSS cassé
- Vérifier que tous les fichiers HTML sont au même niveau
- Les styles inline devraient fonctionner

## 📞 Support

Questions ? Ouvrir une issue sur GitHub !

---

**Bon déploiement ! 🚀✨**
