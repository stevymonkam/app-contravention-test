import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  faCoffee
} from '@fortawesome/free-solid-svg-icons';
import * as $ from 'jquery';
import {
  MatSort
} from '@angular/material/sort';
import {
  MatTableDataSource
} from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorIntl
} from '@angular/material/paginator';
import {
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import {
  Router
} from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators
} from '@angular/forms';

import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import {
  COMMA,
  ENTER
} from '@angular/cdk/keycodes';
import {
  map,
  startWith
} from 'rxjs/operators';
import {
  Observable
} from 'rxjs';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent
} from '@angular/material/autocomplete';
import {
  MatChipInputEvent
} from '@angular/material/chips';
const EXCEL_EXTENSION = '.xlsx';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

@Component({
  selector: 'app-listacontrati',
  templateUrl: './listacontrati.component.html',
  styleUrls: ['./listacontrati.component.scss']
})
export class ListacontratiComponent implements OnInit {

  //@ViewChild(MatPaginator) paginator: MatPaginator;
  //@ViewChild(MatSort) sort: MatSort;
  displayedColumns: string[] = ['azienda', 'id', 'tipologia_contratto', 'sede', 'stato_contratto', 'data_scadenza', 'preavviso', 'owner', 'fornitore'];
  displayedColumns1: string[] = ['id', 'tipo_doc', 'id_contrat', 'note', 'documenti', 'botton'];
  displayedColumnstipo: string[] = ['', 'azienda', 'id', 'tipologia_contratto', 'sede', 'stato_contratto', 'segnalazione'];
  dataSource1: any;
  faCoffee = faCoffee;
  valid: boolean = false;
  fa: FormGroup;
  fa1: FormGroup;
  fa2: FormGroup;
  submitted: boolean = false;
  loading: boolean = false;
  rows: any;
  rows1: any;
  vet = [];
  toto = [];
  rowCount: any;
  search: any = '';
  fileName: any;
  rows_file: any;
  contrafile: any = 'https://bulma.io/images/placeholders/480x480.png';
  file: any;
  flag_edit: boolean = false;
  flag_normal: boolean = false;
  flag_home: boolean = true;
  flag_modal: boolean = false;
  flag_create: boolean = true;
  flag_seganli_nouvo: boolean = true;
  flag_seganli_edit: boolean = false;
  segnailsazioni: any = '';



  @ViewChild("paginatorcontrat", {
      static: false
  }) paginatorcontrat: MatPaginator | undefined;
  @ViewChild("sortcontrat") sortcontrat: MatSort | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;
  @ViewChild("paginatorcontratmodal", {
      static: false
  }) paginatorcontratmodal: MatPaginator | undefined;
  @ViewChild("sortcontratmodal") sortcontratmodal: MatSort | undefined;
  @ViewChild('exporter') exporter: ElementRef | undefined;
  excelfile: any = 'ExcelSheet.xlsx';
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  mailCtrl = new FormControl();
  filename: any;
  tipo: string = "azienda";
  component: string = "listacontratti";
  fileexcel: File | undefined;

  filteredMails: Observable < string[] > | undefined;
  mails: string[] = [];
  ccmails: string[] = [];
  allMails: string[] = [];
  selectable = true;
  selectable1 = true;
  flag_readoly: boolean = false;
  id_filecontrat: any;
  flag_segnali1: boolean = false;
  flag_segnali2: boolean = true;

  // mailInputcc
  @ViewChild('mailInput') mailInput: ElementRef < HTMLInputElement > | undefined;
  @ViewChild('mailInputcc') mailInputcc: ElementRef < HTMLInputElement > | undefined;
  @ViewChild('auto') matAutocomplete: MatAutocomplete | undefined;
  @ViewChild('autocc') matAutocompletecc: MatAutocomplete | undefined;
  mailscc: string[] = [];
  dataSource: any;
  fa3: any;
  visible = true;

  constructor(private modalService: NgbModal, private router: Router, private cdr: ChangeDetectorRef, private fb: FormBuilder
  ) {
      this.flag_readoly = false;
      // Initialize primary form `fa` with all controls used in the template
      this.fa = this.fb.group({
          id_contrat: [''],
          owner: [''],
          sede: [''],
          azienda: [''],
          codice: [''],
          tipo_importo: [''],
          stato_contratto: [''],
          fornitore: [''],
          iva: [''],
          lop_cliente: [''],
          tipologia_contratto: [''],
          data_disdetta: [''],
          data_validata: [''],
          periodo: [''],
          preavviso: [''],
          data_scadenza: [''],
          data_rinnovo: [''],
          rinnovo_automatico: [''],
          note: [''],
          mail_preavviso: [''],
          mail_contratto: [''],
      });
      // Initialize auxiliary forms used in template
      this.fa1 = fb.group({
          'cars': [null, Validators.required],
          'value': [null, Validators.required]
      });

      this.fa2 = fb.group({
          'tipo_doc': [null, Validators.required],
          'id_contrat': [''],
          'documenti': [null],
          'note': [null, Validators.required],
      });

      // Email form for modal
      this.fa3 = fb.group({
        'a': [null, Validators.required],
        'cc': [null],
        'oggetto': [null, Validators.required],
        'corpo': [null, Validators.required],
      });
      /* this.fa3.get('a').valueChanges.pipe(
         startWith(null),
       map((mail: string | null) => mail ? this._filter(mail) : this.allMails.slice()));

       this.fa3.get('cc').valueChanges.pipe(
         startWith(null),
       map((mail: string | null) => mail ? this._filter(mail) : this.allMails.slice()));*/
  }

