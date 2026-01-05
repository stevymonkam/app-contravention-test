// contravention.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContraventionService } from '../../services/contravention.service';
import { Contravention, FileContrevention } from '../../models/contratto.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpEvent, HttpEventType } from '@angular/common/http';

// Interface pour les métadonnées des fichiers (à ajouter au début du fichier)
interface FileMetadata {
  tipo: string;
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
  uploadedFiles: FileContrevention[] = [];
  uploadedFiles1: FileContrevention[] = [];
  uploadedFiles2: any[] = [];
  selectedFiles: File[] = [];
  fileUploadForm!: FormGroup;
  isLoading = false;
  uploadProgress = 0;
  contraventionNumVerbale: any;
  isEditMode = false;
  

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
      next: (contravention: Contravention) => {
        console.log('Contravention chargée depuis le serveur:', contravention);
        console.log('Formulaire avant patchValue:', this.contraventionForm.value);
        
        this.contraventionForm.patchValue({
          numVerbale: contravention.numVerbale,
          targa: contravention.targa,
          guidatore: contravention.guidatore,
          emailGuidatore: contravention.emailGuidatore,
          societaIntestataria: contravention.societaIntestataria,
          dataVerbale: contravention.dataVerbale,
          dataNotifica: contravention.dataNotifica,
          comuneVerbale: contravention.comuneVerbale,
          sedeNotifica: contravention.sedeNotifica,
          ggScadenza: contravention.ggScadenza,
          importo: contravention.importo,
          importoIntegrato: contravention.importoIntegrato,
          numVerbaleCorrelato: contravention.numVerbaleCorrelato,
          dataSpediziFinanz: contravention.dataSpediziFinanz,
          dataPagamentoVerb: contravention.dataPagamentoVerb,
          pagatoAziendaDipendente: contravention.pagatoAziendaDipendente,
          ricorso: contravention.ricorso,
          ggRicorso: contravention.ggRicorso,
          dataInvioRicorso: contravention.dataInvioRicorso,
          decurtaPunti: contravention.decurtaPunti,
          dataInvioDecurtazione: contravention.dataInvioDecurtazione,
          mmyyyyTrattenutaCedolino: contravention.mmyyyyTrattenutaCedolino,
          mmyyyyTrattenutaDiffMultaCedolino: contravention.mmyyyyTrattenutaDiffMultaCedolino,
          idStatoPratica: contravention.idStatoPratica,
          exSocietaIntestataria: contravention.exSocietaIntestataria,
          note: contravention.note
        });
        
        console.log('Formulaire après patchValue:', this.contraventionForm.value);
        
        // Charger les fichiers associés
        if (contravention.files && contravention.files.length > 0) {
          this.uploadedFiles = contravention.files;
          console.log('Fichiers chargés:', this.uploadedFiles);
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
      numVerbale: ['', Validators.required],
      targa: [''],
      guidatore: [''],
      emailGuidatore: [''],
      societaIntestataria: [''],
      dataVerbale: [''],
      dataNotifica: [''],
      comuneVerbale: [''],
      sedeNotifica: [''],
      ggScadenza: [''],
      importo: [''],
      importoIntegrato: [''],
      numVerbaleCorrelato: [''],
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
      idStatoPratica: [''],
      exSocietaIntestataria: [''],
      note: ['']
    });

    // Formulaire pour l'upload de fichiers
    this.fileUploadForm = this.fb.group({
      elemento: [''],
      tipo: [''],
      data: [''],
      testo1: [''],
      testo2: [''],
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
    this.selectedFiles = [];
    this.fileUploadForm.reset();
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

  // Méthode pour uploader les fichiers en mode édition
  uploadFilesInEditMode(numVerbale: string, files: FileContrevention[]): void {
    let uploadedCount = 0;
    let errorCount = 0;
    const totalFiles = files.length;

    console.log("Début de l'upload de", totalFiles, "fichiers pour la contravention numVerbale:", numVerbale);

    files.forEach((allegato, index) => {
      if (allegato.file) {
        const tipo = allegato.tipo || '';
        const note = allegato.note;

        console.log("Fichier à uploader:", allegato.file);
        
        console.log(`Upload du fichier ${index + 1}/${totalFiles}:`, allegato.elemento);

        this.contraventionService.uploadFile(numVerbale, allegato.file, tipo, note)
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
    if (this.contraventionForm.valid) {
      this.isLoading = true;
      
      const contraventionData: Contravention = {
        ...this.contraventionForm.value,
        ricorso: this.contraventionForm.get('ricorso')?.value,
        decurtazionePunti: this.contraventionForm.get('decurtazionePunti')?.value
      };
      
      // Mode édition : mettre à jour
      if (this.isEditMode && this.contraventionNumVerbale) {
        console.log("Mode édition - Mise à jour de la contravention numVerbale:", this.contraventionNumVerbale);
        console.log("Données de la contravention:", contraventionData);
        
        this.contraventionService.updateContravention(this.contraventionNumVerbale, contraventionData)
          .subscribe({
            next: (response: Contravention) => {
              console.log("Réponse du serveur:", response);
              
              // Vérifier s'il y a de nouveaux fichiers à uploader
              const newFiles = this.uploadedFiles.filter(allegato => allegato.file);
              
              if (newFiles.length > 0) {
                console.log("Upload de", newFiles.length, "nouveaux fichiers en mode édition");
                this.uploadFilesInEditMode(this.contraventionNumVerbale!, newFiles);
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