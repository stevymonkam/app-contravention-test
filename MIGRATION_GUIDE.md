# Guide de Migration - Contravention Backend

## Changements Principaux

### 1. Clé Primaire
- **AVANT**: `id: number`
- **APRÈS**: `numVerbale: string`

### 2. Nouveaux Champs dans Contravention
- `guidatore` (au lieu de `nominativoGuidatore`)
- `emailGuidatore` (au lieu de `mailGuidatore`)
- `ggScadenza` (au lieu de `giorniScadenza`)
- `ggRicorso` (au lieu de `giorniRicorso`)
- `dataSpediziFinanz` (au lieu de `dataSpedizioneFinanziario`)
- `dataPagamentoVerb` (au lieu de `dataPagamentoVerbale`)
- `pagatoAziendaDipendente` (au lieu de `pagata`)
- `decurtaPunti` (au lieu de `decurtazionePunti`)
- `mmyyyyTrattenutaCedolino` (nouveau)
- `mmyyyyTrattenutaDiffMultaCedolino` (nouveau)
- `idStatoPratica` (nouveau)
- `numVerbaleCorrelato` (au lieu de `verbaleCorrelato`)
- `exSocietaIntestataria` (nouveau)

### 3. Fichiers (FileContrevention)
- **AVANT**: `AllegatoContravention` avec `contraventionId`
- **APRÈS**: `FileContrevention` avec `numVerbale`

Nouveaux champs:
- `elemento`
- `tipo`
- `data`
- `testo1`
- `testo2`
- `createdAt`
- `updatedAt`

## Modifications à Faire

### Routes Angular (app.module.ts)
```typescript
// AVANT
{
  path: 'contraventions/:id',
  component: ContraventionComponent
}

// APRÈS
{
  path: 'contraventions/:numVerbale',
  component: ContraventionComponent
}
```

### Formulaire (init

Forms)
```typescript
// Ajouter ces champs au FormBuilder:
this.contraventionForm = this.fb.group({
  numVerbale: ['', Validators.required],  // Clé primaire
  targa: [''],
  guidatore: [''],  // Nouveau nom
  emailGuidatore: [''],  // Nouveau nom
  societaIntestataria: [''],
  dataVerbale: [''],
  dataNotifica: [''],
  comuneVerbale: [''],
  sedeNotifica: [''],
  ggScadenza: [''],  // Nouveau nom
  importo: [''],
  importoIntegrato: [''],
  numVerbaleCorrelato: [''],  // Nouveau nom
  dataSpediziFinanz: [''],  // Nouveau nom
  dataPagamentoVerb: [''],  // Nouveau nom
  pagatoAziendaDipendente: [false],  // Nouveau nom (Boolean)
  ricorso: [false],
  ggRicorso: [''],  // Nouveau nom
  dataInvioRicorso: [''],
  decurtaPunti: [false],  // Nouveau nom
  dataInvioDecurtazione: [''],
  mmyyyyTrattenutaCedolino: [''],  // Nouveau
  mmyyyyTrattenutaDiffMultaCedolino: [''],  // Nouveau
  idStatoPratica: [''],  // Nouveau
  exSocietaIntestataria: [''],  // Nouveau
  note: ['']
});
```

### Navigation
```typescript
// AVANT
this.router.navigate(['/contraventions', contravention.id]);

// APRÈS
this.router.navigate(['/contraventions', contravention.numVerbale]);
```

### Service Calls
```typescript
// AVANT
updateContravention(id: number, contravention: Contravention)
getContraventionWithFiles(id: number)
deleteContravention(id: number)

// APRÈS
updateContravention(numVerbale: string, contravention: Contravention)
getContraventionWithFiles(numVerbale: string)
deleteContravention(numVerbale: string)
```

### Load Data dans onSubmit
```typescript
// AVANT
if (this.isEditMode && this.contraventionId) {
  this.contraventionService.updateContravention(this.contraventionId, contraventionData)
}

// APRÈS
if (this.isEditMode && this.contraventionNumVerbale) {
  this.contraventionService.updateContravention(this.contraventionNumVerbale, contraventionData)
}
```

## Endpoints Backend Modifiés
- `GET /api/contraventions/{numVerbale}`
- `PUT /api/contraventions/{numVerbale}`
- `DELETE /api/contraventions/{numVerbale}`
- `GET /api/contraventions/{numVerbale}/with-files`
