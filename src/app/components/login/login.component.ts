import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  errorMessage: string = '';
  showError: boolean = false;
  isLoading = false;
  private authSubscription: Subscription | undefined;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  async onSubmit() {
    if (!this.loginForm.valid) {
      return;
    }

    this.isLoading = true;
    this.showError = false;
    
    const { username, password } = this.loginForm.value;
    
    try {
      const res: any = await this.authService.login(username, password);
      console.log('Réponse complète:', res);
      
      // Vérifications de sécurité
      if (!res) {
        throw new Error('Réponse vide du serveur');
      }
      
      if (!res.accessToken) {
        throw new Error('Token d\'accès manquant dans la réponse');
      }
      
      // Stockage des données
      localStorage.setItem("token", res.accessToken);
      localStorage.setItem('isLoggedIn', 'true');
      
      // CORRECTION: Utiliser res.id au lieu de res.user.id
      if (res.id) {
        localStorage.setItem("idUser", res.id.toString());
        console.log('ID utilisateur stocké:', res.id);
      } else {
        console.warn('ID utilisateur manquant dans la réponse');
      }
      
      // Stockage des autres données utiles (optionnel)
      if (res.email) {
        localStorage.setItem("userEmail", res.email);
      }
      
      if (res.username) {
        localStorage.setItem("username", res.username);
      }
      
      if (res.roles) {
        localStorage.setItem("userRoles", JSON.stringify(res.roles));
      }
      
      console.log('Token stocké:', localStorage.getItem("token"));
      console.log('IsLoggedIn:', localStorage.getItem("isLoggedIn"));
      console.log('ID utilisateur:', localStorage.getItem("idUser"));
      
      // Redirection
      this.router.navigate(['/dashboard']);
      
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      this.isLoading = false;
      
      // Gestion des erreurs
      if (error?.status === 403) {
        this.errorMessage = 'Accès refusé. Vérifiez vos identifiants.';
      } else if (error?.status === 401) {
        this.errorMessage = 'Identifiant ou mot de passe incorrect.';
      } else if (error?.status === 0) {
        this.errorMessage = 'Impossible de se connecter au serveur.';
      } else {
        this.errorMessage = error.message || 'Une erreur inattendue est survenue.';
      }
      
      this.showError = true;
      this.loginForm.patchValue({ password: '' });
    } finally {
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}