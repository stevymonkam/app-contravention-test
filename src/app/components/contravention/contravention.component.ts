// contravention.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContraventionService } from '../../services/contravention.service';
import { Contravention, AllegatoContravention } from '../../models/contratto.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpEvent, HttpEventType } from '@angular/common/http';

// Interface pour les métadonnées des fichiers (à ajouter au début du fichier)
interface FileMetadata {
  tipologia: string;
  numeroVerbale?: string;
  note?: string;
}

@Component({
  selector: 'app-contravention',
  templateUrl: './contravention.component.html',
  styleUrls: ['./contravention.component.css']
})
export class ContraventionComponent implements OnInit {
  contraventionForm!: FormGroup;
  uploadedFiles: AllegatoContravention[] = [];
  uploadedFiles1: AllegatoContravention[] = [];

  uploadedFiles2: any[] = [];

  selectedFiles: File[] = [];
  fileUploadForm!: FormGroup;
  isLoading = false;
  uploadProgress = 0;
  contraventionId: number | null = null;
  isEditMode = false;
  

  // Options pour les dropdowns
  societaOptions = [
    { value: '', label: '---' },
    { value: 'societa1', label: 'Società 1' },
    { value: 'societa2', label: 'Società 2' },
    { value: 'societa3', label: 'Società 3' }
  ];

  statoVerbaleOptions = [
    { value: 'da_pagare', label: 'da pagare' },
    { value: 'pagato', label: 'Pagato' },
    { value: 'in_appello', label: 'In Appello' }
  ];

  tipoFileOptions = [
    { value: 'multa', label: 'Multa' },
    { value: 'verbale', label: 'Verbale' },
    { value: 'documento', label: 'Documento' },
    { value: 'altro', label: 'Altro' }
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
    // Vérifier si on est en mode édition
    this.route.params.subscribe(params => {
      console.log('Params reçus:', params);
      if (params['id']) {
        this.contraventionId = +params['id'];
        this.isEditMode = true;
        console.log('Mode édition activé, ID:', this.contraventionId);
        this.loadContraventionData(this.contraventionId);
      } else {
        console.log('Mode création - pas d\'ID');
      }
    });
  }

