# ✅ Validazioni Obbligatorie - Formulaire Contravention

## 📋 Résumé des Modifications

Les validateurs du formulaire ont été mis à jour pour correspondre exactement aux exigences du tableau fourni. Les validations incluent désormais des champs obligatoires fixes ET conditionnels.

---

## 🔴 Champs OBLIGATOIRES et BLOQUANTS (Toujours requis)

Ces champs ont maintenant `Validators.required` et sont marqués avec un astérisque rouge (*) dans l'interface :

| Campo | FormControlName | Validation | Visuel |
|-------|----------------|------------|--------|
| **Targa** | `targa` | `Validators.required` | ✅ Astérisque rouge |
| **Stato Verbale** | `idStatoPratica` | `Validators.required` | ✅ Astérisque rouge |
| **Data Verbale** | `dataVerbale` | `Validators.required` + `dataVerbaleNotFuture()` | ✅ Astérisque rouge |
| **Numero Verbale** | `numVerbale` | `Validators.required` | ✅ Astérisque rouge |
| **Data Notifica** | `dataNotifica` | `Validators.required` | ✅ Astérisque rouge |
| **Giorni alla scadenza** | `ggScadenza` | `Validators.required` | ✅ Astérisque rouge |
| **Pagata** | `pagatoAziendaDipendente` | Toujours une valeur (radio) | ✅ Astérisque rouge |

---

## 🟠 Champs OBLIGATOIRES CONDITIONNELS (Requis selon conditions)

Ces champs sont **obligatoires uniquement** si certaines conditions sont remplies :

| Campo | FormControlName | Condition | Message d'erreur |
|-------|----------------|-----------|------------------|
| **Data invio ricorso** | `dataInvioRicorso` | Obligatoire si `ricorso = true` | "Data invio ricorso è obbligatoria quando 'Ricorso' è selezionato" |
| **Data invio decurtazione** | `dataInvioDecurtazione` | Obligatoire si `decurtaPunti = true` | "Data invio decurtazione è obbligatoria quando 'Decurtazione punti' è selezionato" |
| **Trattenuta su cedolino del** | `mmyyyyTrattenutaCedolino` | Obligatoire si `pagatoAziendaDipendente = true` (Azienda) | "Trattenuta su cedolino è obbligatoria quando pagata da 'Azienda'" |

---

## ⚪ Champs NON OBLIGATOIRES

Ces champs n'ont **PAS** de `Validators.required` :

| Campo | FormControlName | Validation |
|-------|----------------|------------|
| **Cognome e nome guidatore** | `guidatore` | Aucune |
| **Mail guidatore** | `emailGuidatore` | Aucune |
| **Comune del verbale** | `comuneVerbale` | Aucune |
| **Sede Notifica** | `sedeNotifica` | Aucune |
| **Importo** | `importo` | Aucune |
| **Importo integrato** | `importoIntegrato` | Aucune |
| **Verbale di rif./correlati** | `numVerbaleCorrelato` | Aucune |
| **Data spedizione al finanziario** | `dataSpediziFinanz` | Aucune (mais validations conditionnelles) |
| **Data pagamento verbale** | `dataPagamentoVerb` | Aucune (mais validations conditionnelles) |
| **Gg ricorso** | `ggRicorso` | Aucune |
| **Ricorso** | `ricorso` | Aucune (radio button) |
| **Decurtazione punti** | `decurtaPunti` | Aucune (radio button) |
| **Trattenuta differenza multa su cedolino del** | `mmyyyyTrattenutaDiffMultaCedolino` | Aucune |
| **Note** | `note` | Aucune |

---

## 📝 Code TypeScript - Validateurs Conditionnels

### 1. Data Invio Ricorso (Obligatoire si Ricorso = Si)

```typescript
static dataInvioRicorsoValid(form: FormGroup): ValidationErrors | null {
  const ricorso = form.get('ricorso')?.value;
  const dataInvioRicorso = form.get('dataInvioRicorso')?.value;
  
  // OBLIGATOIRE si ricorso = true
  if (ricorso === true && !dataInvioRicorso) {
    return { dataInvioRicorsoRequired: true };
  }
  
  // Validation supplémentaire : date > data notifica
  // ...
}
```

### 2. Data Invio Decurtazione (Obligatoire si Decurtazione Punti = Si)

```typescript
static dataInvioDecurtazioneValid(form: FormGroup): ValidationErrors | null {
  const decurtaPunti = form.get('decurtaPunti')?.value;
  const dataInvioDecurtazione = form.get('dataInvioDecurtazione')?.value;
  
  // OBLIGATOIRE si decurtaPunti = true
  if (decurtaPunti === true && !dataInvioDecurtazione) {
    return { dataInvioDecurtazioneRequired: true };
  }
  
  // Validation supplémentaire : date > data notifica
  // ...
}
```

