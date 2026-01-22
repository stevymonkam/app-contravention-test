// contravention.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContraventionService } from '../../services/contravention.service';
import { Contravention, FileContrevention } from '../../models/contratto.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpEvent, HttpEventType } from '@angular/common/http';

// modiffront BRANCH
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
  selectedFileIndices: Set<number> = new Set();
  

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
  
  



  onCancel(): void {
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