  // edit(data: any) {}
  /* async edit(data: any) {
     await this.auth.login(data).subscribe((res: any)=>{
       console.log("one school=="+JSON.stringify(res));

     }, err =>{
       console.log("get the error ==="+JSON.stringify(err));
     });

   }*/

  public findInvalidControls(fa: FormGroup) {
      const invalid = [];
      const controls = fa.controls;
      for (const name in controls) {
          if (controls[name].invalid) {
              invalid.push(name);
          }
      }
      return invalid;
  }

  /*loadEmails() {
    this.sendcontrato.getEmails().then((data:any)=>{
      console.log("load all emails ===>"+JSON.stringify(data));
      this.allMails = data.data;
    }).catch((error:any)=>{
      console.log(error);
    });
  }*/

  add(event: MatChipInputEvent): void {
      const input = event.input;
      const value = event.value;
      // Add our mail
      if ((value || '').trim()) {
          this.mails.push(value.trim());
      }
      // Reset the input value
      if (input) {
          input.value = '';
      }
      this.mailCtrl.setValue(null);
  }

  remove(fruit: string): void {
      const index = this.mails.indexOf(fruit);
      if (index >= 0) {
          this.mails.splice(index, 1);
      }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
      this.mails.push(event.option.viewValue);
      this.mailInput ? this.mailInput.nativeElement.value = '' : this.mailInput = undefined;
      this.mailCtrl.setValue(null);
  }

  selectedcc(event: MatAutocompleteSelectedEvent): void {
      this.mailscc.push(event.option.viewValue);
      this.mailInput ? this.mailInput.nativeElement.value = '' : this.mailInput = undefined;
      this.mailCtrl.setValue(null);
  }

  addcc(event: MatChipInputEvent): void {
      const input = event.input;
      const value = event.value;
      // Add our mail
      if ((value || '').trim()) {
          this.mailscc.push(value.trim());
      }
      // Reset the input value
      if (input) {
          input.value = '';
      }
      this.mailCtrl.setValue(null);
  }

  removecc(mail: string): void {
      const index = this.mailscc.indexOf(mail);
      if (index >= 0) {
          this.mailscc.splice(index, 1);
      }
  }

  private _filter(value: string): string[] {
      console.log("from _filter" + value);
      const filterValue = value.toLowerCase();
      return this.allMails.filter(mail => mail.toLowerCase().indexOf(filterValue) === 0);
  }

  /* end tag input or chip input */
  infos(id: any) {}
  invia() {
     
  }

  async sendmail(targetModal: any) {
      this.modalService.open(targetModal, {
          centered: false,
          backdrop: "static",
          size: 'lg',
      });
  }


  exportexcel(tableId: string = "ExampleTable", name ? : string): void {
      let timeSpan = new Date().toISOString();
      let prefix = name || "ExportResult";
      let fileName = `${prefix}-${timeSpan}`;
      let targetTableElm = document.getElementById(tableId);
      let wb = XLSX.utils.table_to_book(targetTableElm, < XLSX.Table2SheetOpts > {
          sheet: prefix
      });
      XLSX.writeFile(wb, `${fileName}.xlsx`);
  }

