# ✅ Suppression Multiple de Fichiers

## 🎯 Fonctionnalité Implémentée

Ajout de la sélection multiple de fichiers avec des **checkboxes** et suppression en masse via le bouton **"Cancella"**.

---

## 📋 Modifications Apportées

### 1. **HTML** (`contravention.component.html`)

#### Tableau avec Checkboxes
```html
<tbody>
  <tr *ngFor="let file of uploadedFiles; let i = index">
    <td class="checkbox-cell">
      <input 
        type="checkbox" 
        [checked]="selectedFileIndices.has(i)"
        (change)="onFileCheckboxChange(i, $event)">
    </td>
    <td>{{ file.tipo || '-' }}</td>
    <td>{{ file.numVerbale || contraventionNumVerbale || '-' }}</td>
    <td>{{ file.note || '-' }}</td>
    <td><a href="javascript:void(0)" class="link-button">{{ file.elemento || file.testo1 || 'Documento' }}</a></td>
    <td><span class="view-icon">👁️</span> Guarda</td>
  </tr>
</tbody>
```

**Changements :**
- ✅ Checkbox avec `[checked]="selectedFileIndices.has(i)"`
- ✅ Event `(change)="onFileCheckboxChange(i, $event)"`
- ✅ Chaque checkbox est liée à l'index du fichier

#### Bouton "Cancella" Mis à Jour
```html
<div class="action-buttons">
  <button 
    type="button" 
    (click)="removeSelectedFiles()" 
    [disabled]="selectedFileIndices.size === 0">
    Cancella
  </button>
  <button type="button" (click)="onPrint()">Stampa</button>
  <button type="button">Invia</button>
</div>
```

**Changements :**
- ✅ Appelle `removeSelectedFiles()` au clic
- ✅ Désactivé quand `selectedFileIndices.size === 0` (aucun fichier sélectionné)

---

### 2. **TypeScript** (`contravention.component.ts`)

#### Propriété Ajoutée
```typescript
selectedFileIndices: Set<number> = new Set();
```

