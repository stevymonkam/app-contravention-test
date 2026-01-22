# 🐛 Debug - Blocco Campi in Modalità Modifica

## 🔍 Modifications Effectuées pour le Debug

### 1. **Ajout de `setTimeout()` dans `loadContraventionData()`**

```typescript
// Mettre à jour l'état des champs selon le stato verbale
// Utiliser setTimeout pour s'assurer que le formulaire est complètement initialisé
setTimeout(() => {
  this.updateFieldsDisabledState(contravention.contravention.idStatoPratica);
}, 0);
```

**Pourquoi ?**
- Le `setTimeout(..., 0)` force l'exécution après le cycle de détection de changement d'Angular
- Garantit que le formulaire est complètement initialisé avant de désactiver les champs

---

### 2. **Options dans `disable()` et `enable()`**

```typescript
control.disable({ onlySelf: true, emitEvent: false });
control.enable({ onlySelf: true, emitEvent: false });
```

**Pourquoi ?**
- `onlySelf: true` : Ne propage pas le changement aux parents
- `emitEvent: false` : N'émet pas d'événement valueChanges (évite les boucles infinies)

---

### 3. **Logs de Debug Améliorés**

Dans `updateFieldsDisabledState()` :
```typescript
console.log(`Mode édition - Stato verbale: ${statoVerbale}, isEditMode: ${this.isEditMode}, Disabilita campi: ${shouldDisable}`);
console.log(`Campo ${fieldName} disabilitato (stato: ${statoVerbale}), control.disabled: ${control.disabled}`);
```

Dans le listener :
```typescript
console.log('▶ idStatoPratica changé:', value, 'isEditMode:', this.isEditMode);
```

---

## 🧪 Comment Tester et Déboguer

### Test 1 : Ouverture d'une Contravention "Pagato"

**Étapes :**
1. Ouvrir la console du navigateur (F12)
2. Aller à la liste des contraventions
3. Cliquer sur une contravention avec stato = "pagato" (2)

**Logs attendus dans la console :**
```
loadContraventionData appelée avec numVerbale: V-XXXXX
Contravention chargée depuis le serveur: {...}
Formulaire avant patchValue: {...}
Formulaire après patchValue: {...}
Mode édition - Stato verbale: 2, isEditMode: true, Disabilita campi: true
Campo targa disabilitato (stato: 2), control.disabled: true
Campo dataVerbale disabilitato (stato: 2), control.disabled: true
```

**Résultat visuel :**
- Les champs Targa et Data Verbale doivent être **grisés**
- Le curseur change quand on survole (interdit)
- Impossible de taper dedans

---

### Test 2 : Changement d'État en Mode Édition

**Étapes :**
1. Ouvrir une contravention avec stato = "da pagare" (1)
2. Vérifier que Targa et Data Verbale sont modifiables
3. Changer le dropdown "Stato Verbale" vers "pagato" (2)

**Logs attendus :**
```
▶ idStatoPratica changé: 2 isEditMode: true
Mode édition - Stato verbale: 2, isEditMode: true, Disabilita campi: true
Campo targa disabilitato (stato: 2), control.disabled: true
Campo dataVerbale disabilitato (stato: 2), control.disabled: true
```

**Résultat visuel :**
- Les champs Targa et Data Verbale deviennent **instantanément grisés**

---

### Test 3 : Mode Création

**Étapes :**
1. Cliquer sur "Nuova Contravention"
2. Remplir les champs
3. Sélectionner stato = "pagato" (2)

**Logs attendus :**
```
▶ idStatoPratica changé: 2 isEditMode: false
Mode création : aucun champ bloqué
```

**Résultat visuel :**
- Targa et Data Verbale restent **modifiables** (blancs, pas grisés)

---

## 🚨 Problèmes Possibles et Solutions

### Problème 1 : Les champs ne sont pas grisés visuellement

**Diagnostic :**
- Vérifier les logs : `control.disabled: true` ?
- Si `true` mais pas grisé → Problème CSS ou Angular Material

**Solution :**
```typescript
// Forcer la détection de changement
import { ChangeDetectorRef } from '@angular/core';

constructor(private cdr: ChangeDetectorRef, ...) {}

private updateFieldsDisabledState(statoVerbale: string): void {
  // ... code existant ...
  
  // Forcer la détection
  this.cdr.detectChanges();
}
```

---

### Problème 2 : Les champs sont bloqués même en mode création

