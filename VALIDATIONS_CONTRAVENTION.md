# ✅ Validations Conditionnelles - Formulaire Contravention

## 🎯 Objectif

Ajouter des validations conditionnelles au formulaire de création/modification de contravention selon les règles métier spécifiées.

---

## 📋 Règles de Validation Implémentées

### 1. **Data Verbale** ≤ Aujourd'hui
- ❌ **Condition** : La date du verbale ne peut pas être dans le futur
- 📅 **Validation** : `dataVerbale <= aujourd'hui`
- 💬 **Message d'erreur** : "Data verbale non può essere futura"

```typescript
static dataVerbaleNotFuture(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dataVerbale = new Date(control.value);
    return dataVerbale > today ? { futureDate: true } : null;
  };
}
```

---

### 2. **Data Notifica** ≥ Data Verbale
- ❌ **Condition** : La date de notification doit être postérieure ou égale à la date du verbale
- 📅 **Validation** : `dataNotifica >= dataVerbale`
- 🔗 **Dépendance** : Data verbale doit être présente
- 💬 **Message d'erreur** : "Data notifica deve essere >= data verbale"

```typescript
static dataNotificaAfterDataVerbale(form: FormGroup): ValidationErrors | null {
  const dataVerbale = form.get('dataVerbale')?.value;
  const dataNotifica = form.get('dataNotifica')?.value;
  
  if (!dataVerbale || !dataNotifica) return null;
  
  const dateVerbale = new Date(dataVerbale);
  const dateNotifica = new Date(dataNotifica);
  
  return dateNotifica < dateVerbale ? { dataNotificaBeforeVerbale: true } : null;
}
```

---

### 3. **Data Spedizione al Finanziario** > Data Notifica
- ❌ **Condition** : Si présente, la date d'expédition au financier doit être strictement postérieure à la date de notification
- 📅 **Validation** : `dataSpediziFinanz > dataNotifica` (si présente)
- 🔗 **Dépendance** : Data notifica doit être présente
- 💬 **Message d'erreur** : "Data spedizione al finanziario deve essere > data notifica"

```typescript
static dataSpedizioneAfterNotifica(form: FormGroup): ValidationErrors | null {
  const dataNotifica = form.get('dataNotifica')?.value;
  const dataSpedizione = form.get('dataSpediziFinanz')?.value;
  
  if (!dataNotifica || !dataSpedizione) return null;
  
  const dateNotifica = new Date(dataNotifica);
  const dateSpedizione = new Date(dataSpedizione);
  
  return dateSpedizione <= dateNotifica ? { dataSpedizioneInvalid: true } : null;
}
```

---

### 4. **Data Pagamento Verbale** ≥ Data Notifica
- ❌ **Condition** : Si présente et si stato verbale = "pagato" (2), la date de paiement doit être ≥ date de notification
- 📅 **Validation** : `dataPagamentoVerb >= dataNotifica` (si stato = pagato)
- 🔗 **Dépendance** : Stato verbale = "pagato" (2)
- 💬 **Message d'erreur** : "Data pagamento verbale deve essere >= data notifica (quando stato = pagato)"

```typescript
static dataPagamentoValid(form: FormGroup): ValidationErrors | null {
  const statoVerbale = form.get('idStatoPratica')?.value;
  const dataNotifica = form.get('dataNotifica')?.value;
  const dataPagamento = form.get('dataPagamentoVerb')?.value;
  
  if (statoVerbale !== '2' || !dataNotifica || !dataPagamento) return null;
  
  const dateNotifica = new Date(dataNotifica);
  const datePagamento = new Date(dataPagamento);
  
  return datePagamento < dateNotifica ? { dataPagamentoInvalid: true } : null;
}
```

---

### 5. **Pagata** (Azienda/Dipendente)
- ❌ **Condition** : 
  - Si **data spedizione finanziario présente** → doit être **"A" (Azienda)**
  - Si **data spedizione finanziario absente** → doit être **"D" (Dipendente)**
- 🔗 **Dépendance** : Data pagamento verbale présente, stato verbale = "pagato" (2)
- 💬 **Messages d'erreur** :
  - "Pagata deve essere 'Azienda' quando data spedizione al finanziario è presente"
  - "Pagata deve essere 'Dipendente' quando data spedizione al finanziario non è presente"

