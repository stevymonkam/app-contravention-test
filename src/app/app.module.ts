import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';


// Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ContractDetailComponent } from './components/contract-detail/contract-detail.component';
import { ContraventionComponent } from './components/contravention/contravention.component';
import { AuthGuard } from './services/auth.guard';
import { AuthService } from './services/auth.service';
import { ContrattoService } from './services/contratto.service';
import { ContraventionService } from './services/contravention.service';
import { ListacontratiComponent } from './components/listacontrati/listacontrati.component';
import { HeaderComponent } from './components/header/header.component';
import { ListaContraventionsComponent } from './components/lista-contraventions/lista-contraventions.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'listacontrati', 
    component: ListacontratiComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'contract/new',
    component: ContractDetailComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'contract/:id',
    component: ContractDetailComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'contraventions/:numVerbale',
    component: ContraventionComponent,
    canActivate: [AuthGuard],
    data: { title: 'Modifier Contravention' }
  },
  {
    path: 'contraventions',
    component: ContraventionComponent,
    canActivate: [AuthGuard],
    data: { title: 'Gestion des Contraventions' }
  },
  {
    path: 'lista-contraventions',
    component: ListaContraventionsComponent,
    canActivate: [AuthGuard],
    data: { title: 'Lista Contraventions' }
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    ContractDetailComponent,
    ContraventionComponent,
    ListacontratiComponent,
    HeaderComponent,
    ListaContraventionsComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    RouterModule.forRoot(routes),
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatPaginatorModule,
    MatSortModule,
    MatCheckboxModule,
    MatRadioModule,
    MatCardModule,
    MatSnackBarModule,
    NgbModule
  ],
  providers: [
    AuthService, 
    AuthGuard,
    ContrattoService,
    ContraventionService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
