// contravention.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContraventionService } from '../../services/contravention.service';
import { Compagnia, Contravention, FileContrevention, TipoDoc } from '../../models/contratto.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpEvent, HttpEventType } from '@angular/common/http';

// modiffront release 1.0.0
// Interface pour les métadonnées des fichiers (à ajouter au début du fichier)
interface FileMetadata {
  tipo: string;
  numeroVerbale?: string;
  note?: string;
}

// Validateurs personnalisés
class ContraventionValidators {
  // Data verbale <= oggi
  static dataVerbaleNotFuture(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      //today.setHours(0, 0, 0, 0);
      const dataVerbale = new Date(control.value);
      return dataVerbale > today ? { futureDate: true } : null;
    };
  }

  // Data notifica >= data verbale
  static dataNotificaAfterDataVerbale(form: FormGroup): ValidationErrors | null {
    const dataVerbale = form.get('dataVerbale')?.value;
    const dataNotifica = form.get('dataNotifica')?.value;
    
    if (!dataVerbale || !dataNotifica) return null;
    
    const dateVerbale = new Date(dataVerbale);
    const dateNotifica = new Date(dataNotifica);
    
    return dateNotifica < dateVerbale ? { dataNotificaBeforeVerbale: true } : null;
  }

  // Data spedizione > data notifica
  static dataSpedizioneAfterNotifica(form: FormGroup): ValidationErrors | null {
    const dataNotifica = form.get('dataNotifica')?.value;
    const dataSpedizione = form.get('dataSpediziFinanz')?.value;
    
    if (!dataNotifica || !dataSpedizione) return null;
    
    const dateNotifica = new Date(dataNotifica);
    const dateSpedizione = new Date(dataSpedizione);
    
    return dateSpedizione <= dateNotifica ? { dataSpedizioneInvalid: true } : null;
  }

  // Data pagamento >= data notifica (se stato = pagato)
  static dataPagamentoValid(form: FormGroup): ValidationErrors | null {
    const statoVerbale = form.get('idStatoPratica')?.value;
    const dataNotifica = form.get('dataNotifica')?.value;
    const dataPagamento = form.get('dataPagamentoVerb')?.value;
    
    if (statoVerbale !== '2' || !dataNotifica || !dataPagamento) return null;
    
    const dateNotifica = new Date(dataNotifica);
    const datePagamento = new Date(dataPagamento);
    
    return datePagamento < dateNotifica ? { dataPagamentoInvalid: true } : null;
  }

  // Pagata: A si data spedizione presente, altrimenti D
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

  // Ricorso: stato verbale = contestata (3)
  static ricorsoValid(form: FormGroup): ValidationErrors | null {
    const statoVerbale = form.get('idStatoPratica')?.value;
    const ricorso = form.get('ricorso')?.value;
    
    if (ricorso === true && statoVerbale !== '3') {
      return { ricorsoRequiresContestata: true };
    }
    
    return null;
  }

  // Data invio ricorso > data notifica
  static dataInvioRicorsoValid(form: FormGroup): ValidationErrors | null {
    const ricorso = form.get('ricorso')?.value;
    const statoVerbale = form.get('idStatoPratica')?.value;
    const dataNotifica = form.get('dataNotifica')?.value;
    const dataInvioRicorso = form.get('dataInvioRicorso')?.value;
    
    // OBLIGATOIRE si ricorso = true
    if (ricorso === true && !dataInvioRicorso) {
      return { dataInvioRicorsoRequired: true };
    }
    
    if (!ricorso || statoVerbale !== '3' || !dataNotifica || !dataInvioRicorso) return null;
    
    const dateNotifica = new Date(dataNotifica);
    const dateInvioRicorso = new Date(dataInvioRicorso);
    
    return dateInvioRicorso <= dateNotifica ? { dataInvioRicorsoInvalid: true } : null;
  }

  // Data invio decurtazione > data notifica
  static dataInvioDecurtazioneValid(form: FormGroup): ValidationErrors | null {
    const decurtaPunti = form.get('decurtaPunti')?.value;
    const dataNotifica = form.get('dataNotifica')?.value;
    const dataInvioDecurtazione = form.get('dataInvioDecurtazione')?.value;
    
    // OBLIGATOIRE si decurtaPunti = true
    if (decurtaPunti === true && !dataInvioDecurtazione) {
      return { dataInvioDecurtazioneRequired: true };
    }
    
    if (!decurtaPunti || !dataNotifica || !dataInvioDecurtazione) return null;
    
    const dateNotifica = new Date(dataNotifica);
    const dateInvioDecurtazione = new Date(dataInvioDecurtazione);
    
    return dateInvioDecurtazione <= dateNotifica ? { dataInvioDecurtazioneInvalid: true } : null;
  }

  // Trattenuta su cedolino: solo se pagata = A
  static trattenutaCedulinoValid(form: FormGroup): ValidationErrors | null {
    const pagata = form.get('pagatoAziendaDipendente')?.value;
    const trattenuta = form.get('mmyyyyTrattenutaCedolino')?.value;
    
    // OBLIGATOIRE si pagata = Azienda (true)
    if (pagata === true && !trattenuta) {
      return { trattenutaCedulinoRequired: true };
    }
    
    if (trattenuta && pagata !== true) {
      return { trattenutaRequiresAzienda: true };
    }
    
    return null;
  }
}

