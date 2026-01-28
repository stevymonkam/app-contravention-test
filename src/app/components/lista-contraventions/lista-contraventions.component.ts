import {
  Component,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  MatSort
} from '@angular/material/sort';
import {
  MatTableDataSource
} from '@angular/material/table';
import {
  MatPaginator
} from '@angular/material/paginator';
import {
  MatSnackBar
} from '@angular/material/snack-bar';
import {
  Router
} from '@angular/router';
import {
  ContraventionService
} from '../../services/contravention.service';
import {
  Contravention
} from '../../models/contratto.model';

@Component({
  selector: 'app-lista-contraventions',
  templateUrl: './lista-contraventions.component.html',
  styleUrls: ['./lista-contraventions.component.scss']
})
export class ListaContraventionsComponent implements OnInit {

  displayedColumns: string[] = [
    'targa',
    'societaIntestataria',
    'numVerbale',
    'dataVerbale',
    'dataNotifica',
    'nominativoGuidatore',
    'statoVerbale',
    
  ];

  displayedColumnstipo: string[] = [
    '',
    'targa',
    'societaIntestataria',
    'numeroVerbale',
    'statoVerbale',
    'dataVerbale',
    'nominativoGuidatore'
  ];

  dataSource: MatTableDataSource<Contravention>;
  rows: Contravention[] = [];
  search: string = '';
  selectedFilterField: string = ''; // Champ sélectionné pour le filtre
  flag_home: boolean = true;
  flag_segnali1: boolean = false;
  flag_segnali2: boolean = true;

  @ViewChild("paginatorcontravention", {
    static: false
  }) paginatorcontravention: MatPaginator | undefined;

  @ViewChild(MatSort) sort: MatSort | undefined;

  constructor(
    private contraventionService: ContraventionService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource<Contravention>([]);
    this.loadTable();
  }

  ngOnInit(): void {
    this.loadTable();
    
    // jQuery pour le toggle du menu
    const menuToggle = document.getElementById('menu-toggle');
    const wrapper = document.getElementById('wrapper');
    
    if (menuToggle && wrapper) {
      menuToggle.addEventListener('click', (e) => {
        e.preventDefault();
        wrapper.classList.toggle('toggled');
      });
    }
  }

  loadTable(): void {
    this.contraventionService.getAllContraventionsWithFiles().subscribe({
      next: (data: Contravention[]) => {
        console.log('Contraventions chargées:', data);
        this.rows = data;
        this.dataSource = new MatTableDataSource(this.rows);
        setTimeout(() => {
          if (this.paginatorcontravention) {
            this.dataSource.paginator = this.paginatorcontravention;
          }
        });
        setTimeout(() => {
          if (this.sort) {
            this.dataSource.sort = this.sort;
          }
        }); 
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des contraventions:', error);
      }
    });
  }

  onChange(value: string): void {
    console.log('Champ sélectionné pour le filtre:', value);
    this.selectedFilterField = value;
    
    // Réinitialiser le filtre si aucun champ n'est sélectionné
    if (!value || value === '') {
      this.dataSource.filter = '';
      this.search = '';
    }
  }

  doFilter(): void {
    console.log('doFilter appelé - Champ:', this.selectedFilterField, 'Valeur:', this.search);
    
    if (!this.search || this.search.trim().length === 0) {
      // Si aucune valeur de recherche, afficher tout
      this.dataSource.filter = '';
      return;
    }

    // Définir le filterPredicate en fonction du champ sélectionné
    this.dataSource.filterPredicate = (data: Contravention, filter: string) => {
      if (!filter) return true;
      
      const searchValue = filter.toLowerCase().trim();
      
      switch (this.selectedFilterField) {
        case "targa": {
          return (data.targa || '').toLowerCase().includes(searchValue);
        }
        case "societaIntestataria": {
          return (data.societaIntestataria || '').toLowerCase().includes(searchValue);
        }
        case "numeroVerbale": {
          return (data.numVerbale || '').toLowerCase().includes(searchValue);
        }
        case "dataVerbale": {
          return (data.dataVerbale || '').toLowerCase().includes(searchValue);
        }
        case "": {
          // Si aucun champ sélectionné, rechercher dans tous les champs
          const allFields = [
            data.targa,
            data.societaIntestataria,
            data.numVerbale,
            data.dataVerbale,
            data.guidatore
          ].join(' ').toLowerCase();
          return allFields.includes(searchValue);
        }
        default: {
          // Par défaut, rechercher dans tous les champs
          const allFields = [
            data.targa,
            data.societaIntestataria,
            data.numVerbale,
            data.dataVerbale,
            data.guidatore
          ].join(' ').toLowerCase();
          return allFields.includes(searchValue);
        }
      }
    };
    
    // Appliquer le filtre
    this.dataSource.filter = this.search.trim().toLowerCase();
    
    // Vérifier si des résultats ont été trouvés
    setTimeout(() => {
      if (this.dataSource.filteredData.length === 0) {
        this.showNoResultsMessage();
      }
    }, 100);
  }

  showNoResultsMessage(): void {
    const fieldName = this.getFieldDisplayName(this.selectedFilterField);
    const message = fieldName 
      ? `Aucun résultat trouvé pour "${this.search}" dans le champ ${fieldName}`
      : `Aucun résultat trouvé pour "${this.search}"`;
    
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['snackbar-warning']
    });
  }

  getFieldDisplayName(fieldValue: string): string {
    const fieldNames: { [key: string]: string } = {
      'targa': 'Targa',
      'societaIntestataria': 'Società Intestataria',
      'numeroVerbale': 'Numero Verbale',
      'dataVerbale': 'Data Verbale',
      'nominativoGuidatore': 'Nominativo Guidatore'
    };
    return fieldNames[fieldValue] || '';
  }

  goToDashboard(): void {
    this.router.navigate(['/contraventions']);
  }

  editContravention(contravention: Contravention): void {
    console.log('Navigation vers contravention:', contravention);
    this.router.navigate(['/contraventions', contravention.numVerbale]);
  }

  getStatoVerbaleLabel(idStatoPratica: number | string | undefined): string {
    if (!idStatoPratica) return '-';
    
    const statoMap: { [key: string]: string } = {
      '1': 'da pagare',
      '2': 'pagato',
      '3': 'contestato',
      '4': 'sospeso in attesa ricevuta',
      '5': 'sospeso in attesa di decurtaz punti',
      '6': 'annullato'
    };
    
    return statoMap[idStatoPratica.toString()] || idStatoPratica.toString();
  }

}
