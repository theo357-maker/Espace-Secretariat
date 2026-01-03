// build.js - À exécuter avant chaque déploiement
const fs = require('fs');
const crypto = require('crypto');

// 1. Générer un nouveau numéro de version basé sur la date
const now = new Date();
const version = `2.${now.getFullYear() % 100}.${now.getMonth() + 1}.${now.getDate()}`;

console.log(`🔄 Génération version ${version}`);

// 2. Mettre à jour sw.js
let swContent = fs.readFileSync('sw.js', 'utf8');
swContent = swContent.replace(
  /const APP_VERSION = ['"][^'"]*['"]/,
  `const APP_VERSION = '${version}'`
);
fs.writeFileSync('sw.js', swContent);

// 3. Mettre à jour version-manifest.json
const manifest = JSON.parse(fs.readFileSync('version-manifest.json', 'utf8'));
manifest.currentVersion = version;
manifest.previousVersion = manifest.currentVersion;
manifest.releaseDate = now.toISOString().split('T')[0];
fs.writeFileSync('version-manifest.json', JSON.stringify(manifest, null, 2));

// 4. Ajouter un hash aux fichiers pour casser le cache
const indexContent = fs.readFileSync('index.html', 'utf8');
const hash = crypto.createHash('md5').update(indexContent).digest('hex').substring(0, 8);
const newIndexContent = indexContent.replace(
  /<link rel="stylesheet"/g,
  `<link rel="stylesheet"?v=${hash}`
).replace(
  /<script src="[^"]*"/g,
  match => match.replace(/\.js"/, `.js?v=${hash}"`)
);

fs.writeFileSync('index.html', newIndexContent);

console.log('✅ Build terminé!');