@Component({
  selector: 'app-contravention',
  templateUrl: './contravention.component.html',
  styleUrls: ['./contravention.component.css']
})
export class ContraventionComponent implements OnInit {
  contraventionForm!: FormGroup;
  uploadedFiles: FileContrevention[] = [];
  uploadedFiles1: FileContrevention[] = [];
  uploadedFiles2: any[] = [];
  selectedFiles: File[] = [];
  fileUploadForm!: FormGroup;
  compagnie: Compagnia[] = [];
  isLoadingCompagnie = false;
  isLoading = false;
  uploadProgress = 0;
  tipoDocList: TipoDoc[] = [];
  isLoadingTipoDoc = false;
  contraventionNumVerbale: any;
  isEditMode = false;
  selectedFileIndices: Set<number> = new Set();
  isFieldsLocked = false; // Blocage des champs targa et dataVerbale si stato = pagato ou annullato
  

  // Options pour les dropdowns (si nécessaire)
  societaOptions = [
    { value: '', label: '---' },
    { value: 'societa1', label: 'Società 1' },
    { value: 'societa2', label: 'Società 2' },
    { value: 'societa3', label: 'Società 3' }
  ];

  constructor(
    private fb: FormBuilder,
    private contraventionService: ContraventionService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    console.log('ngOnInit appelé');
    this.loadCompagnie();
    this.loadTipoDoc();
    // Convertir automatiquement la targa en majuscules en temps réel
    this.contraventionForm.get('targa')?.valueChanges.subscribe(value => {
      if (value && typeof value === 'string') {
        const upperValue = value.toUpperCase();
        if (value !== upperValue) {
          this.contraventionForm.get('targa')?.setValue(upperValue, { emitEvent: false });
        }
      }
    });
    
    // Vérifier si on est en mode édition
    this.route.params.subscribe(params => {
      console.log('Params reçus:', params);
      if (params['numVerbale']) {
        this.contraventionNumVerbale = params['numVerbale'];
        this.isEditMode = true;
        console.log('Mode édition activé, numVerbale:', this.contraventionNumVerbale);
        this.loadContraventionData(this.contraventionNumVerbale);
      } else {
        console.log('Mode création - pas de numVerbale');
      }
    });
  }

  loadContraventionData(numVerbale: string): void {
    console.log('loadContraventionData appelée avec numVerbale:', numVerbale);
    this.isLoading = true;
    this.contraventionService.getContraventionWithFiles(numVerbale).subscribe({
      next: (contravention: any) => {
        console.log('Contravention chargée depuis le serveur:', contravention);
        console.log('provaaaaaaaaaaaaaa:', contravention.contravention.numVerbale);

        console.log('Formulaire avant patchValue:', this.contraventionForm.value);
        
        this.contraventionForm.patchValue({
          numVerbale: contravention.contravention.numVerbale,
          targa: contravention.contravention.targa,
          guidatore: contravention.contravention.guidatore,
          emailGuidatore: contravention.contravention.emailGuidatore,
          societaIntestataria: contravention.contravention.societaIntestataria,
          dataVerbale: contravention.contravention.dataVerbale,
          dataNotifica: contravention.contravention.dataNotifica,
          comuneVerbale: contravention.contravention.comuneVerbale,
          sedeNotifica: contravention.contravention.sedeNotifica,
          ggScadenza: contravention.contravention.ggScadenza,
          importo: contravention.contravention.importo,
          importoIntegrato: contravention.contravention.importoIntegrato,
          numVerbaleCorrelato: contravention.contravention.numVerbaleCorrelato,
          dataSpediziFinanz: contravention.contravention.dataSpediziFinanz,
          dataPagamentoVerb: contravention.contravention.dataPagamentoVerb,
          pagatoAziendaDipendente: contravention.contravention.pagatoAziendaDipendente,
          ricorso: contravention.contravention.ricorso,
          ggRicorso: contravention.contravention.ggRicorso,
          dataInvioRicorso: contravention.contravention.dataInvioRicorso,
          decurtaPunti: contravention.contravention.decurtaPunti,
          dataInvioDecurtazione: contravention.contravention.dataInvioDecurtazione,
          mmyyyyTrattenutaCedolino: contravention.contravention.mmyyyyTrattenutaCedolino,
          mmyyyyTrattenutaDiffMultaCedolino: contravention.contravention.mmyyyyTrattenutaDiffMultaCedolino,
          idStatoPratica: contravention.contravention.idStatoPratica,
          exSocietaIntestataria: contravention.contravention.exSocietaIntestataria,
          note: contravention.contravention.note
        });
        
        console.log('Formulaire après patchValue:', this.contraventionForm.value);
        
        // Charger les fichiers associés
        if (contravention.contravention.files && contravention.contravention.files.length > 0) {
          this.uploadedFiles = contravention.contravention.files;
          console.log('Fichiers chargés:', this.uploadedFiles);
        }
        
        // Mettre à jour l'état des champs selon le stato verbale
        // Utiliser setTimeout pour s'assurer que le formulaire est complètement initialisé
        setTimeout(() => {
          this.updateFieldsDisabledState(contravention.contravention.idStatoPratica);
        }, 0);
        
        this.isLoading = false;
        this.showMessage('Données chargées avec succès', 'success');
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement:', error);
        this.isLoading = false;
        this.showMessage('Erreur lors du chargement des données', 'error');
      }
    });
  }