```typescript
static pagataValid(form: FormGroup): ValidationErrors | null {
  const statoVerbale = form.get('idStatoPratica')?.value;
  const dataPagamento = form.get('dataPagamentoVerb')?.value;
  const dataSpedizione = form.get('dataSpediziFinanz')?.value;
  const pagata = form.get('pagatoAziendaDipendente')?.value;
  
  if (statoVerbale !== '2' || !dataPagamento) return null;
  
  if (dataSpedizione && pagata !== true) {
    return { pagataDeveEssereAzienda: true };
  }
  
  if (!dataSpedizione && pagata !== false) {
    return { pagataDeveEssereDipendente: true };
  }
  
  return null;
}
```

---

### 6. **Ricorso** → Stato Verbale = "contestato"
- ❌ **Condition** : Si Ricorso = "Si", alors stato verbale doit être "contestato" (3)
- 🔗 **Dépendance** : Stato verbale = "contestato" (3)
- 💬 **Message d'erreur** : "Ricorso richiede stato verbale = 'contestato'"

```typescript
static ricorsoValid(form: FormGroup): ValidationErrors | null {
  const statoVerbale = form.get('idStatoPratica')?.value;
  const ricorso = form.get('ricorso')?.value;
  
  if (ricorso === true && statoVerbale !== '3') {
    return { ricorsoRequiresContestata: true };
  }
  
  return null;
}
```

---

### 7. **Giorni Ricorso** (implicite)
- 🔗 **Dépendance** : Ricorso = "Si", stato verbale = "contestato" (3)
- ℹ️ **Note** : Pas de validation spécifique, juste une dépendance logique

---

### 8. **Data Invio Ricorso** > Data Notifica
- ❌ **Condition** : Si présente, doit être > data notifica
- 🔗 **Dépendance** : Ricorso = "Si", stato verbale = "contestato" (3)
- 💬 **Message d'erreur** : "Data invio ricorso deve essere > data notifica"

```typescript
static dataInvioRicorsoValid(form: FormGroup): ValidationErrors | null {
  const ricorso = form.get('ricorso')?.value;
  const statoVerbale = form.get('idStatoPratica')?.value;
  const dataNotifica = form.get('dataNotifica')?.value;
  const dataInvioRicorso = form.get('dataInvioRicorso')?.value;
  
  if (!ricorso || statoVerbale !== '3' || !dataNotifica || !dataInvioRicorso) return null;
  
  const dateNotifica = new Date(dataNotifica);
  const dateInvioRicorso = new Date(dataInvioRicorso);
  
  return dateInvioRicorso <= dateNotifica ? { dataInvioRicorsoInvalid: true } : null;
}
```

---

### 9. **Data Invio Decurtazione** > Data Notifica
- ❌ **Condition** : Si présente, doit être > data notifica
- 🔗 **Dépendance** : Decurta. Punti = "Si"
- 💬 **Message d'erreur** : "Data invio decurtazione deve essere > data notifica"

```typescript
static dataInvioDecurtazioneValid(form: FormGroup): ValidationErrors | null {
  const decurtaPunti = form.get('decurtaPunti')?.value;
  const dataNotifica = form.get('dataNotifica')?.value;
  const dataInvioDecurtazione = form.get('dataInvioDecurtazione')?.value;
  
  if (!decurtaPunti || !dataNotifica || !dataInvioDecurtazione) return null;
  
  const dateNotifica = new Date(dataNotifica);
  const dateInvioDecurtazione = new Date(dataInvioDecurtazione);
  
  return dateInvioDecurtazione <= dateNotifica ? { dataInvioDecurtazioneInvalid: true } : null;
}
```

---

### 10. **Trattenuta su Cedolino** → Pagata = "A"
- ❌ **Condition** : Si présente, Pagata doit être "Azienda" (true)
- 🔗 **Dépendance** : Pagata = "Azienda"
- 💬 **Message d'erreur** : "Trattenuta su cedolino richiede pagata = 'Azienda'"

```typescript
static trattenutaCedulinoValid(form: FormGroup): ValidationErrors | null {
  const pagata = form.get('pagatoAziendaDipendente')?.value;
  const trattenuta = form.get('mmyyyyTrattenutaCedolino')?.value;
  
  if (trattenuta && pagata !== true) {
    return { trattenutaRequiresAzienda: true };
  }
  
  return null;
}
```

---

## 🔄 Revalidation Automatique

Pour que les validations se déclenchent automatiquement quand les champs dépendants changent, des **listeners** ont été ajoutés :

