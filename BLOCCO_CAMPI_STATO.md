# 🔒 Blocco Campi per Stato Verbale

## 🎯 Objectif

Désactiver la modification de certains champs critiques lorsque le stato verbale est **"Pagato"** (2) ou **"Annullato"** (6).

---

## 📋 Champs Bloqués

Lorsque le stato verbale est **"Pagato"** (2) ou **"Annullato"** (6), les champs suivants deviennent **non modifiables** :

1. ✅ **Targa** → `formControlName="targa"`
2. ✅ **Data Verbale** → `formControlName="dataVerbale"`
3. ✅ **Numero Verbale** → `formControlName="numVerbale"` (déjà readonly en mode édition)

---

## 🔧 Implémentation Technique

### 1. **Méthode `updateFieldsDisabledState()`**

Cette méthode active ou désactive les champs selon l'état du verbale.

```typescript
/**
 * Active ou désactive les champs targa, dataVerbale et numVerbale
 * selon l'état du verbale (Pagato ou Annullato)
 */
private updateFieldsDisabledState(statoVerbale: string): void {
  const fieldsToDisable = ['targa', 'dataVerbale'];
  // Note: numVerbale est déjà readonly en mode édition
  
  // Stati che bloccano la modifica: 2 = Pagato, 6 = Annullato
  const shouldDisable = statoVerbale === '2' || statoVerbale === '6';
  
  console.log(`Stato verbale: ${statoVerbale}, Disabilita campi: ${shouldDisable}`);
  
  fieldsToDisable.forEach(fieldName => {
    const control = this.contraventionForm.get(fieldName);
    if (control) {
      if (shouldDisable) {
        control.disable();
        console.log(`Campo ${fieldName} disabilitato`);
      } else {
        control.enable();
        console.log(`Campo ${fieldName} abilitato`);
      }
    }
  });
}
```

**Fonctionnement :**
- 🔍 Vérifie si `statoVerbale === '2'` (Pagato) ou `statoVerbale === '6'` (Annullato)
- 🔒 Si oui → **désactive** (`disable()`) les champs `targa` et `dataVerbale`
- 🔓 Si non → **active** (`enable()`) les champs
- 📝 Log dans la console pour le debugging

---

### 2. **Listener sur `idStatoPratica`**

Un listener a été ajouté dans `setupValidationListeners()` pour détecter les changements d'état :

```typescript
// Revalider quand idStatoPratica change
this.contraventionForm.get('idStatoPratica')?.valueChanges.subscribe((value) => {
  this.contraventionForm.updateValueAndValidity({ emitEvent: false });
  this.updateFieldsDisabledState(value); // ← Appel automatique
});
```

**Fonctionnement :**
- 👂 Écoute les changements de la valeur du dropdown "Stato Verbale"
- ⚡ Appelle automatiquement `updateFieldsDisabledState()` avec la nouvelle valeur
- 🔄 Les champs sont activés/désactivés **en temps réel**

---

### 3. **Initialisation en Mode Édition**

Lors du chargement d'une contravention existante (`loadContraventionData()`), l'état des champs est mis à jour :

```typescript
// Mettre à jour l'état des champs selon le stato verbale
this.updateFieldsDisabledState(contravention.contravention.idStatoPratica);
```

**Fonctionnement :**
- 📥 Charge les données de la contravention depuis le serveur
- 📝 Remplit le formulaire avec `patchValue()`
- 🔒 Appelle `updateFieldsDisabledState()` pour désactiver les champs si nécessaire
- ✅ L'utilisateur voit immédiatement les champs grisés (disabled)

---

### 4. **Sauvegarde avec `getRawValue()`**

Lors de la soumission du formulaire, on utilise `getRawValue()` au lieu de `.value` :

```typescript
// Utiliser getRawValue() pour inclure les champs désactivés (targa, dataVerbale)
const contraventionData: Contravention = {
  ...this.contraventionForm.getRawValue(),
  ricorso: this.contraventionForm.get('ricorso')?.value,
  decurtazionePunti: this.contraventionForm.get('decurtazionePunti')?.value
};
```

**Pourquoi `getRawValue()` ?**
- ⚠️ **`.value`** : Exclut les champs désactivés
- ✅ **`.getRawValue()`** : Inclut **tous** les champs, même désactivés
- 💾 Garantit que les valeurs de `targa` et `dataVerbale` sont envoyées au serveur

---

## 🎮 Scénarios d'Utilisation

### Scénario 1 : Changement d'État vers "Pagato"
1. L'utilisateur ouvre une contravention en mode édition
2. État initial : "da pagare" (1)
3. **Champs modifiables** : Targa, Data Verbale, tous les autres
4. L'utilisateur change l'état vers **"pagato"** (2)
5. ⚡ **Automatiquement** :
   - ❌ Targa devient **grisé** (disabled)
   - ❌ Data Verbale devient **grisé** (disabled)
   - ✅ Les autres champs restent modifiables

### Scénario 2 : Ouverture d'une Contravention "Annullato"
1. L'utilisateur clique sur une ligne dans la liste
2. La contravention a l'état "annullato" (6)
3. Le formulaire se charge
4. ⚡ **Automatiquement** :
   - ❌ Targa est **grisé** (disabled)
   - ❌ Data Verbale est **grisé** (disabled)
   - ❌ Numero Verbale est **readonly** (déjà en place)