  private initForms(): void {
    // Formulaire principal de contravention
    this.contraventionForm = this.fb.group({
      numVerbale: ['', Validators.required],
      targa: ['', Validators.required], // Obligatoire et bloquant
      guidatore: [''], // Non obligatoire
      emailGuidatore: [''], // Non obligatoire
      societaIntestataria: ['', Validators.required], // Obligatoire et bloquant
      dataVerbale: ['', [Validators.required, ContraventionValidators.dataVerbaleNotFuture()]], // Obligatoire et bloquant
      dataNotifica: ['', Validators.required], // Obligatoire et bloquant
      comuneVerbale: [''], // Non obligatoire
      sedeNotifica: [''], // Non obligatoire
      ggScadenza: ['', Validators.required], // Obligatoire et bloquant
      importo: [''], // Non obligatoire
      importoIntegrato: [''], // Non obligatoire
      numVerbaleCorrelato: [''], // Non obligatoire
      dataSpediziFinanz: [''],
      dataPagamentoVerb: [''],
      pagatoAziendaDipendente: [false],
      ricorso: [false],
      ggRicorso: [''],
      dataInvioRicorso: [''],
      decurtaPunti: [false],
      dataInvioDecurtazione: [''],
      mmyyyyTrattenutaCedolino: [''],
      mmyyyyTrattenutaDiffMultaCedolino: [''],
      idStatoPratica: ['', Validators.required], // Obligatoire et bloquant (Stato verbale)
      exSocietaIntestataria: [''],
      note: ['']
    }, {
      validators: [
        ContraventionValidators.dataNotificaAfterDataVerbale,
        ContraventionValidators.dataSpedizioneAfterNotifica,
        ContraventionValidators.dataPagamentoValid,
        ContraventionValidators.pagataValid,
        ContraventionValidators.ricorsoValid,
        ContraventionValidators.dataInvioRicorsoValid,
        ContraventionValidators.dataInvioDecurtazioneValid,
        ContraventionValidators.trattenutaCedulinoValid
      ]
    });

    // Ajouter des listeners pour revalider le formulaire
    this.setupValidationListeners();

    // Formulaire pour l'upload de fichiers
    this.fileUploadForm = this.fb.group({
      elemento: [''],
      tipo: ['', Validators.required], // ✅ Obligatoire pour l'upload
      data: [''],
      testo1: [''],
      testo2: [''],
      note: ['']
    });
  }

  private setupValidationListeners(): void {
    // Revalider quand dataVerbale change
    this.contraventionForm.get('dataVerbale')?.valueChanges.subscribe(() => {
      this.contraventionForm.get('dataNotifica')?.updateValueAndValidity({ emitEvent: false });
    });

    // Revalider quand dataNotifica change
    this.contraventionForm.get('dataNotifica')?.valueChanges.subscribe(() => {
      this.contraventionForm.updateValueAndValidity({ emitEvent: false });
    });

    // Revalider quand dataSpediziFinanz change
    this.contraventionForm.get('dataSpediziFinanz')?.valueChanges.subscribe(() => {
      this.contraventionForm.get('pagatoAziendaDipendente')?.updateValueAndValidity({ emitEvent: false });
      this.contraventionForm.updateValueAndValidity({ emitEvent: false });
    });

    // Revalider quand dataPagamentoVerb change
    this.contraventionForm.get('dataPagamentoVerb')?.valueChanges.subscribe(() => {
      this.contraventionForm.updateValueAndValidity({ emitEvent: false });
    });

    // Revalider quand idStatoPratica change
    this.contraventionForm.get('idStatoPratica')?.valueChanges.subscribe((value) => {
      console.log('▶ idStatoPratica changé:', value, 'isEditMode:', this.isEditMode);
      this.contraventionForm.updateValueAndValidity({ emitEvent: false });
      this.updateFieldsDisabledState(value);
    });

    // Revalider quand ricorso change
    this.contraventionForm.get('ricorso')?.valueChanges.subscribe(() => {
      this.contraventionForm.updateValueAndValidity({ emitEvent: false });
    });

    // Revalider quand decurtaPunti change
    this.contraventionForm.get('decurtaPunti')?.valueChanges.subscribe(() => {
      this.contraventionForm.updateValueAndValidity({ emitEvent: false });
    });

    // Revalider quand pagatoAziendaDipendente change
    this.contraventionForm.get('pagatoAziendaDipendente')?.valueChanges.subscribe(() => {
      this.contraventionForm.updateValueAndValidity({ emitEvent: false });
    });
  }