### 3. Trattenuta Cedolino (Obligatoire si Pagata = Azienda)

```typescript
static trattenutaCedulinoValid(form: FormGroup): ValidationErrors | null {
  const pagata = form.get('pagatoAziendaDipendente')?.value;
  const trattenuta = form.get('mmyyyyTrattenutaCedolino')?.value;
  
  // OBLIGATOIRE si pagata = Azienda (true)
  if (pagata === true && !trattenuta) {
    return { trattenutaCedulinoRequired: true };
  }
  
  // Validation supplémentaire : peut seulement être remplie si pagata = Azienda
  if (trattenuta && pagata !== true) {
    return { trattenutaRequiresAzienda: true };
  }
  
  return null;
}
```

---

## 📝 Code TypeScript - initForms()

```typescript
this.contraventionForm = this.fb.group({
  numVerbale: ['', Validators.required],              // ✅ Obligatoire
  targa: ['', Validators.required],                   // ✅ Obligatoire
  guidatore: [''],                                    // ⚪ Non obligatoire
  emailGuidatore: [''],                               // ⚪ Non obligatoire
  societaIntestataria: [''],
  dataVerbale: ['', [Validators.required, ContraventionValidators.dataVerbaleNotFuture()]], // ✅ Obligatoire
  dataNotifica: ['', Validators.required],            // ✅ Obligatoire
  comuneVerbale: [''],                                // ⚪ Non obligatoire
  sedeNotifica: [''],                                 // ⚪ Non obligatoire
  ggScadenza: ['', Validators.required],              // ✅ Obligatoire
  importo: [''],                                      // ⚪ Non obligatoire
  importoIntegrato: [''],                             // ⚪ Non obligatoire
  numVerbaleCorrelato: [''],                          // ⚪ Non obligatoire
  dataSpediziFinanz: [''],                            // ⚪ Non obligatoire
  dataPagamentoVerb: [''],                            // ⚪ Non obligatoire
  pagatoAziendaDipendente: [false],                   // ✅ Radio (toujours une valeur)
  ricorso: [false],                                   // ⚪ Radio
  ggRicorso: [''],                                    // ⚪ Non obligatoire
  dataInvioRicorso: [''],                             // 🟠 Conditionnel
  decurtaPunti: [false],                              // ⚪ Radio
  dataInvioDecurtazione: [''],                        // 🟠 Conditionnel
  mmyyyyTrattenutaCedolino: [''],                     // 🟠 Conditionnel
  mmyyyyTrattenutaDiffMultaCedolino: [''],            // ⚪ Non obligatoire
  idStatoPratica: ['', Validators.required],          // ✅ Obligatoire
  exSocietaIntestataria: [''],
  note: ['']                                          // ⚪ Non obligatoire
}, {
  validators: [
    // Validateurs de groupe (conditionnels)
    ContraventionValidators.dataNotificaAfterDataVerbale,
    ContraventionValidators.dataSpedizioneAfterNotifica,
    ContraventionValidators.dataPagamentoValid,
    ContraventionValidators.pagataValid,
    ContraventionValidators.ricorsoValid,
    ContraventionValidators.dataInvioRicorsoValid,        // ✅ Inclut validation required
    ContraventionValidators.dataInvioDecurtazioneValid,   // ✅ Inclut validation required
    ContraventionValidators.trattenutaCedulinoValid       // ✅ Inclut validation required
  ]
});
```

---

## 🎨 Indicateurs Visuels HTML

Chaque champ obligatoire affiche un astérisque rouge (*) :

```html
<!-- Exemple : Targa -->
<div class="form-group">
  <label>Targa <span style="color: red;">*</span></label>
  <input type="text" formControlName="targa" [readonly]="isFieldsLocked">
</div>

<!-- Exemple : Stato Verbale -->
<div class="form-group">
  <label>Stato Verbale <span style="color: red;">*</span></label>
  <select formControlName="idStatoPratica">
    <option value="">-- Seleziona --</option>
    <option value="1">da pagare</option>
    <option value="2">pagato</option>
    <!-- ... -->
  </select>
</div>
```

---

## 📢 Messages d'Erreur

Les messages d'erreur suivants sont affichés dans la méthode `getValidationErrors()` :

### Champs Obligatoires (Always Required)
- ❌ "Targa è obbligatoria"
- ❌ "Numero Verbale è obbligatorio"
- ❌ "Data Verbale è obbligatoria"
- ❌ "Data Notifica è obbligatoria"
- ❌ "Giorni alla scadenza è obbligatorio"
- ❌ "Stato Verbale è obbligatorio"

