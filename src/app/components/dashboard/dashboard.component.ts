import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface Contract {
  societa: string;
  codiceContratto: string;
  tipologia: string;
  sede: string;
  stato: string;
  dataScadenza: string;
  dataScadenzaPreavviso: string;
  owner: string;
  fornitore: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  contracts: Contract[] = [
    {
      societa: 'Be Consulting',
      codiceContratto: 'Teleleasing spa ost/001234567',
      tipologia: 'Accordo quadro 3ze parti',
      sede: 'Sede milano affari',
      stato: 'Scaduto',
      dataScadenza: '21/08/2013',
      dataScadenzaPreavviso: '21/08/2013',
      owner: 'Federica Vitacolonna',
      fornitore: 'Teleleasing spa'
    },
    {
      societa: 'Be Consulting',
      codiceContratto: 'Telepass spa ost/001234568',
      tipologia: 'Accordo quadro',
      sede: 'Sede roma',
      stato: 'Attivo',
      dataScadenza: '15/12/2023',
      dataScadenzaPreavviso: '15/11/2023',
      owner: 'Mario Rossi',
      fornitore: 'Telepass spa'
    },
    {
      societa: 'Be Consulting',
      codiceContratto: 'Enel energia ost/001234569',
      tipologia: 'Fornitura energia',
      sede: 'Sede napoli',
      stato: 'In scadenza',
      dataScadenza: '30/09/2023',
      dataScadenzaPreavviso: '30/08/2023',
      owner: 'Luigi Bianchi',
      fornitore: 'Enel'
    },
    {
      societa: 'Be Consulting',
      codiceContratto: 'Fastweb ost/001234570',
      tipologia: 'Connettività',
      sede: 'Sede milano affari',
      stato: 'Attivo',
      dataScadenza: '15/03/2024',
      dataScadenzaPreavviso: '15/02/2024',
      owner: 'Giuseppe Verdi',
      fornitore: 'Fastweb'
    },
    {
      societa: 'Be Consulting',
      codiceContratto: 'Ikea ost/001234571',
      tipologia: 'Arredamento',
      sede: 'Sede milano affari',
      stato: 'Scaduto',
      dataScadenza: '10/01/2023',
      dataScadenzaPreavviso: '10/12/2022',
      owner: 'Anna Neri',
      fornitore: 'Ikea'
    },
    {
      societa: 'Be Consulting',
      codiceContratto: 'Manpower ost/001234572',
      tipologia: 'Fornitura personale',
      sede: 'Sede roma',
      stato: 'Attivo',
      dataScadenza: '30/06/2024',
      dataScadenzaPreavviso: '30/05/2024',
      owner: 'Paolo Rossi',
      fornitore: 'Manpower'
    },
    {
      societa: 'Be Consulting',
      codiceContratto: 'Microsoft ost/001234573',
      tipologia: 'Licenze software',
      sede: 'Sede napoli',
      stato: 'In scadenza',
      dataScadenza: '15/11/2023',
      dataScadenzaPreavviso: '15/10/2023',
      owner: 'Laura Gialli',
      fornitore: 'Microsoft'
    },
    {
      societa: 'Be Consulting',
      codiceContratto: 'Olivetti ost/001234574',
      tipologia: 'Stampanti',
      sede: 'Sede milano affari',
      stato: 'Attivo',
      dataScadenza: '28/02/2025',
      dataScadenzaPreavviso: '28/01/2025',
      owner: 'Marco Neri',
      fornitore: 'Olivetti'
    },
    {
      societa: 'Be Consulting',
      codiceContratto: 'Siemens ost/001234575',
      tipologia: 'Impianti',
      sede: 'Sede roma',
      stato: 'Scaduto',
      dataScadenza: '15/05/2023',
      dataScadenzaPreavviso: '15/04/2023',
      owner: 'Giovanni Rossi',
      fornitore: 'Siemens'
    },
    {
      societa: 'Be Consulting',
      codiceContratto: 'Tim ost/001234576',
      tipologia: 'Telefonia mobile',
      sede: 'Sede milano affari',
      stato: 'Attivo',
      dataScadenza: '30/09/2024',
      dataScadenzaPreavviso: '30/08/2024',
      owner: 'Sara Verdi',
      fornitore: 'Tim'
    },
    {
      societa: 'Be Consulting',
      codiceContratto: 'Unieuro ost/001234577',
      tipologia: 'Elettronica',
      sede: 'Sede napoli',
      stato: 'In scadenza',
      dataScadenza: '15/12/2023',
      dataScadenzaPreavviso: '15/11/2023',
      owner: 'Luca Bianchi',
      fornitore: 'Unieuro'
    }
  ];

  menuItems = [
    { label: 'File', subItems: ['Stampa', 'Esporta', 'Invia', 'Esci'] },
    { label: 'Impostazioni' }
  ];

  activeMenu: string | null = null;
  showFileSubmenu = false;

  constructor(private router: Router) {}

  ngOnInit(): void {}

  toggleMenu(menu: string): void {
    if (menu === 'File') {
      this.showFileSubmenu = !this.showFileSubmenu;
    } else {
      this.showFileSubmenu = false;
    }
    this.activeMenu = this.activeMenu === menu ? null : menu;
  }

  logout(): void {
    // Implement logout logic here
    this.router.navigate(['/login']);
  }

  createNewContract(): void {
    this.router.navigate(['/contract/new']);
  }
}