  /**
   * Active ou désactive les champs targa, dataVerbale et numVerbale
   * selon l'état du verbale (Pagato ou Annullato)
   * UNIQUEMENT EN MODE ÉDITION
   */
  private updateFieldsDisabledState(statoVerbale: string): void {
    // Ne bloquer les champs QUE en mode édition
    if (!this.isEditMode) {
      console.log('Mode création : aucun champ bloqué');
      this.isFieldsLocked = false;
      return;
    }
    
    // Stati che bloccano la modifica: 2 = Pagato, 6 = Annullato
    if (statoVerbale == '2' || statoVerbale == '6') {
      this.isFieldsLocked = true;
    } else {
      this.isFieldsLocked = false;
    }
    
    console.log(`Mode édition - Stato verbale: ${statoVerbale}, isEditMode: ${this.isEditMode}, isFieldsLocked: ${this.isFieldsLocked}`);
  }

  // Méthode pour déclencher le clic sur l'input file
  triggerFileInput(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    console.log("11111111111111111 triggerFileInput  1111111111111");

    if (fileInput) {
      fileInput.click();
      console.log("2222222222222222222 triggerFileInput  22222222222222");

    }
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    console.log("3333333333333333  event  3333333333333333333");
    if (files) {
      for (let i = 0; i < files.length; i++) {
        this.selectedFiles.push(files[i]);
        console.log("3333333333333333  +files[i]+"+files[i]+"  3333333333333333333");

      }
    }
  }

  uploadFiles(): void {
    if (this.selectedFiles.length === 0) {
      this.showMessage('Veuillez sélectionner au moins un fichier', 'error');
      return;
    }

    // ✅ Validation OBLIGATOIRE du champ "tipo"
    if (this.fileUploadForm.invalid) {
      this.fileUploadForm.markAllAsTouched();
      if (!this.fileUploadForm.get('tipo')?.value) {
        this.showMessage('Il campo "Tipo" è obbligatorio per aggiungere un file', 'error');
        return;
      }
      this.showMessage('Compilare tutti i campi obbligatori', 'error');
      return;
    }

    console.log("11111111111111111 uploadFiles:", this.uploadedFiles);


    const elemento = this.fileUploadForm.get('elemento')?.value;
    const tipo = this.fileUploadForm.get('tipo')?.value;
    const data = this.fileUploadForm.get('data')?.value;
    const testo1 = this.fileUploadForm.get('testo1')?.value;
    const testo2 = this.fileUploadForm.get('testo2')?.value;
    const note = this.fileUploadForm.get('note')?.value;

    console.log("Fichiers sélectionnés:", this.selectedFiles);

    this.selectedFiles.forEach(file => {
      const fileContrevention: FileContrevention = {
        numVerbale: this.contraventionNumVerbale || '',
        elemento: elemento || file.name,
        tipo: tipo,
        data: data,
        testo1: testo1,
        testo2: testo2,
        note: note,
        file: file
      };
      this.uploadedFiles.push(fileContrevention);
      console.log("Fichier ajouté à la liste:", fileContrevention);
    });

    // Réinitialiser la sélection
    console.log("22222222222222222 uploadedFiles:", this.uploadedFiles);
    this.selectedFiles = [];
    this.fileUploadForm.reset();
    this.resetFileInput();
    this.showMessage('Fichiers ajoutés avec succès', 'success');
  }

  removeFile(index: number): void {
    const fileToRemove = this.uploadedFiles[index];
    
    // Si le fichier a un ID, c'est un fichier existant sur le serveur
    if (fileToRemove.id && this.contraventionNumVerbale) {
      if (confirm('Êtes-vous sûr de vouloir supprimer ce fichier?')) {
        this.contraventionService.deleteFile(this.contraventionNumVerbale, fileToRemove.id)
          .subscribe({
            next: () => {
              console.log('Fichier supprimé du serveur:', fileToRemove.testo1);
              this.uploadedFiles.splice(index, 1);
              this.showMessage('Fichier supprimé avec succès', 'success');
            },
            error: (error: any) => {
              console.error('Erreur lors de la suppression du fichier:', error);
              this.showMessage('Erreur lors de la suppression du fichier', 'error');
            }
          });
      }
    } else {
      // Si le fichier n'a pas d'ID, c'est un fichier nouvellement ajouté mais pas encore uploadé
      this.uploadedFiles.splice(index, 1);
      this.showMessage('Fichier retiré de la liste', 'success');
    }
  }

  // Gestion des checkbox pour sélection multiple
  onFileCheckboxChange(index: number, event: any): void {
    if (event.target.checked) {
      this.selectedFileIndices.add(index);
    } else {
      this.selectedFileIndices.delete(index);
    }
    console.log('Fichiers sélectionnés:', Array.from(this.selectedFileIndices));
  }

