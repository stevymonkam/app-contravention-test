import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { tap, catchError, map } from 'rxjs/operators';

interface AuthResponse {
  token: string;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;
  private authStatusListener = new BehaviorSubject<boolean>(false);

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USERNAME_KEY = 'username';
 // private api_url = 'http://192.168.3.49:8080/api';
  private api_url = 'http://localhost:8080/api';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    // Vérifier si l'utilisateur est déjà connecté au chargement de l'application
    const isLoggedIn = localStorage.getItem("isLoggedIn") === 'true';
    if (isLoggedIn) {
      this.isAuthenticated = true;
      this.authStatusListener.next(true);
    }
  }

  /*login(username: string, password: string): Observable<boolean> {
   
    const loginUrl = 'http://localhost:8080/api/auth/login';
    
    console.log('Tentative de connexion vers:', loginUrl);
    console.log('Avec les identifiants:', { username });
    
    return this.http.post<AuthResponse>(
      loginUrl, 
      { username, password },
      { 
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }),
        withCredentials: true
      }
    ).pipe(
      tap({
        next: (response) => {
          console.log('Réponse du serveur:', response);
          if (response && response.token) {
            console.log('Token reçu, stockage en cours...');
            localStorage.setItem(this.TOKEN_KEY, response.token);
            localStorage.setItem(this.USERNAME_KEY, response.username);
            this.isAuthenticated = true;
            this.authStatusListener.next(true);
          }
        },
        error: (error) => {
          console.error('Erreur complète:', error);
          console.error('Statut de l\'erreur:', error.status);
          console.error('Corps de l\'erreur:', error.error);
          console.error('En-têtes de l\'erreur:', error.headers);
        }
      }),
      map((response: AuthResponse) => {
        const success = !!(response && response.token);
        console.log('Connexion réussie?', success);
        return success;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Erreur lors de la connexion:', error);
        if (error.status === 403) {
          console.error('Accès refusé - Vérifiez vos identifiants ou vos permissions');
        } else if (error.status === 0) {
          console.error('Impossible de se connecter au serveur - Vérifiez que le serveur est en cours d\'exécution');
        }
        return of(false);
      })
    );
  }*/

  login(username: string, password: string): Promise<any> {

    return this.http.post<any>(`${this.api_url}/auth/signin`, { username, password }).toPromise();
  }
 

  logout(): void {
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.router.navigate(['/login']);
  }

  isUserAuthenticated(): boolean {
    return this.isAuthenticated || localStorage.getItem("IsLoggedIn") === 'true';
  }

  getAuthStatusListener(): Observable<boolean> {
    return this.authStatusListener.asObservable();
  }

  getCurrentUser(): string | null {
    return localStorage.getItem('username');
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Vérifie si l'utilisateur est authentifié
  isAuthenticatedUser(): boolean {
    return !!this.getToken();
  }

  // Récupère le nom d'utilisateur
  getUsername(): string | null {
    return localStorage.getItem(this.USERNAME_KEY);
  }
}
