// contravention.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContraventionService } from '../../services/contravention.service';
import { Contravention, AllegatoContravention } from '../../models/contratto.model';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  selectedFiles: File[] = [];
  fileUploadForm!: FormGroup;
  isLoading = false;
  uploadProgress = 0;
  

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
    private snackBar: MatSnackBar
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    // Initialisation si nécessaire
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

    this.selectedFiles.forEach(file => {
      const allegato: AllegatoContravention = {
        nomeFile: file.name,
        tipo: tipo,
        note: note,
        dimensione: file.size,
        file: file
      };
      this.uploadedFiles.push(allegato);
    });

    // Réinitialiser la sélection
    this.selectedFiles = [];
    this.fileUploadForm.patchValue({ note: '' });
    this.showMessage('Fichiers ajoutés avec succès', 'success');
  }

  removeFile(index: number): void {
    this.uploadedFiles.splice(index, 1);
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
   // this.getAllContraventions();
   this.getAllContraventionsWithFiles();
    if (this.contraventionForm.valid) {
      this.isLoading = true;
   
     
      this.loadContraventionWithFiles(6);
      const contraventionData: Contravention = {
        ...this.contraventionForm.value,
        ricorso: this.contraventionForm.get('ricorso')?.value,
        decurtazionePunti: this.contraventionForm.get('decurtazionePunti')?.value
      };
  
     
      // Préparer les fichiers pour l'envoi
      const files: File[] = this.uploadedFiles
        .filter(allegato => allegato.file)
        .map(allegato => allegato.file!);
  
      // Préparer les métadonnées des fichiers selon la nouvelle structure
      const filesMetadata: FileMetadata[] = this.uploadedFiles
        .filter(allegato => allegato.file)
        .map(allegato => ({
          tipologia: allegato.tipo,
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
            this.showMessage('Erreur lors de l\'enregistrement: ' + error.message, 'error');
          }
        });
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