  resetFileInput(): void {
    console.log('🔄 resetFileInput appelée');
    
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    
    if (fileInput) {
      fileInput.value = ''; // ✅ Vide la valeur
      console.log('✅ Input file value réinitialisée');
    } else {
      console.error('❌ Input file non trouvé!');
    }
    
    this.selectedFiles = []; // ✅ Vide le tableau
    console.log('✅ selectedFiles vidé');
  }

  // Suppression des fichiers sélectionnés
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
        console.log("9090909090  fileToRemove:"+fileToRemove+"    9090909090");
        console.log("9090909090  index:"+fileToRemove.id+"    9090909090");
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
                  this.resetFileInput();
                  this.showMessage(`${deletedCount} fichier(s) supprimé(s) avec succès`, 'success');
                }
              },
              error: (error: any) => {
                console.error('Erreur lors de la suppression:', error);
                errorCount++;
                
                if (deletedCount + errorCount === totalToDelete) {
                  this.selectedFileIndices.clear();
                  this.resetFileInput();
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
        this.resetFileInput();
        this.showMessage(`${deletedCount} fichier(s) retiré(s) de la liste`, 'success');
      }
    }
  }

  // Visualiser un fichier
  viewFile(fileContrevention: FileContrevention, index: number): void {
    console.log('viewFile appelée pour:', fileContrevention);
    
    // Si le fichier a un ID, c'est un fichier du backend (mode édition)
    if (fileContrevention.id && this.contraventionNumVerbale) {
      console.log('Récupération du fichier depuis le backend, ID:', fileContrevention.id);
      this.isLoading = true;
      
      this.contraventionService.getFile(this.contraventionNumVerbale, fileContrevention.id)
        .subscribe({
          next: (blob: Blob) => {
            console.log('Fichier récupéré depuis le backend:', blob);
            this.isLoading = false;
            
            // Créer une URL temporaire pour le blob
            const fileURL = URL.createObjectURL(blob);
            
            // Obtenir le nom du fichier et son extension
            const fileName = fileContrevention.testo1 || fileContrevention.elemento || 'fichier';
            const fileExtension = this.getFileExtension(fileName);
            
            // Ouvrir le fichier dans un nouvel onglet
            this.openFileInNewTab(fileURL, fileName, fileExtension);
          },
          error: (error: any) => {
            console.error('Erreur lors de la récupération du fichier:', error);
            this.isLoading = false;
            this.showMessage('Erreur lors de l\'ouverture du fichier', 'error');
          }
        });
    } 
    // Si le fichier a un objet File, c'est un fichier local (mode création)
    else if (fileContrevention.file) {
      console.log('Ouverture du fichier local:', fileContrevention.file.name);
      
      // Créer une URL temporaire pour le fichier local
      const fileURL = URL.createObjectURL(fileContrevention.file);
      const fileName = fileContrevention.file.name;
      const fileExtension = this.getFileExtension(fileName);
      
      // Ouvrir le fichier dans un nouvel onglet
      this.openFileInNewTab(fileURL, fileName, fileExtension);
    } 
    else {
      console.error('Fichier non disponible pour visualisation');
      this.showMessage('Fichier non disponible', 'error');
    }
  }

  // Ouvrir le fichier dans un nouvel onglet
  private openFileInNewTab(fileURL: string, fileName: string, fileExtension: string, useGoogleViewer: boolean = false): void {
    console.log('Ouverture du fichier:', fileName, 'Extension:', fileExtension, 'Google Viewer:', useGoogleViewer);
    
    // Formats Office qui nécessitent Google Docs Viewer
    const officeExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
    
    if (officeExtensions.includes(fileExtension.toLowerCase()) && useGoogleViewer) {
      // Pour les fichiers Office, utiliser Google Docs Viewer
      const googleViewerURL = `https://docs.google.com/viewer?url=${encodeURIComponent(fileURL)}&embedded=true`;
      console.log('Ouverture avec Google Docs Viewer:', googleViewerURL);
      window.open(googleViewerURL, '_blank');
    } else {
      // Pour les autres fichiers (PDF, images, etc.) ouvrir directement
      window.open(fileURL, '_blank');
    }
    
    console.log('Fichier ouvert dans un nouvel onglet:', fileName);
  }

  // Obtenir l'extension du fichier
  private getFileExtension(fileName: string): string {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts[parts.length - 1] : '';
  }

  // Méthode pour uploader les fichiers en mode édition
  uploadFilesInEditMode(numVerbale: string, files: FileContrevention[], guidatore: string | undefined, targa: string | undefined): void {
    let uploadedCount = 0;
    let errorCount = 0;
    const totalFiles = files.length;

    console.log("Début de l'upload de", totalFiles, "fichiers pour la contravention numVerbale:", numVerbale);

    files.forEach((allegato, index) => {
      if (allegato.file) {
        const tipo = allegato.tipo || '';
        const note = allegato.note;

        console.log("Fichier à uploader:", allegato);
        console.log("guidatore:", guidatore);
        console.log("targa:", targa);
        
        console.log(`Upload du fichier ${index + 1}/${totalFiles}:`, allegato.elemento);

        this.contraventionService.uploadFile(numVerbale, allegato.file, tipo, note, guidatore, targa)
          .subscribe({
            next: (event: HttpEvent<any>) => {
              if (event.type === HttpEventType.Response) {
                uploadedCount++;
                console.log(`Fichier ${uploadedCount}/${totalFiles} uploadé avec succès:`, allegato.elemento);
                
                // Si tous les fichiers ont été traités
                if (uploadedCount + errorCount === totalFiles) {
                  this.isLoading = false;
                  if (errorCount === 0) {
                    this.showMessage('Contravention et fichiers mis à jour avec succès', 'success');
                  } else {
                    this.showMessage(`Contravention mise à jour. ${uploadedCount} fichier(s) uploadé(s), ${errorCount} erreur(s)`, 'error');
                  }
                  // Retourner à la liste après 1 seconde
                  setTimeout(() => {
                    this.router.navigate(['/lista-contraventions']);
                  }, 1000);
                }
              }
            },
            error: (error: any) => {
              errorCount++;
              console.error(`Erreur lors de l'upload du fichier ${allegato.elemento}:`, error);
              
              // Si tous les fichiers ont été traités
              if (uploadedCount + errorCount === totalFiles) {
                this.isLoading = false;
                if (uploadedCount > 0) {
                  this.showMessage(`Contravention mise à jour. ${uploadedCount} fichier(s) uploadé(s), ${errorCount} erreur(s)`, 'error');
                } else {
                  this.showMessage('Contravention mise à jour mais erreur lors de l\'upload des fichiers', 'error');
                }
                // Retourner à la liste après 1 seconde
                setTimeout(() => {
                  this.router.navigate(['/lista-contraventions']);
                }, 1000);
              }
            }
          });
      }
    });
  }

  createContravention(): void {
    this.isLoading = true;
    console.log("je suis dans createContravention");
    console.log(this.contraventionForm.value);
   

    this.contraventionService.createContravention(this.contraventionForm.value)
      .subscribe({
        next: (response: Contravention) => {
          console.log("je suis dans next");
          console.log(response);
          this.isLoading = false;
          this.showMessage('Contravention enregistrée avec succès', 'success');
          this.resetForm();
        },
        error: (error: any) => {
          console.log("je suis dans error");
          console.log(error);
        }
      });
  }

  // Dans votre component