  loadContraventionData(id: number): void {
    this.isLoading = true;
    this.contraventionService.getContraventionWithFiles(id).subscribe({
      next: (data: any) => {
        console.log('Contravention chargée dedans stevy1:', data, data.files, data.files[0]);
        this.contraventionForm.patchValue({
          targa: data.contravention.targa,
          societaIntestataria: data.contravention.societaIntestataria,
          nominativoGuidatore: data.contravention.nominativoGuidatore,
          mailGuidatore: data.contravention.mailGuidatore,
          statoVerbale: data.contravention.statoVerbale,
          dataVerbale: data.contravention.dataVerbale,
          numeroVerbale: data.contravention.numeroVerbale,
          comuneVerbale: data.contravention.comuneVerbale,
          dataNotifica: data.contravention.dataNotifica,
          sedeNotifica: data.contravention.sedeNotifica,
          giorniScadenza: data.contravention.giorniScadenza,
          importo: data.contravention.importo,
          importoIntegrato: data.contravention.importoIntegrato,
          verbaleCorrelato: data.contravention.verbaleCorrelato,
          dataSpedizioneFinanziario: data.contravention.dataSpedizioneFinanziario,
          dataPagamentoVerbale: data.contravention.dataPagamentoVerbale,
          giorniRicorso: data.contravention.giorniRicorso,
          ricorso: data.contravention.ricorso,
          dataInvioRicorso: data.contravention.dataInvioRicorso,
          decurtazionePunti: data.contravention.decurtazionePunti,
          dataInvioDecurtazione: data.contravention.dataInvioDecurtazione,
          note: data.contravention.note,
          pagata: data.contravention.pagata,
          trattamentoDifferenzaCedolino: data.contravention.trattamentoDifferenzaCedolino,
          trattenutaCedolino: data.contravention.trattenutaCedolino
        });
        
        console.log('Formulaire après patchValue:', this.contraventionForm.value);

        console.log('Fichiers chargés datataaaaa:', data);

        console.log('Fichiers chargés data.files:', data.files);

        console.log('Fichiers chargés data.alleggatti:', data.contravention.allegati); 


        if (data.contravention.allegati && data.contravention.allegati.length > 0) {
          // Mapper les fichiers existants pour s'assurer qu'ils n'ont pas la propriété 'file'
          this.uploadedFiles1 = data.contravention.allegati.map((file: any) => ({
            id: file.id,
            documenti: file.nomeFile,
            tipologia: file.tipo,
            note: file.note,
            numeroVerbale: file.numeroVerbale,
            dimensione: file.dimensione
            // Pas de propriété 'file' pour les fichiers existants
          }));
          console.log('Fichiers chargés alllegaatttiiiii:', this.uploadedFiles1);
        }
        
        // Charger les fichiers associés (fichiers existants sans la propriété file)
          if (data.files && data.files.length > 0) {
          // Mapper les fichiers existants pour s'assurer qu'ils n'ont pas la propriété 'file'
          this.uploadedFiles = data.files.map((file: any) => ({
            id: file.id,
            documenti: file.documenti,
            tipologia: file.tipologia,
            note: file.note,
            numeroVerbale: file.numeroVerbale,
            dimensione: file.dimensione
            // Pas de propriété 'file' pour les fichiers existants
          }));
          console.log('Fichiers chargés:', this.uploadedFiles);
        }
                // Fusionner uploadedFiles1 et uploadedFiles si uploadedFiles1 n'est pas vide
if (this.uploadedFiles1 && this.uploadedFiles1.length > 0) {
  // Combiner les deux tableaux
  this.uploadedFiles = [...this.uploadedFiles1, ...this.uploadedFiles];
  console.log('Fichiers fusionnés:', this.uploadedFiles);
}


        
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
      targa: ['', Validators.required],
      societaIntestataria: ['', Validators.required],
      nominativoGuidatore: [''],
      mailGuidatore: [''],
      statoVerbale: ['da_pagare', Validators.required],
      dataVerbale: ['', Validators.required],
      numeroVerbale: ['', Validators.required],
      comuneVerbale: [''],
      dataNotifica: ['', Validators.required],
      sedeNotifica: [''],
      giorniScadenza: ['', Validators.required],
      importo: [''],
      importoIntegrato: [''],
      verbaleCorrelato: [''],
      dataSpedizioneFinanziario: [''],
      dataPagamentoVerbale: [''],
      giorniRicorso: [''],
      ricorso: [false],
      dataInvioRicorso: [''],
      decurtazionePunti: [false],
      dataInvioDecurtazione: [''],
      note: [''],
      pagata: ['Az.da', Validators.required],
      trattamentoDifferenzaCedolino: [''],
      trattenutaCedolino: ['']
    });

    // Formulaire pour l'upload de fichiers
    this.fileUploadForm = this.fb.group({
      tipo: ['multa', Validators.required],
      note: ['']
    });
  }

  // Méthode pour déclencher le clic sur l'input file
  triggerFileInput(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        this.selectedFiles.push(files[i]);
      }
    }
  }

  uploadFiles(): void {
    if (this.selectedFiles.length === 0) {
      this.showMessage('Veuillez sélectionner au moins un fichier', 'error');
      return;
    }

    const tipo = this.fileUploadForm.get('tipo')?.value;
    const note = this.fileUploadForm.get('note')?.value;

    console.log("je suis dans selectedFiles le neauveau 2222222", this.selectedFiles);

    this.selectedFiles.forEach(file => {
      const allegato: AllegatoContravention = {
        documenti: file.name,
        tipologia: tipo,
        note: note,
        dimensione: file.size,
        file: file,
      
      };
      this.uploadedFiles.push(allegato);
      console.log("je suis dans uploadfiles le neauveau 33333", allegato);

    });

    // Réinitialis
    // er la sélection
    this.selectedFiles = [];
    this.fileUploadForm.patchValue({ note: '' });
    this.showMessage('Fichiers ajoutés avec succès', 'success');
  }