### Scénario 3 : Changement d'État depuis "Pagato" vers "da pagare"
1. La contravention est en état "pagato" (2)
2. Champs bloqués : Targa, Data Verbale
3. L'utilisateur change l'état vers **"da pagare"** (1)
4. ⚡ **Automatiquement** :
   - ✅ Targa devient **modifiable**
   - ✅ Data Verbale devient **modifiable**

---

## 📊 Tableau des États

| Stato Verbale | Valeur | Targa | Data Verbale | Numero Verbale | Autres Champs |
|---------------|--------|-------|--------------|----------------|---------------|
| **da pagare** | 1 | ✅ Modifiable | ✅ Modifiable | 🔒 Readonly | ✅ Modifiable |
| **pagato** | 2 | ❌ Bloqué | ❌ Bloqué | 🔒 Readonly | ✅ Modifiable |
| **contestato** | 3 | ✅ Modifiable | ✅ Modifiable | 🔒 Readonly | ✅ Modifiable |
| **sospeso in attesa ricevuta** | 4 | ✅ Modifiable | ✅ Modifiable | 🔒 Readonly | ✅ Modifiable |
| **sospeso in attesa decurtaz punti** | 5 | ✅ Modifiable | ✅ Modifiable | 🔒 Readonly | ✅ Modifiable |
| **annullato** | 6 | ❌ Bloqué | ❌ Bloqué | 🔒 Readonly | ✅ Modifiable |

**Légende :**
- ✅ **Modifiable** : L'utilisateur peut modifier le champ
- ❌ **Bloqué** : Champ désactivé (grisé), non modifiable
- 🔒 **Readonly** : Affiche la valeur, mais pas modifiable (spécifique à numVerbale en édition)

---

## 🎨 Apparence Visuelle

### Champ Normal (Activé)
```html
<input type="text" formControlName="targa">
```
- 📝 Fond blanc
- ✍️ Curseur visible
- ✅ L'utilisateur peut taper

### Champ Désactivé
```html
<input type="text" formControlName="targa" [disabled]="true">
```
- 🔲 Fond grisé (selon le style du navigateur)
- 🚫 Curseur interdit
- ❌ L'utilisateur ne peut pas taper

---

## 🧪 Tests Recommandés

### Test 1 : Blocage Automatique lors du Changement d'État
1. Ouvrir une contravention existante
2. État initial : "da pagare"
3. Vérifier que Targa et Data Verbale sont **modifiables**
4. Changer l'état vers **"pagato"**
5. ✅ Vérifier que Targa et Data Verbale sont **grisés** (disabled)

### Test 2 : Chargement d'une Contravention "Pagato"
1. Aller à la liste des contraventions
2. Cliquer sur une contravention avec stato = "pagato"
3. ✅ Vérifier que Targa et Data Verbale sont **immédiatement grisés**

### Test 3 : Déblocage en Changeant l'État
1. Ouvrir une contravention avec stato = "pagato"
2. Vérifier que Targa et Data Verbale sont **grisés**
3. Changer l'état vers **"da pagare"**
4. ✅ Vérifier que Targa et Data Verbale redeviennent **modifiables**

### Test 4 : Sauvegarde avec Champs Désactivés
1. Ouvrir une contravention avec stato = "pagato"
2. Modifier un autre champ (ex: Note)
3. Cliquer sur **"Salva"**
4. ✅ Vérifier que les valeurs de Targa et Data Verbale sont **bien envoyées** au serveur

### Test 5 : Stato "Annullato"
1. Créer ou ouvrir une contravention
2. Changer l'état vers **"annullato"** (6)
3. ✅ Vérifier que Targa et Data Verbale sont **grisés**

---

## 🔍 Console Logs (Debugging)

Lors du changement d'état, vous verrez ces logs dans la console :

```
Stato verbale: 2, Disabilita campi: true
Campo targa disabilitato
Campo dataVerbale disabilitato
```

Lors du déblocage :

```
Stato verbale: 1, Disabilita campi: false
Campo targa abilitato
Campo dataVerbale abilitato
```

---

## 📁 Fichiers Modifiés

1. ✅ `contravention.component.ts`
   - Méthode `updateFieldsDisabledState()` ajoutée
   - Listener sur `idStatoPratica` mis à jour
   - Appel dans `loadContraventionData()`
   - Utilisation de `getRawValue()` dans `onSubmit()`

2. ✅ `BLOCCO_CAMPI_STATO.md` (ce fichier)
   - Documentation complète

---

## ✅ Résultat Final

✅ **Champs bloqués** automatiquement pour stato "Pagato" et "Annullato"  
✅ **Changement en temps réel** lors de la modification du dropdown  
✅ **État correct** au chargement d'une contravention existante  
✅ **Sauvegarde correcte** avec `getRawValue()` incluant les champs désactivés  
✅ **Logs de debugging** pour tracer les changements  

🎉 **Les champs sont maintenant protégés selon l'état du verbale !**