### Champs Obligatoires Conditionnels
- ⚠️ "Data invio ricorso è obbligatoria quando 'Ricorso' è selezionato"
- ⚠️ "Data invio decurtazione è obbligatoria quando 'Decurtazione punti' è selezionato"
- ⚠️ "Trattenuta su cedolino è obbligatoria quando pagata da 'Azienda'"

### Validations Conditionnelles (Dates & États)
- ⚠️ "Data verbale non può essere futura"
- ⚠️ "Data notifica deve essere >= data verbale"
- ⚠️ "Data spedizione al finanziario deve essere > data notifica"
- ⚠️ "Data pagamento verbale deve essere >= data notifica (quando stato = pagato)"
- ⚠️ "Pagata deve essere 'Azienda' quando data spedizione al finanziario è presente"
- ⚠️ "Pagata deve essere 'Dipendente' quando data spedizione al finanziario non è presente"
- ⚠️ "Ricorso richiede stato verbale = 'contestato'"
- ⚠️ "Data invio ricorso deve essere > data notifica"
- ⚠️ "Data invio decurtazione deve essere > data notifica"
- ⚠️ "Trattenuta su cedolino richiede pagata = 'Azienda'"

---

## 🚫 Comportement de Blocage

### Soumission du Formulaire

Si un champ obligatoire est vide ou si une validation conditionnelle échoue, le formulaire sera **invalide** et la soumission sera **bloquée** :

```typescript
onSubmit(): void {
  if (this.contraventionForm.invalid) {
    this.markFormGroupTouched();
    const errors = this.getValidationErrors();
    if (errors.length > 0) {
      const errorMessage = 'Erreurs de validation:\n' + errors.join('\n');
      this.showMessage(errorMessage, 'error');
    }
    return; // ❌ Blocage de la soumission
  }
  // ✅ Continuer avec la soumission...
}
```

---

## 🔄 Validations Conditionnelles Conservées

Les validations conditionnelles existantes (basées sur les dates et les états) sont **toujours actives** :

1. ✅ **Data Verbale** ne peut pas être dans le futur
2. ✅ **Data Notifica** doit être après Data Verbale
3. ✅ **Data Spedizione** doit être après Data Notifica
4. ✅ **Data Pagamento** ne peut être remplie que si "Pagata" est cochée
5. ✅ **Data Invio Ricorso** requiert que "Ricorso" soit coché
6. ✅ **Data Invio Decurtazione** requiert que "Decurta Punti" soit coché
7. ✅ **Trattenuta Cedolino** requiert que "Pagata" soit "Azienda" (A)
8. ✅ **Stato Verbale** bloque Targa et Data Verbale si "Pagato" ou "Annullato" (en mode édition)

---

## 📁 Fichiers Modifiés

### 1. `contravention.component.ts`
- ✅ Ajout de `Validators.required` sur 6 champs obligatoires
- ✅ Conservation des validateurs conditionnels existants

### 2. `contravention.component.html`
- ✅ Ajout d'astérisques rouges (*) sur les 6 labels des champs obligatoires

---

## ✅ Tests à Effectuer

### Test 1 : Champs Obligatoires (Always Required)
1. Ouvrir le formulaire de création de contravention
2. Essayer de soumettre sans remplir les champs obligatoires
3. **Résultat attendu** : Messages d'erreur pour :
   - "Targa è obbligatoria"
   - "Numero Verbale è obbligatorio"
   - "Data Verbale è obbligatoria"
   - "Data Notifica è obbligatoria"
   - "Giorni alla scadenza è obbligatorio"
   - "Stato Verbale è obbligatorio"

### Test 2 : Validation Conditionnelle - Data Invio Ricorso
1. Cocher "Ricorso = Si"
2. Laisser "Data Invio Ricorso" vide
3. Soumettre le formulaire
4. **Résultat attendu** : Erreur "Data invio ricorso è obbligatoria quando 'Ricorso' è selezionato"

### Test 3 : Validation Conditionnelle - Data Invio Decurtazione
1. Cocher "Decurtazione punti = Si"
2. Laisser "Data Invio Decurtazione" vide
3. Soumettre le formulaire
4. **Résultat attendu** : Erreur "Data invio decurtazione è obbligatoria quando 'Decurtazione punti' è selezionato"

### Test 4 : Validation Conditionnelle - Trattenuta Cedolino
1. Sélectionner "Pagata = Azienda"
2. Laisser "Trattenuta su cedolino" vide
3. Soumettre le formulaire
4. **Résultat attendu** : Erreur "Trattenuta su cedolino è obbligatoria quando pagata da 'Azienda'"

