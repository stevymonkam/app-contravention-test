import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contratto } from '../models/contratto.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ContrattoService {
  private apiUrl = 'http://192.168.3.49:8080/api/contratti';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem("token");
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getContratti(): Observable<Contratto[]> {
    return this.http.get<Contratto[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getContratto(id: number): Observable<Contratto> {
    return this.http.get<Contratto>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createContratto(contratto: Contratto): Observable<Contratto> {
    return this.http.post<Contratto>(
      this.apiUrl, 
      contratto, 
      { headers: this.getHeaders() }
    );
  }

  updateContratto(id: number, contratto: Contratto): Observable<Contratto> {
    return this.http.put<Contratto>(
      `${this.apiUrl}/${id}`, 
      contratto, 
      { headers: this.getHeaders() }
    );
  }

  deleteContratto(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`, 
      { headers: this.getHeaders() }
    );
  }

  getContrattiByCliente(clienteId: number): Observable<Contratto[]> {
    return this.http.get<Contratto[]>(
      `${this.apiUrl}/cliente/${clienteId}`, 
      { headers: this.getHeaders() }
    );
  }

  getContrattiByFornitore(fornitoreId: number): Observable<Contratto[]> {
    return this.http.get<Contratto[]>(
      `${this.apiUrl}/fornitore/${fornitoreId}`,
      { headers: this.getHeaders() }
    );
  }
}