**Description :**
- Type : `Set<number>` (ensemble d'index uniques)
- Stocke les index des fichiers sélectionnés
- Permet une gestion efficace des sélections multiples

---

#### Méthode 1 : `onFileCheckboxChange()`
```typescript
onFileCheckboxChange(index: number, event: any): void {
  if (event.target.checked) {
    this.selectedFileIndices.add(index);
  } else {
    this.selectedFileIndices.delete(index);
  }
  console.log('Fichiers sélectionnés:', Array.from(this.selectedFileIndices));
}
```

**Fonctionnement :**
1. Si la checkbox est **cochée** → Ajoute l'index au `Set`
2. Si la checkbox est **décochée** → Retire l'index du `Set`
3. Log les fichiers sélectionnés pour debug

---

#### Méthode 2 : `removeSelectedFiles()`
```typescript
removeSelectedFiles(): void {
  if (this.selectedFileIndices.size === 0) {
    this.showMessage('Aucun fichier sélectionné', 'error');
    return;
  }

  if (confirm(`Êtes-vous sûr de vouloir supprimer ${this.selectedFileIndices.size} fichier(s)?`)) {
    // Trier en ordre décroissant pour éviter les problèmes d'index
    const indices = Array.from(this.selectedFileIndices).sort((a, b) => b - a);
    
    let deletedCount = 0;
    let errorCount = 0;
    const totalToDelete = indices.length;

    indices.forEach(index => {
      const fileToRemove = this.uploadedFiles[index];
      
      // Si le fichier a un ID, le supprimer du serveur
      if (fileToRemove.id && this.contraventionNumVerbale) {
        this.contraventionService.deleteFile(this.contraventionNumVerbale, fileToRemove.id)
          .subscribe({
            next: () => {
              console.log('Fichier supprimé du serveur:', fileToRemove.testo1);
              this.uploadedFiles.splice(index, 1);
              deletedCount++;
              
              if (deletedCount + errorCount === totalToDelete) {
                this.selectedFileIndices.clear();
                this.showMessage(`${deletedCount} fichier(s) supprimé(s) avec succès`, 'success');
              }
            },
            error: (error: any) => {
              console.error('Erreur lors de la suppression:', error);
              errorCount++;
              
              if (deletedCount + errorCount === totalToDelete) {
                this.selectedFileIndices.clear();
                this.showMessage(`${deletedCount} fichier(s) supprimé(s), ${errorCount} erreur(s)`, 'error');
              }
            }
          });
      } else {
        // Fichier pas encore uploadé, juste le retirer de la liste
        this.uploadedFiles.splice(index, 1);
        deletedCount++;
      }
    });

    // Si tous les fichiers étaient locaux (pas encore uploadés)
    if (indices.every(i => !this.uploadedFiles[i]?.id)) {
      this.selectedFileIndices.clear();
      this.showMessage(`${deletedCount} fichier(s) retiré(s) de la liste`, 'success');
    }
  }
}
```

**Fonctionnement :**
1. **Vérification** : Si aucun fichier sélectionné → Message d'erreur
2. **Confirmation** : Demande confirmation avant suppression
3. **Tri décroissant** : `sort((a, b) => b - a)` pour éviter les problèmes d'index
4. **Suppression** :
   - **Fichiers avec ID** → Appel API `deleteFile()` puis suppression du tableau
   - **Fichiers locaux** → Suppression directe du tableau
5. **Compteurs** : Tracking de `deletedCount` et `errorCount`
6. **Nettoyage** : `selectedFileIndices.clear()` à la fin
7. **Feedback** : Message de succès/erreur avec nombre de fichiers

---

## 🎮 Utilisation

### Scénario 1 : Supprimer 1 Fichier
1. Cocher la checkbox du fichier à supprimer
2. Cliquer sur "Cancella"
3. Confirmer la suppression
4. ✅ Fichier supprimé

### Scénario 2 : Supprimer Plusieurs Fichiers
1. Cocher plusieurs checkboxes
2. Cliquer sur "Cancella"
3. Confirmer : "Êtes-vous sûr de vouloir supprimer X fichier(s)?"
4. ✅ Tous les fichiers sélectionnés sont supprimés

### Scénario 3 : Aucun Fichier Sélectionné
1. Ne cocher aucune checkbox
2. Le bouton "Cancella" est **désactivé** (`disabled`)
3. ❌ Impossible de cliquer

---

## 🔍 Points Techniques

### Pourquoi un `Set<number>` ?
- ✅ **Unicité** : Pas de doublons d'index
- ✅ **Performance** : `has()`, `add()`, `delete()` en O(1)
- ✅ **Simplicité** : Méthodes natives pour ajouter/retirer

### Pourquoi trier en ordre décroissant ?
```typescript
const indices = Array.from(this.selectedFileIndices).sort((a, b) => b - a);
```

**Exemple problématique (ordre croissant) :**
```
Fichiers: [0, 1, 2, 3, 4]
Sélection: [1, 3]

Suppression de 1 → [0, 2, 3, 4]
Suppression de 3 → ERREUR ! (index 3 pointe maintenant sur l'ancien index 4)
```

**Solution (ordre décroissant) :**
```
Fichiers: [0, 1, 2, 3, 4]
Sélection: [1, 3] → Tri: [3, 1]

Suppression de 3 → [0, 1, 2, 4]
Suppression de 1 → [0, 2, 4] ✅ Correct !
```

### Gestion des Fichiers Uploadés vs Locaux
- **Fichiers avec `id`** : Déjà sur le serveur → Appel API `deleteFile()`
- **Fichiers sans `id`** : En attente d'upload → Suppression directe du tableau

---

## 📊 Messages Utilisateur

| Cas | Message |
|-----|---------|
| Aucun fichier sélectionné | "Aucun fichier sélectionné" (erreur) |
| Confirmation avant suppression | "Êtes-vous sûr de vouloir supprimer X fichier(s)?" |
| Suppression réussie | "X fichier(s) supprimé(s) avec succès" (succès) |
| Suppression partielle | "X fichier(s) supprimé(s), Y erreur(s)" (erreur) |
| Fichiers locaux retirés | "X fichier(s) retiré(s) de la liste" (succès) |

---

## ✅ Tests Recommandés

1. **Sélection unique** : Cocher 1 fichier → Cancella → Vérifier suppression
2. **Sélection multiple** : Cocher 3 fichiers → Cancella → Vérifier suppression
3. **Désélection** : Cocher puis décocher → Vérifier que le bouton se désactive
4. **Aucune sélection** : Ne rien cocher → Vérifier que "Cancella" est désactivé
5. **Fichiers uploadés** : Supprimer un fichier avec ID → Vérifier appel API
6. **Fichiers locaux** : Supprimer un fichier sans ID → Vérifier retrait direct
7. **Annulation** : Cliquer "Annuler" dans la confirmation → Rien ne se passe
8. **Erreur serveur** : Simuler une erreur → Vérifier message d'erreur

---

## 🎯 Résultat Final

✅ **Sélection multiple** de fichiers avec checkboxes  
✅ **Bouton "Cancella"** désactivé si aucune sélection  
✅ **Suppression en masse** avec confirmation  
✅ **Gestion d'erreurs** avec compteurs et messages  
✅ **Nettoyage automatique** des sélections après suppression  
✅ **Support fichiers uploadés ET locaux**

🎉 **La fonctionnalité de suppression multiple est maintenant opérationnelle !**
