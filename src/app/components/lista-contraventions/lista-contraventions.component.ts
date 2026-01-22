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
    'dataVerbale',
    'statoVerbale',
    'dataNotifica',
    'nominativoGuidatore',
    'dataRicorso',
    
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
  flag_home: boolean = true;
  flag_segnali1: boolean = false;
  flag_segnali2: boolean = true;

  @ViewChild("paginatorcontravention", {
    static: false
  }) paginatorcontravention: MatPaginator | undefined;

  @ViewChild(MatSort) sort: MatSort | undefined;

  constructor(
    private contraventionService: ContraventionService,
    private router: Router
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
    console.log(value);
    this.dataSource.filterPredicate = (data: Contravention, filter: string) => {
      switch (value) {
        case "": {
          this.loadTable();
          return true;
        }
        case "targa": {
          return data.targa == filter;  
        }
        case "societaIntestataria": {
          return data.societaIntestataria == filter;
        }
        case "numeroVerbale": {
          return data.numVerbale == filter;
        }
        case "dataVerbale": {
          return data.dataVerbale == filter;
        }
       default: {
          console.log("Invalid choice");
          return true;
        }
      }
    };
  }

  doFilter(): void {
    if (this.search.length != 0) {
      this.dataSource.filter = this.search.trim().toLocaleLowerCase();
    } else {
      this.loadTable();
    }
  }

  goToDashboard(): void {
    this.router.navigate(['/contraventions']);
  }

  editContravention(contravention: Contravention): void {
    console.log('Navigation vers contravention:', contravention);
    this.router.navigate(['/contraventions', contravention.numVerbale]);
  }

}