### Test 5 : Champs Non Obligatoires
1. Remplir uniquement les 7 champs obligatoires :
   - Targa
   - Stato Verbale
   - Data Verbale
   - Numero Verbale
   - Data Notifica
   - Giorni alla scadenza
   - Pagata (radio - toujours une valeur)
2. Laisser tous les autres champs vides (sauf validations conditionnelles)
3. Soumettre le formulaire
4. **Résultat attendu** : Soumission réussie

### Test 6 : Indicateurs Visuels
1. Ouvrir le formulaire
2. Vérifier que les 7 champs obligatoires ont un astérisque rouge (*)
3. **Résultat attendu** : Astérisques visibles sur :
   - Targa *
   - Stato Verbale *
   - Data Verbale *
   - Numero Verbale *
   - Data Notifica *
   - Giorni alla scadenza *
   - Pagata *

### Test 7 : Blocage en Mode Édition
1. Ouvrir une contravention existante avec Stato = "Pagato" (2) ou "Annullato" (6)
2. Essayer de modifier Targa ou Data Verbale
3. **Résultat attendu** : Champs en lecture seule (readonly, grisés)

### Test 8 : Validations de Dates
1. Entrer une "Data Verbale" dans le futur
2. **Résultat attendu** : Erreur "Data verbale non può essere futura"
3. Entrer une "Data Notifica" avant "Data Verbale"
4. **Résultat attendu** : Erreur "Data notifica deve essere >= data verbale"

---

## 🎯 Résumé

| Aspect | État |
|--------|------|
| Champs obligatoires toujours requis | ✅ 7/7 (Targa, Stato, Data Verbale, Num Verbale, Data Notifica, Gg Scadenza, Pagata) |
| Champs obligatoires conditionnels | ✅ 3/3 (Data invio ricorso, Data invio decurtazione, Trattenuta cedolino) |
| Astérisques rouges affichés | ✅ 7/7 |
| Validations conditionnelles (dates & états) | ✅ 10 validateurs actifs |
| Messages d'erreur détaillés | ✅ 16+ messages configurés |
| Blocage en mode édition | ✅ Fonctionnel (Targa & Data Verbale si Pagato/Annullato) |
| Listeners de revalidation | ✅ Configurés pour tous les champs conditionnels |

---

## 📊 Tableau Récapitulatif Complet

| Campo | Type | Obligatoire | Bloccante | Validation |
|-------|------|-------------|-----------|------------|
| Targa | Texte | **Oui** | **Oui** (si Pagato/Annullato en edit) | `Validators.required` |
| Stato Verbale | Select | **Oui** | **Oui** | `Validators.required` |
| Data Verbale | Date | **Oui** | **Oui** (si Pagato/Annullato en edit) | `Validators.required` + pas future |
| Numero Verbale | Texte | **Oui** | **Oui** (en edit) | `Validators.required` |
| Data Notifica | Date | **Oui** | **Oui** | `Validators.required` + >= Data Verbale |
| Giorni alla scadenza | Nombre | **Oui** | **Oui** | `Validators.required` |
| Pagata | Radio | **Oui** | Non | Radio (toujours une valeur) |
| Cognome e nome guidatore | Texte | Non | Non | - |
| Mail guidatore | Texte | Non | Non | - |
| Comune del verbale | Texte | Non | Non | - |
| Sede Notifica | Texte | Non | Non | - |
| Importo | Texte | Non | Non | - |
| Importo integrato | Texte | Non | Non | - |
| Verbale di rif./correlati | Texte | Non | Non | - |
| Data spedizione finanziario | Date | Non | Non | Validation conditionnelle |
| Data pagamento verbale | Date | Non | Non | Validation conditionnelle |
| Gg ricorso | Nombre | Non | Non | - |
| Ricorso | Radio | Non | Non | - |
| Data invio ricorso | Date | **Oui si Ricorso = Si** | Non | Conditionnel + > Data Notifica |
| Decurtazione punti | Radio | Non | Non | - |
| Data invio decurtazione | Date | **Oui si Decurtazione = Si** | Non | Conditionnel + > Data Notifica |
| Trattenuta cedolino | Texte | **Oui si Pagata = Azienda** | Non | Conditionnel |
| Trattenuta diff. multa cedolino | Texte | Non | Non | - |
| Note | Texte | Non | Non | - |

---

## 📅 Date de Modification

**Date** : 5 décembre 2025  
**Auteur** : Assistant IA  
**Version** : 2.0 (Ajout des validations conditionnelles)

---

🎉 **Les validations obligatoires et conditionnelles sont maintenant correctement configurées selon le tableau complet fourni !**