**Diagnostic :**
- Vérifier les logs : `isEditMode: false` ?
- Si `false` mais bloqués → Vérifier le `return` dans la fonction

**Solution :**
- Vérifier que `this.isEditMode` est bien défini dans `ngOnInit()`
- Ajouter un log dans `ngOnInit()` :
```typescript
console.log('ngOnInit - Params:', params, 'isEditMode:', this.isEditMode);
```

---

### Problème 3 : `control.disabled` est `false` mais devrait être `true`

**Diagnostic :**
- Le control n'existe pas ou n'est pas trouvé
- Vérifier les logs : `Control ${fieldName} non trovato!`

**Solution :**
- Vérifier que les noms de champs sont corrects : `'targa'`, `'dataVerbale'`
- Vérifier que le formulaire est bien initialisé

---

### Problème 4 : Ça fonctionne la première fois, mais pas après changement d'état

**Diagnostic :**
- Le listener ne se déclenche pas
- Vérifier les logs : `▶ idStatoPratica changé:` apparaît ?

**Solution :**
- Vérifier que `setupValidationListeners()` est appelé dans `initForms()`
- Vérifier qu'il n'y a pas d'erreur JavaScript qui bloque l'exécution

---

## 📋 Checklist de Vérification

Avant de tester :

- ✅ `setTimeout()` ajouté dans `loadContraventionData()`
- ✅ `{ onlySelf: true, emitEvent: false }` dans `disable()` et `enable()`
- ✅ Logs de debug présents
- ✅ Listener sur `idStatoPratica` avec log
- ✅ Vérification `!this.isEditMode` au début de `updateFieldsDisabledState()`

Pendant le test :

- ✅ Ouvrir la console (F12)
- ✅ Onglet "Console" visible
- ✅ Pas d'erreurs JavaScript
- ✅ Logs apparaissent correctement
- ✅ Valeur `control.disabled` correcte

---

## 🔧 Code Complet de la Fonction

```typescript
/**
 * Active ou désactive les champs targa, dataVerbale et numVerbale
 * selon l'état du verbale (Pagato ou Annullato)
 * UNIQUEMENT EN MODE ÉDITION
 */
private updateFieldsDisabledState(statoVerbale: string): void {
  // Ne bloquer les champs QUE en mode édition
  if (!this.isEditMode) {
    console.log('Mode création : aucun champ bloqué');
    return;
  }
  
  const fieldsToDisable = ['targa', 'dataVerbale'];
  
  // Stati che bloccano la modifica: 2 = Pagato, 6 = Annullato
  const shouldDisable = statoVerbale === '2' || statoVerbale === '6';
  
  console.log(`Mode édition - Stato verbale: ${statoVerbale}, isEditMode: ${this.isEditMode}, Disabilita campi: ${shouldDisable}`);
  
  fieldsToDisable.forEach(fieldName => {
    const control = this.contraventionForm.get(fieldName);
    if (control) {
      if (shouldDisable) {
        control.disable({ onlySelf: true, emitEvent: false });
        console.log(`Campo ${fieldName} disabilitato (stato: ${statoVerbale}), control.disabled: ${control.disabled}`);
      } else {
        control.enable({ onlySelf: true, emitEvent: false });
        console.log(`Campo ${fieldName} abilitato, control.disabled: ${control.disabled}`);
      }
    } else {
      console.error(`Control ${fieldName} non trovato!`);
    }
  });
}
```

---

## 📸 Capture d'Écran des Logs Attendus

```
Console:
▼ loadContraventionData appelée avec numVerbale: V-390614A-2025
▼ Contravention chargée depuis le serveur: {contravention: {...}}
▼ Formulaire avant patchValue: {...}
▼ Formulaire après patchValue: {...}
▼ Fichiers chargés: []
▶ Mode édition - Stato verbale: 2, isEditMode: true, Disabilita campi: true
▶ Campo targa disabilitato (stato: 2), control.disabled: true
▶ Campo dataVerbale disabilitato (stato: 2), control.disabled: true
✓ Données chargées avec succès
```

---

## ✅ Si Ça Ne Fonctionne Toujours Pas

1. **Copier tous les logs de la console** et les envoyer
2. **Faire une capture d'écran** du formulaire
3. **Vérifier la version d'Angular** : `ng version`
4. **Vérifier si Reactive Forms est bien importé** dans `app.module.ts`

---

🎯 **Avec ces modifications et ces logs, nous pourrons identifier exactement où est le problème !**