/*loadContraventionWithFiles(id: number) {
  this.contraventionService.getContraventionWithFiles(id)
    .subscribe({
      next: (contravention: Contravention) => {
        console.log('Contravention:', contravention);
        //console.log('Fichiers joints:', contravention.files);
        
        // Parcourir les fichiers
          //contravention.files.forEach(file => {
          //console.log(`Fichier: ${file.documenti}, Type: ${file.tipologia}`);
        //});
      },
      error: (error: any) => {
        console.error('Erreur:', error);
      }
    });
}*/


  getFiles(numVerbale: string): void {
    this.contraventionService.getFiles(numVerbale).subscribe({
      next: (response: FileContrevention[]) => {
        console.log("Fichiers récupérés:", response);
      },
      error: (error: any) => {
        console.error("Erreur lors de la récupération des fichiers:", error);
      }
    });
  }

  getAllContraventions(): void {
    this.contraventionService.getAllContraventions().subscribe({
      next: (response: Contravention[]) => {
        console.log("je suis dans next getAllContraventions");
        console.log(response);
      },
      error: (error: any) => {
        console.log("je suis dans error getAllContraventions");
        console.log(error);
      }
    });
  }

  getAllContraventionsWithFiles(): void {
    this.contraventionService.getAllContraventionsWithFiles().subscribe({
      next: (response: Contravention[]) => {
        console.log("je suis dans next getAllContraventionsWithFiles");
        console.log(response);
      },
      error: (error: any) => {
        console.log("je suis dans error getAllContraventionsWithFiles");
        console.log(error);
      }
    });
  }

  onSubmit(): void {
    // Afficher les erreurs de validation si le formulaire est invalide
    if (this.contraventionForm.invalid) {
      this.markFormGroupTouched();
      const errors = this.getValidationErrors();
      if (errors.length > 0) {
        const errorMessage = 'Erreurs de validation:\n' + errors.join('\n');
        this.showMessage(errorMessage, 'error');
        console.error('Erreurs de validation:', errors);
      } else {
        this.showMessage('Veuillez remplir tous les champs obligatoires', 'error');
      }
      return;
    }
    
    if (this.contraventionForm.valid) {
      this.isLoading = true;
      
      // Utiliser getRawValue() pour inclure les champs désactivés (targa, dataVerbale)
      const contraventionData: Contravention = {
        ...this.contraventionForm.getRawValue(),
        ricorso: this.contraventionForm.get('ricorso')?.value,
        decurtazionePunti: this.contraventionForm.get('decurtazionePunti')?.value
      };
      
      // Convertir la targa en majuscules avant l'envoi au backend
      if (contraventionData.targa) {
        contraventionData.targa = contraventionData.targa.toUpperCase();
      }
      
      // Mode édition : mettre à jour
      if (this.isEditMode && this.contraventionNumVerbale) {
        console.log("Mode édition - Mise à jour de la contravention numVerbale:", this.contraventionNumVerbale);
        console.log("Données de la contravention:", contraventionData);

        console.log("EEEEEEEEEEEEEDDDDDDDDDDDDDDDDDDDIIIIIIIIIITTTTTTTTTT ");
        console.log("uploadedFiles:", this.uploadedFiles);
        // Préparer les fichiers pour l'envoi
        const files: File[] = this.uploadedFiles
          .filter(allegato => allegato.file)
          .map(allegato => allegato.file!);
    
        // Préparer les métadonnées des fichiers selon la nouvelle structure
        const filesMetadata: FileMetadata[] = this.uploadedFiles
          .filter(allegato => allegato.file)
          .map(allegato => ({
            tipo: allegato.tipo ?? 'ALTRO',
            numeroVerbale: this.contraventionForm.get('numeroVerbale')?.value || undefined,
            note: allegato.note || undefined
          }));
    
        console.log("Données de la contravention EDITTTT: ", contraventionData);
        console.log("Fichiers EDITTTT: ", files);
        console.log("Métadonnées des fichiers EDITTTT: ", filesMetadata);

         
        
        this.contraventionService.updateContravention(this.contraventionNumVerbale, contraventionData, files, filesMetadata)
          .subscribe({
            next: (response: Contravention) => {
              console.log("Réponse du serveur:", response);
               this.isLoading = false;
                this.showMessage('Contravention mise à jour avec succès', 'success');
                // Retourner à la liste après 1 seconde
                setTimeout(() => {
                  this.router.navigate(['/lista-contraventions']);
                }, 1000);
              
            },
            error: (error: any) => {    
              console.error("Erreur:", error);
              this.isLoading = false;
              this.showMessage('Erreur lors de la mise à jour: ' + (error.message || 'Erreur inconnue'), 'error');
            }
          });
      } 
      // Mode création : créer nouvelle contravention
      else {
        console.log("Mode création - Nouvelle contravention");
        
        // Préparer les fichiers pour l'envoi
        const files: File[] = this.uploadedFiles
          .filter(allegato => allegato.file)
          .map(allegato => allegato.file!);
    
        // Préparer les métadonnées des fichiers selon la nouvelle structure
        const filesMetadata: FileMetadata[] = this.uploadedFiles
          .filter(allegato => allegato.file)
          .map(allegato => ({
            tipo: allegato.tipo ?? 'ALTRO',
            numeroVerbale: this.contraventionForm.get('numeroVerbale')?.value || undefined,
            note: allegato.note || undefined
          }));
    
        console.log("Données de la contravention:", contraventionData);
        console.log("Fichiers:", files);
        console.log("Métadonnées des fichiers:", filesMetadata);
    
        // Appel du service avec la nouvelle signature
        this.contraventionService.submitContravention(contraventionData, files, filesMetadata)
          .subscribe({
            next: (response: any) => {
              console.log("Réponse du serveur:", response);
              this.isLoading = false;
              this.showMessage('Contravention enregistrée avec succès', 'success');
              this.resetForm();
            },
            error: (error: any) => {
              console.error("Erreur:", error);
              this.isLoading = false;
              this.showMessage('Erreur lors de l\'enregistrement: ' + (error.message || 'Erreur inconnue'), 'error');
            }
          });
      }
    } else {
      this.markFormGroupTouched();
      this.showMessage('Veuillez remplir tous les champs obligatoires', 'error');
    }
  }
  
  
  loadCompagnie(): void {
    this.isLoadingCompagnie = true;
    this.contraventionService.getAllCompagnie().subscribe({
      next: (data) => {
        this.compagnie = data;
        this.isLoadingCompagnie = false;
      },
      error: (error) => {
        console.error('Errore nel caricamento delle compagnie:', error);
        this.isLoadingCompagnie = false;
      }
    });
  }

  loadTipoDoc(): void {
    this.isLoadingTipoDoc = true;
    this.contraventionService.getAllTipoDoc().subscribe({
      next: (data) => {
        this.tipoDocList = data;
        this.isLoadingTipoDoc = false;
      },
      error: (error) => {
        console.error('Errore nel caricamento dei tipo doc:', error);
        this.isLoadingTipoDoc = false;
      }
    });
  }



  onCancel(): void {

    console.log("onCancel appelée:"+this.isEditMode+" "+this.contraventionNumVerbale);
    if (this.isEditMode && this.contraventionNumVerbale) {
      // Demander confirmation avant de supprimer
      if (confirm('Sei sicuro di voler eliminare questa contravvenzione?')) {
        this.contraventionService.deleteContravention(this.contraventionNumVerbale)
          .subscribe(
            () => {
              console.log('Contravention supprimée avec succès');
              alert('Contravvenzione eliminata con successo!');
              this.router.navigate(['/contraventions']); // Rediriger vers la liste
            },
            (error) => {
              console.error('Erreur lors de la suppression:', error);
              alert('Errore durante l\'eliminazione della contravvenzione');
            }
          );
      }
    } else {
      // Si on n'est pas en mode édition, juste réinitialiser le formulaire
      this.resetForm();
      //this.router.navigate(['/contraventions']); // Ou rediriger
    }
  }

  onPrint(): void {
    // Logique pour l'impression
    window.print();
  }

  backToList(): void {
    this.router.navigate(['/lista-contraventions']);
  }

  goHome(): void {
    this.router.navigate(['/lista-contraventions']);
  }

  goToNewContravention(): void {
    this.router.navigate(['/contraventions']);
    // Réinitialiser le formulaire pour une nouvelle contravention
    this.contraventionNumVerbale = null;
    this.isEditMode = false;
    this.resetForm();
  }

  private resetForm(): void {
    this.contraventionForm.reset({
      ricorso: false,
      decurtaPunti: false,
      pagatoAziendaDipendente: false
    });
    this.uploadedFiles = [];
    this.selectedFiles = [];
    this.fileUploadForm.reset();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.contraventionForm.controls).forEach(key => {
      const control = this.contraventionForm.get(key);
      control?.markAsTouched();
    });
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: type === 'success' ? ['success-snackbar'] : ['error-snackbar']
    });
  }

  private getValidationErrors(): string[] {
    const errors: string[] = [];
    const formErrors = this.contraventionForm.errors;

    if (formErrors) {
      if (formErrors['futureDate']) {
        errors.push('• Data verbale non può essere futura');
      }
      if (formErrors['dataNotificaBeforeVerbale']) {
        errors.push('• Data notifica deve essere >= data verbale');
      }
      if (formErrors['dataSpedizioneInvalid']) {
        errors.push('• Data spedizione al finanziario deve essere > data notifica');
      }
      if (formErrors['dataPagamentoInvalid']) {
        errors.push('• Data pagamento verbale deve essere >= data notifica (quando stato = pagato)');
      }
      if (formErrors['pagataDeveEssereAzienda']) {
        errors.push('• Pagata deve essere "Azienda" quando data spedizione al finanziario è presente');
      }
      if (formErrors['pagataDeveEssereDipendente']) {
        errors.push('• Pagata deve essere "Dipendente" quando data spedizione al finanziario non è presente');
      }
      if (formErrors['ricorsoRequiresContestata']) {
        errors.push('• Ricorso richiede stato verbale = "contestato"');
      }
      if (formErrors['dataInvioRicorsoRequired']) {
        errors.push('• Data invio ricorso è obbligatoria quando "Ricorso" è selezionato');
      }
      if (formErrors['dataInvioRicorsoInvalid']) {
        errors.push('• Data invio ricorso deve essere > data notifica');
      }
      if (formErrors['dataInvioDecurtazioneRequired']) {
        errors.push('• Data invio decurtazione è obbligatoria quando "Decurtazione punti" è selezionato');
      }
      if (formErrors['dataInvioDecurtazioneInvalid']) {
        errors.push('• Data invio decurtazione deve essere > data notifica');
      }
      if (formErrors['trattenutaCedulinoRequired']) {
        errors.push('• Trattenuta su cedolino è obbligatoria quando pagata da "Azienda"');
      }
      if (formErrors['trattenutaRequiresAzienda']) {
        errors.push('• Trattenuta su cedolino richiede pagata = "Azienda"');
      }
    }

    // Vérifier les erreurs des champs individuels
    if (this.contraventionForm.get('dataVerbale')?.errors?.['futureDate']) {
      if (!errors.includes('• Data verbale non può essere futura')) {
        errors.push('• Data verbale non può essere futura');
      }
    }
    
    // Vérifier les champs obligatoires
    if (this.contraventionForm.get('targa')?.errors?.['required']) {
      errors.push('• Targa è obbligatoria');
    }
    if (this.contraventionForm.get('societaIntestataria')?.errors?.['required']) {
      errors.push('• Società Intestataria è obbligatoria');
    }
    if (this.contraventionForm.get('numVerbale')?.errors?.['required']) {
      errors.push('• Numero Verbale è obbligatorio');
    }
    if (this.contraventionForm.get('dataVerbale')?.errors?.['required']) {
      errors.push('• Data Verbale è obbligatoria');
    }
    if (this.contraventionForm.get('dataNotifica')?.errors?.['required']) {
      errors.push('• Data Notifica è obbligatoria');
    }
    if (this.contraventionForm.get('ggScadenza')?.errors?.['required']) {
      errors.push('• Giorni alla scadenza è obbligatorio');
    }
    if (this.contraventionForm.get('idStatoPratica')?.errors?.['required']) {
      errors.push('• Stato Verbale è obbligatorio');
    }

    return errors;
  }

  // Getters pour faciliter l'accès aux contrôles
  get f() {
    return this.contraventionForm.controls;
  }

  get fileForm() {
    return this.fileUploadForm.controls;
  }
}