//verbale // stevy
  removeFile(index: number): void {
    const fileToRemove = this.uploadedFiles[index];
    
    // Si le fichier a un ID, c'est un fichier existant sur le serveur
    if (fileToRemove.id && this.contraventionId) {
      if (confirm('Êtes-vous sûr de vouloir supprimer ce fichier?')) {
        this.contraventionService.deleteFile(this.contraventionId, fileToRemove.id)
          .subscribe({
            next: () => {
              console.log('Fichier supprimé du serveur:', fileToRemove.documenti);
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

  // Méthode pour uploader les fichiers en mode édition
  uploadFilesInEditMode(contraventionId: number, files: AllegatoContravention[]): void {
    let uploadedCount = 0;
    let errorCount = 0;
    const totalFiles = files.length;

    console.log("Début de l'upload de", totalFiles, "fichiers pour la contravention ID:", contraventionId);

    files.forEach((allegato, index) => {
      if (allegato.file) {
        const tipo = allegato.tipologia;
        const note = allegato.note;

        console.log("3333333333444444555555", allegato.file);
        
        console.log(`Upload du fichier ${index + 1}/${totalFiles}:`, allegato.documenti);

        this.contraventionService.uploadFile(contraventionId, allegato.file, tipo, note)
          .subscribe({
            next: (event: HttpEvent<any>) => {
              if (event.type === HttpEventType.Response) {
                uploadedCount++;
                console.log(`Fichier ${uploadedCount}/${totalFiles} uploadé avec succès:`, allegato.documenti);
                
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
              console.error(`Erreur lors de l'upload du fichier ${allegato.documenti}:`, error);
              
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
loadContraventionWithFiles(id: number) {
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
}


  getFiles(contraventionId: number): void {
    this.contraventionService.getFiles(contraventionId).subscribe({
      next: (response: AllegatoContravention[]) => {
        console.log("je suis dans next getFiles");
        console.log(response);
      },
      error: (error: any) => {
        console.log("je suis dans error getFiles");
        console.log(error);
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
    if (this.contraventionForm.valid) {
      this.isLoading = true;
      
      const contraventionData: Contravention = {
        ...this.contraventionForm.value,
        ricorso: this.contraventionForm.get('ricorso')?.value,
        decurtazionePunti: this.contraventionForm.get('decurtazionePunti')?.value
      };
      
      // Mode édition : mettre à jour
      if (this.isEditMode && this.contraventionId) {
        console.log("Mode édition - Mise à jour de la contravention ID:", this.contraventionId);
        console.log("Données de la contravention:", contraventionData);
        
        this.contraventionService.updateContravention(this.contraventionId, contraventionData)
          .subscribe({
            next: (response: Contravention) => {
              console.log("Réponse du serveur:", response);
              
              // Vérifier s'il y a de nouveaux fichiers à uploader
              const newFiles = this.uploadedFiles.filter(allegato => allegato.file);
              
              if (newFiles.length > 0) {
                console.log("Upload de", newFiles.length, "nouveaux fichiers en mode édition");
                this.uploadFilesInEditMode(this.contraventionId!, newFiles);
              } else {
                this.isLoading = false;
                this.showMessage('Contravention mise à jour avec succès', 'success');
                // Retourner à la liste après 1 seconde
                setTimeout(() => {
                  this.router.navigate(['/lista-contraventions']);
                }, 1000);
              }
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
            tipologia: allegato.tipologia,
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
  
  

  onCancel(): void {
    this.resetForm();
  }

  onPrint(): void {
    // Logique pour l'impression
    window.print();
  }

  backToList(): void {
    this.router.navigate(['/lista-contraventions']);
  }

  private resetForm(): void {
    this.contraventionForm.reset({
      statoVerbale: 'da_pagare',
      ricorso: false,
      decurtazionePunti: false,
      pagata: 'Az.da'
    });
    this.uploadedFiles = [];
    this.selectedFiles = [];
    this.fileUploadForm.reset({ tipo: 'multa' });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.contraventionForm.controls).forEach(key => {
      const control = this.contraventionForm.get(key);
      control?.markAsTouched();
    });
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: type === 'success' ? ['success-snackbar'] : ['error-snackbar']
    });
  }

  // Getters pour faciliter l'accès aux contrôles
  get f() {
    return this.contraventionForm.controls;
  }

  get fileForm() {
    return this.fileUploadForm.controls;
  }
}