  public exportAsExcelFile(json: any[], excelFileName: string): void {
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
      const workbook: XLSX.WorkBook = {
          Sheets: {
              'data': worksheet
          },
          SheetNames: ['data']
      };
      const excelBuffer: any = XLSX.write(workbook, {
          bookType: 'xlsx',
          type: 'array'
      });
      this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
      const data: Blob = new Blob([buffer], {
          type: EXCEL_TYPE
      });
      this.filename = 'fileName' + new Date().getTime();
      this.fileexcel = new File([data], this.filename, {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      //FileSaver.saveAs(data, fileName + '_export_' + new  Date().getTime() + EXCEL_EXTENSION);
  }
  /*edit(data: any) {
 if(this.fa.valid){

  console.log("ecoooo fa contrat");
    console.log(this.fa.value);
    this.sendcontrato.sendContrato(this.fa.value).subscribe( (res) =>{
      console.log("ecoooo fa contrat dedans");

      console.log(res);
    }, err =>{
      console.log('errooo');
    })

   alert('valide');
 }else{
  this.submitted = true;

   alert('not valide');
   console.log("this.fa");
   console.log(this.fa.value);
   console.log("incompleted are =="+this.findInvalidControls(this.fa));

 }
}*/

  /*listeContra() {

   this.sendcontrato.GetList().then(
     (res)=> {
       console.log(res);

       this.dataSource = ELEMENT_DATA;
       console.log('this.dataSource');

       console.log(this.dataSource);
     }
   ).catch(
     (error)=>{
       console.log("error"+JSON.stringify(error));
     }
   )
  }*/
  /*
doFilter() {
// console.log(this.fa1.value);

if(this.fa1.value.cars == 'sede'){
for(let i =0; i< this.rows.length; i++) {

  if(this.rows[i].sede == this.fa1.value.value) {

      this.vet.push(this.toto[i]);

  }
}
this.dataSource = new MatTableDataSource(this.vet);
this.vet = [];
}

if(this.fa1.value.cars == 'tipologia_contratto'){
for(let i =0; i< this.rows.length; i++) {

   if(this.rows[i].tipologia_contratto == this.fa1.value.value) {

       this.vet.push(this.toto[i]);

   }
 }
 this.dataSource = new MatTableDataSource(this.vet);
 this.vet = [];
}

if(this.fa1.value.cars == 'azienda'){
for(let i =0; i< this.rows.length; i++) {

   if(this.rows[i].azienda == this.fa1.value.value) {

       this.vet.push(this.toto[i]);

   }
 }
 this.dataSource = new MatTableDataSource(this.vet);
 this.vet = [];
}
if(this.fa1.value.cars == 'owner'){
for(let i =0; i< this.rows.length; i++) {

   if(this.rows[i].owner == this.fa1.value.value) {

       this.vet.push(this.toto[i]);

   }
 }
 this.dataSource = new MatTableDataSource(this.vet);
 this.vet = [];
}
if(this.fa1.value.cars == 'fornitore'){
for(let i =0; i< this.rows.length; i++) {

   if(this.rows[i].fornitore == this.fa1.value.value) {

       this.vet.push(this.toto[i]);

   }
 }
 this.dataSource = new MatTableDataSource(this.vet);
 this.vet = [];
}
if(this.fa1.value.cars == "" || this.fa1.value.cars == null || this.fa1.value.value == null || this.fa1.value.value == "") {

this.loadTable(false);
}






};
*/
  /*onChangeSelect2(value: string) {
    //console.log(value);

   localStorage.setItem('value1',value);

  }*/
  infos1(id: any, doc: any) {
      console.log("iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");

      console.log(id);
      console.log(doc);

  }
  public doFilter = () => {
      if (this.search.lenght != 0) {
          this.dataSource.filter = this.search.trim().toLocaleLowerCase();
      } else {
          this.loadTable(false);
      }
  };
  onChange(value: string) {
      console.log(value);
      this.dataSource.filterPredicate = (data: any, filter: string) => {
          switch (value) {
              case "": {
                  console.log(data.azienda == filter);

                  this.loadTable(false);
                  return null;
              }
              case "azienda": {
                  console.log(data.azienda == filter);

                  return data.azienda == filter;
              }
              case "tipologia_contratto": {
                  return data.tipologia_contratto == filter;
              }
              case "sede": {
                  return data.sede == filter;
              }
              case "stato_contratto": {
                  return data.stato_contratto == filter;
              }
              case "data_scadenza": {
                  return data.data_scadenza == filter;
              }
              case "preavviso": {
                  return data.preavviso == filter;
              }
              case "owner": {
                  return data.owner == filter;
              }
              case "fornitore": {
                  return data.fornitore == filter;
              }
              default: {
                  console.log("Invalid choice");
                  return null;
              }
          }
      };
  }
  loadTable(loadOrNot: boolean) {
     
  }

  loadTablesegnali(loadOrNot: boolean) {
      
  }

  onChangefile(file: File) {

      console.log(file);
      this.file = file;

  }
  loadTable2(data: any) {
      console.log('vriwejhoggvwbovw');
      console.log(data);
      this.dataSource1 = new MatTableDataSource(data);
      this.cdr.detectChanges();
      setTimeout(() => (this.dataSource1.paginator = this.paginatorcontratmodal));
      setTimeout(() => (this.dataSource1.sort = this.sortcontratmodal));
  }

  async onfile() {
      
  }
  openEditModalFilecontrat(id: any, documente: any) {
     

  }
  pathUpload(doc: any) {

     
  }
  dismiss() {
    
  }
  eliminadoc() {}

  deletecontrat() {}

  edit1() {}

  edit2() {}

  onChangeSelect() {
      //console.log(hello);
  }
  opensegnali() {}

  openinterrogazioni() {
      //this.router.navigate(['interrogazioni']);

  }

  async openModalAdd() {

   
  }
  Nouvo() {
      

  }


 

  opensignalisazioni() {

      this.router.navigate(['segnalazioni']);
  }
  ngOnInit(): void {
      this.flag_readoly = false;
      this.submitted = false;
      this.flag_seganli_nouvo = true;
      this.flag_seganli_edit = false;
      this.loadTablesegnali(false);
      console.log(this.rows);
      this.loadTable(false);
      $("#menu-toggle").click(function(e) {
          e.preventDefault();
          $("#wrapper").toggleClass("toggled");
      });
  }

}
