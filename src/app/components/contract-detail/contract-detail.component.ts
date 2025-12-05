import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ContrattoService } from '../../services/contratto.service';
import { Contratto } from '../../models/contratto.model';

interface Documento {
  id: string;
  tipo: string;
  note: string;
  nomeFile: string;
  file?: File;
  url?: string;
}

@Component({
  selector: 'app-contract-detail',
  templateUrl: './contract-detail.component.html',
  styleUrls: ['./contract-detail.component.css']
})
export class ContractDetailComponent implements OnInit {
  contract: Contratto = {
    codice: '',
    tipologia: '',
    clienteId: 0,
    clienteRagioneSociale: '',
    fornitoreId: 0,
    fornitoreRagioneSociale: '',
    dataInizio: new Date().toISOString().split('T')[0],
    oggetto: '',
    stato: 'ATTIVO',
    importoTotale: 0,
    valuta: 'EUR',
    dataCreazione: new Date().toISOString(),
    dataUltimaModifica: new Date().toISOString(),
    creatoDaId: 1,
    creatoDaNome: 'F.Fulgori'
  } as Contratto;

  documenti: Documento[] = [];
  selectedDocuments: string[] = [];
  newDocument: { tipo: string, note: string, file: File | null } = { tipo: '', note: '', file: null };
  
  tipiDocumento = ['Contratto', 'Ricevuta', 'Fattura', 'Altro'];

  isEditMode = false;
  isNewContract = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private contrattoService: ContrattoService
  ) {}

  ngOnInit(): void {
    const contractId = this.route.snapshot.paramMap.get('id');
    if (contractId) {
      // Carica contratto esistente
      this.loadContract(contractId);
    } else {
      this.isNewContract = true;
      this.isEditMode = true;
    }
  }

  loadContract(id: string): void {
    this.contrattoService.getContratto(Number(id)).subscribe({
      next: (contratto) => {
        this.contract = contratto;
        // Carica eventuali allegati
        if (contratto.allegati) {
          this.documenti = contratto.allegati.map(allegato => ({
            id: allegato.id?.toString() || '',
            tipo: allegato.tipo,
            note: allegato.descrizione || '',
            nomeFile: allegato.nomeFile,
            url: `#${allegato.id}`
          }));
        }
      },
      error: (error) => {
        console.error('Errore durante il caricamento del contratto:', error);
        alert('Impossibile caricare i dettagli del contratto.');
      }
    });
  }

  saveContract(): void {
    if (this.isNewContract) {
      // Crea un nuovo contratto
      this.contrattoService.createContratto(this.contract).subscribe({
        next: (savedContratto) => {
          console.log('Contratto creato con successo:', savedContratto);
          this.isNewContract = false;
          this.isEditMode = false;
          this.router.navigate(['/contract', savedContratto.id]);
          alert('Contratto creato con successo!');
        },
        error: (error) => {
          console.error('Errore durante la creazione del contratto:', error);
          alert('Si è verificato un errore durante il salvataggio del contratto.');
        }
      });
    } else if (this.contract.id) {
      // Aggiorna un contratto esistente
      this.contrattoService.updateContratto(Number(this.contract.id), this.contract).subscribe({
        next: (updatedContratto) => {
          console.log('Contratto aggiornato con successo:', updatedContratto);
          this.isEditMode = false;
          alert('Contratto aggiornato con successo!');
        },
        error: (error) => {
          console.error('Errore durante l\'aggiornamento del contratto:', error);
          alert('Si è verificato un errore durante l\'aggiornamento del contratto.');
        }
      });
    }
  }

  deleteContract(): void {
    if (confirm('Sei sicuro di voler eliminare questo contratto?')) {
      // Qui andrebbe la logica per eliminare il contratto
      console.log('Eliminazione contratto:', this.contract.id);
      this.router.navigate(['/dashboard']);
    }
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.newDocument.file = file;
    }
  }

  uploadDocument(): void {
    if (this.newDocument.file) {
      const newDoc: Documento = {
        id: Math.random().toString(36).substr(2, 9),
        tipo: this.newDocument.tipo,
        note: this.newDocument.note,
        nomeFile: this.newDocument.file.name,
        file: this.newDocument.file
      };
      
      this.documenti.push(newDoc);
      
      // Resetta il form
      this.newDocument = { tipo: '', note: '', file: null };
      
      // Qui andrebbe la logica per caricare effettivamente il file sul server
      console.log('Documento caricato:', newDoc);
    }
  }

  toggleDocumentSelection(docId: string): void {
    const index = this.selectedDocuments.indexOf(docId);
    if (index > -1) {
      this.selectedDocuments.splice(index, 1);
    } else {
      this.selectedDocuments.push(docId);
    }
  }

  deleteSelectedDocuments(): void {
    if (this.selectedDocuments.length === 0) {
      alert('Seleziona almeno un documento da eliminare');
      return;
    }
    
    if (confirm(`Sei sicuro di voler eliminare ${this.selectedDocuments.length} documenti selezionati?`)) {
      // Filtra i documenti rimuovendo quelli selezionati
      this.documenti = this.documenti.filter(doc => !this.selectedDocuments.includes(doc.id));
      this.selectedDocuments = [];
      
      // Qui andrebbe la logica per eliminare i file dal server
      console.log('Documenti eliminati:', this.selectedDocuments);
    }
  }

  sendDocumentsByEmail(): void {
    if (this.selectedDocuments.length === 0) {
      alert('Seleziona almeno un documento da inviare');
      return;
    }
    
    // Qui andrebbe la logica per inviare i documenti selezionati via email
    console.log('Invio email con documenti:', this.selectedDocuments);
    alert(`Invio in corso di ${this.selectedDocuments.length} documenti...`);
  }

  viewDocument(doc: Documento): void {
    // Qui andrebbe la logica per visualizzare il documento
    console.log('Visualizzazione documento:', doc);
    window.open(doc.url || '#', '_blank');
  }

  selectAllDocuments(): void {
    this.selectedDocuments = this.documenti.map(doc => doc.id);
  }

  deselectAllDocuments(): void {
    this.selectedDocuments = [];
  }

  isDocumentSelected(docId: string): boolean {
    return this.selectedDocuments.includes(docId);
  }

  onSelectAllChange(event: any): void {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.selectAllDocuments();
    } else {
      this.deselectAllDocuments();
    }
  }
}
