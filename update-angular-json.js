const fs = require('fs');
const path = require('path');

const angularJsonPath = path.join(__dirname, 'angular.json');

// Lire le fichier angular.json
fs.readFile(angularJsonPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Erreur lors de la lecture du fichier angular.json:', err);
    return;
  }

  try {
    // Remplacer toutes les occurrences de styles.scss par styles.css
    const updatedData = data.replace(/styles\.scss/g, 'styles.css');
    
    // Écrire les modifications dans le fichier
    fs.writeFile(angularJsonPath, updatedData, 'utf8', (err) => {
      if (err) {
        console.error('Erreur lors de l\'écriture du fichier angular.json:', err);
        return;
      }
      console.log('Le fichier angular.json a été mis à jour avec succès.');
    });
  } catch (error) {
    console.error('Erreur lors du traitement du fichier angular.json:', error);
  }
});