```typescript
private setupValidationListeners(): void {
  // Revalider quand dataVerbale change
  this.contraventionForm.get('dataVerbale')?.valueChanges.subscribe(() => {
    this.contraventionForm.get('dataNotifica')?.updateValueAndValidity({ emitEvent: false });
  });

  // Revalider quand dataNotifica change
  this.contraventionForm.get('dataNotifica')?.valueChanges.subscribe(() => {
    this.contraventionForm.updateValueAndValidity({ emitEvent: false });
  });

  // ... autres listeners
}
```

---

## 🎨 Affichage des Erreurs

### Dans `onSubmit()`
```typescript
if (this.contraventionForm.invalid) {
  this.markFormGroupTouched();
  const errors = this.getValidationErrors();
  if (errors.length > 0) {
    const errorMessage = 'Erreurs de validation:\n' + errors.join('\n');
    this.showMessage(errorMessage, 'error');
    console.error('Erreurs de validation:', errors);
  }
  return;
}
```

### Méthode `getValidationErrors()`
```typescript
private getValidationErrors(): string[] {
  const errors: string[] = [];
  const formErrors = this.contraventionForm.errors;

  if (formErrors) {
    if (formErrors['dataNotificaBeforeVerbale']) {
      errors.push('• Data notifica deve essere >= data verbale');
    }
    // ... autres erreurs
  }

  return errors;
}
```

---

## 📊 Tableau Récapitulatif

| # | Champ | Condition | Dépendances | Message d'Erreur |
|---|-------|-----------|-------------|------------------|
| 1 | Data Verbale | ≤ aujourd'hui | - | Data verbale non può essere futura |
| 2 | Data Notifica | ≥ data verbale | Data verbale présente | Data notifica deve essere >= data verbale |
| 3 | Data Spediz. Finanz. | > data notifica (si présente) | Data notifica présente | Data spedizione deve essere > data notifica |
| 4 | Data Pagamento | ≥ data notifica | Stato = pagato (2) | Data pagamento deve essere >= data notifica |
| 5 | Pagata | A (si spedizione), D (sinon) | Stato = pagato (2) | Pagata deve essere Azienda/Dipendente |
| 6 | Ricorso | - | Stato = contestato (3) | Ricorso richiede stato contestato |
| 7 | Giorni Ricorso | - | Ricorso = Si, stato = contestato | - |
| 8 | Data Invio Ricorso | > data notifica (si présente) | Ricorso = Si, stato = contestato | Data invio ricorso > data notifica |
| 9 | Data Invio Decurt. | > data notifica (si présente) | Decurta punti = Si | Data invio decurtazione > data notifica |
| 10 | Trattenuta Cedolino | - | Pagata = A | Trattenuta richiede pagata = Azienda |

---

## 🧪 Tests Recommandés

### Test 1 : Data Verbale Futura
1. Entrer une date future dans "Data Verbale"
2. Tenter de sauvegarder
3. ✅ Erreur : "Data verbale non può essere futura"

### Test 2 : Data Notifica Avant Data Verbale
1. Data Verbale = 10/01/2025
2. Data Notifica = 05/01/2025
3. Tenter de sauvegarder
4. ✅ Erreur : "Data notifica deve essere >= data verbale"

### Test 3 : Pagata avec Data Spedizione
1. Stato = "pagato"
2. Data Spedizione Finanz. = présente
3. Pagata = "Dipendente"
4. Tenter de sauvegarder
5. ✅ Erreur : "Pagata deve essere 'Azienda'"

### Test 4 : Ricorso sans Stato Contestato
1. Ricorso = "Si"
2. Stato Verbale = "pagato"
3. Tenter de sauvegarder
4. ✅ Erreur : "Ricorso richiede stato verbale = 'contestato'"

### Test 5 : Trattenuta sans Azienda
1. Trattenuta su cedolino = "01/2025"
2. Pagata = "Dipendente"
3. Tenter de sauvegarder
4. ✅ Erreur : "Trattenuta su cedolino richiede pagata = 'Azienda'"

---

## ✅ Résultat Final

✅ **10 règles de validation** implémentées  
✅ **Validations conditionnelles** avec dépendances  
✅ **Revalidation automatique** lors des changements  
✅ **Messages d'erreur** clairs et en italien  
✅ **Affichage groupé** des erreurs dans un snackbar  
✅ **Console logs** pour le debugging  

🎉 **Toutes les validations conditionnelles sont maintenant actives !**
